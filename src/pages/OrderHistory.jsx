// frontend/src/pages/OrderHistory.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import profileImage from "../assets/Profile .png";
import { getCurrentUser, getAuthToken, getUserOrders } from "../services/api";
import { formatSAR } from "../utils/currency";

function OrderHistory() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({ fullName: "", email: "" });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

useEffect(() => {
  const handleResize = () => setIsMobile(window.innerWidth < 768);
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);

  // Load profile and orders from BACKEND only
  useEffect(() => {
    const loadData = async () => {
      const token = getAuthToken();
      const currentUser = getCurrentUser();
      
      if (!token || !currentUser) {
        navigate("/");
        return;
      }

      try {
        // Load profile from backend
        const profileResponse = await fetch(`http://localhost:5000/api/auth/profile`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (profileResponse.ok) {
          const userData = await profileResponse.json();
          setProfileData({
            fullName: userData.user.fullName || "User",
            email: userData.user.email || "",
          });
        } else {
          setProfileData({
            fullName: currentUser.fullName || "User",
            email: currentUser.email || "",
          });
        }

        // Load orders from BACKEND
        const ordersResponse = await fetch(`http://localhost:5000/api/orders/my-orders`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          setOrders(ordersData);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="purple-page" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div>Loading your orders...</div>
      </div>
    );
  }

  return (
    <div className="purple-page" style={{ minHeight: "100vh" }}>
      <div style={{ position: "relative", zIndex: 1, width: "92%", maxWidth: "1280px", margin: "0 auto", paddingTop: "24px", paddingBottom: "30px" }}>
        <button onClick={() => navigate(-1)} style={{
          background: "rgba(255,255,255,0.12)",
          border: "1px solid rgba(255,255,255,0.28)",
          borderRadius: "30px",
          padding: "16px 34px",
          fontFamily: "Josefin Sans, sans-serif",
          fontSize: "18px",
          color: "#2e3d4c",
          cursor: "pointer",
          backdropFilter: "blur(12px)",
          marginBottom: "10px",
        }}>
          ← Back
        </button>

        <div className="order-history-layout" style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "230px 1fr",
minWidth: 0, gap: "34px", alignItems: "start" }}>
          {/* Profile Sidebar */}
          <div style={{
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.28)",
            borderRadius: "28px",
            padding: "30px 18px 20px",
            backdropFilter: "blur(14px)",
            textAlign: "center",
            minHeight: "230px",

            minWidth: 0,
          }}>
            <div style={{ width: "132px", height: "132px", borderRadius: "50%", overflow: "hidden", margin: "0 auto 18px", background: "rgba(255,255,255,0.24)" }}>
              <img src={profileImage} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <h2 style={{ margin: "0 0 10px", color: "#334155", fontSize: "22px", fontWeight: "600", wordBreak: "break-word" }}>
              @{(profileData.fullName || "User").replace(/\s+/g, "")}
            </h2>
            <div style={{ display: "inline-block", padding: "6px 12px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.2)", fontSize: "13px", color: "#4b5563", wordBreak: "break-all" }}>
              {profileData.email}
            </div>
          </div>

          {/* Orders Section */}
          <div style={{
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.28)",
            borderRadius: "28px",
            padding: "32px",
            backdropFilter: "blur(14px)",
            minHeight: "540px",
            minWidth: 0,
          }}>
            <h1 style={{ margin: "0 0 22px", fontSize: "28px", color: "#111827", fontWeight: "700" }}>Order History</h1>

            <div style={{ width: "100%", maxWidth: "720px", overflowX: "auto", borderRadius: "16px", background: "rgba(255,255,255,0.34)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "620px" }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.52)", color: "#4b5563", textAlign: "left" }}>
                    <th style={{ padding: "14px 10px", fontSize: "14px" }}>Order ID</th>
                    <th style={{ padding: "14px 10px", fontSize: "14px" }}>Date</th>
                    <th style={{ padding: "14px 10px", fontSize: "14px" }}>Items</th>
                    <th style={{ padding: "14px 10px", fontSize: "14px" }}>Total</th>
                    <th style={{ padding: "14px 10px", fontSize: "14px" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length > 0 ? (
                    orders.map((order, index) => {
                      const itemNames = order.items?.map(item => item.name).join(", ") || "Unknown Item";
                      return (
                        <tr key={order._id || index} style={{ borderTop: "1px solid rgba(255,255,255,0.35)" }}>
                          <td style={{ padding: "18px 10px", color: "#374151" }}>#{order._id?.slice(-8) || `ORD${1000 + index}`}</td>
                          <td style={{ padding: "18px 10px", color: "#374151" }}>{formatDate(order.createdAt)}</td>
                          <td style={{ padding: "18px 10px", color: "#374151" }}>{itemNames}</td>
                          <td style={{ padding: "18px 10px", color: "#374151" }}>{formatSAR(order.totalPrice)}</td>
                          <td style={{ padding: "18px 10px" }}>
                            <span style={{ background: "#b99af1", color: "#5b2fb2", padding: "6px 12px", borderRadius: "10px", fontSize: "12px", fontWeight: "600" }}>
                              {order.status || "Pending"}
                            </span>
                           </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ padding: "24px 10px", textAlign: "center", color: "#4b5563" }}>No orders found.</td>
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

export default OrderHistory;