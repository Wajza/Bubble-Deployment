// frontend/src/pages/ReviewManagement.jsx
import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { getAuthToken } from "../utils/auth";

function ReviewManagement() {
  const { themeData } = useTheme();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch("http://localhost:5000/api/reviews/admin/all", {
        headers: { "Authorization": token ? `Bearer ${token}` : "" }
      });
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this review?")) {
      const token = getAuthToken();
      await fetch(`http://localhost:5000/api/reviews/admin/${id}`, {
        method: "DELETE",
        headers: { "Authorization": token ? `Bearer ${token}` : "" }
      });
      fetchReviews();
    }
  };

  if (loading) return <div style={{ textAlign: "center", padding: "50px" }}>Loading reviews...</div>;

  return (
    <div style={{
      background: themeData.cardBg,
      borderRadius: "28px",
      padding: "24px",
    }}>
      <h1 style={{ margin: "0 0 24px", color: themeData.textColor }}>Review Management</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {reviews.map(review => (
          <div key={review._id} style={{
            background: "rgba(255,255,255,0.08)",
            borderRadius: "16px",
            padding: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px", flexWrap: "wrap" }}>
                <strong style={{ color: themeData.textColor }}>{review.userName || "Anonymous"}</strong>
                <span style={{ color: themeData.primary }}>⭐ {review.rating || 5}/5</span>
                <span style={{ color: themeData.textLight, fontSize: "12px" }}>
                  {review.date || new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p style={{ color: themeData.textLight, margin: "8px 0" }}>{review.text}</p>
              <p style={{ color: themeData.textLight, fontSize: "13px" }}>Product: {review.productId?.name || "Unknown"}</p>
            </div>
            <button onClick={() => handleDelete(review._id)} style={{
              background: "#ff4d6d",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "6px 12px",
              cursor: "pointer",
            }}>Delete</button>
          </div>
        ))}
        {reviews.length === 0 && (
          <p style={{ textAlign: "center", color: themeData.textLight, padding: "40px" }}>No reviews found</p>
        )}
      </div>
    </div>
  );
}

export default ReviewManagement;