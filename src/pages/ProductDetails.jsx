// frontend/src/pages/ProductDetails.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCurrentUserId, getCurrentUser, getAuthToken } from "../services/api";
import { formatSAR } from "../utils/currency";
import { useTheme } from "../context/ThemeContext";
import { HeartIcon, ProfileIcon } from "../components/DynamicIcons";
import Button from "../components/Button";
import bubble7 from "../assets/bubble7.png";
import bubble8 from "../assets/bubble8.png";

function ProductDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { themeData } = useTheme();
  const userId = getCurrentUserId();
  const currentUser = getCurrentUser();
  const token = getAuthToken();
  const isLoggedIn = !!userId;

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [addedToCart, setAddedToCart] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [liked, setLiked] = useState(false);
  const [cartMessage, setCartMessage] = useState("");

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch product data
  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, [id]);

  // Fetch reviews from backend
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/reviews/product/${id}`);
        const data = await response.json();
        setReviews(data);
      } catch (error) {
        console.error("Error loading reviews:", error);
      }
    };
    
    if (id) fetchReviews();
  }, [id]);

  // Check wishlist status
  useEffect(() => {
    if (!userId || !id) return;
    
    const checkWishlist = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/wishlist/${userId}`, {
          headers: { "Authorization": token ? `Bearer ${token}` : "" }
        });
        const data = await response.json();
        const exists = data.some((item) => item.productId?._id === id);
        setLiked(exists);
      } catch (error) {
        console.error(error);
      }
    };

    checkWishlist();
    window.addEventListener("wishlistUpdated", checkWishlist);
    return () => window.removeEventListener("wishlistUpdated", checkWishlist);
  }, [userId, id, token]);

  // Add product to cart
  const handleAddToCart = async () => {
    setAddedToCart(false);
    setCartMessage("");

    if (!isLoggedIn) {
      alert("Please login first");
      navigate("/");
      return;
    }

    if (product.stock <= 0) {
      alert("Out of stock");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          userId: userId,
          productId: product._id,
          quantity: 1,
        }),
      });

      if (!response.ok) throw new Error("Failed to add to cart");

      setAddedToCart(true);
      setCartMessage("Added to cart successfully!");
      setTimeout(() => {
        setAddedToCart(false);
        setCartMessage("");
      }, 3000);
    } catch (error) {
      console.error(error);
      setCartMessage("Failed to add to cart");
    }
  };

  // Toggle wishlist
  const handleWishlistClick = async () => {
    if (!isLoggedIn) {
      alert("Please login first");
      navigate("/");
      return;
    }

    try {
      if (liked) {
        const response = await fetch(`http://localhost:5000/api/wishlist/${userId}`, {
          headers: { "Authorization": token ? `Bearer ${token}` : "" }
        });
        const data = await response.json();
        const wishlistItem = data.find((item) => item.productId?._id === product._id);
        if (wishlistItem) {
          await fetch(`http://localhost:5000/api/wishlist/${wishlistItem._id}`, {
            method: "DELETE",
            headers: { "Authorization": token ? `Bearer ${token}` : "" }
          });
        }
        setLiked(false);
      } else {
        await fetch("http://localhost:5000/api/wishlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : ""
          },
          body: JSON.stringify({ userId: userId, productId: product._id, quantity: 1 }),
        });
        setLiked(true);
      }
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (error) {
      console.error(error);
      alert("Failed to update wishlist");
    }
  };

  // Add new review
