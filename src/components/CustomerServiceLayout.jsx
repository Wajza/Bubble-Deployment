import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { useTheme } from "../context/ThemeContext";

function CustomerServiceLayout() {
  const { themeData } = useTheme();

  return (
    <div className={`${themeData.name}-page`} style={{
      minHeight: "100vh",
      background: themeData.background,
      position: "relative",
    }}>
      <Navbar />

      {/* ✅ CLEAN CONTENT (NO SIDEBAR) */}
      <div style={{
        paddingTop: "100px",
        paddingLeft: "16px",
        paddingRight: "16px",
        paddingBottom: "30px",
        maxWidth: "1100px",
        margin: "0 auto",
      }}>
        <Outlet />
      </div>
    </div>
  );
}

export default CustomerServiceLayout;