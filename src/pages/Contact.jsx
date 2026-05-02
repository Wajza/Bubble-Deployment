// frontend/src/pages/Contact.jsx
import { useState, useEffect } from "react";
import Button from "../components/Button";
import Input from "../components/Input";
import { getCurrentUser, getAuthToken, getCurrentUserId } from "../services/api";
import { useTheme } from "../context/ThemeContext";

function Contact() {
  const { themeData } = useTheme();
  const [form, setForm] = useState({
    fullName: "",
    orderId: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userOrders, setUserOrders] = useState([]);
  const [fetchingOrders, setFetchingOrders] = useState(false);

  const isMobile = window.innerWidth <= 768;
  const userId = getCurrentUserId();

  // Load profile data from backend
  useEffect(() => {
    const loadProfileData = async () => {
      const token = getAuthToken();
      const currentUser = getCurrentUser();
      
      if (token && currentUser) {
        try {
          const response = await fetch(`http://localhost:5000/api/auth/profile`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setForm(prev => ({
              ...prev,
              fullName: userData.user.fullName || "",
              email: userData.user.email || "",
              phone: userData.user.phone || "",
            }));
          } else {
            setForm(prev => ({
              ...prev,
              fullName: currentUser.fullName || "",
              email: currentUser.email || "",
              phone: currentUser.phone || "",
            }));
          }
        } catch (error) {
          console.error("Error loading profile:", error);
          setForm(prev => ({
            ...prev,
            fullName: currentUser.fullName || "",
            email: currentUser.email || "",
            phone: currentUser.phone || "",
          }));
        }
      }
      setLoading(false);
    };

    loadProfileData();
    
    // Load FAQs from backend
    fetch("http://localhost:5000/api/faqs")
      .then(res => res.json())
      .then(data => setFaqs(data))
      .catch(err => console.log(err));
  }, []);

  // Load user's orders from BACKEND
  useEffect(() => {
    const loadUserOrders = async () => {
      const token = getAuthToken();
      if (!token) {
        setFetchingOrders(false);
        return;
      }
      
      setFetchingOrders(true);
      try {
        const response = await fetch(`http://localhost:5000/api/orders/my-orders`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (response.ok) {
          const ordersData = await response.json();
          setUserOrders(ordersData);
        }
      } catch (error) {
        console.error("Error loading orders:", error);
        setUserOrders([]);
      } finally {
        setFetchingOrders(false);
      }
    };

    if (form.email) {
      loadUserOrders();
    } else {
      const currentUser = getCurrentUser();
      if (currentUser?.email) {
        setForm(prev => ({ ...prev, email: currentUser.email }));
      }
    }
  }, [form.email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Don't allow email to be changed
    if (name === "email") return;
    
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      login: "",
    }));

    setSuccessMessage("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.fullName.trim()) {
      newErrors.fullName = "Name is required";
    } else if (/\d/.test(form.fullName)) {
      newErrors.fullName = "Name cannot contain numbers";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }

    if (form.phone && !/^\d+$/.test(form.phone)) {
      newErrors.phone = "Phone must contain only numbers";
    }

    if (!form.subject.trim()) {
      newErrors.subject = "Subject cannot be empty";
    }

    if (!form.message.trim()) {
      newErrors.message = "Message cannot be empty";
    }

    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setSuccessMessage("");
      return;
    }

    const ticketData = {
      customer: form.fullName,
      email: form.email,
      phone: form.phone,
      orderNumber: form.orderId || "N/A",
      subject: form.subject,
      message: form.message,
      status: "Pending",
      date: new Date().toLocaleDateString(),
    };

    try {
      const token = getAuthToken();
      const response = await fetch("http://localhost:5000/api/tickets", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify(ticketData),
      });

      if (!response.ok) throw new Error("Failed to submit ticket");

      setSuccessMessage("✅ Support ticket submitted successfully!");

      // Clear only ticket-specific fields
      setForm((prev) => ({
        ...prev,
        orderId: "",
        subject: "",
        message: "",
      }));

      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (error) {
      console.error("Error submitting ticket:", error);
      setSuccessMessage("❌ Failed to submit ticket. Please try again.");
    }
  };

  const visibleFaqs = showAll ? faqs : faqs.slice(0, 5);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <div style={{ fontSize: "18px", color: themeData.textColor }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{
      width: "94%",
      maxWidth: "1200px",
      margin: "0 auto",
      paddingBottom: "40px",
    }}>
      <div style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        gap: "24px",
      }}>
        {/* FAQs Section */}
        <div style={{
          width: isMobile ? "100%" : "35%",
          background: themeData.cardBg,
          border: `1px solid ${themeData.borderColor}`,
          borderRadius: "28px",
          padding: isMobile ? "24px 20px" : "28px 24px",
          backdropFilter: "blur(14px)",
        }}>
          <h2 style={{
            marginTop: 0,
            marginBottom: "24px",
            fontSize: isMobile ? "28px" : "32px",
            fontWeight: "600",
            color: themeData.textColor,
          }}>
            ❓ FAQs
          </h2>

          {faqs.length > 0 ? (
            <>
              {visibleFaqs.map((faq) => (
                <div key={faq._id} style={{ marginBottom: "24px" }}>
                  <p style={{
                    margin: 0,
                    fontSize: isMobile ? "16px" : "18px",
                    fontWeight: "600",
                    color: themeData.primary,
                  }}>
                    {faq.question}
                  </p>
                  <p style={{
                    marginTop: "8px",
                    marginBottom: 0,
                    fontSize: isMobile ? "14px" : "15px",
                    color: themeData.textLight,
                    lineHeight: 1.5,
                  }}>
                    {faq.answer}
                  </p>
                </div>
              ))}

              {faqs.length > 5 && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  style={{
                    marginTop: "10px",
                    background: "transparent",
                    border: "none",
                    color: themeData.primary,
                    cursor: "pointer",
                    fontWeight: "500",
                    fontSize: "14px",
                  }}
                >
                  {showAll ? "▲ Show Less" : "▼ Show More"}
                </button>
              )}
            </>
          ) : (
            <p style={{ color: themeData.textLight }}>No FAQs available</p>
          )}
        </div>

        {/* Contact Form Section */}
        <div style={{
          flex: 1,
          background: themeData.cardBg,
          border: `1px solid ${themeData.borderColor}`,
          borderRadius: "28px",
          padding: isMobile ? "24px 20px" : "28px 24px",
          backdropFilter: "blur(14px)",
        }}>
          <h1 style={{
            marginTop: 0,
            marginBottom: "8px",
            fontSize: isMobile ? "32px" : "36px",
            fontWeight: "600",
            color: themeData.textColor,
          }}>
            📧 Contact Us
          </h1>
          <p style={{
            marginBottom: "24px",
            color: themeData.textLight,
            fontSize: "15px",
          }}>
            Have questions? We're here to help!
          </p>

          {/* Full Name */}
          <Input 
            label="Full Name *" 
            name="fullName" 
            value={form.fullName} 
            onChange={handleChange} 
            error={errors.fullName} 
          />

          {/* Order Number Dropdown */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: themeData.textColor, fontWeight: "500" }}>
              Order Number
            </label>
            
            {fetchingOrders ? (
              <div style={{
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1px solid #e0e0e0",
                backgroundColor: "#f5f5f5",
                fontSize: "14px",
                color: "#999",
              }}>
                Loading your orders...
              </div>
            ) : userOrders.length > 0 ? (
              <select
                name="orderId"
                value={form.orderId}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  border: "1px solid #b9b9b9",
                  outline: "none",
                  fontSize: "14px",
                  fontFamily: "Josefin Sans, sans-serif",
                  background: "white",
                  cursor: "pointer"
                }}
              >
                <option value="">-- Select an order (optional) --</option>
                {userOrders.map((order) => (
                  <option key={order._id} value={order._id}>
                    #{order._id?.slice(-8)} - {order.items?.length || 0} item(s) - {order.status || "Pending"}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                name="orderId"
                placeholder="No orders found. Type manually (optional)"
                value={form.orderId}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  border: "1px solid #b9b9b9",
                  outline: "none",
                  fontSize: "14px",
                  fontFamily: "Josefin Sans, sans-serif",
                  background: "white",
                }}
              />
            )}
            <small style={{ color: "#666", fontSize: "12px", display: "block", marginTop: "5px" }}>
              {userOrders.length > 0 
                ? `📦 ${userOrders.length} orders found in your history` 
                : "No orders yet. You can type your order number manually."}
            </small>
          </div>

          {/* Email - Read Only */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: themeData.textColor, fontWeight: "500" }}>
              Email *
            </label>
            <div style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: "10px",
              border: "1px solid #e0e0e0",
              backgroundColor: "#f5f5f5",
              fontSize: "14px",
              fontFamily: "Josefin Sans, sans-serif",
              color: "#666",
              cursor: "not-allowed",
            }}>
              {form.email || "No email set"}
            </div>
            {errors.email && <p style={{ color: "#ff5a45", fontSize: "12px", marginTop: "6px" }}>{errors.email}</p>}
          </div>

          {/* Phone Number */}
          <Input 
            label="Phone Number" 
            name="phone" 
            value={form.phone} 
            onChange={handleChange} 
            error={errors.phone} 
          />

          {/* Subject */}
          <Input 
            label="Subject *" 
            name="subject" 
            value={form.subject} 
            onChange={handleChange} 
            error={errors.subject} 
          />

          {/* Message */}
          <Input 
            label="Message *" 
            name="message" 
            value={form.message} 
            onChange={handleChange} 
            error={errors.message} 
            textarea 
            rows={5}
          />

          <Button text="Submit Ticket" variant="purple" onClick={handleSubmit} style={{ width: "100%", marginTop: "10px" }} />

          {successMessage && (
            <p style={{ 
              color: successMessage.includes("✅") ? "#39a86f" : "#ff4d6d", 
              marginTop: "16px",
              textAlign: "center",
              fontWeight: "500"
            }}>
              {successMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Contact;