// frontend/src/pages/ProductManagement.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { formatSAR } from "../utils/currency";
import { getAuthToken } from "../utils/auth";

function ProductManagement() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { themeData } = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("list"); // 'list', 'add', 'edit'
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    scent: "",
    skinType: [],
    ingredients: "",
    theme: "purple",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState("");
  const [message, setMessage] = useState("");

  // Available themes with their colors
  const availableThemes = [
    { name: "purple", color: "#8f4bd8", label: "Purple" },
    { name: "pink", color: "#b84a57", label: "Pink" },
    { name: "yellow", color: "#d4a843", label: "Yellow" },
    { name: "green", color: "#3d8f5e", label: "Green" },
    { name: "blue", color: "#3a7ca5", label: "Blue" }
  ];

  useEffect(() => {
    fetchProducts();
    if (id) {
      fetchProductForEdit(id);
      setMode("edit");
    }
  }, [id]);

  const fetchProducts = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch("http://localhost:5000/api/admin/products", {
        headers: { "Authorization": token ? `Bearer ${token}` : "" }
      });
      const data = await res.json();
      setProducts(data.filter(p => !p.isCustomizable));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductForEdit = async (productId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/products/${productId}`);
      const product = await res.json();
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        stock: product.stock || "",
        scent: product.scent || "",
        skinType: product.skinType || [],
        ingredients: Array.isArray(product.ingredients) ? product.ingredients.join(", ") : product.ingredients || "",
        theme: product.theme || "purple",
        image: null,
      });
      if (product.image) {
        setImagePreview(product.image);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const token = getAuthToken();
      await fetch(`http://localhost:5000/api/admin/products/${productId}`, {
        method: "DELETE",
        headers: { "Authorization": token ? `Bearer ${token}` : "" }
      });
      fetchProducts();
      setMessage("✅ Product deleted successfully!");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSkinTypeChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      skinType: prev.skinType.includes(value)
        ? prev.skinType.filter(t => t !== value)
        : [...prev.skinType, value]
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.description || !formData.price || !formData.stock) {
      setMessage("❌ Please fill all required fields");
      return;
    }

    const token = getAuthToken();
    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("description", formData.description);
    submitData.append("price", formData.price);
    submitData.append("stock", formData.stock);
    submitData.append("scent", formData.scent);
    submitData.append("skinType", formData.skinType.join(","));
    submitData.append("ingredients", formData.ingredients);
    submitData.append("theme", formData.theme);
    submitData.append("isCustomizable", false);
    
    if (formData.image && formData.image instanceof File) {
      submitData.append("image", formData.image);
    }

    try {
      let response;
      if (mode === "edit") {
        response = await fetch(`http://localhost:5000/api/admin/products/${id}`, {
          method: "PUT",
          headers: { "Authorization": token ? `Bearer ${token}` : "" },
          body: submitData,
        });
      } else {
        response = await fetch("http://localhost:5000/api/admin/products", {
          method: "POST",
          headers: { "Authorization": token ? `Bearer ${token}` : "" },
          body: submitData,
        });
      }

      if (response.ok) {
        setMessage(mode === "edit" ? "✅ Product updated successfully!" : "✅ Product added successfully!");
        fetchProducts();
        setTimeout(() => {
          setMessage("");
          setMode("list");
          navigate("/admin/products");
        }, 2000);
      } else {
        const errorData = await response.json();
        setMessage(`❌ ${errorData.message || "Failed to save product"}`);
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Error saving product");
    }
  };

  if (loading && mode === "list") {
    return (
      <div style={{ 
        background: themeData.cardBg, 
        borderRadius: "28px", 
        padding: "50px", 
        textAlign: "center" 
      }}>
        Loading products...
      </div>
    );
  }

  // Product List View
  if (mode === "list") {
    return (
      <div style={{
        background: themeData.cardBg,
        borderRadius: "28px",
        padding: "24px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
          <h1 style={{ margin: 0, color: themeData.textColor }}>🛍️ Product Management</h1>
          <button 
            onClick={() => {
              setMode("add");
              setFormData({
                name: "", description: "", price: "", stock: "", 
                scent: "", skinType: [], ingredients: "", theme: "purple", image: null
              });
              setImagePreview("");
            }} 
            style={{
              background: themeData.primary,
              color: "white",
              border: "none",
              borderRadius: "12px",
              padding: "12px 24px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            + Add New Product
          </button>
        </div>

        {message && (
          <div style={{
            background: message.includes("✅") ? "rgba(57,168,111,0.2)" : "rgba(255,77,109,0.2)",
            color: message.includes("✅") ? "#39a86f" : "#ff4d6d",
            padding: "12px",
            borderRadius: "12px",
            marginBottom: "20px",
            textAlign: "center",
          }}>
            {message}
          </div>
        )}

        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", 
          gap: "20px" 
        }}>
          {products.map(product => {
            // Get theme color for the product card
            const productTheme = availableThemes.find(t => t.name === product.theme) || availableThemes[0];
            
            return (
              <div key={product._id} style={{
                background: "rgba(255,255,255,0.08)",
                borderRadius: "20px",
                padding: "20px",
                textAlign: "center",
                transition: "transform 0.2s, box-shadow 0.2s",
                cursor: "pointer",
                border: `1px solid ${productTheme.color}40`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = `0 10px 25px ${productTheme.color}30`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
              >
                <img 
                  src={product.image?.startsWith("http") ? product.image : `http://localhost:5000${product.image}`} 
                  alt={product.name} 
                  style={{ width: "140px", height: "140px", objectFit: "contain", marginBottom: "12px" }} 
                />
                <h3 style={{ margin: "0 0 8px", color: themeData.textColor, fontSize: "18px" }}>{product.name}</h3>
                <p style={{ color: productTheme.color, fontWeight: "bold", fontSize: "20px", margin: "8px 0" }}>
                  {formatSAR(product.price)}
                </p>
                <p style={{ 
                  color: product.stock <= 5 ? "#ff4d6d" : "#39a86f", 
                  fontSize: "13px",
                  fontWeight: "500"
                }}>
                  {product.stock <= 5 ? `⚠️ Low Stock: ${product.stock}` : `✓ In Stock: ${product.stock}`}
                </p>
                <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "16px" }}>
                  <button 
                    onClick={() => {
                      setMode("edit");
                      fetchProductForEdit(product._id);
                      navigate(`/admin/products/edit/${product._id}`);
                    }} 
                    style={{
                      background: productTheme.color,
                      color: "white",
                      border: "none",
                      borderRadius: "10px",
                      padding: "8px 20px",
                      cursor: "pointer",
                      fontWeight: "500",
                    }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(product._id)} 
                    style={{
                      background: "#ff4d6d",
                      color: "white",
                      border: "none",
                      borderRadius: "10px",
                      padding: "8px 20px",
                      cursor: "pointer",
                      fontWeight: "500",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {products.length === 0 && (
          <div style={{ 
            textAlign: "center", 
            color: themeData.textLight, 
            padding: "60px 20px",
            background: "rgba(255,255,255,0.05)",
            borderRadius: "20px",
            marginTop: "20px"
          }}>
            <p style={{ fontSize: "18px", marginBottom: "16px" }}>📦 No products found</p>
            <button 
              onClick={() => {
                setMode("add");
                setFormData({
                  name: "", description: "", price: "", stock: "", 
                  scent: "", skinType: [], ingredients: "", theme: "purple", image: null
                });
                setImagePreview("");
              }} 
              style={{
                background: themeData.primary,
                color: "white",
                border: "none",
                borderRadius: "12px",
                padding: "10px 20px",
                cursor: "pointer",
              }}
            >
              + Add Your First Product
            </button>
          </div>
        )}
      </div>
    );
  }

  // Add/Edit Form View
  return (
    <div style={{
      background: themeData.cardBg,
      borderRadius: "28px",
      padding: "24px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
        <button 
          onClick={() => {
            setMode("list");
            navigate("/admin/products");
          }} 
          style={{
            background: "rgba(255,255,255,0.2)",
            color: themeData.textColor,
            border: "none",
            borderRadius: "10px",
            padding: "10px 20px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          ← Back to Products
        </button>
        <h1 style={{ margin: 0, color: themeData.textColor }}>
          {mode === "edit" ? "✏️ Edit Product" : "✨ Add New Product"}
        </h1>
      </div>

      {message && (
        <div style={{
          background: message.includes("✅") ? "rgba(57,168,111,0.2)" : "rgba(255,77,109,0.2)",
          color: message.includes("✅") ? "#39a86f" : "#ff4d6d",
          padding: "12px",
          borderRadius: "12px",
          marginBottom: "20px",
          textAlign: "center",
        }}>
          {message}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
        {/* Left Column - Form Fields */}
        <div>
          {/* Product Name */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: themeData.textColor }}>
              Product Name <span style={{ color: "#ff4d6d" }}>*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Lavender Bliss Soap"
              style={{ 
                width: "100%", 
                padding: "12px", 
                borderRadius: "10px", 
                border: "1px solid #ddd",
                fontSize: "14px",
              }}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: themeData.textColor }}>
              Description <span style={{ color: "#ff4d6d" }}>*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your product..."
              rows="3"
              style={{ 
                width: "100%", 
                padding: "12px", 
                borderRadius: "10px", 
                border: "1px solid #ddd",
                resize: "vertical",
                fontSize: "14px",
                fontFamily: "inherit",
              }}
            />
          </div>

          {/* Price and Stock */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: themeData.textColor }}>
                Price (SAR) <span style={{ color: "#ff4d6d" }}>*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #ddd" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: themeData.textColor }}>
                Stock Quantity <span style={{ color: "#ff4d6d" }}>*</span>
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                placeholder="0"
                style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #ddd" }}
              />
            </div>
          </div>

          {/* Scent */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: themeData.textColor }}>Scent</label>
            <select
              name="scent"
              value={formData.scent}
              onChange={handleInputChange}
              style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #ddd" }}
            >
              <option value="">Select Scent</option>
              <option value="Lavender">🌸 Lavender</option>
              <option value="Rose">🌹 Rose</option>
              <option value="Coconut">🥥 Coconut</option>
              <option value="Honey">🍯 Honey</option>
              <option value="Unscented">🚫 Unscented</option>
              <option value="Sakura">🌸 Sakura</option>
            </select>
          </div>

          {/* Skin Type */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: themeData.textColor }}>Skin Type</label>
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              {["Normal", "Dry", "Oily", "Sensitive"].map(type => (
                <label key={type} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    value={type}
                    checked={formData.skinType.includes(type)}
                    onChange={handleSkinTypeChange}
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          {/* Ingredients */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: themeData.textColor }}>Ingredients</label>
            <input
              type="text"
              name="ingredients"
              value={formData.ingredients}
              onChange={handleInputChange}
              placeholder="e.g., Shea Butter, Coconut Oil, Vitamin E (comma separated)"
              style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #ddd" }}
            />
          </div>

          {/* Theme Color Selector */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: themeData.textColor }}>Theme Color</label>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
              {availableThemes.map(theme => (
                <button
                  key={theme.name}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, theme: theme.name }))}
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: theme.color,
                    border: formData.theme === theme.name ? "3px solid white" : "2px solid rgba(255,255,255,0.3)",
                    cursor: "pointer",
                    boxShadow: formData.theme === theme.name ? `0 0 0 2px ${theme.color}` : "none",
                    transition: "all 0.2s ease",
                    transform: formData.theme === theme.name ? "scale(1.1)" : "scale(1)",
                  }}
                  title={theme.label}
                />
              ))}
            </div>
            <p style={{ fontSize: "12px", color: themeData.textLight, marginTop: "8px" }}>
              Selected: <strong style={{ color: availableThemes.find(t => t.name === formData.theme)?.color }}>{formData.theme}</strong>
            </p>
          </div>
        </div>

        {/* Right Column - Image Upload */}
        <div>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: themeData.textColor }}>Product Image</label>
          <div style={{
            background: "rgba(255,255,255,0.08)",
            borderRadius: "20px",
            padding: "30px",
            textAlign: "center",
            border: "2px dashed rgba(255,255,255,0.2)",
            minHeight: "300px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}>
            {imagePreview ? (
              <div>
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  style={{ 
                    maxWidth: "100%", 
                    maxHeight: "200px", 
                    objectFit: "contain", 
                    marginBottom: "16px",
                    borderRadius: "12px",
                  }} 
                />
                <button
                  onClick={() => {
                    setImagePreview("");
                    setFormData(prev => ({ ...prev, image: null }));
                  }}
                  style={{
                    background: "#ff4d6d",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "6px 12px",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  Remove Image
                </button>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>🖼️</div>
                <p style={{ color: themeData.textLight, marginBottom: "12px" }}>No image selected</p>
                <label style={{
                  background: themeData.primary,
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  padding: "10px 20px",
                  cursor: "pointer",
                  display: "inline-block",
                }}>
                  Choose Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            )}
            <p style={{ fontSize: "11px", color: themeData.textLight, marginTop: "16px" }}>
              Recommended: Square image, max 2MB (JPG, PNG, GIF)
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "16px", justifyContent: "flex-end", marginTop: "30px", paddingTop: "20px", borderTop: `1px solid ${themeData.borderColor}` }}>
        <button
          onClick={() => {
            setMode("list");
            navigate("/admin/products");
          }}
          style={{
            background: "rgba(255,255,255,0.2)",
            color: themeData.textColor,
            border: "none",
            borderRadius: "12px",
            padding: "12px 28px",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          style={{
            background: availableThemes.find(t => t.name === formData.theme)?.color || themeData.primary,
            color: "white",
            border: "none",
            borderRadius: "12px",
            padding: "12px 32px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          {mode === "edit" ? "💾 Update Product" : "➕ Add Product"}
        </button>
      </div>
    </div>
  );
}

export default ProductManagement;