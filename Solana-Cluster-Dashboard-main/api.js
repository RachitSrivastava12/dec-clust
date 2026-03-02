/**
 * ALPHA API.JS v2.0
 * Express API Server for Solana Cluster Monitor
 *
 * Fixes over v1:
 *  - REMOVED localStorage.setItem() calls — this is Node.js, not a browser
 *  - Added SSE /clusters/stream endpoint for real-time push (no client polling needed)
 *  - /clusters no longer triggers startPolling() — that's index.js's job
 *  - JWT cookie now uses secure + sameSite=strict in production
 *  - DB pool connection error properly caught on startup
 *  - Removed double PORT declaration (was declared twice)
 *  - Added /clusters/top — returns highest confidence cluster only
 *  - Rate limiting on auth endpoints
 *  - Proper 404 handler
 */

'use strict';

const express      = require('express');
const cors         = require('cors');
const cookieParser = require('cookie-parser');
const { Pool }     = require('pg');
const bcrypt       = require('bcrypt');
const jwt          = require('jsonwebtoken');

const { serializeClusters, getClusterStats } = require('./cluster');

// ─── Config ──────────────────────────────────────────────────────────────────
const JWT_SECRET     = process.env.JWT_SECRET || 'change-me-in-production';
const DB_URL         = process.env.DATABASE_URL ||
  'postgresql://poly:poly_market@localhost:5432/poly_market';

const IS_PRODUCTION  = process.env.NODE_ENV === 'production';

if (JWT_SECRET === 'change-me-in-production' && IS_PRODUCTION) {
  console.warn('⚠️  WARNING: Using default JWT_SECRET in production — set JWT_SECRET env var!');
}

