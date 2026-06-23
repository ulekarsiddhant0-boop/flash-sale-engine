import React, { useState, useEffect } from "react";
import { ShoppingCart, ShieldAlert, Zap, RefreshCw } from "lucide-react";

// Make sure this ID matches your seeded Product ID from your backend terminal logs
const PRODUCT_ID = "6a2eb84e12a1d5c7154396ac";
const API_BASE_URL = "https://flash-sale-engine-api.onrender.com/api";

function App() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch live Product Details (Utilizes our Cache-Aside Read Route)
  const fetchProductDetails = async () => {
    try {
      setError("");
      const response = await fetch(`${API_BASE_URL}/products/${PRODUCT_ID}`);
      const result = await response.json();

      if (result.success) {
        setProduct(result.data);
      } else {
        setError(result.message || "Failed to load product.");
      }
    } catch (err) {
      setError(
        "Cannot connect to the backend server. Make sure port 5000 is live!",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, []);

  // 2. Handle "Buy Now" Request (Hits our Concurrency Engine & Rate Limiter)
  const handlePurchase = async () => {
    setIsSubmitting(true);
    setMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}/orders/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: PRODUCT_ID }),
      });

      const result = await response.json();

      if (response.status === 201) {
        setMessage(`🎉 Success! ${result.message}`);
        // Refresh product info to instantly update the stock tracking bar
        fetchProductDetails();
      } else {
        setMessage(`⚠️ Rejection: ${result.message}`);
      }
    } catch (err) {
      setMessage("❌ Connection error while trying to process checkout.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div style={styles.center}>
        <h3>Loading Flash Sale Engine...</h3>
      </div>
    );
  if (error)
    return (
      <div style={styles.center}>
        <h3 style={{ color: "red" }}>{error}</h3>
        <button onClick={fetchProductDetails} style={styles.button}>
          Retry
        </button>
      </div>
    );

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <Zap color="#EAB308" size={32} fill="#EAB308" />
        <h1>Lightning Flash Sale Portal</h1>
      </header>

      <main style={styles.card}>
        <div style={styles.badge}>LIVE DEALS</div>
        <h2 style={styles.title}>{product?.name}</h2>
        <p style={styles.desc}>{product?.description}</p>

        <div style={styles.priceContainer}>
          <span style={styles.flashPrice}>${product?.flashPrice}</span>
          <span style={styles.originalPrice}>${product?.price}</span>
        </div>

        {/* Real-time Dynamic Stock Tracker */}
        <div style={styles.stockWrapper}>
          <div style={styles.stockHeader}>
            <span>
              Available Stock: <strong>{product?.stock} units</strong>
            </span>
            <span>{product?.stock > 0 ? "In Stock" : "SOLD OUT"}</span>
          </div>
          <div style={styles.progressBarBg}>
            <div
              style={{
                ...styles.progressBarFill,
                width: `${(product?.stock / 10) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handlePurchase}
          disabled={isSubmitting || product?.stock <= 0}
          style={product?.stock > 0 ? styles.buyButton : styles.disabledButton}
        >
          <ShoppingCart size={20} />
          {isSubmitting
            ? "Securing Item..."
            : product?.stock > 0
              ? "FLASH BUY NOW"
              : "SOLD OUT"}
        </button>

        {/* Real-time Firewall & Transaction Notifications */}
        {message && (
          <div
            style={message.includes("🎉") ? styles.successBox : styles.alertBox}
          >
            {message.includes("Too many") ? <ShieldAlert size={18} /> : null}
            <span>{message}</span>
          </div>
        )}
      </main>

      <button onClick={fetchProductDetails} style={styles.refreshBtn}>
        <RefreshCw size={16} /> Refresh Market Price
      </button>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "system-ui, sans-serif",
    backgroundColor: "#0F172A",
    color: "#F8FAFC",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "30px",
  },
  card: {
    backgroundColor: "#1E293B",
    borderRadius: "16px",
    padding: "32px",
    width: "100%",
    maxWidth: "450px",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
    border: "1px solid #334155",
    position: "relative",
  },
  badge: {
    backgroundColor: "#EF4444",
    color: "white",
    fontWeight: "bold",
    fontSize: "12px",
    padding: "4px 12px",
    borderRadius: "9999px",
    display: "inline-block",
    marginBottom: "16px",
  },
  title: { fontSize: "24px", margin: "0 0 8px 0", fontWeight: "700" },
  desc: {
    color: "#94A3B8",
    fontSize: "14px",
    lineHeight: "1.5",
    margin: "0 0 24px 0",
  },
  priceContainer: {
    display: "flex",
    alignItems: "baseline",
    gap: "12px",
    marginBottom: "24px",
  },
  flashPrice: { fontSize: "36px", fontWeight: "800", color: "#22C55E" },
  originalPrice: {
    fontSize: "18px",
    textDecoration: "line-through",
    color: "#64748B",
  },
  stockWrapper: { marginBottom: "28px" },
  stockHeader: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px",
    marginBottom: "8px",
    color: "#CBD5E1",
  },
  progressBarBg: {
    height: "8px",
    backgroundColor: "#334155",
    borderRadius: "9999px",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#EAB308",
    transition: "width 0.4s ease-in-out",
  },
  buyButton: {
    width: "100%",
    backgroundColor: "#EF4444",
    color: "white",
    border: "none",
    padding: "14px",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  disabledButton: {
    width: "100%",
    backgroundColor: "#475569",
    color: "#94A3B8",
    border: "none",
    padding: "14px",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    cursor: "not-allowed",
  },
  successBox: {
    marginTop: "20px",
    padding: "12px",
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    border: "1px solid #22C55E",
    color: "#4ADE80",
    borderRadius: "8px",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  alertBox: {
    marginTop: "20px",
    padding: "12px",
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    border: "1px solid #EF4444",
    color: "#FCA5A5",
    borderRadius: "8px",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  center: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0F172A",
    color: "white",
  },
  refreshBtn: {
    marginTop: "16px",
    backgroundColor: "transparent",
    border: "none",
    color: "#64748B",
    cursor: "pointer",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  button: {
    marginTop: "12px",
    padding: "8px 16px",
    backgroundColor: "#334155",
    border: "none",
    color: "white",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default App;
