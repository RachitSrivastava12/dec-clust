const express = require('express');
const { serializeClusters, getClusterStats } = require('./cluster');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

// const pool = new Pool({
//   connectionString: "postgresql://postgres:Rachit@2209@db.qrohatrfjojfckiljaxc.supabase.co:5432/postgres",
//   ssl: {
//     rejectUnauthorized: false, // allow self-signed certs
//   },
// });


const pool = new Pool({
  connectionString: "postgresql://postgres:Rachit@2209@db.qrohatrfjojfckiljaxc.supabase.co:5432/postgres",
  ssl: { rejectUnauthorized: false },
  family: 4, // 👈 FORCE IPv4 (THIS IS THE FIX)
});


// 🔹 Initialize DB tables if not exist
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE,
        password_hash TEXT,
        solana_address TEXT UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Users table created or already exists');
  } catch (err) {
    console.error('❌ Error initializing DB:', err.message);
  }
}

function startApi(port = 3001, startPolling, stopPolling) {
  initDB(); // Call on startup

  const app = express();
  
//const allowedOrigin = "http://localhost:3000"; // your frontend URL

// app.use(cors({
//   origin: "*",   // allow everything
//   credentials: true
// }));


  app.use(cors({
  origin: (origin, callback) => {
    // Allow all origins, including undefined (e.g., curl or server requests)
    callback(null, true);
  },
  credentials: true  // Allows cookies to be sent
}));




  app.use(express.json());
  app.use(cookieParser());

  // 🔹 Utility: auth middleware
  function authMiddleware(req, res, next) {
    const token = req.cookies['auth-token'];
    if (!token) return res.status(401).json({ error: "Not authenticated" });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch {
      return res.status(401).json({ error: "Invalid token" });
    }
  }

  // 🔹 Signup
  app.post('/signup', async (req, res) => {
    const { email, password, solanaAddress } = req.body;
    if (!email && !solanaAddress) {
      return res.status(400).json({ error: "Email or Solana address required" });
    }
    if (email && !password) {
      return res.status(400).json({ error: "Password required for email signup" });
    }

    try {
      // Check for existing email or solana address
      if (email) {
        const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
        if (existing.rows.length > 0) {
          return res.status(400).json({ error: "Email already registered" });
        }
      }
      if (solanaAddress) {
        const existing = await pool.query("SELECT id FROM users WHERE solana_address = $1", [solanaAddress]);
        if (existing.rows.length > 0) {
          return res.status(400).json({ error: "Solana address already registered" });
        }
      }

      let passwordHash = null;
      if (password) {
        passwordHash = await bcrypt.hash(password, 10);
      }

      const result = await pool.query(
        `INSERT INTO users (email, password_hash, solana_address) 
         VALUES ($1, $2, $3) RETURNING id, email, solana_address`,
        [email || null, passwordHash, solanaAddress || null]
      );

      const user = result.rows[0];
      const token = jwt.sign({ id: user.id, email: user.email, solana_address: user.solana_address }, JWT_SECRET, { expiresIn: "7d" });
      res.cookie("auth-token", token, { httpOnly: true, sameSite: "lax" });
      res.json({ user });

      localStorage.setItem("Account", "Signed up");
    } catch (err) {
      console.error("❌ Signup error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // 🔹 Login
  app.post('/login', async (req, res) => {
    const { email, password, solanaAddress } = req.body;
    if (!email && !solanaAddress) {
      return res.status(400).json({ error: "Email+password or Solana address required" });
    }
    if (email && !password) {
      return res.status(400).json({ error: "Password required for email login" });
    }

    try {
      let user;
      if (email) {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        user = result.rows[0];
        if (!user) return res.status(400).json({ error: "User not found" });
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return res.status(400).json({ error: "Invalid password" });
      } else if (solanaAddress) {
        const result = await pool.query("SELECT * FROM users WHERE solana_address = $1", [solanaAddress]);
        user = result.rows[0];
        if (!user) return res.status(400).json({ error: "User not found" });
      }

      const token = jwt.sign({ id: user.id, email: user.email, solana_address: user.solana_address }, JWT_SECRET, { expiresIn: "7d" });
      res.cookie("auth-token", token, { httpOnly: true, sameSite: "lax" });
      

      res.json({ user });
      localStorage.setItem("Account", "Logged in");
    } catch (err) {
      console.error("❌ Login error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // 🔹 Logout
  app.post('/logout', (req, res) => {
    res.clearCookie("auth-token");
    res.json({ message: "Logged out successfully" });
  });

  // 🔹 Me
  app.get('/me', authMiddleware, (req, res) => {
    res.json({ user: req.user });
  });

  // ============ YOUR EXISTING ROUTES ============
  app.get('/health', (_req, res) => {
    const stats = getClusterStats();
    res.json({ 
      ok: true, 
      timestamp: new Date().toISOString(),
      clusters: stats,
      uptime: process.uptime(),
      network: 'mainnet-beta'
    });
  });

  app.get('/clusters', async (_req, res) => {
    try {
      await startPolling();
      
      const clusters = serializeClusters();
      const stats = getClusterStats();
      
      console.log(`📡 API /clusters request served - Active: ${clusters.length}, Total tracked: ${stats.totalClusters}`);
      
      const response = {
        clusters: clusters,
        metadata: {
          total_active: clusters.length,
          total_tracked: stats.totalClusters,
          timestamp: new Date().toISOString(),
          requirements: {
            min_children: 5,
            min_total_sol: 20,
            min_transfer_sol: 1,
            detection_window_sec: 10,
            data_retention_min: 30
          }
        }
      };
      
      res.json(response);
    } catch (error) {
      console.error('❌ Error serving /clusters:', error.message);
      res.status(500).json({ 
        error: 'Internal server error', 
        message: error.message 
      });
    }
  });

  app.post('/stop-polling', async (_req, res) => {
    try {
      stopPolling();
      console.log('📡 API /stop-polling request served - Polling stopped');
      res.json({ message: 'Polling stopped successfully' });
    } catch (error) {
      console.error('❌ Error stopping polling:', error.message);
      res.status(500).json({ 
        error: 'Internal server error', 
        message: error.message 
      });
    }
  });

  app.get('/stats', (_req, res) => {
    const stats = getClusterStats();
    res.json({
      ...stats,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      network: 'mainnet-beta'
    });
  });


const PORT = process.env.PORT || 8080

const server = app.listen(PORT, () => {
  console.log(`🌐 API server listening on port ${PORT}`);
  console.log(`📋 Endpoints available:`);
  console.log(`   POST /signup    - Register user`);
  console.log(`   POST /login     - Login user`);
  console.log(`   POST /logout    - Logout user`);
  console.log(`   GET  /me        - Current session user`);
  console.log(`   GET  /health    - Health check`);
  console.log(`   GET  /clusters  - Active clusters data`);
  console.log(`   POST /stop-polling - Stop backend polling`);
  console.log(`   GET  /stats     - System statistics`);
});


  server.on('error', (error) => {
    console.error('❌ API server error:', error.message);
  });

  return server;
}

module.exports = { startApi };
