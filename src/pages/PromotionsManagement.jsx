// frontend/src/pages/PromotionsManagement.jsx
import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { getAuthToken } from "../utils/auth";

function PromotionsManagement() {
  const { themeData } = useTheme();
  const [promotions, setPromotions] = useState([]);
  const [form, setForm] = useState({ code: "", expiry: "", type: "", value: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    const res = await fetch("http://localhost:5000/api/admin/promotions");
    const data = await res.json();
    setPromotions(data);
  };

  const handleCreate = async () => {
    if (!form.code || !form.expiry || !form.type || !form.value) {
      setMessage("Please fill all fields");
      return;
    }

    const token = getAuthToken();
    const res = await fetch("http://localhost:5000/api/admin/promotions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : ""
      },
      body: JSON.stringify({
        code: form.code.toLowerCase(),
        expiry: form.expiry,
        type: form.type,
        value: parseInt(form.value),
      }),
    });

    if (res.ok) {
      setMessage("✅ Promo code created!");
      setForm({ code: "", expiry: "", type: "", value: "" });
      fetchPromotions();
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage("❌ Failed to create");
    }
  };

  const handleDelete = async (id) => {
    const token = getAuthToken();
    await fetch(`http://localhost:5000/api/admin/promotions/${id}`, {
      method: "DELETE",
      headers: { "Authorization": token ? `Bearer ${token}` : "" }
    });
    fetchPromotions();
  };

  return (
    <div style={{
      background: themeData.cardBg,
      borderRadius: "28px",
      padding: "24px",
    }}>
      <h1 style={{ margin: "0 0 24px", color: themeData.textColor }}>Promotions Management</h1>

      {/* Create Form */}
      <div style={{
        background: "rgba(255,255,255,0.08)",
        borderRadius: "20px",
        padding: "20px",
        marginBottom: "24px",
      }}>
        <h2 style={{ margin: "0 0 16px", fontSize: "20px", color: themeData.textColor }}>Create New Promo Code</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <input
            type="text"
            placeholder="Code (e.g., SUMMER25)"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
          />
          <input
            type="date"
            value={form.expiry}
            onChange={(e) => setForm({ ...form, expiry: e.target.value })}
            style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
          />
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
          >
            <option value="">Select Type</option>
            <option value="All Products">All Products</option>
            <option value="Specific Product">Specific Product</option>
            <option value="Category">Category</option>
          </select>
          <input
            type="number"
            placeholder="Discount % (1-100)"
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
            style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
          />
          <button onClick={handleCreate} style={{
            background: themeData.primary,
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "10px",
            cursor: "pointer",
          }}>Create Promo Code</button>
        </div>
        {message && <p style={{ marginTop: "16px", textAlign: "center", color: message.includes("✅") ? "#39a86f" : "#ff4d6d" }}>{message}</p>}
      </div>

      {/* Promotions List */}
      <div style={{
        background: "rgba(255,255,255,0.08)",
        borderRadius: "20px",
        padding: "20px",
      }}>
        <h2 style={{ margin: "0 0 16px", fontSize: "20px", color: themeData.textColor }}>Active Promo Codes</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {promotions.map(promo => (
            <div key={promo._id} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "12px",
            }}>
              <div>
                <strong style={{ color: themeData.primary }}>{promo.code.toUpperCase()}</strong>
                <span style={{ marginLeft: "12px", color: themeData.textLight }}>{promo.value}% off</span>
                <span style={{ marginLeft: "12px", color: themeData.textLight, fontSize: "12px" }}>
                  Expires: {new Date(promo.expiry).toLocaleDateString()}
                </span>
              </div>
              <button onClick={() => handleDelete(promo._id)} style={{
                background: "#ff4d6d",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "6px 12px",
                cursor: "pointer",
              }}>Delete</button>
            </div>
          ))}
          {promotions.length === 0 && <p style={{ textAlign: "center", color: themeData.textLight }}>No promo codes yet</p>}
        </div>
      </div>
    </div>
  );
}

export default PromotionsManagement;