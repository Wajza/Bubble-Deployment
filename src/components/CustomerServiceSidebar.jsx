// frontend/src/components/CustomerServiceSidebar.jsx
import { useNavigate } from "react-router-dom";
import logo from "../assets/bubble-logo.png";
import { useTheme } from "../context/ThemeContext";

function CustomerServiceSidebar({ activePage }) {
  const navigate = useNavigate();
  const { themeData } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="sidebar" style={{
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      height: "100%",
      minHeight: "500px",
    }}>
      <div className="logo-card" style={{
        background: "rgba(255,255,255,0.12)",
        border: "1px solid rgba(255,255,255,0.35)",
        borderRadius: "24px",
        backdropFilter: "blur(14px)",
        padding: "16px",
        textAlign: "center",
        marginBottom: "10px",
      }}>
        <img src={logo} alt="Bubble Logo" style={{ width: "100%", maxWidth: "120px", objectFit: "contain" }} />
      </div>

      <button
        className={activePage === "tickets" ? "active" : ""}
        onClick={() => navigate("/customer-service/tickets")}
        style={{
          background: activePage === "tickets" ? themeData.primary : "rgba(255,255,255,0.12)",
          border: "1px solid rgba(255,255,255,0.35)",
          borderRadius: "18px",
          padding: "14px 12px",
          fontFamily: "Josefin Sans, sans-serif",
          fontSize: "16px",
          color: activePage === "tickets" ? "white" : themeData.textColor,
          fontWeight: activePage === "tickets" ? "700" : "400",
          cursor: "pointer",
          transition: "all 0.3s ease",
        }}
      >
        🎫 Ticket Management
      </button>

      <button
        className={activePage === "faqs" ? "active" : ""}
        onClick={() => navigate("/customer-service/faqs")}
        style={{
          background: activePage === "faqs" ? themeData.primary : "rgba(255,255,255,0.12)",
          border: "1px solid rgba(255,255,255,0.35)",
          borderRadius: "18px",
          padding: "14px 12px",
          fontFamily: "Josefin Sans, sans-serif",
          fontSize: "16px",
          color: activePage === "faqs" ? "white" : themeData.textColor,
          fontWeight: activePage === "faqs" ? "700" : "400",
          cursor: "pointer",
          transition: "all 0.3s ease",
        }}
      >
        📋 FAQ Templates
      </button>

      <div style={{ flex: 1 }} />

      <button
        onClick={handleLogout}
        style={{
          background: "rgba(255,255,255,0.12)",
          border: "1px solid rgba(255,255,255,0.35)",
          borderRadius: "18px",
          padding: "14px 12px",
          fontFamily: "Josefin Sans, sans-serif",
          fontSize: "16px",
          color: themeData.textColor,
          cursor: "pointer",
          transition: "all 0.3s ease",
          marginTop: "20px",
        }}
      >
        🚪 Logout
      </button>
    </div>
  );
}

export default CustomerServiceSidebar;