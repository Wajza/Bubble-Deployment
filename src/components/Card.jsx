// Product card component
// src/components/Card.jsx
import Button from "./Button";
import heart from "../assets/heart.png";
import heartFilled from "../assets/heart-filled.png";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCurrentUserId } from "../utils/auth";

function Card({ product }) {
    const navigate = useNavigate();
    const [liked, setLiked] = useState(false);
    const userId = getCurrentUserId();
    const isLoggedIn = !!userId;

    // Check if product is in wishlist
    useEffect(() => {
        if (!userId) return;

        const checkWishlist = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/wishlist/${userId}`);
                const data = await response.json();
                const exists = data.some((item) => item.productId?._id === product._id);
                setLiked(exists);
            } catch (error) {
                console.error(error);
            }
        };

        checkWishlist();

        window.addEventListener("wishlistUpdated", checkWishlist);
        return () => window.removeEventListener("wishlistUpdated", checkWishlist);
    }, [product._id, userId]);

    // Toggle wishlist
    const handleWishlistClick = async () => {
        if (!isLoggedIn) {
            alert("Please login first");
            navigate("/");
            return;
        }

        try {
            if (liked) {
                const response = await fetch(`http://localhost:5000/api/wishlist/${userId}`);
                const data = await response.json();
                const wishlistItem = data.find(
                    (item) => item.productId?._id === product._id
                );
                if (wishlistItem) {
                    await fetch(`http://localhost:5000/api/wishlist/${wishlistItem._id}`, {
                        method: "DELETE",
                    });
                }
                setLiked(false);
            } else {
                await fetch("http://localhost:5000/api/wishlist", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
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

    // Add product to cart
    const handleAddToCart = async () => {
        if (!isLoggedIn) {
            alert("Please login first");
            navigate("/");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/cart", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: userId,
                    productId: product._id,
                    quantity: 1,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to add to cart");
            }

            alert(`${product.name} added to cart`);
        } catch (error) {
            console.error(error);
            alert("Failed to add product to cart");
        }
    };

    // Rest of your component remains the same...
    return (
        <div
            style={{
                background: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(15px)",
                WebkitBackdropFilter: "blur(15px)",
                border: "1px solid rgba(255,255,255,0.4)",
                borderRadius: "20px",
                padding: "10px",
                textAlign: "center",
                boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    marginBottom: "10px",
                    height: "24px",
                }}
            >
                {!product.customizable && (
                    <img
                        src={liked ? heartFilled : heart}
                        alt="wishlist"
                        onClick={handleWishlistClick}
                        style={{
                            width: "24px",
                            height: "24px",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            transform: liked ? "scale(1.2)" : "scale(1)",
                        }}
                    />
                )}
            </div>

            <div
                style={{
                    width: "100%",
                    height: "150px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "15px",
                }}
            >
                {product.image ? (
                    <img
                        src={
                            product.image?.startsWith("http")
                                ? product.image
                                : new URL(`../assets/${product.image}`, import.meta.url).href
                        }
                        alt={product.name}
                        style={{
                            maxWidth: "150px",
                            maxHeight: "120px",
                            objectFit: "contain",
                        }}
                    />
                ) : product._id === "custom-soap" ? (
                
                    <div
                        style={{
                            fontSize: "80px",
                            color: "#b07ae8",
                        }}
                    >
                        +
                    </div>
                ) : (
                   
                    <div
                        style={{
                            fontSize: "14px",
                            color: "#aaa",
                        }}
                    >
                        No Image
                    </div>
                )}
            </div>

            <h3
                style={{
                    fontSize: "16px",
                    fontWeight: "500",
                    color: "#333",
                    marginBottom: "10px",
                }}
            >
                {product.name}
            </h3>

            <p
                style={{
                    fontSize: "16px",
                    color: "#666",
                    marginBottom: "16px",
                }}
            >
                {product.price > 0 ? `$${product.price.toFixed(2)}` : "$???"}
            </p>

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "10px",
                    marginTop: "20px",
                }}
            >
                {product.customizable ? (
                    <Button
                        text="Customize"
                        variant="purple"
                        onClick={() => navigate("/customize")}
                    />
                ) : product.stock > 0 ? (
                    <>
                        <Button
                            text="Add to Cart"
                            variant="purple"
                            onClick={handleAddToCart}
                        />
                        <Button
                            text="Details"
                            variant="purple"
                            onClick={() => navigate(`/product-details/${product._id}`)}
                        />
                    </>
                ) : (
                    <>
                        <Button text="Out Of Stock" variant="purpleDisabled" disabled />
                        <Button
                            text="Product Details"
                            variant="purple"
                            onClick={() => navigate(`/product-details/${product._id}`)}
                        />
                    </>
                )}
            </div>
        </div>
    );
}

export default Card;