// frontend/src/components/AppLayout.jsx
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { useTheme } from "../context/ThemeContext";

function AppLayout() {
  const { themeData } = useTheme();
  
  return (
    <div className={`${themeData.name}-page`} style={{
      minHeight: "100vh",
      background: themeData.background,
      position: "relative",
      overflowX: "hidden",
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
        <Outlet />
      </div>
    </div>
  );
}

export default AppLayout;