const handleSendReview = async () => {
  if (!isLoggedIn) {
    alert("Please login first");
    return;
  }

  if (!reviewText.trim()) return;

  setSubmitting(true);

  try {
    // 👇 تأكد من التوكن
    console.log("TOKEN:", token);

    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch("http://localhost:5000/api/reviews", {
      method: "POST",
      headers,
      body: JSON.stringify({
        productId: product._id,
        text: reviewText,
        rating: 5,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to add review");
    }

    setReviews([data, ...reviews]);
    setReviewText("");

  } catch (error) {
    console.error(error);
    alert(error.message);
  } finally {
    setSubmitting(false);
  }
};

  if (loading) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        background: themeData.background 
      }}>
        <div style={{ color: themeData.textColor, fontSize: "18px" }}>
          Loading product details...
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        background: themeData.background 
      }}>
        <div style={{ color: themeData.textColor, fontSize: "18px" }}>
          Product not found
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        background: themeData.background,
        padding: isMobile ? "20px 16px 30px" : "30px 48px 24px",
        boxSizing: "border-box",
        transition: "background 0.5s ease-in-out",
      }}
    >
      {/* Decorative bubbles */}
      <img
        src={bubble7}
        alt="bubble"
        style={{
          position: "absolute",
          left: isMobile ? "-50px" : "-10px",
          bottom: "0",
          width: isMobile ? "220px" : "360px",
          opacity: themeData.bubbleOpacity || 0.4,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      <img
        src={bubble8}
        alt="bubble"
        style={{
          position: "absolute",
          right: isMobile ? "-40px" : "0",
          top: "0",
          width: isMobile ? "220px" : "360px",
          opacity: themeData.bubbleOpacity || 0.4,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        style={{
          padding: isMobile ? "12px 28px" : "14px 36px",
          borderRadius: "30px",
          border: `1px solid ${themeData.borderColor}`,
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
          color: themeData.textColor,
          fontSize: isMobile ? "16px" : "18px",
          fontFamily: "Josefin Sans, sans-serif",
          cursor: "pointer",
          marginBottom: "18px",
          position: "relative",
          zIndex: 2,
          transition: "all 0.3s ease",
        }}
      >
        ← Back
      </button>

      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? "18px" : "42px",
          alignItems: isMobile ? "stretch" : "flex-start",
        }}
      >
        {/* Product Image */}
        <div
          style={{
            flex: 1,
            minHeight: isMobile ? "auto" : "620px",
            display: "flex",
            alignItems: isMobile ? "center" : "flex-start",
            justifyContent: "center",
            paddingTop: isMobile ? "0" : "25px",
          }}
        >
          <img
            src={
              product.image?.startsWith("http")
                ? product.image
                : new URL(`../assets/${product.image}`, import.meta.url).href
            }
            alt={product.name}
            style={{
              width: "100%",
              maxWidth: isMobile ? "320px" : "650px",
              objectFit: "contain",
              filter: "drop-shadow(0px 24px 40px rgba(0,0,0,0.16))",
              display: "block",
            }}
          />
        </div>

        {/* Product Info */}
        <div
          style={{
            width: isMobile ? "100%" : "390px",
            maxWidth: isMobile ? "100%" : "390px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            marginTop: isMobile ? "0" : "22px",
          }}
        >
          {/* Product Name */}
          <div style={{
            background: themeData.cardBg,
            border: `1px solid ${themeData.borderColor}`,
            borderRadius: isMobile ? "22px" : "24px",
            padding: isMobile ? "14px 16px" : "16px 18px",
            backdropFilter: "blur(12px)",
            textAlign: "center",
          }}>
            <h1 style={{
              margin: 0,
              color: themeData.textColor,
              fontSize: isMobile ? "24px" : "28px",
              fontWeight: "700",
            }}>
              {product.name}
            </h1>
          </div>

          {/* Description */}
          <div style={{
            background: themeData.cardBg,
            border: `1px solid ${themeData.borderColor}`,
            borderRadius: isMobile ? "22px" : "24px",
            padding: isMobile ? "14px 16px" : "16px 18px",
            backdropFilter: "blur(12px)",
          }}>
            <p style={{
              margin: 0,
              color: themeData.textColor,
              fontSize: "15px",
              lineHeight: 1.5,
              textAlign: "center",
            }}>
              {product.description}
            </p>
          </div>

          {/* Price */}
          <div style={{
            background: themeData.cardBg,
            border: `1px solid ${themeData.borderColor}`,
            borderRadius: isMobile ? "22px" : "24px",
            padding: isMobile ? "14px 16px" : "16px 18px",
            backdropFilter: "blur(12px)",
            textAlign: "center",
          }}>
            <p style={{ margin: 0, color: "#666", fontSize: "14px", marginBottom: "8px" }}>Price</p>
            <p style={{
              margin: 0,
              color: themeData.textColor,
              fontSize: isMobile ? "28px" : "32px",
              fontWeight: "700",
            }}>
              {formatSAR(product.price)}
            </p>
          </div>

          {/* Ingredients */}
          <div style={{
            background: themeData.cardBg,
            border: `1px solid ${themeData.borderColor}`,
            borderRadius: isMobile ? "22px" : "24px",
            padding: isMobile ? "14px 16px" : "16px 18px",
            backdropFilter: "blur(12px)",
            textAlign: "center",
          }}>
            <p style={{ margin: "0 0 8px 0", color: "#666", fontSize: "14px" }}>Ingredients</p>
            <p style={{ margin: 0, color: themeData.textColor, fontSize: "14px", lineHeight: 1.5 }}>
              {product.ingredients?.join(", ") || "Natural ingredients"}
            </p>
          </div>

          {/* Stock Status */}
          <div style={{
            background: themeData.cardBg,
            border: `1px solid ${themeData.borderColor}`,
            borderRadius: isMobile ? "22px" : "24px",
            padding: isMobile ? "14px 16px" : "16px 18px",
            backdropFilter: "blur(12px)",
            textAlign: "center",
          }}>
            <p style={{
              margin: 0,
              color: product.stock > 0 ? themeData.primary : "#ff4d6d",
              fontSize: "16px",
              fontWeight: "600",
            }}>
              {product.stock > 0 ? `✓ In Stock (${product.stock} available)` : "✗ Out of Stock"}
            </p>
          </div>

          {/* Actions */}
          <div style={{
            background: themeData.cardBg,
            border: `1px solid ${themeData.borderColor}`,
            borderRadius: isMobile ? "22px" : "24px",
            padding: "16px",
            backdropFilter: "blur(12px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "14px",
              flexWrap: "wrap",
              width: "100%",
            }}>
              <Button
                text="Add to Cart"
                variant={product.stock > 0 ? "purple" : "purpleDisabled"}
                disabled={product.stock <= 0}
                style={{ width: "170px", borderRadius: "14px" }}
                onClick={handleAddToCart}
              />

              <HeartIcon 
                size={28} 
                liked={liked} 
                onClick={handleWishlistClick}
              />
            </div>

            {cartMessage && (
              <p style={{
                margin: 0,
                textAlign: "center",
                color: cartMessage.includes("success") ? "#39a86f" : "#ff4d6d",
                fontSize: "14px",
                fontWeight: "500",
              }}>
                {cartMessage}
              </p>
            )}
          </div>

          {/* Reviews Section */}
          <div style={{
            background: themeData.cardBg,
            border: `1px solid ${themeData.borderColor}`,
            borderRadius: isMobile ? "22px" : "24px",
            padding: "16px",
            backdropFilter: "blur(12px)",
          }}>
            <p style={{
              margin: "0 0 12px 0",
              color: themeData.textColor,
              fontSize: "18px",
              fontWeight: "600",
              textAlign: "center",
            }}>
              Reviews ({reviews.length})
            </p>

            {/* Add Review Input */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "16px",
            }}>
              <ProfileIcon size={28} />
              <input
                type="text"
                placeholder="Write your review..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                style={{
                  flex: 1,
                  padding: "11px 14px",
                  borderRadius: "18px",
                  background: "rgba(255,255,255,0.9)",
                  border: `1px solid ${themeData.borderColor}`,
                  color: themeData.textColor,
                  fontSize: "14px",
                  fontFamily: "Josefin Sans, sans-serif",
                  outline: "none",
                }}
              />
              <button
                onClick={handleSendReview}
                disabled={!reviewText.trim() || submitting}
                style={{
                  padding: isMobile ? "10px 16px" : "10px 20px",
                  borderRadius: "12px",
                  border: "none",
                  background: reviewText.trim() && !submitting ? themeData.primary : "#ccc",
                  color: "white",
                  cursor: reviewText.trim() && !submitting ? "pointer" : "not-allowed",
                  fontFamily: "Josefin Sans, sans-serif",
                  fontWeight: "600",
                  transition: "all 0.3s ease",
                }}
              >
                {submitting ? "Sending..." : "Send"}
              </button>
            </div>

            {!isLoggedIn && (
              <p style={{
                color: "#ff4d6d",
                fontSize: "13px",
                textAlign: "center",
                marginBottom: "12px",
              }}>
                Please login to leave a review
              </p>
            )}
            
            {/* Display Reviews List */}
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review._id || review.id} style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  padding: "12px",
                  borderRadius: "16px",
                  background: "rgba(255,255,255,0.08)",
                  marginBottom: "10px",
                }}>
                  <ProfileIcon size={20} />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "4px",
                      flexWrap: "wrap",
                      gap: "5px",
                    }}>
                      <strong style={{ fontSize: "13px", color: themeData.primary }}>
                        {review.userName || "Anonymous"}
                      </strong>
                      {review.date && (
                        <span style={{ fontSize: "11px", color: "#999" }}>
                          {review.date}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: 0, fontSize: "14px", color: themeData.textColor }}>
                      {review.text}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: "center", color: "#999", padding: "20px" }}>
                No reviews yet. Be the first to review this product! ✨
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;