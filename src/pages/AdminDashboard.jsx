// frontend/src/pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { getAuthToken } from "../utils/auth";
import { formatSAR } from "../utils/currency";
import { useTheme } from "../context/ThemeContext";

function AdminDashboard() {
const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

useEffect(() => {
  const handleResize = () => setIsMobile(window.innerWidth < 768);
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []); 
  const { themeData } = useTheme();
  const [dashboardData, setDashboardData] = useState(null);
  const [salesFilter, setSalesFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const token = getAuthToken();
        const response = await fetch(
          `http://localhost:5000/api/admin/dashboard?salesFilter=${salesFilter}`,
          { headers: { "Authorization": token ? `Bearer ${token}` : "" } }
        );
        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error("Failed to fetch dashboard:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, [salesFilter]);

  const totalSales = dashboardData?.totalSales || 0;
  const totalOrders = dashboardData?.totalOrders || 0;
  const totalCustomers = dashboardData?.totalCustomers || 0;
  const totalProducts = dashboardData?.totalProducts || 0;
  const recentOrders = dashboardData?.recentOrders || [];
  const topProducts = dashboardData?.topProducts || [];
  const salesChartData = dashboardData?.salesChartData || [];
  const activityData = dashboardData?.activityData || [];

  if (loading) {
    return <div style={{ textAlign: "center", padding: "50px" }}>Loading dashboard...</div>;
  }

  return (
        <div style={{
          display: "grid",
          gap: "20px",
          width: "100%",
          maxWidth: "1000px",
          margin: "0 auto",
          marginTop: "100px",
          padding: isMobile ? "0 10px" : "0"
        }}>
        {/* Stats Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile
        ? "1fr 1fr"
        : "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px",
      }}>
        <StatCard title="Total Sales" value={formatSAR(totalSales)} bg={themeData.primary} />
        <StatCard title="Total Orders" value={totalOrders.toString()} bg={themeData.primaryLight} />
        <StatCard title="Total Customers" value={totalCustomers.toString()} bg={themeData.primary} />
        <StatCard title="Total Products" value={totalProducts.toString()} bg={themeData.primaryLight} />
      </div>

      {/* Sales Chart */}
      <div style={{
        background: themeData.cardBg,
        border: `1px solid ${themeData.borderColor}`,
        borderRadius: "20px",
        padding: isMobile ? "12px" : "20px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ margin: 0, fontSize: "20px", color: themeData.textColor }}>Sales Overview</h2>
          <select value={salesFilter} onChange={(e) => setSalesFilter(e.target.value)} style={{
            padding: "6px 12px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            background: "white",
          }}>
            <option value="all">All Months</option>
            <option value="last6">Last 6 Months</option>
            <option value="last3">Last 3 Months</option>
          </select>
        </div>
        <div style={{ width: "100%", height: isMobile ? "220px" : "300px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesChartData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatSAR(value)} />
              <Line type="monotone" dataKey="sales" stroke={themeData.primary} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders & Top Products */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "16px",
      }}>
        <div style={{
          background: themeData.cardBg,
          border: `1px solid ${themeData.borderColor}`,
          borderRadius: "20px",
          padding: isMobile ? "12px" : "20px"
        }}>
          <h2 style={{ margin: "0 0 16px", fontSize: isMobile ? "16px" : "20px", color: themeData.textColor }}>Recent Orders</h2>
          {recentOrders.slice(0, 5).map((order) => (
            <div key={order._id} style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr",
              gap: "6px",
              padding: "10px 0",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}>
              <span style={{ color: themeData.textLight }}>#{order._id?.slice(-8)}</span>
              <span style={{ color: themeData.textLight }}>{formatSAR(order.totalPrice)}</span>
              <span style={statusStyle(order.status)}>{order.status || "Processing"}</span>
            </div>
          ))}
        </div>

        <div style={{
          background: themeData.cardBg,
          border: `1px solid ${themeData.borderColor}`,
          borderRadius: "20px",
          padding: isMobile ? "12px" : "20px"
        }}>
          <h2 style={{ margin: "0 0 16px", fontSize: "20px", color: themeData.textColor }}>Top Products</h2>
          {topProducts.slice(0, 5).map((product, idx) => (
            <div key={idx} style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 0",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}>
              <span style={{
                color: themeData.textLight,
                maxWidth: "70%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}>
                {product.name || "Product"}
              </span>
              <span style={{ color: themeData.primary, fontWeight: "bold" }}>Sold: {product.quantity || 0}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ title, value, bg }) => (
  <div style={{
    background: "rgba(255,255,255,0.12)",
    borderRadius: "20px",
    padding: "20px",
    textAlign: "center",
  }}>
    <p style={{ margin: "0 0 8px", fontSize: "14px", color: "#888" }}>{title}</p>
    <h2 style={{ margin: 0, fontSize: "28px", fontWeight: "bold", color: bg }}>{value}</h2>
  </div>
);

const statusStyle = (status) => ({
  display: "inline-block",
  padding: "4px 10px",
  borderRadius: "12px",
  fontSize: "12px",
  fontWeight: "600",
  background: status === "Delivered" ? "#d7f2d4" : status === "Shipped" ? "#d8e7ff" : "#ffd7c9",
  color: status === "Delivered" ? "#3d9b44" : status === "Shipped" ? "#3d6fd1" : "#d96a3a",
});

export default AdminDashboard;