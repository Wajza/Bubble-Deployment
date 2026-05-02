import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { formatSAR } from "../utils/currency";

function OrderManagement() {
  const { themeData } = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    fetchOrders();

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/orders");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    await fetch(`http://localhost:5000/api/admin/orders/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchOrders();
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: "50px" }}>Loading orders...</div>;
  }

  return (
    <div style={{
      background: themeData.cardBg,
      minWidth: 0,
      borderRadius: "28px",
      padding: isMobile ? "12px" : "24px",
    }}>
      <h1 style={{
        margin: "0 0 20px",
        color: themeData.textColor,
        fontSize: isMobile ? "18px" : "24px"
      }}>
        Order Management
      </h1>

      {/* ✅ Scroll container */}
        <div style={{
          overflowX: "auto",
          borderRadius: "14px",
          width: "100%"
        }}>
        <table style={{
          width: "1200px",
          borderCollapse: "collapse"
        }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.1)" }}>
              <th style={thStyle(themeData)}>Order ID</th>
              <th style={thStyle(themeData)}>Customer</th>
              <th style={thStyle(themeData)}>Total</th>
              <th style={thStyle(themeData)}>Status</th>
              <th style={thStyle(themeData)}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {orders.map(order => (
              <tr key={order._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>

                <td style={tdStyle(themeData)}>
                  #{order._id?.slice(-6)}
                </td>

                <td style={{
                  ...tdStyle(themeData),
                  maxWidth: "120px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}>
                  {order.customer?.fullName || "Guest"}
                </td>

                <td style={{
                  ...tdStyle(themeData),
                  color: themeData.primary,
                  fontWeight: "bold"
                }}>
                  {formatSAR(order.totalPrice)}
                </td>

                <td style={tdStyle(themeData)}>
                  <span style={statusStyle(order.status)}>
                    {order.status || "Processing"}
                  </span>
                </td>

                <td style={tdStyle(themeData)}>
                  <select
                    value={order.status || "Processing"}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                    style={{
                      padding: isMobile ? "4px" : "6px",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                      fontSize: isMobile ? "12px" : "14px",
                      cursor: "pointer"
                    }}
                  >
                    <option>Processing</option>
                    <option>Shipped</option>
                    <option>Delivered</option>
                    <option>Cancelled</option>
                  </select>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle = (theme) => ({
  padding: "12px",
  textAlign: "left",
  color: theme.textColor,
  fontSize: "14px"
});

const tdStyle = (theme) => ({
  padding: "10px",
  color: theme.textLight,
  fontSize: "13px"
});

const statusStyle = (status) => ({
  display: "inline-block",
  padding: "4px 10px",
  borderRadius: "12px",
  fontSize: "12px",
  fontWeight: "600",
  background:
    status === "Delivered" ? "#d7f2d4" :
    status === "Shipped" ? "#d8e7ff" :
    "#ffd7c9",
  color:
    status === "Delivered" ? "#3d9b44" :
    status === "Shipped" ? "#3d6fd1" :
    "#d96a3a",
});

export default OrderManagement;