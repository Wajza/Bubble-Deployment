// frontend/src/components/AdminSidebar.jsx
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/bubble-logo.png";
import { useTheme } from "../context/ThemeContext";

function AdminSidebar() {
  const isMobile = window.innerWidth < 768;
  if (isMobile) return null;
  const navigate = useNavigate();
  const location = useLocation();
  const { themeData } = useTheme();
  
  // Get current active page from URL
  const getActivePage = () => {
    const path = location.pathname;
    if (path === "/admin-dashboard") return "dashboard";
    if (path.includes("/admin/products")) return "products";
    if (path.includes("/admin/inventory")) return "inventory";
    if (path.includes("/admin/orders")) return "orders";
    if (path.includes("/admin/reviews")) return "reviews";
    if (path.includes("/admin/promotions")) return "promotions";
    return "dashboard";
  };

  const activePage = getActivePage();

  const menuItems = [
    { name: "Dashboard", path: "/admin-dashboard", icon: "📊" },
    { name: "Products", path: "/admin/products", icon: "🛍️" },
    { name: "Inventory", path: "/admin/inventory", icon: "📦" },
    { name: "Orders", path: "/admin/orders", icon: "📋" },
    { name: "Reviews", path: "/admin/reviews", icon: "⭐" },
    { name: "Promotions", path: "/admin/promotions", icon: "🏷️" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      height: "100%",
      position: "sticky",
      top: "100px",
    }}>
      {/* Logo Section */}
      <div style={{
        background: themeData.cardBg,
        border: `1px solid ${themeData.borderColor}`,
        borderRadius: "24px",
        padding: "20px",
        textAlign: "center",
        marginBottom: "8px",
      }}>
        <img 
          src={logo} 
          alt="Bubble Logo" 
          style={{ 
            width: "100px", 
            objectFit: "contain",
            marginBottom: "8px",
          }} 
        />
        <p style={{ 
          fontSize: "12px", 
          color: themeData.textLight,
          margin: 0,
        }}>
          Admin Panel
        </p>
      </div>

      {/* Navigation Menu */}
      {menuItems.map((item) => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            background: activePage === item.path.split('/')[2] ? themeData.primary : "rgba(255,255,255,0.08)",
            border: `1px solid ${activePage === item.path.split('/')[2] ? themeData.primary : themeData.borderColor}`,
            borderRadius: "16px",
            padding: "14px 18px",
            fontFamily: "Josefin Sans, sans-serif",
            fontSize: "15px",
            color: activePage === item.path.split('/')[2] ? "white" : themeData.textColor,
            fontWeight: activePage === item.path.split('/')[2] ? "600" : "400",
            cursor: "pointer",
            transition: "all 0.3s ease",
            width: "100%",
            textAlign: "left",
          }}
          onMouseEnter={(e) => {
            if (activePage !== item.path.split('/')[2]) {
              e.currentTarget.style.background = "rgba(255,255,255,0.15)";
            }
          }}
          onMouseLeave={(e) => {
            if (activePage !== item.path.split('/')[2]) {
              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
            }
          }}
        >
          <span style={{ fontSize: "20px" }}>{item.icon}</span>
          <span>{item.name}</span>
          {activePage === item.path.split('/')[2] && (
            <span style={{ 
              marginLeft: "auto", 
              fontSize: "12px",
              background: "rgba(255,255,255,0.2)",
              padding: "2px 8px",
              borderRadius: "20px",
            }}>
              Active
            </span>
          )}
        </button>
      ))}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          background: "rgba(255,77,109,0.1)",
          border: `1px solid rgba(255,77,109,0.3)`,
          borderRadius: "16px",
          padding: "14px 18px",
          fontFamily: "Josefin Sans, sans-serif",
          fontSize: "15px",
          color: "#ff4d6d",
          fontWeight: "500",
          cursor: "pointer",
          transition: "all 0.3s ease",
          width: "100%",
          marginTop: "20px",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255,77,109,0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255,77,109,0.1)";
        }}
      >
        <span style={{ fontSize: "20px" }}>🚪</span>
        <span>Logout</span>
      </button>
    </div>
  );
}

export default AdminSidebar;