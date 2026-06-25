import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL;

function AdminDashboard() {
  const [stats, setStats] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API}/admin/stats`);
      const data = await res.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const resetStock = async () => {
    await fetch(`${API}/admin/reset-stock`, {
      method: "POST",
    });

    fetchStats();
  };

  useEffect(() => {
    fetchStats();

    const interval = setInterval(fetchStats, 3000);

    return () => clearInterval(interval);
  }, []);

  if (!stats) return <h2>Loading...</h2>;

  return (
  <div
    style={{
      minHeight: "100vh",
      background: "#0F172A",
      color: "white",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "system-ui",
    }}
  >
    <div
      style={{
        width: "500px",
        background: "#1E293B",
        borderRadius: "16px",
        padding: "30px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
        ⚡ Flash Sale Admin
      </h1>

      <div style={cardStyle}>
        <span>📦 MongoDB Stock</span>
        <strong>{stats.mongoStock}</strong>
      </div>

      <div style={cardStyle}>
        <span>⚡ Redis Stock</span>
        <strong>{stats.redisStock}</strong>
      </div>

      <div style={cardStyle}>
        <span>🛒 Orders Created</span>
        <strong>{stats.totalOrders}</strong>
      </div>

      <button
        onClick={resetStock}
        style={{
          width: "100%",
          marginTop: "25px",
          padding: "14px",
          background: "#22C55E",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        🔄 Reset Stock
      </button>
    </div>
  </div>
);
}
const cardStyle = {
  display: "flex",
  justifyContent: "space-between",
  background: "#334155",
  padding: "15px",
  borderRadius: "10px",
  marginBottom: "15px",
  fontSize: "18px",
};
export default AdminDashboard;
