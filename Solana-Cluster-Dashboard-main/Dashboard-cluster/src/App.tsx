// import React, { useEffect, useState } from 'react';
// import './App.css';

// interface Cluster {
//   funding_wallet: string;
//   recipients: string[];
//   token_mints: string[];
//   fan_out_slot: number;
//   buy_slots: number[];
//   common_patterns: {
//     amounts: string;
//     wallet_age: string;
//     dex_programs: string[];
//   };
//   total_sol_funded: number;
//   total_sol_remaining: number;
//   spend_rate_sol_per_min: number | null;
//   time_remaining_sec: number | null;
//   last_update: number;
//   cluster_age_sec: number;
//   children_count: number;
//   created_at: number;
//   status: 'active' | 'forming';
// }

// interface ApiResponse {
//   clusters: Cluster[];
//   metadata: {
//     total_active: number;
//     total_tracked: number;
//     timestamp: string;
//     requirements: {
//       min_children: number;
//       min_total_sol: number;
//       min_transfer_sol: number;
//       detection_window_sec: number;
//       data_retention_min: number;
//     };
//   };
// }

// const App: React.FC = () => {
//   const [data, setData] = useState<ApiResponse | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'forming'>('all');
//   const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);
//   const [isPolling, setIsPolling] = useState(false);
//   const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);

//   const API_BASE = 'https://solana-cluster-monitor.onrender.com';

//   const fetchData = async () => {
//     try {
//       const response = await fetch(`${API_BASE}/clusters`);
//       if (!response.ok) {
//         throw new Error('Failed to fetch clusters');
//       }
//       const json: ApiResponse = await response.json();
//       setData(json);
//       setLoading(false);
//     } catch (err) {
//       setError((err as Error).message);
//       setLoading(false);
//     }
//   };

//   const startPolling = async () => {
//     if (!isPolling) {
//       await fetchData();
//       const interval = setInterval(fetchData, 5000);
//       setPollInterval(interval);
//       setIsPolling(true);
//       console.log('🚀 Frontend polling started');
//     }
//   };

//   const stopPolling = async () => {
//     if (pollInterval) {
//       clearInterval(pollInterval);
//       setPollInterval(null);
//       setIsPolling(false);
//       console.log('🛑 Frontend polling stopped');
//     }
    
//     try {
//       const response = await fetch(`${API_BASE}/stop-polling`, {
//         method: 'POST',
//       });
//       if (!response.ok) {
//         throw new Error('Failed to stop backend polling');
//       }
//       console.log('🛑 Backend polling stopped');
//     } catch (err) {
//       console.error('❌ Error stopping backend polling:', err);
//       setError('Failed to stop backend polling');
//     }
//   };

//   if (!loading) {
//     console.log("loading is false");
//   }
//   if (error === "syntax error") {
//     console.log("loading is false");
//   }

//   useEffect(() => {
//     return () => {
//       if (pollInterval) {
//         clearInterval(pollInterval);
//       }
//     };
//   }, [pollInterval]);

//   const filteredClusters = data?.clusters.filter(cluster => {
//     const matchesSearch = cluster.funding_wallet.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesStatus = statusFilter === 'all' || cluster.status === statusFilter;
//     return matchesSearch && matchesStatus;
//   }) || [];

//   const copyToClipboard = (text: string) => {
//     navigator.clipboard.writeText(text).then(() => {
//       alert('Copied to clipboard!');
//     }).catch(err => {
//       console.error('Failed to copy:', err);
//     });
//   };

