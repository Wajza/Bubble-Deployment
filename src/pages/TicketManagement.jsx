// frontend/src/pages/TicketManagement.jsx
import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { getAuthToken } from "../utils/auth";

function TicketManagement() {
  const { themeData } = useTheme();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [issueType, setIssueType] = useState("");
  const [refundEligibility, setRefundEligibility] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch("http://localhost:5000/api/tickets", {
        headers: { "Authorization": token ? `Bearer ${token}` : "" }
      });
      const data = await response.json();
      setTickets(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedTicket) return;
    const token = getAuthToken();
    await fetch(`http://localhost:5000/api/tickets/${selectedTicket._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : ""
      },
      body: JSON.stringify({ issueType, refundEligibility, status }),
    });
    setMessage("✅ Ticket updated!");
    setTimeout(() => setMessage(""), 3000);
    loadTickets();
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = filterStatus === "All" || ticket.status === filterStatus;
    const matchesSearch = ticket._id?.toLowerCase().includes(search.toLowerCase()) ||
      ticket.customer?.toLowerCase().includes(search.toLowerCase()) ||
      ticket.email?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

useEffect(() => {
  const handleResize = () => setIsMobile(window.innerWidth < 768);
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);

  if (loading) return <div style={{ textAlign: "center", padding: "50px" }}>Loading tickets...</div>;

  return (
    <div style={{
      background: themeData.cardBg,
      borderRadius: "28px",
      padding: isMobile ? "12px" : "24px",
    }}>
      <h1 style={{ margin: "0 0 24px", color: themeData.textColor }}>🎫 Ticket Management</h1>

      {/* Filters */}
      <div style={{
        display: "flex",
        gap: "12px",
        flexWrap: "wrap",
        marginBottom: "24px",
      }}>
        <input
          type="text"
          placeholder="Search by ID, customer, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "10px",
            border: "1px solid #ccc",
          }}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: "10px", borderRadius: "10px", border: "1px solid #ccc" }}
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Open">Open</option>
          <option value="Processed">Processed</option>
        </select>
      </div>

      {/* Tickets List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
        {filteredTickets.map(ticket => (
          <div
            key={ticket._id}
            onClick={() => {
              setSelectedTicket(ticket);
              setIssueType(ticket.issueType || "");
              setRefundEligibility(ticket.refundEligibility || "");
              setStatus(ticket.status || "Pending");
            }}
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "flex-start" : "center",
              gap: "8px",
              padding: "16px",
              background: selectedTicket?._id === ticket._id ? themeData.primary : "rgba(255,255,255,0.08)",
              borderRadius: "16px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <div>
              <div style={{ fontWeight: "bold", wordBreak: "break-word", color: selectedTicket?._id === ticket._id ? "white" : themeData.textColor }}>
                #{ticket._id?.slice(-8)} - {ticket.customer || "Guest"}
              </div>
              <div style={{ fontSize: "13px", color: selectedTicket?._id === ticket._id ? "rgba(255,255,255,0.8)" : themeData.textLight }}>
                {ticket.subject || "No subject"}
              </div>
            </div>
            <div>
              <span style={{
                display: "inline-block",
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "600",
                background: ticket.status === "Processed" ? "#d7f2d4" : ticket.status === "Open" ? "#d8e7ff" : "#ffd7c9",
                color: ticket.status === "Processed" ? "#3d9b44" : ticket.status === "Open" ? "#3d6fd1" : "#d96a3a",
              }}>
                {ticket.status || "Pending"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Ticket Details */}
      {selectedTicket && (
        <div style={{
          background: "rgba(255,255,255,0.08)",
          borderRadius: "20px",
          padding: "20px",
          marginTop: "20px",
        }}>
          <h2 style={{ margin: "0 0 16px", fontSize: "20px", color: themeData.textColor }}>
            Ticket #{selectedTicket._id?.slice(-8)} Details
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px", marginBottom: "20px" }}>
            <div><strong>Customer:</strong> {selectedTicket.customer || "N/A"}</div>
            <div><strong>Email:</strong> {selectedTicket.email || "N/A"}</div>
            <div><strong>Phone:</strong> {selectedTicket.phone || "N/A"}</div>
            <div><strong>Order:</strong> {selectedTicket.orderNumber || "N/A"}</div>
            <div><strong>Subject:</strong> {selectedTicket.subject || "N/A"}</div>
            <div><strong>Message:</strong> {selectedTicket.message || "N/A"}</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            <select value={issueType} onChange={(e) => setIssueType(e.target.value)} style={{ padding: "10px", borderRadius: "8px" }}>
              <option>Refund</option>
              <option>Wrong Order</option>
              <option>Missing Item</option>
              <option>Late Delivery</option>
              <option>Other</option>
            </select>
            <select value={refundEligibility} onChange={(e) => setRefundEligibility(e.target.value)} style={{ padding: "10px", borderRadius: "8px" }}>
              <option>Pending</option>
              <option>Approve</option>
              <option>Reject</option>
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: "10px", borderRadius: "8px" }}>
              <option>Pending</option>
              <option>Open</option>
              <option>Processed</option>
            </select>
            <button onClick={handleUpdate} style={{
              background: themeData.primary,
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "10px",
              cursor: "pointer",
            }}>Update Ticket</button>
          </div>
          {message && <p style={{ marginTop: "16px", textAlign: "center", color: "#39a86f" }}>{message}</p>}
        </div>
      )}
    </div>
  );
}

export default TicketManagement;