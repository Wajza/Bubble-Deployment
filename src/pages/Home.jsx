// frontend/src/pages/Home.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import bubble7 from "../assets/bubble7.png";
import bubble8 from "../assets/bubble8.png";
import heart from "../assets/heart.png";
import heartFilled from "../assets/heart-filled.png";
import { getCurrentUserId } from "../utils/auth";

function Home() {
  const navigate = useNavigate();
  const userId = getCurrentUserId();
  const isLoggedIn = !!userId;

  const [products, setProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [liked, setLiked] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const intervalRef = useRef(null);

  const isMobile = window.innerWidth <= 768;
  const product = products[currentIndex] || null;

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => {
        const normal = data.filter((item) => !item.isCustomizable);
        setProducts(normal);
      })
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    if (products.length < 2) return;
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
      setAnimKey((k) => k + 1);
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, [products]);

  useEffect(() => {
    if (!userId || !product) return;

    const checkWishlist = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/wishlist/${userId}`);
        const data = await response.json();
        setLiked(data.some((item) => item.productId?._id === product._id));
      } catch (error) {
        console.error(error);
      }
    };

    checkWishlist();
    window.addEventListener("wishlistUpdated", checkWishlist);
    return () => window.removeEventListener("wishlistUpdated", checkWishlist);
  }, [userId, product]);

  const handleWishlist = async () => {
    if (!isLoggedIn) {
      navigate("/");
      return;
    }
    if (!product) return;

    try {
      if (liked) {
        const response = await fetch(`http://localhost:5000/api/wishlist/${userId}`);
        const data = await response.json();
        const wishlistItem = data.find((item) => item.productId?._id === product._id);
        if (wishlistItem) {
          await fetch(`http://localhost:5000/api/wishlist/${wishlistItem._id}`, {
            method: "DELETE",
          });
        }
        setLiked(false);
      } else {
        await fetch("http://localhost:5000/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userId,
            productId: product._id,
            quantity: 1,
          }),
        });
        setLiked(true);
      }
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (error) {
      console.error(error);
      alert("Failed to update wishlist");
    }
  };

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      navigate("/");
      return;
    }
    if (!product) return;

    try {
      const response = await fetch("http://localhost:5000/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          productId: product._id,
          quantity: 1,
        }),
      });

      if (!response.ok) throw new Error("Failed to add to cart");

      setCartMessage("Added to cart!");
      setTimeout(() => setCartMessage(""), 2000);
    } catch (error) {
      console.error(error);
      setCartMessage("Failed to add");
    }
  };

  const handleMoreDetails = () => {
    if (!isLoggedIn) {
      navigate("/");
      return;
    }
    if (!product) return;
    navigate(`/product-details/${product._id}`);
  };

  const goTo = (index) => {
    clearInterval(intervalRef.current);
    setCurrentIndex(index);
    setAnimKey((k) => k + 1);
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
      setAnimKey((k) => k + 1);
    }, 5000);
  };

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      {/* Background bubbles */}
      <img
        src={bubble7}
        alt="bubble left"
        style={{
          position: "absolute",
          left: "5px",
          bottom: "20px",
          width: "35vw",
          maxWidth: "500px",
          opacity: 0.4,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      <img
        src={bubble8}
        alt="bubble right"
        style={{
          position: "absolute",
          right: "2px",
          top: "20px",
          width: "35vw",
          maxWidth: "500px",
          opacity: 0.4,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* Main content */}
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 2,
        }}
      >
        {product && (
          <img
            key={animKey}
            src={product.image}
            alt={product.name}
            style={{
              width: "90%",
              maxWidth: "560px",
              filter: "drop-shadow(0px 20px 40px rgba(0,0,0,0.18))",
              marginBottom: "10px",
              pointerEvents: "none",
              animation: "slideIn 0.6s cubic-bezier(0.22,1,0.36,1) both",
            }}
          />
        )}

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
            justifyContent: "center",
            position: "absolute",
            bottom: isMobile ? "40px" : "80px",
          }}
        >
          <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Button text="Add to Cart" variant="primary" onClick={handleAddToCart} />
            {cartMessage && (
              <span style={{ position: "absolute", top: "110%", color: "#39a86f", fontSize: "14px", fontWeight: "500", whiteSpace: "nowrap" }}>
                {cartMessage}
              </span>
            )}
          </div>

          <Button text="More Details" variant="secondary" onClick={handleMoreDetails} />

          <img
            src={liked ? heartFilled : heart}
            alt="wishlist"
            onClick={handleWishlist}
            style={{
              width: "24px",
              height: "24px",
              cursor: "pointer",
              transition: "0.3s",
              transform: liked ? "scale(1.2)" : "scale(1)",
            }}
          />
        </div>

        {/* Dots */}
        {products.length > 1 && (
          <div
            style={{
              display: "flex",
              gap: "8px",
              position: "absolute",
              bottom: isMobile ? "10px" : "40px",
            }}
          >
            {products.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                style={{
                  width: i === currentIndex ? "24px" : "8px",
                  height: "8px",
                  borderRadius: "4px",
                  border: "none",
                  background: i === currentIndex ? "#8B3A52" : "rgba(139,58,82,0.3)",
                  cursor: "pointer",
                  padding: 0,
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;