//   return (
//     <div className="app">
//       <header className="header">
//         <h1>Solana Funding Cluster Dashboard</h1>
//         <p>Real-time monitoring of active funding clusters (≥5 children, ≥20 SOL total, 10s window). Total Active: {data?.metadata.total_active} | Tracked: {data?.metadata.total_tracked} | Last Updated: {new Date(data?.metadata.timestamp || '').toLocaleString()}</p>
//         {error && <p className="error">{error}</p>}
//       </header>
//       <div className="controls">
//         <input
//           type="text"
//           placeholder="Search by Funding Wallet..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="search-input"
//         />
//         <select
//           value={statusFilter}
//           onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'forming')}
//           className="status-filter"
//         >
//           <option value="all">All Statuses</option>
//           <option value="active">Active Only</option>
//           <option value="forming">Forming Only</option>
//         </select>
//         <button
//           className={isPolling ? 'polling-btn active' : 'polling-btn'}
//           onClick={startPolling}
//           disabled={isPolling}
//         >
//           Start Polling
//         </button>
//         <button
//           className="polling-btn stop"
//           onClick={stopPolling}
//           disabled={!isPolling}
//         >
//           Stop Polling
//         </button>
//       </div>
//       <div className="table-container">
//         <table className="cluster-table">
//           <thead>
//             <tr>
//               <th>Funding Wallet</th>
//               <th>Children</th>
//               <th>Total Funded SOL</th>
//               <th>Remaining SOL</th>
//               <th>Spend Rate (SOL/min)</th>
//               <th>Time Remaining (sec)</th>
//               <th>Token Mints</th>
//               <th>DEX Programs</th>
//               <th>Fan Out Slot</th>
//               <th>Status</th>
//               <th>Age (sec)</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredClusters.length === 0 ? (
//               <tr><td colSpan={11} className="no-data">No clusters match your filters</td></tr>
//             ) : (
//               filteredClusters.map((cluster, index) => (
//                 <tr key={index} className="cluster-row">
//                   <td>{cluster.funding_wallet}</td>
//                   <td>
//                     {cluster.children_count}{' '}
//                     <button
//                       className="view-children-btn"
//                       onClick={() => setSelectedCluster(cluster)}
//                     >
//                       View Children
//                     </button>
//                   </td>
//                   <td>{cluster.total_sol_funded.toFixed(2)}</td>
//                   <td className={cluster.total_sol_remaining < 1 ? 'low-remaining' : ''}>{cluster.total_sol_remaining.toFixed(2)}</td>
//                   <td>{cluster.spend_rate_sol_per_min?.toFixed(2) ?? 'N/A'}</td>
//                   <td>{cluster.time_remaining_sec ?? 'N/A'}</td>
//                   <td>{cluster.token_mints.join(', ') || 'None'}</td>
//                   <td>{cluster.common_patterns.dex_programs.join(', ') || 'None'}</td>
//                   <td>{cluster.fan_out_slot}</td>
//                   <td className={`status-${cluster.status}`}>{cluster.status.toUpperCase()}</td>
//                   <td>{cluster.cluster_age_sec}</td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {selectedCluster && (
//         <div className="modal-overlay">
//           <div className="modal">
//             <h2>Child Addresses for {selectedCluster.funding_wallet.slice(0, 6)}...{selectedCluster.funding_wallet.slice(-4)}</h2>
//             <div className="child-addresses">
//               {selectedCluster.recipients.map((address, idx) => (
//                 <div key={idx} className="child-address">
//                   <span>{address}</span>
//                   <button
//                     className="copy-btn"
//                     onClick={() => copyToClipboard(address)}
//                   >
//                     Copy
//                   </button>
//                 </div>
//               ))}
//             </div>
//             <button
//               className="close-btn"
//               onClick={() => setSelectedCluster(null)}
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default App;

import React, { useEffect, useState } from 'react';
import './App.css';

interface Cluster {
  funding_wallet: string;
  recipients: string[];
  token_mints: string[];
  fan_out_slot: number;
  buy_slots: number[];
  common_patterns: {
    amounts: string;
    wallet_age: string;
    dex_programs: string[];
  };
  total_sol_funded: number;
  total_sol_remaining: number;
  spend_rate_sol_per_min: number | null;
  time_remaining_sec: number | null;
  last_update: number;
  cluster_age_sec: number;
  children_count: number;
  created_at: number;
  status: 'active' | 'forming';
}

interface ApiResponse {
  clusters: Cluster[];
  metadata: {
    total_active: number;
    total_tracked: number;
    timestamp: string;
    requirements: {
      min_children: number;
      min_total_sol: number;
      min_transfer_sol: number;
      detection_window_sec: number;
      data_retention_min: number;
    };
  };
}