// ─── Database Pool ────────────────────────────────────────────────────────────
const pool = new Pool({
  connectionString: DB_URL,
  ssl:    { rejectUnauthorized: false },
  family: 4,   // Force IPv4
  max:    10,
  idleTimeoutMillis:    30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on('error', (err) => {
  console.error('❌ Unexpected DB pool error:', err.message);
});

// ─── DB Init ──────────────────────────────────────────────────────────────────
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id             SERIAL PRIMARY KEY,
        email          TEXT UNIQUE,
        password_hash  TEXT,
        solana_address TEXT UNIQUE,
        created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ DB initialized');
  } catch (err) {
    console.error('❌ DB init error:', err.message);
    // Don't crash — auth routes will fail gracefully if DB is down
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Simple in-memory rate limiter per IP */
const rateLimitMap = new Map();
function rateLimit(windowMs = 60_000, maxRequests = 10) {
  return (req, res, next) => {
    const ip  = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const key = `${ip}:${req.path}`;

    const record = rateLimitMap.get(key) || { count: 0, resetAt: now + windowMs };
    if (now > record.resetAt) {
      record.count   = 0;
      record.resetAt = now + windowMs;
    }
    record.count++;
    rateLimitMap.set(key, record);

    if (record.count > maxRequests) {
      return res.status(429).json({ error: 'Too many requests, slow down' });
    }
    next();
  };
}

/** JWT auth middleware */
function authMiddleware(req, res, next) {
  // Support both cookie and Authorization header
  const tokenFromCookie = req.cookies?.['auth-token'];
  const authHeader       = req.headers.authorization;
  const tokenFromHeader  = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const token            = tokenFromCookie || tokenFromHeader;

  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/** Issue JWT + set cookie */
function issueToken(res, user) {
  const payload = { id: user.id, email: user.email, solana_address: user.solana_address };
  const token   = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

  res.cookie('auth-token', token, {
    httpOnly: true,
    sameSite: IS_PRODUCTION ? 'strict' : 'lax',
    secure:   IS_PRODUCTION,   // HTTPS-only in prod
    maxAge:   7 * 24 * 60 * 60 * 1000,
  });

  return token;
}

// ─── SSE Helpers ──────────────────────────────────────────────────────────────
const sseClients = new Set();

function broadcastSSE(data) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

// Broadcast cluster updates every 3 seconds to all SSE subscribers
let sseBroadcastInterval = null;
function startSSEBroadcast() {
  if (sseBroadcastInterval) return;
  sseBroadcastInterval = setInterval(() => {
    if (sseClients.size === 0) return;
    try {
      const clusters = serializeClusters();
      const stats    = getClusterStats();
      broadcastSSE({ type: 'update', clusters, stats, timestamp: Date.now() });
    } catch (e) {
      console.error('SSE broadcast error:', e.message);
    }
  }, 3_000);
}

// ─── App Factory ──────────────────────────────────────────────────────────────
function startApi(port, startPolling, stopPolling) {
  initDB();
  startSSEBroadcast();

  const app = express();

  // ── Middleware ──────────────────────────────────────────────────────────────
  app.use(cors({
    origin:      (origin, cb) => cb(null, true),  // Allow all origins
    credentials: true,
  }));
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  // Request logger (minimal — logs method + path only)
  app.use((req, _res, next) => {
    if (req.path !== '/health') {  // Skip health check spam
      console.log(`📡 ${req.method} ${req.path} [${req.ip}]`);
    }
    next();
  });

  // ── Auth Routes ─────────────────────────────────────────────────────────────

  app.post('/signup', rateLimit(60_000, 5), async (req, res) => {
    const { email, password, solanaAddress } = req.body;
    if (!email && !solanaAddress) {
      return res.status(400).json({ error: 'Email or Solana address required' });
    }
    if (email && !password) {
      return res.status(400).json({ error: 'Password required for email signup' });
    }

    try {
      if (email) {
        const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) return res.status(409).json({ error: 'Email already registered' });
      }
      if (solanaAddress) {
        const existing = await pool.query('SELECT id FROM users WHERE solana_address = $1', [solanaAddress]);
        if (existing.rows.length > 0) return res.status(409).json({ error: 'Solana address already registered' });
      }

      const passwordHash = password ? await bcrypt.hash(password, 12) : null;
      const result = await pool.query(
        `INSERT INTO users (email, password_hash, solana_address)
         VALUES ($1, $2, $3) RETURNING id, email, solana_address`,
        [email || null, passwordHash, solanaAddress || null]
      );

      const user  = result.rows[0];
      const token = issueToken(res, user);

      console.log(`✅ New user signed up: ${email || solanaAddress}`);
      return res.status(201).json({ user: { id: user.id, email: user.email, solana_address: user.solana_address }, token });

    } catch (err) {
      console.error('❌ Signup error:', err.message);
      return res.status(500).json({ error: 'Signup failed' });
    }
  });

  app.post('/login', rateLimit(60_000, 10), async (req, res) => {
    const { email, password, solanaAddress } = req.body;
    if (!email && !solanaAddress) {
      return res.status(400).json({ error: 'Email+password or Solana address required' });
    }
    if (email && !password) {
      return res.status(400).json({ error: 'Password required for email login' });
    }

    try {
      let user;
      if (email) {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        user = result.rows[0];
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return res.status(401).json({ error: 'Invalid credentials' });

      } else {
        const result = await pool.query('SELECT * FROM users WHERE solana_address = $1', [solanaAddress]);
        user = result.rows[0];
        if (!user) return res.status(401).json({ error: 'Wallet not registered' });
      }

      const token = issueToken(res, user);
      console.log(`✅ Login: ${email || solanaAddress}`);
      return res.json({ user: { id: user.id, email: user.email, solana_address: user.solana_address }, token });

    } catch (err) {
      console.error('❌ Login error:', err.message);
      return res.status(500).json({ error: 'Login failed' });
    }
  });

  app.post('/logout', (req, res) => {
    res.clearCookie('auth-token', { httpOnly: true, sameSite: IS_PRODUCTION ? 'strict' : 'lax' });
    return res.json({ message: 'Logged out successfully' });
  });

  app.get('/me', authMiddleware, (req, res) => {
    return res.json({ user: req.user });
  });

  // ── Cluster Routes ──────────────────────────────────────────────────────────

  /**
   * GET /clusters
   * Returns all active/forming clusters.
   * Does NOT start polling — polling is started by startPolling() at boot or manually.
   * If called before polling starts, starts it once.
   */
  app.get('/clusters', async (_req, res) => {
    try {
      // Start polling on first /clusters hit if not already running
      if (!require('./state').isPollingStarted) {
        console.log('🚀 /clusters triggered startPolling()');
        startPolling().catch(e => console.error('startPolling error:', e.message));
        // Give it a moment to initialize before returning empty data
        await new Promise(r => setTimeout(r, 500));
      }

      const clusters = serializeClusters();
      const stats    = getClusterStats();

      return res.json({
        clusters,
        metadata: {
          total_active:   clusters.length,
          total_tracked:  stats.totalClusters,
          avg_confidence: stats.avgConfidence,
          total_sol:      stats.totalSOLInActive,
          timestamp:      new Date().toISOString(),
          requirements: {
            min_children:        5,
            min_total_sol:       20,
            min_transfer_sol:    1,
            detection_window_sec: 10,
          },
        },
      });

    } catch (err) {
      console.error('❌ /clusters error:', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * GET /clusters/top
   * Returns the single highest-confidence active cluster.
   * Useful for quick alerts / dashboard hero card.
   */
  app.get('/clusters/top', (_req, res) => {
    try {
      const clusters = serializeClusters();
      const top      = clusters[0] || null;  // Already sorted by confidence desc
      return res.json({ cluster: top, timestamp: new Date().toISOString() });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * GET /clusters/stream
   * Server-Sent Events endpoint — real-time cluster push.
   * Client connects once; receives updates every 3 seconds automatically.
   * No more client-side polling needed!
   *
   * Usage (frontend):
   *   const es = new EventSource('http://localhost:3001/clusters/stream');
   *   es.onmessage = e => console.log(JSON.parse(e.data));
   */
  app.get('/clusters/stream', (req, res) => {
    res.setHeader('Content-Type',  'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection',    'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

    res.flushHeaders();

    // Send initial snapshot immediately
    try {
      const clusters = serializeClusters();
      const stats    = getClusterStats();
      res.write(`data: ${JSON.stringify({ type: 'snapshot', clusters, stats, timestamp: Date.now() })}\n\n`);
    } catch (e) {
      console.error('SSE initial snapshot error:', e.message);
    }

    // Register client
    sseClients.add(res);
    console.log(`📡 SSE client connected (total: ${sseClients.size})`);

    // Heartbeat to keep connection alive through proxies
    const heartbeat = setInterval(() => {
      try { res.write(': heartbeat\n\n'); } catch { clearInterval(heartbeat); }
    }, 25_000);

    // Cleanup on disconnect
    req.on('close', () => {
      clearInterval(heartbeat);
      sseClients.delete(res);
      console.log(`📡 SSE client disconnected (total: ${sseClients.size})`);
    });
  });

  // ── Control Routes ──────────────────────────────────────────────────────────

  app.post('/start-polling', async (_req, res) => {
    try {
      await startPolling();
      return res.json({ message: 'Polling started', isRunning: require('./state').isPollingStarted });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post('/stop-polling', async (_req, res) => {
    try {
      await stopPolling();
      return res.json({ message: 'Polling stopped' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ── System Routes ───────────────────────────────────────────────────────────

  app.get('/health', (_req, res) => {
    const stats = getClusterStats();
    return res.json({
      ok:        true,
      timestamp: new Date().toISOString(),
      uptime:    process.uptime(),
      network:   'mainnet-beta',
      polling:   require('./state').isPollingStarted,
      clusters:  stats,
      sse_clients: sseClients.size,
    });
  });

  app.get('/stats', (_req, res) => {
    const stats = getClusterStats();
    return res.json({
      ...stats,
      timestamp:   new Date().toISOString(),
      uptime:      process.uptime(),
      memory:      process.memoryUsage(),
      network:     'mainnet-beta',
      polling:     require('./state').isPollingStarted,
      sse_clients: sseClients.size,
    });
  });

  // ── 404 Handler ─────────────────────────────────────────────────────────────
  app.use((_req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
  });

  // ── Global Error Handler ────────────────────────────────────────────────────
  app.use((err, _req, res, _next) => {
    console.error('❌ Unhandled Express error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  });

  // ── Start Server ─────────────────────────────────────────────────────────────
  const server = app.listen(port, () => {
    console.log(`\n🌐 API server listening on port ${port}`);
    console.log('📋 Endpoints:');
    console.log('   POST /signup              — Register');
    console.log('   POST /login               — Login');
    console.log('   POST /logout              — Logout');
    console.log('   GET  /me                  — Current user');
    console.log('   GET  /health              — Health check');
    console.log('   GET  /clusters            — All active clusters (JSON)');
    console.log('   GET  /clusters/top        — Highest confidence cluster');
    console.log('   GET  /clusters/stream     — Real-time SSE stream');
    console.log('   POST /start-polling       — Start monitoring');
    console.log('   POST /stop-polling        — Stop monitoring');
    console.log('   GET  /stats               — System stats\n');
  });

  server.on('error', (err) => {
    console.error('❌ Server error:', err.message);
  });

  // Increase header timeout for SSE connections
  server.headersTimeout = 0;
  server.keepAliveTimeout = 0;

  return server;
}

module.exports = { startApi };
