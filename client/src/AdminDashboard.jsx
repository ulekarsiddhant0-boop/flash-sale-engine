import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL;

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [tokenInput, setTokenInput] = useState("");
  const [adminToken, setAdminToken] = useState("");
  const [authError, setAuthError] = useState("");
  const [resetting, setResetting] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const fetchStats = async (token) => {
    try {
      const res = await fetch(`${API}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        setAdminToken("");
        setStats(null);
        setAuthError("Access denied. Check the admin token and try again.");
        return false;
      }
      const data = await res.json();

      if (data.success) {
        setStats(data.data);
        setAuthError("");
        return true;
      }
      setAuthError(data.message || "Could not load admin stats.");
    } catch {
      setAuthError("Could not connect to the admin API.");
    }
    return false;
  };

  const submitToken = async (event) => {
    event.preventDefault();
    setStats(null);
    const token = tokenInput.trim();
    if (token && await fetchStats(token)) {
      setAdminToken(token);
      setTokenInput("");
    }
  };

  const resetStock = async () => {
  if (resetting) return;

  setResetting(true);
  setActionMessage("");

  try {
    const res = await fetch(`${API}/admin/reset-stock`, {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const data = await res.json();

    if (res.status === 401) {
      setAdminToken("");
      setStats(null);
      setAuthError("Access denied. Enter the admin token again.");
      return;
    }

    if (!res.ok || !data.success) {
      setActionMessage(data.message || "Stock reset failed.");
      return;
    }

    setActionMessage(data.message || "Stock reset successfully.");
    await fetchStats(adminToken);
  } catch {
    setActionMessage("Could not connect to the admin API.");
  } finally {
    setResetting(false);
  }
};

  useEffect(() => {
    if (!adminToken) return undefined;

    const interval = setInterval(() => fetchStats(adminToken), 3000);

    return () => clearInterval(interval);
  }, [adminToken]);

     if (!adminToken || !stats) {
    return (
      <div style={pageStyle}>
        <form onSubmit={submitToken} style={loginStyle}>
          <h1>Flash Sale Admin</h1>

          <label htmlFor="admin-token">Admin token</label>

          <input
            id="admin-token"
            type="password"
            autoComplete="off"
            value={tokenInput}
            onChange={(event) => setTokenInput(event.target.value)}
            required
          />

          {authError && <p role="alert">{authError}</p>}

          <button type="submit">Sign in</button>
        </form>
      </div>
    );
  }

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
      {actionMessage && (
  <p role="status" aria-live="polite">
    {actionMessage}
  </p>
)}
      <button
        onClick={resetStock}
        disabled={resetting}
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
       {resetting ? "Resetting..." : "🔄 Reset Stock"}
      </button>
    </div>
  </div>
);
}
const pageStyle = {
  minHeight: "100vh",
  background: "#0F172A",
  color: "white",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontFamily: "system-ui",
};
const loginStyle = {
  width: "min(400px, calc(100% - 40px))",
  display: "grid",
  gap: "12px",
  background: "#1E293B",
  padding: "30px",
  borderRadius: "16px",
};
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