const App: React.FC = () => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'forming'>('all');
  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);

  const API_BASE = 'http://localhost:3001';

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_BASE}/clusters`);
      if (!response.ok) {
        throw new Error('Failed to fetch clusters');
      }
      const json: ApiResponse = await response.json();
      setData(json);
      setLoading(false);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  const startPolling = async () => {
    if (!isPolling) {
      await fetchData();
      const interval = setInterval(fetchData, 5000);
      setPollInterval(interval);
      setIsPolling(true);
      console.log('🚀 Frontend polling started');
    }
  };

  const stopPolling = async () => {
    if (pollInterval) {
      clearInterval(pollInterval);
      setPollInterval(null);
      setIsPolling(false);
      console.log('🛑 Frontend polling stopped');
    }
    
    try {
      const response = await fetch(`${API_BASE}/stop-polling`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to stop backend polling');
      }
      console.log('🛑 Backend polling stopped');
    } catch (err) {
      console.error('❌ Error stopping backend polling:', err);
      setError('Failed to stop backend polling');
    }
  };

  if (!loading) {
    console.log("loading is false");
  }
  if (error === "syntax error") {
    console.log("loading is false");
  }

  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [pollInterval]);

  const filteredClusters = data?.clusters.filter(cluster => {
    const matchesSearch = cluster.funding_wallet.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || cluster.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Solana Funding Cluster Dashboard</h1>
        <p>Real-time monitoring of active funding clusters (≥5 children, ≥20 SOL total, 10s window). Total Active: {data?.metadata.total_active} | Tracked: {data?.metadata.total_tracked} | Last Updated: {new Date(data?.metadata.timestamp || '').toLocaleString()}</p>
        {error && <p className="error">{error}</p>}
      </header>
      <div className="controls">
        <input
          type="text"
          placeholder="Search by Funding Wallet..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'forming')}
          className="status-filter"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active Only</option>
          <option value="forming">Forming Only</option>
        </select>
        <button
          className={isPolling ? 'polling-btn active' : 'polling-btn'}
          onClick={startPolling}
          disabled={isPolling}
        >
          Start Polling
        </button>
        <button
          className="polling-btn stop"
          onClick={stopPolling}
          disabled={!isPolling}
        >
          Stop Polling
        </button>
      </div>
      <div className="table-container">
        <table className="cluster-table">
          <thead>
            <tr>
              <th>Funding Wallet</th>
              <th>Children</th>
              <th>Total Funded SOL</th>
              <th>Remaining SOL</th>
              <th>Spend Rate (SOL/min)</th>
              <th>Time Remaining (sec)</th>
              <th>Token Mints</th>
              <th>DEX Programs</th>
              <th>Fan Out Slot</th>
              <th>Status</th>
              <th>Age (sec)</th>
            </tr>
          </thead>
          <tbody>
            {filteredClusters.length === 0 ? (
              <tr><td colSpan={11} className="no-data">No clusters match your filters</td></tr>
            ) : (
              filteredClusters.map((cluster, index) => (
                <tr key={index} className="cluster-row">
                  <td>{cluster.funding_wallet}</td>
                  <td>
                    {cluster.children_count}{' '}
                    <button
                      className="view-children-btn"
                      onClick={() => setSelectedCluster(cluster)}
                    >
                      View Children
                    </button>
                  </td>
                  <td>{cluster.total_sol_funded.toFixed(2)}</td>
                  <td className={cluster.total_sol_remaining < 1 ? 'low-remaining' : ''}>{cluster.total_sol_remaining.toFixed(2)}</td>
                  <td>{cluster.spend_rate_sol_per_min?.toFixed(2) ?? 'N/A'}</td>
                  <td>{cluster.time_remaining_sec ?? 'N/A'}</td>
                  <td>{cluster.token_mints.join(', ') || 'None'}</td>
                  <td>{cluster.common_patterns.dex_programs.join(', ') || 'None'}</td>
                  <td>{cluster.fan_out_slot}</td>
                  <td className={`status-${cluster.status}`}>{cluster.status.toUpperCase()}</td>
                  <td>{cluster.cluster_age_sec}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedCluster && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Child Addresses for {selectedCluster.funding_wallet.slice(0, 6)}...{selectedCluster.funding_wallet.slice(-4)}</h2>
            <div className="child-addresses">
              {selectedCluster.recipients.map((address, idx) => (
                <div key={idx} className="child-address">
                  <span>{address}</span>
                  <button
                    className="copy-btn"
                    onClick={() => copyToClipboard(address)}
                  >
                    Copy
                  </button>
                </div>
              ))}
            </div>
            <button
              className="close-btn"
              onClick={() => setSelectedCluster(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;


