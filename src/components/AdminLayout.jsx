// frontend/src/components/AdminLayout.jsx
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import { useTheme } from "../context/ThemeContext";

function AdminLayout() {
  const { themeData } = useTheme();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

useEffect(() => {
  const handleResize = () => setIsMobile(window.innerWidth < 768);
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);

  return (
    <div className={`${themeData.name}-page`} style={{
      minHeight: "100vh",
      background: themeData.background,
      position: "relative",
    }}>
      <Navbar />
      <div style={{
        paddingTop: "90px",
        paddingLeft: "24px",
        paddingRight: "24px",
        paddingBottom: "30px",
        position: "relative",
        zIndex: 2,
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "240px 1fr",
          gap: "24px",
        }}>
          <AdminSidebar />
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;