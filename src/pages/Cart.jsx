// frontend/src/pages/Cart.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import bubble8 from "../assets/bubble8.png";
import soap from "../assets/soap-bliss.png";
import { getCurrentUserId, getAuthToken } from "../services/api";
import { formatSAR } from "../utils/currency";

function Cart() {
  const navigate = useNavigate();
  const isMobile = window.innerWidth <= 768;

  // Get actual logged-in user
  const userId = getCurrentUserId();
  const isLoggedIn = !!userId;

  const [discountCode, setDiscountCode] = useState("");
  const [discountMessage, setDiscountMessage] = useState("");
  const [discountError, setDiscountError] = useState("");
  const [cartMessage, setCartMessage] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch cart
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
        const data = await response.json();

        const formattedItems = data.map((item) => {
          const isCustom =
            item.customOptions &&
            (
              item.customOptions.scents?.length > 0 ||
              item.customOptions.texture ||
              item.customOptions.ingredients?.length > 0
            );

          return {
            _id: item._id,
            name: isCustom ? "Custom Soap" : item.productId?.name,
            price: isCustom ? item.customPrice : item.productId?.price,
            image: isCustom
              ? soap
              : item.productId?.image?.startsWith("http")
                ? item.productId.image
                : new URL(`../assets/${item.productId?.image}`, import.meta.url).href,
            stock: isCustom ? 999 : item.productId?.stock,
            quantity: item.quantity,
            customOptions: item.customOptions,
          };
        });

        setCartItems(formattedItems);
      } catch (error) {
        console.error("Failed to fetch cart:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [userId]);

  // Fetch wishlist
  useEffect(() => {
    if (!userId) return;

    const fetchWishlist = async () => {
      try {
        const token = getAuthToken();
        const response = await fetch(`http://localhost:5000/api/wishlist/${userId}`, {
          headers: { "Authorization": token ? `Bearer ${token}` : "" }
        });
        const data = await response.json();

        setWishlistItems(data.map((item) => ({
          _id: item._id,
          productId: item.productId?._id,
          name: item.productId?.name,
          price: item.productId?.price || 0,
          image: item.productId?.image?.startsWith("http")
            ? item.productId.image
            : new URL(`../assets/${item.productId?.image}`, import.meta.url).href,
          stock: item.productId?.stock,
          quantity: item.quantity,
        })));
      } catch (error) {
        console.error("Failed to fetch wishlist:", error);
      }
    };

    fetchWishlist();
  }, [userId]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
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
      const promos = await response.json();
      const promo = promos.find(p => p.code === code);

      if (!promo) {
        setDiscountError("Invalid discount code");
        setDiscountAmount(0);
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expiryDate = new Date(promo.expiry);
      expiryDate.setHours(0, 0, 0, 0);

      if (expiryDate < today || !promo.active) {
        setDiscountError("Promo code expired");
        setDiscountAmount(0);
        return;
      }

      const amount = subtotal * (promo.value / 100);
      setDiscountAmount(amount);
      setDiscountMessage(`Discount applied: ${promo.value}% off`);
    } catch (error) {
      console.error(error);
      setDiscountError("Failed to apply discount");
    }
  };

  const updateCartQuantity = async (itemToUpdate, change) => {
    const newQuantity = itemToUpdate.quantity + change;
    if (newQuantity < 1 || newQuantity > itemToUpdate.stock) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`http://localhost:5000/api/cart/${itemToUpdate._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!response.ok) throw new Error("Failed to update");

      setCartItems(prev => prev.map(item =>
        item._id === itemToUpdate._id ? { ...item, quantity: newQuantity } : item
      ));
    } catch (error) {
      console.error(error);
    }
  };

  const removeCartItem = async (itemToRemove) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`http://localhost:5000/api/cart/${itemToRemove._id}`, {
        method: "DELETE",
        headers: { "Authorization": token ? `Bearer ${token}` : "" }
      });

      if (!response.ok) throw new Error("Failed to delete");

      setCartItems(prev => prev.filter(item => item._id !== itemToRemove._id));
      setCartMessage("Product removed successfully");
      setTimeout(() => setCartMessage(""), 3000);
    } catch (error) {
      console.error(error);
    }
  };

  const removeWishlistItem = async (id) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`http://localhost:5000/api/wishlist/${id}`, {
        method: "DELETE",
        headers: { "Authorization": token ? `Bearer ${token}` : "" }
      });

      if (!response.ok) throw new Error("Failed to delete");

      setWishlistItems(prev => prev.filter(item => item._id !== id));
      window.dispatchEvent(new Event("wishlistUpdated"));
      setCartMessage("Product removed from wishlist");
      setTimeout(() => setCartMessage(""), 3000);
    } catch (error) {
      console.error(error);
    }
  };

  const addToCartFromWishlist = async (wishlistItem) => {
    try {
      const token = getAuthToken();

      const response = await fetch("http://localhost:5000/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          userId: userId,
          productId: wishlistItem.productId,
          quantity: wishlistItem.quantity,
        }),
      });

      if (!response.ok) throw new Error("Failed to add to cart");

      await removeWishlistItem(wishlistItem._id);

      // Refresh cart
      const cartResponse = await fetch(`http://localhost:5000/api/cart/${userId}`, {
        headers: { "Authorization": token ? `Bearer ${token}` : "" }
      });
      const cartData = await cartResponse.json();

      setCartItems(cartData.map(item => ({
        _id: item._id,
        name: item.productId?.name,
        price: item.productId?.price || 0,
        image: item.productId?.image?.startsWith("http")
          ? item.productId.image
          : new URL(`../assets/${item.productId?.image}`, import.meta.url).href,
        stock: item.productId?.stock,
        quantity: item.quantity,
      })));

      setCartMessage("Product moved to cart successfully");
      setTimeout(() => setCartMessage(""), 3000);
    } catch (error) {
      console.error(error);
      setCartMessage("Failed to move product to cart");
    }
  };

  const handleCheckout = () => {
    if (!isLoggedIn) {
      navigate("/");
      return;
    }
    if (cartItems.length === 0) {
      alert("Cart is empty");
      return;
    }
    navigate("/checkout");
  };

  if (loading) {
    return (
      <div className="purple-page" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div>Loading your cart...</div>
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

      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: "18px",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          style={{
            width: isMobile ? "100%" : "220px",
            minWidth: isMobile ? "100%" : "220px",
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: "28px",
            padding: "18px 16px",
            backdropFilter: "blur(14px)",
            boxSizing: "border-box",
            alignSelf: isMobile ? "stretch" : "flex-start",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: "14px",
              fontSize: isMobile ? "24px" : "22px",
              color: "#333",
            }}
          >
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

          <Button text="Apply" variant="purple" style={{ width: "100%", marginTop: "10px", marginBottom: "12px" }} onClick={handleDiscountApply} />

          {discountMessage && <p style={{ color: "#39a86f", fontSize: "14px", fontWeight: "500", marginBottom: "6px" }}>{discountMessage}</p>}
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
            <span>{formatSAR(total)}</span>
          </div>

          <div style={{ marginTop: "16px" }}>
            <Button text="Checkout" variant="purple" style={{ width: "100%" }} onClick={handleCheckout} />
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Cart Section */}
          <div style={{
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: "28px",
            padding: "18px",
            backdropFilter: "blur(14px)",
            boxSizing: "border-box",
          }}>
            <h1 style={{ marginTop: 0, marginBottom: "18px", fontSize: isMobile ? "28px" : "30px", color: "#333" }}>Cart</h1>

            <div style={{ overflowX: "auto", borderRadius: "14px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "620px", background: "rgba(255,255,255,0.22)", borderRadius: "14px", overflow: "hidden" }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.45)" }}>
                    <th style={{ padding: "14px 12px", textAlign: "center", fontWeight: "600", color: "#333", fontSize: "15px" }}>Product</th>
                    <th style={{ padding: "14px 12px", textAlign: "center", fontWeight: "600", color: "#333", fontSize: "15px" }}>Price</th>
                    <th style={{ padding: "14px 12px", textAlign: "center", fontWeight: "600", color: "#333", fontSize: "15px" }}>Quantity</th>
                    <th style={{ padding: "14px 12px", textAlign: "center", fontWeight: "600", color: "#333", fontSize: "15px" }}>Subtotal</th>
                    <th style={{ padding: "14px 12px", textAlign: "center", fontWeight: "600", color: "#333", fontSize: "15px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.length > 0 ? (
                    cartItems.map((item) => (
                      <tr key={item._id}>
                        <td style={{ padding: "14px 12px", textAlign: "center", color: "#444", borderTop: "1px solid rgba(0,0,0,0.06)", fontSize: "14px", verticalAlign: "middle" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                            <img src={item.image} alt={item.name} style={{ width: "74px", height: "74px", objectFit: "contain" }} />
                            <div>
                              <span style={{ fontWeight: "500" }}>{item.name}</span>
                              {item.customOptions &&
                                (
                                  item.customOptions.scents?.length > 0 ||
                                  item.customOptions.texture ||
                                  item.customOptions.ingredients?.length > 0
                                ) && (
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
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            <button onClick={() => updateCartQuantity(item, -1)} style={{ width: "24px", height: "24px", borderRadius: "4px", border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.65)", cursor: "pointer" }}>−</button>
                            <span style={{ minWidth: "18px", display: "inline-block", textAlign: "center" }}>{item.quantity}</span>
                            <button onClick={() => updateCartQuantity(item, 1)} style={{ width: "24px", height: "24px", borderRadius: "4px", border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.65)", cursor: "pointer" }}>+</button>
                          </div>
                        </td>
                        <td style={{ padding: "14px 12px", textAlign: "center", color: "#444", borderTop: "1px solid rgba(0,0,0,0.06)", fontSize: "14px", verticalAlign: "middle" }}>
                          {formatSAR(item.price * item.quantity)}
                        </td>
                        <td style={{ padding: "14px 12px", textAlign: "center", color: "#444", borderTop: "1px solid rgba(0,0,0,0.06)", fontSize: "14px", verticalAlign: "middle" }}>
                          <button onClick={() => removeCartItem(item)} style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: "18px" }}>🗑</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ padding: "14px 12px", textAlign: "center", color: "#444" }}>Your cart is empty</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {cartMessage && <p style={{ color: "#39a86f", fontSize: "14px", fontWeight: "500", marginTop: "12px" }}>{cartMessage}</p>}
          </div>

          {/* Wishlist Section */}
          <div style={{
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: "28px",
            padding: "18px",
            backdropFilter: "blur(14px)",
            boxSizing: "border-box",
          }}>
            <h2 style={{ marginTop: 0, marginBottom: "18px", fontSize: isMobile ? "28px" : "30px", color: "#333" }}>Wishlist</h2>

            <div style={{ overflowX: "auto", borderRadius: "14px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "720px", background: "rgba(255,255,255,0.22)", borderRadius: "14px", overflow: "hidden" }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.45)" }}>
                    <th style={{ padding: "14px 12px", textAlign: "center", fontWeight: "600", color: "#333", fontSize: "15px" }}>Product</th>
                    <th style={{ padding: "14px 12px", textAlign: "center", fontWeight: "600", color: "#333", fontSize: "15px" }}>Price</th>
                    <th style={{ padding: "14px 12px", textAlign: "center", fontWeight: "600", color: "#333", fontSize: "15px" }}>Quantity</th>
                    <th style={{ padding: "14px 12px", textAlign: "center", fontWeight: "600", color: "#333", fontSize: "15px" }}>Subtotal</th>
                    <th style={{ padding: "14px 12px", textAlign: "center", fontWeight: "600", color: "#333", fontSize: "15px" }}></th>
                    <th style={{ padding: "14px 12px", textAlign: "center", fontWeight: "600", color: "#333", fontSize: "15px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {wishlistItems.length > 0 ? (
                    wishlistItems.map((item) => (
                      <tr key={item._id}>
                        <td style={{ padding: "14px 12px", textAlign: "center", color: "#444", borderTop: "1px solid rgba(0,0,0,0.06)", fontSize: "14px", verticalAlign: "middle" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                            <img src={item.image} alt={item.name} style={{ width: "74px", height: "74px", objectFit: "contain" }} />
                            <span>{item.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: "14px 12px", textAlign: "center", color: "#444", borderTop: "1px solid rgba(0,0,0,0.06)", fontSize: "14px", verticalAlign: "middle" }}>
                          {item.stock > 0 ? formatSAR(item.price) : "Out Of Stock"}
                        </td>
                        <td style={{ padding: "14px 12px", textAlign: "center", color: "#444", borderTop: "1px solid rgba(0,0,0,0.06)", fontSize: "14px", verticalAlign: "middle" }}>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            <button onClick={() => updateWishlistQuantity(item, -1)} style={{ width: "24px", height: "24px", borderRadius: "4px", border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.65)", cursor: "pointer" }} disabled={item.stock === 0}>−</button>
                            <span style={{ minWidth: "18px", display: "inline-block", textAlign: "center" }}>{item.quantity}</span>
                            <button onClick={() => updateWishlistQuantity(item, 1)} style={{ width: "24px", height: "24px", borderRadius: "4px", border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.65)", cursor: "pointer" }} disabled={item.stock === 0}>+</button>
                          </div>
                        </td>
                        <td style={{ padding: "14px 12px", textAlign: "center", color: "#444", borderTop: "1px solid rgba(0,0,0,0.06)", fontSize: "14px", verticalAlign: "middle" }}>
                          {item.stock > 0 ? formatSAR(item.price * item.quantity) : "Out Of Stock"}
                        </td>
                        <td style={{ padding: "14px 12px", textAlign: "center", color: "#444", borderTop: "1px solid rgba(0,0,0,0.06)", fontSize: "14px", verticalAlign: "middle" }}>
                          <button onClick={() => addToCartFromWishlist(item)} style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: "18px" }} disabled={item.stock === 0} title="Move to Cart">🛒</button>
                        </td>
                        <td style={{ padding: "14px 12px", textAlign: "center", color: "#444", borderTop: "1px solid rgba(0,0,0,0.06)", fontSize: "14px", verticalAlign: "middle" }}>
                          <button onClick={() => removeWishlistItem(item._id)} style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: "18px" }}>🗑</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ padding: "14px 12px", textAlign: "center", color: "#444" }}>Your wishlist is empty</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const glassBox = {
  background: "rgba(255,255,255,0.12)",
  border: "1px solid rgba(255,255,255,0.25)",
  borderRadius: "28px",
  padding: "18px",
  backdropFilter: "blur(14px)",
  boxSizing: "border-box",
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "10px",
  border: "1px solid #b9b9b9",
  outline: "none",
  fontSize: "14px",
  fontFamily: "Josefin Sans, sans-serif",
  boxSizing: "border-box",
};

const summaryRow = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "10px",
  color: "#444",
  fontWeight: "500",
};

const tableWrapper = {
  overflowX: "auto",
  borderRadius: "14px",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "620px",
  background: "rgba(255,255,255,0.22)",
  borderRadius: "14px",
  overflow: "hidden",
};

const tableHeadRow = {
  background: "rgba(255,255,255,0.45)",
};

const thStyle = {
  padding: "14px 12px",
  textAlign: "center",
  fontWeight: "600",
  color: "#333",
  fontSize: "15px",
};

const tdStyle = {
  padding: "14px 12px",
  textAlign: "center",
  color: "#444",
  borderTop: "1px solid rgba(0,0,0,0.06)",
  fontSize: "14px",
  verticalAlign: "middle",
};

const productCell = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
};

const productImageStyle = {
  width: "74px",
  height: "74px",
  objectFit: "contain",
};

const qtyBox = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
};

const qtyBtn = {
  width: "24px",
  height: "24px",
  borderRadius: "4px",
  border: "1px solid rgba(0,0,0,0.08)",
  background: "rgba(255,255,255,0.65)",
  cursor: "pointer",
};

const qtyValue = {
  minWidth: "18px",
  display: "inline-block",
  textAlign: "center",
};

const trashBtn = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: "18px",
};

const cartMoveBtn = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: "18px",
};

const successStyle = {
  color: "#39a86f",
  fontSize: "14px",
  fontWeight: "500",
  margin: 0,
};

const errorStyle = {
  color: "#ff5a45",
  fontSize: "13px",
  marginTop: "6px",
  marginBottom: 0,
};

const customDetailsBox = {
  marginTop: "6px",
  padding: "6px 8px",
  borderRadius: "10px",
  background: "rgba(255,255,255,0.35)",
  color: "#555",
  fontSize: "12px",
  lineHeight: "1.5",
  textAlign: "left",
  maxWidth: "230px",
};

export default Cart;