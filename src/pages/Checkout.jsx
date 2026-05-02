// frontend/src/pages/Checkout.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import soap from "../assets/soap-bliss.png";
import bubble8 from "../assets/bubble8.png";
import { getCurrentUserId, getCurrentUser, getAuthToken } from "../services/api";
import { formatSAR } from "../utils/currency";

function Checkout() {
  const navigate = useNavigate();
  const isMobile = window.innerWidth <= 768;
  const userId = getCurrentUserId();

  const [cartItems, setCartItems] = useState([]);
  const [discountCode, setDiscountCode] = useState("");
  const [discountMessage, setDiscountMessage] = useState("");
  const [discountError, setDiscountError] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
  });

  const [formError, setFormError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [orderMessage, setOrderMessage] = useState("");
  const [orderError, setOrderError] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);

  // Load profile data from backend
  useEffect(() => {
    const loadProfileData = async () => {
      const token = getAuthToken();
      const currentUser = getCurrentUser();
      
      if (token && currentUser) {
        try {
          const response = await fetch(`http://localhost:5000/api/auth/profile`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setForm({
              fullName: userData.user.fullName || "",
              email: userData.user.email || "",
              phone: userData.user.phone || "",
              location: userData.user.address || "",
            });
          } else {
            setForm({
              fullName: currentUser.fullName || "",
              email: currentUser.email || "",
              phone: currentUser.phone || "",
              location: currentUser.address || "",
            });
          }
        } catch (error) {
          console.error("Error loading profile:", error);
          setForm({
            fullName: currentUser.fullName || "",
            email: currentUser.email || "",
            phone: currentUser.phone || "",
            location: currentUser.address || "",
          });
        }
      }
      setLoading(false);
    };

    loadProfileData();
  }, []);

  // Fetch cart from backend
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchCart = async () => {
      try {
        const token = getAuthToken();
        const response = await fetch(`http://localhost:5000/api/cart/${userId}`, {
          headers: { "Authorization": token ? `Bearer ${token}` : "" }
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch cart");
        }
        
        const data = await response.json();

        const formattedCart = data.map((item) => {
          const product = item.productId;
          
          // Handle case where product might be null
          if (!product) {
            return null;
          }
          
          const isCustom = product.name === "Custom Soap";
          let price = product.price || 0;
          
          if (isCustom && item.customOptions) {
            const scentPrices = { Lavender: 1, Coconut: 1, Rose: 1, Honey: 2 };
            const ingredientPrices = {
              "Shea Butter": 2, Sugar: 1, "Aloe Vera": 2,
              Oils: 1, "Vitamin E": 2, "Coconut Oil": 2, Charcoal: 3
            };
            
            const scentsTotal = (item.customOptions?.scents || []).reduce(
              (sum, s) => sum + (scentPrices[s] || 0), 0
            );
            const ingredientsTotal = (item.customOptions?.ingredients || []).reduce(
              (sum, i) => sum + (ingredientPrices[i] || 0), 0
            );
            const texturePrice = item.customOptions?.texture === "Scrub" ? 2 : 0;
            price = (product.price || 7) + scentsTotal + ingredientsTotal + texturePrice;
          }

          return {
            _id: item._id,
            productId: product._id,
            name: product.name || "Unknown Product",
            price: price,
            image: product.image?.startsWith("http") ? product.image : soap,
            stock: product.stock || 0,
            quantity: item.quantity || 1,
            customOptions: item.customOptions,
          };
        }).filter(item => item !== null); // Remove null items

        setCartItems(formattedCart);
      } catch (error) {
        console.error("Failed to fetch checkout cart:", error);
        setOrderError("Failed to load cart. Please try again.");
      }
    };

    fetchCart();
  }, [userId]);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = Math.max(subtotal - discountAmount, 0);

  const handleDiscountApply = async () => {
    setDiscountMessage("");
    setDiscountError("");

    const code = discountCode.trim().toLowerCase();

    if (!code) {
      setDiscountError("Please enter a discount code");
      setDiscountAmount(0);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/admin/promotions");
      
      if (!response.ok) {
        throw new Error("Failed to fetch promotions");
      }
      
      const promos = await response.json();

      const promo = promos.find(p => String(p.code).trim().toLowerCase() === code);

      if (!promo) {
        setDiscountError("Invalid discount code");
        setDiscountAmount(0);
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expiryDate = new Date(promo.expiry);
      expiryDate.setHours(0, 0, 0, 0);

      if (expiryDate < today || promo.active === false) {
        setDiscountError("Promo code expired");
        setDiscountAmount(0);
        return;
      }

      const percent = Number(promo.value);
      if (isNaN(percent) || percent <= 0 || percent > 100) {
        setDiscountError("Invalid discount value");
        setDiscountAmount(0);
        return;
      }

      const amount = subtotal * (percent / 100);
      setDiscountAmount(amount);
      setDiscountMessage(`Discount applied: ${percent}% off (${formatSAR(amount)})`);
    } catch (error) {
      console.error(error);
      setDiscountError("Failed to apply discount");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Don't allow email to be changed
    if (name === "email") return;
    
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSaveMessage("");
    setFormError("");
    setOrderError("");

    if (name === "phone") {
      const phoneRegex = /^\d{10}$/;
      if (value && !phoneRegex.test(value)) {
        setPhoneError("Phone number must be 10 digits");
      } else {
        setPhoneError("");
      }
    }
  };

  const getLocation = () => {
    setSaveMessage("");
    setFormError("");

    if (!navigator.geolocation) {
      setFormError("Location is not supported on this device");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locationValue = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

        setForm((prev) => ({
          ...prev,
          location: locationValue,
        }));

        setLocationLoading(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationLoading(false);
        setFormError("Unable to retrieve location. Please enter manually.");
      }
    );
  };

  const handleSave = async () => {
    setSaveMessage("");
    setFormError("");
    setPhoneError("");

    if (!form.fullName || !form.email || !form.phone || !form.location) {
      setFormError("Please fill all shipping information");
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(form.phone)) {
      setPhoneError("Phone number must be 10 digits");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setFormError("Please login again");
      return;
    }
    
    try {
      const response = await fetch("http://localhost:5000/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: form.fullName,
          phone: form.phone,
          address: form.location,
        }),
      });
      
      if (response.ok) {
        // Update local user cache
        const currentUser = getCurrentUser();
        if (currentUser) {
          currentUser.fullName = form.fullName;
          currentUser.phone = form.phone;
          currentUser.address = form.location;
          localStorage.setItem("user", JSON.stringify(currentUser));
        }
        setSaveMessage("Saved!");
        setTimeout(() => setSaveMessage(""), 3000);
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      console.error("Error saving:", error);
      setSaveMessage("Error saving");
    }
  };

  const clearCartAfterOrder = async () => {
    const token = getAuthToken();
    await Promise.all(
      cartItems.map((item) =>
        fetch(`http://localhost:5000/api/cart/${item._id}`, {
          method: "DELETE",
          headers: { "Authorization": token ? `Bearer ${token}` : "" }
        })
      )
    );
  };

  const handlePayConfirm = async () => {
    setOrderMessage("");
    setOrderError("");
    setFormError("");
    setPhoneError("");
    setPlacingOrder(true);

    if (!userId) {
      setOrderError("Please login first");
      setPlacingOrder(false);
      return;
    }

    if (cartItems.length === 0) {
      setOrderError("Cart is empty");
      setPlacingOrder(false);
      return;
    }

    if (!form.fullName || !form.email || !form.phone || !form.location) {
      setFormError("Please fill all shipping information");
      setPlacingOrder(false);
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(form.phone)) {
      setPhoneError("Phone number must be 10 digits");
      setPlacingOrder(false);
      return;
    }

    try {
      const token = getAuthToken();
      
      // Prepare order items
      const orderItems = cartItems.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        customization: item.customOptions || null,
      }));
      
      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          items: orderItems,
          totalPrice: total,
          shippingAddress: form.location,
          paymentMethod: "Cash on Delivery",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to place order");
      }

      const orderResult = await response.json();
      console.log("Order placed:", orderResult);

      // Clear cart after successful order
      await clearCartAfterOrder();

      setCartItems([]);
      setDiscountCode("");
      setDiscountAmount(0);
      setDiscountMessage("");
      setDiscountError("");
      setOrderMessage("Order placed successfully! 🎉 Redirecting to orders...");
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/order-history");
      }, 2000);
    } catch (error) {
      console.error("Order error:", error);
      setOrderError(error.message || "Failed to place order. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="purple-page" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>Loading your information...</div>
      </div>
    );
  }

  return (
    <div className="purple-page" style={{
      minHeight: "100vh",
      padding: isMobile ? "20px 14px 30px" : "46px 40px",
      boxSizing: "border-box",
      position: "relative",
      overflow: "hidden",
    }}>
      <img src={bubble8} alt="bubble" style={{
        position: "absolute",
        left: isMobile ? "-80px" : "-30px",
        top: isMobile ? "120px" : "20px",
        width: isMobile ? "220px" : "320px",
        opacity: 0.18,
        pointerEvents: "none",
      }} />

      <button onClick={() => navigate(-1)} style={{
        padding: isMobile ? "12px 22px" : "14px 30px",
        borderRadius: "26px",
        border: "1px solid rgba(255,255,255,0.35)",
        background: "rgba(255,255,255,0.10)",
        backdropFilter: "blur(12px)",
        color: "#3b3b3b",
        fontSize: isMobile ? "15px" : "16px",
        fontFamily: "Josefin Sans, sans-serif",
        cursor: "pointer",
        marginBottom: "18px",
        position: "relative",
        zIndex: 2,
      }}>
        ← Back
      </button>

      <div style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        gap: "18px",
        position: "relative",
        zIndex: 2,
      }}>
        {/* Order Summary Sidebar */}
        <div style={{
          width: isMobile ? "100%" : "235px",
          minWidth: isMobile ? "100%" : "235px",
          background: "rgba(255,255,255,0.12)",
          border: "1px solid rgba(255,255,255,0.25)",
          borderRadius: "28px",
          padding: "18px 16px",
          backdropFilter: "blur(14px)",
          boxSizing: "border-box",
          alignSelf: isMobile ? "stretch" : "flex-start",
        }}>
          <h2 style={{ marginTop: 0, marginBottom: "10px", fontSize: isMobile ? "24px" : "22px", color: "#333" }}>
            Order Summary
          </h2>

          <p style={{ margin: "0 0 8px 0", color: "#444", fontSize: "14px" }}>Discount</p>
          <input
            type="text"
            placeholder="Discount Code"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "10px",
              border: "1px solid #b9b9b9",
              outline: "none",
              fontSize: "14px",
              fontFamily: "Josefin Sans, sans-serif",
              boxSizing: "border-box",
            }}
          />

          <Button text="Apply" variant="purple" style={{ width: "100%", marginTop: "10px", marginBottom: "8px" }} onClick={handleDiscountApply} />

          {discountMessage && <p style={{ color: "#39a86f", fontSize: "14px", fontWeight: "500", marginBottom: "4px" }}>{discountMessage}</p>}
          {discountError && <p style={{ color: "#ff5a45", fontSize: "13px", marginBottom: "10px" }}>{discountError}</p>}

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", color: "#444", fontWeight: "500" }}>
            <span>Subtotal</span>
            <span>{formatSAR(subtotal)}</span>
          </div>

          {discountAmount > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", color: "#444", fontWeight: "500" }}>
              <span>Discount</span>
              <span>-{formatSAR(discountAmount)}</span>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", color: "#444", fontWeight: "500" }}>
            <span>Total</span>
            <span><strong>{formatSAR(total)}</strong></span>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Cart Items */}
          <div style={{
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: "28px",
            padding: "18px",
            backdropFilter: "blur(14px)",
            boxSizing: "border-box",
          }}>
            <h1 style={{ marginTop: 0, marginBottom: "18px", fontSize: isMobile ? "28px" : "30px", color: "#333" }}>
              Checkout
            </h1>

            {cartItems.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                <p>Your cart is empty</p>
                <Button text="Continue Shopping" variant="purple" onClick={() => navigate("/products")} />
              </div>
            ) : (
              <div style={{ overflowX: "auto", borderRadius: "14px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "540px", background: "rgba(255,255,255,0.22)", borderRadius: "14px", overflow: "hidden" }}>
                  <thead>
                    <tr style={{ background: "rgba(255,255,255,0.45)" }}>
                      <th style={{ padding: "14px 12px", textAlign: "center", fontWeight: "600", color: "#333", fontSize: "15px" }}>Product</th>
                      <th style={{ padding: "14px 12px", textAlign: "center", fontWeight: "600", color: "#333", fontSize: "15px" }}>Price</th>
                      <th style={{ padding: "14px 12px", textAlign: "center", fontWeight: "600", color: "#333", fontSize: "15px" }}>Quantity</th>
                      <th style={{ padding: "14px 12px", textAlign: "center", fontWeight: "600", color: "#333", fontSize: "15px" }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item._id}>
                        <td style={{ padding: "14px 12px", textAlign: "center", color: "#444", borderTop: "1px solid rgba(0,0,0,0.06)", fontSize: "14px", verticalAlign: "middle" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <img src={item.image} alt={item.name} style={{ width: "56px", height: "56px", objectFit: "contain" }} />
                            <div>
                              <span>{item.name}</span>
                              {item.customOptions && (
                                <div style={{ marginTop: "6px", padding: "6px 8px", borderRadius: "10px", background: "rgba(255,255,255,0.35)", color: "#555", fontSize: "12px", lineHeight: "1.5", textAlign: "left", maxWidth: "230px" }}>
                                  {item.customOptions.scents?.length > 0 && <div><strong>Scent:</strong> {item.customOptions.scents.join(", ")}</div>}
                                  {item.customOptions.texture && <div><strong>Texture:</strong> {item.customOptions.texture}</div>}
                                  {item.customOptions.ingredients?.length > 0 && <div><strong>Ingredients:</strong> {item.customOptions.ingredients.join(", ")}</div>}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "14px 12px", textAlign: "center", color: "#444", borderTop: "1px solid rgba(0,0,0,0.06)", fontSize: "14px", verticalAlign: "middle" }}>
                          {formatSAR(item.price)}
                        </td>
                        <td style={{ padding: "14px 12px", textAlign: "center", color: "#444", borderTop: "1px solid rgba(0,0,0,0.06)", fontSize: "14px", verticalAlign: "middle" }}>
                          {item.quantity}
                        </td>
                        <td style={{ padding: "14px 12px", textAlign: "center", color: "#444", borderTop: "1px solid rgba(0,0,0,0.06)", fontSize: "14px", verticalAlign: "middle" }}>
                          {formatSAR(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                 </table>
              </div>
            )}
          </div>

          {/* Profile Information */}
          <div style={{
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: "28px",
            padding: "18px",
            backdropFilter: "blur(14px)",
            boxSizing: "border-box",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row", gap: "10px", marginBottom: "12px" }}>
              <h2 style={{ margin: 0, fontSize: isMobile ? "28px" : "30px", color: "#333" }}>Profile Information</h2>
              {formError && <p style={{ color: "#ff3d2e", fontSize: "13px", fontWeight: "500", margin: 0 }}>{formError}</p>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "22px 28px" }}>
              {/* Full Name */}
              <div>
                <label style={{ display: "block", marginBottom: "8px", color: "#444", fontSize: "15px" }}>Full Name *</label>
                <input type="text" name="fullName" placeholder="Your full name" value={form.fullName} onChange={handleChange} style={{
                  width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #777", outline: "none",
                  fontSize: "14px", fontFamily: "Josefin Sans, sans-serif", boxSizing: "border-box", background: "rgba(255,255,255,0.92)"
                }} />
              </div>

              {/* Email - Read Only */}
              <div>
                <label style={{ display: "block", marginBottom: "8px", color: "#444", fontSize: "15px" }}>Email *</label>
                <div style={{
                  width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid #e0e0e0",
                  backgroundColor: "#f5f5f5", fontSize: "14px", fontFamily: "Josefin Sans, sans-serif",
                  boxSizing: "border-box", color: "#666", cursor: "not-allowed", wordBreak: "break-all"
                }}>
                  {form.email || "No email set"}
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label style={{ display: "block", marginBottom: "8px", color: "#444", fontSize: "15px" }}>Phone Number *</label>
                <input type="tel" name="phone" placeholder="5XXXXXXXX" value={form.phone} onChange={handleChange} style={{
                  width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #777", outline: "none",
                  fontSize: "14px", fontFamily: "Josefin Sans, sans-serif", boxSizing: "border-box", background: "rgba(255,255,255,0.92)"
                }} />
                {phoneError && <p style={{ color: "#ff3d2e", fontSize: "13px", fontWeight: "500", marginTop: "6px" }}>{phoneError}</p>}
              </div>

              {/* Location with GPS */}
              <div>
                <label style={{ display: "block", marginBottom: "8px", color: "#444", fontSize: "15px" }}>Delivery Location *</label>
                <div style={{ position: "relative" }}>
                  <input type="text" name="location" placeholder="Enter address or tap location icon" value={form.location} onChange={handleChange} style={{
                    width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #777", outline: "none",
                    fontSize: "14px", fontFamily: "Josefin Sans, sans-serif", boxSizing: "border-box", background: "rgba(255,255,255,0.92)", paddingRight: "42px"
                  }} />
                  <span onClick={getLocation} style={{
                    position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)",
                    color: "#555", fontSize: "18px", cursor: "pointer", userSelect: "none"
                  }} title="Use current location">📍</span>
                </div>
                {locationLoading && <p style={{ color: "#39a86f", fontSize: "14px", fontWeight: "500", marginTop: "6px" }}>Getting location...</p>}
              </div>
            </div>

            <div style={{ marginTop: "22px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              <Button text="Save Information" variant="purple" style={{ width: "140px" }} onClick={handleSave} />
              {saveMessage && <p style={{ color: saveMessage === "Saved!" ? "#39a86f" : "#ff3d2e", fontSize: "14px", fontWeight: "500", margin: 0 }}>{saveMessage}</p>}
            </div>

            <div style={{ marginTop: "28px", display: "flex", alignItems: "center", gap: "18px", flexWrap: "wrap" }}>
              <Button 
                text={placingOrder ? "Processing..." : "Confirm & Pay"} 
                variant="purple" 
                style={{ width: "180px" }} 
                onClick={handlePayConfirm} 
                disabled={placingOrder || cartItems.length === 0} 
              />
              {orderMessage && <p style={{ color: "#39a86f", fontSize: "14px", fontWeight: "500", margin: 0 }}>{orderMessage}</p>}
              {orderError && <p style={{ color: "#ff3d2e", fontSize: "13px", fontWeight: "500", margin: 0 }}>{orderError}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;