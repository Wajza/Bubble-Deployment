// frontend/src/pages/InventoryManagement.jsx
import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";

function InventoryManagement() {
  const { themeData } = useTheme();

  const [products, setProducts] = useState([]);
  const [customOptions, setCustomOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchCustomOptions();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/inventory");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomOptions = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/custom-options");
      const data = await res.json();
      setCustomOptions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const updateStock = async (id, newStock) => {
    const safeStock = Number.isNaN(newStock) || newStock < 0 ? 0 : newStock;

    await fetch(`http://localhost:5000/api/admin/inventory/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock: safeStock }),
    });

    fetchProducts();
  };

  const updateCustomOption = async (id, updates) => {
    await fetch(`http://localhost:5000/api/custom-options/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    fetchCustomOptions();
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        Loading inventory...
      </div>
    );
  }

  return (
    <div
      style={{
        background: themeData.cardBg,
        borderRadius: "28px",
        padding: "24px",
      }}
    >
      <h1 style={{ margin: "0 0 24px", color: themeData.textColor }}>
        Inventory Management
      </h1>

      {/* Normal Products */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "20px",
        }}
      >
        {products.map((product) => (
          <div
            key={product._id}
            style={{
              background: "rgba(255,255,255,0.08)",
              borderRadius: "16px",
              padding: "16px",
              textAlign: "center",
            }}
          >
            <img
              src={product.image}
              alt={product.name}
              style={{
                width: "100px",
                height: "100px",
                objectFit: "contain",
              }}
            />

            <h3 style={{ margin: "12px 0 6px", color: themeData.textColor }}>
              {product.name}
            </h3>

            <p
              style={{
                color: product.stock <= 5 ? "#ff4d6d" : "#39a86f",
                fontWeight: "bold",
              }}
            >
              {product.stock <= 5 ? "⚠️ Low Stock" : "✓ In Stock"}
            </p>

            <input
              type="number"
              min="0"
              value={product.stock}
              onChange={(e) =>
                updateStock(product._id, parseInt(e.target.value, 10))
              }
              style={{
                width: "80px",
                padding: "8px",
                textAlign: "center",
                borderRadius: "8px",
                border: "1px solid #ccc",
                margin: "10px 0",
              }}
            />

            <p style={{ color: themeData.textLight }}>
              Current: {product.stock} units
            </p>
          </div>
        ))}
      </div>

      {/* Custom Soap Options */}
      <h2 style={{ margin: "36px 0 20px", color: themeData.textColor }}>
        Custom Soap Options
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "20px",
        }}
      >
        {customOptions.map((option) => (
          <div
            key={option._id}
            style={{
              background: "rgba(255,255,255,0.08)",
              borderRadius: "16px",
              padding: "16px",
              textAlign: "center",
            }}
          >
            <h3 style={{ margin: "12px 0 6px", color: themeData.textColor }}>
              {option.name}
            </h3>

            <p style={{ color: themeData.textLight, margin: "6px 0" }}>
              Type: {option.type}
            </p>

            <p
              style={{
                color:
                  option.available && option.stock > 0 ? "#39a86f" : "#ff4d6d",
                fontWeight: "bold",
              }}
            >
              {option.available && option.stock > 0
                ? "✓ Available"
                : "Unavailable"}
            </p>

            <input
              type="number"
              min="0"
              value={option.stock}
              onChange={(e) =>
                updateCustomOption(option._id, {
                  stock: parseInt(e.target.value, 10) || 0,
                })
              }
              style={{
                width: "80px",
                padding: "8px",
                textAlign: "center",
                borderRadius: "8px",
                border: "1px solid #ccc",
                margin: "10px 0",
              }}
            />

            <p style={{ color: themeData.textLight }}>
              Current: {option.stock} units
            </p>

            <button
              onClick={() =>
                updateCustomOption(option._id, {
                  available: !option.available,
                })
              }
              style={{
                marginTop: "8px",
                padding: "8px 14px",
                border: "none",
                borderRadius: "8px",
                color: "white",
                background:
                  option.available && option.stock > 0 ? "#39a86f" : "#ff4d6d",
                cursor: "pointer",
              }}
            >
              {option.available ? "Set Unavailable" : "Set Available"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default InventoryManagement;