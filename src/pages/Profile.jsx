// frontend/src/pages/Profile.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import defaultProfileImage from "../assets/Profile .png";
import billingCard from "../assets/Card.png";
import { getCurrentUser, getAuthToken, updateUserProfile, uploadProfileImage, getUserOrders } from "../services/api";
import { formatSAR } from "../utils/currency";

function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

useEffect(() => {
  const handleResize = () => setIsMobile(window.innerWidth < 768);
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
  });
  const [errors, setErrors] = useState({});
  const [savedMessage, setSavedMessage] = useState("");
  const [orders, setOrders] = useState([]);
  const [imageMessage, setImageMessage] = useState("");
  const [profileImage, setProfileImage] = useState(defaultProfileImage);

  // Fetch user data and orders from backend
  useEffect(() => {
    const fetchUserData = async () => {
      const token = getAuthToken();
      const currentUser = getCurrentUser();
      
      if (!token || !currentUser) {
        navigate("/");
        return;
      }
      
      try {
        // Fetch profile from backend
        const response = await fetch(`http://localhost:5000/api/auth/profile`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (response.ok) {
          const userData = await response.json();
          setFormData({
            fullName: userData.user.fullName || "",
            email: userData.user.email || "",
            phone: userData.user.phone || "",
            address: userData.user.address || "",
          });
          if (userData.user.profileImage) {
            setProfileImage(userData.user.profileImage);
          }
        } else {
          // Fallback to cached user
          setFormData({
            fullName: currentUser.fullName || "",
            email: currentUser.email || "",
            phone: currentUser.phone || "",
            address: currentUser.address || "",
          });
        }
        
        // Fetch orders from backend
        const ordersResponse = await fetch(`http://localhost:5000/api/orders/my-orders`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          setOrders(ordersData);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setFormData({
          fullName: currentUser.fullName || "",
          email: currentUser.email || "",
          phone: currentUser.phone || "",
          address: currentUser.address || "",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
    setSavedMessage("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (formData.phone && !/^\d+$/.test(formData.phone)) {
      newErrors.phone = "Phone must contain only numbers";
    }

    return newErrors;
  };

  const handleSave = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSavedMessage("");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      alert("Please login again");
      navigate("/");
      return;
    }

    try {
      const result = await updateUserProfile({
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
      });
      
      // Update cached user data
      const currentUser = getCurrentUser();
      if (currentUser) {
        currentUser.fullName = formData.fullName;
        currentUser.phone = formData.phone;
        currentUser.address = formData.address;
        localStorage.setItem("user", JSON.stringify(currentUser));
      }
      
      setSavedMessage("Profile updated successfully!");
      setTimeout(() => setSavedMessage(""), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setSavedMessage(error.message || "Error updating profile");
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageMessage("Please choose a valid image file.");
      return;
    }

    const maxSizeInBytes = 2 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setImageMessage("Image size must be less than 2MB.");
      return;
    }

    try {
      const result = await uploadProfileImage(file);
      setProfileImage(result.user.profileImage);
      setImageMessage("Profile picture updated.");
      
      // Update cached user
      const currentUser = getCurrentUser();
      if (currentUser) {
        currentUser.profileImage = result.user.profileImage;
        localStorage.setItem("user", JSON.stringify(currentUser));
      }
      
      setTimeout(() => setImageMessage(""), 3000);
    } catch (error) {
      console.error(error);
      setImageMessage("Failed to upload image");
    }
  };

  const handleRemoveImage = async () => {
    setProfileImage(defaultProfileImage);
    setImageMessage("Profile picture removed.");
    
    // Note: You'd need a backend endpoint to remove the image
    // For now, just update local state
    setTimeout(() => setImageMessage(""), 3000);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const displayUsername = formData.fullName
    ? `@${formData.fullName.replace(/\s+/g, "")}`
    : "@Username";

  if (loading) {
    return (
      <div className="purple-page" style={{ minHeight: "100vh" }}>
        <div style={{ textAlign: "center", paddingTop: "200px" }}>
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="purple-page" style={{ minHeight: "100vh" }}>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          paddingTop: "110px",
          paddingBottom: "40px",
          width: "100%",
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0 12px",  
        }}
      >
        <div style={{ marginBottom: "18px" }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              backdropFilter: "blur(10px)",
              borderRadius: "30px",
              padding: "14px 28px",
              fontFamily: "Josefin Sans, sans-serif",
              fontSize: "18px",
              color: "#2e3d4c",
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
            }}
          >
            ← Back
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "260px 1fr",
            minWidth: 0,
            gap: "22px",
            alignItems: "start",
          }}
        >
          {/* Left Sidebar - Profile Picture */}
          <div
            style={{
              background: "rgba(255,255,255,0.16)",
              backdropFilter: "blur(15px)",
              border: "1px solid rgba(255,255,255,0.35)",
              borderRadius: "28px",
              padding: "34px 20px 18px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              minHeight: "580px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "170px",
                  height: "170px",
                  margin: "0 auto 18px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  background: "rgba(255,255,255,0.25)",
                }}
              >
                <img
                  src={profileImage}
                  alt="Profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>

              <h2
                style={{
                  fontSize: "34px",
                  color: "#334155",
                  margin: "0 0 10px",
                  fontWeight: "600",
                  wordBreak: "break-word",
                }}
              >
                {displayUsername}
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#4b5563",
                  fontSize: "15px",
                  wordBreak: "break-word",
                }}
              >
                {formData.email}
              </p>
            </div>

            <div
              style={{
                marginTop: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />

              <button
                onClick={handleUploadClick}
                style={{
                  background: "rgba(255,255,255,0.18)",
                  border: "1px solid rgba(255,255,255,0.28)",
                  borderRadius: "14px",
                  padding: "10px 14px",
                  textAlign: "left",
                  fontFamily: "Josefin Sans, sans-serif",
                  color: "#5b6470",
                  cursor: "pointer",
                }}
              >
                ↻ Upload Profile Picture
              </button>

              <button
                onClick={handleRemoveImage}
                style={{
                  background: "rgba(255,255,255,0.18)",
                  border: "1px solid rgba(255,255,255,0.28)",
                  borderRadius: "14px",
                  padding: "10px 14px",
                  textAlign: "left",
                  fontFamily: "Josefin Sans, sans-serif",
                  color: "#5b6470",
                  cursor: "pointer",
                }}
              >
                ✕ Remove Profile Picture
              </button>

              {imageMessage && (
                <p
                  style={{
                    margin: "4px 0 0",
                    color: imageMessage.includes("updated") ? "#39a86f" : "#ff4d6d",
                    fontSize: "13px",
                  }}
                >
                  {imageMessage}
                </p>
              )}
            </div>
          </div>

          {/* Right Side - Profile Form */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "22px",
              minWidth: 0,
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.16)",
                backdropFilter: "blur(15px)",
                border: "1px solid rgba(255,255,255,0.35)",
                borderRadius: "28px",
                minWidth: 0,
                padding: "28px 32px 34px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              }}
            >
              <h1
                style={{
                  margin: "0 0 22px",
                  fontSize: "28px",
                  color: "#2e3d4c",
                  fontWeight: "700",
                }}
              >
                Profile Information
              </h1>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  minWidth: 0,
                  gap: "20px 28px",
                }}
              >
                {/* Full Name */}
                <div>
                  <label style={{ display: "block", marginBottom: "8px", color: "#444", fontSize: "15px" }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: "1px solid #b9b9b9",
                      outline: "none",
                      fontSize: "14px",
                      fontFamily: "Josefin Sans, sans-serif",
                      boxSizing: "border-box",
                      background: "white",
                    }}
                  />
                  {errors.fullName && (
                    <p style={{ color: "#ff5a45", fontSize: "12px", marginTop: "6px" }}>
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Email - Read Only */}
                <div>
                  <label style={{ display: "block", marginBottom: "8px", color: "#444", fontSize: "15px" }}>
                    Email
                  </label>
                  <div
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: "1px solid #e0e0e0",
                      backgroundColor: "#f5f5f5",
                      fontSize: "14px",
                      fontFamily: "Josefin Sans, sans-serif",
                      boxSizing: "border-box",
                      color: "#333",
                      cursor: "not-allowed",
                      wordBreak: "break-all",
                      overflowWrap: "break-word",
                    }}
                  >
                    {formData.email || "No email set"}
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label style={{ display: "block", marginBottom: "8px", color: "#444", fontSize: "15px" }}>
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: "1px solid #b9b9b9",
                      outline: "none",
                      fontSize: "14px",
                      fontFamily: "Josefin Sans, sans-serif",
                      boxSizing: "border-box",
                      background: "white",
                    }}
                  />
                  {errors.phone && (
                    <p style={{ color: "#ff5a45", fontSize: "12px", marginTop: "6px" }}>
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label style={{ display: "block", marginBottom: "8px", color: "#444", fontSize: "15px" }}>
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: "1px solid #b9b9b9",
                      outline: "none",
                      fontSize: "14px",
                      fontFamily: "Josefin Sans, sans-serif",
                      boxSizing: "border-box",
                      background: "white",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  marginTop: "26px",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  text="Save Changes"
                  variant="secondary"
                  onClick={handleSave}
                />

                {savedMessage && (
                  <span
                    style={{
                      color: savedMessage.includes("success") ? "#39a86f" : "#ff4d6d",
                      fontSize: "16px",
                      fontWeight: "600",
                    }}
                  >
                    {savedMessage}
                  </span>
                )}
              </div>
            </div>

            {/* Orders Section */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1.5fr 0.9fr",
                minWidth: 0,
                gap: "22px",
                alignItems: "stretch",
              }}
            >
              <div
                style={{
                  background: "rgba(255,255,255,0.16)",
                  backdropFilter: "blur(15px)",
                  minWidth: 0,
                  border: "1px solid rgba(255,255,255,0.35)",
                  borderRadius: "28px",
                  padding: "26px 32px 20px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                }}
              >
                <h2
                  style={{
                    margin: "0 0 18px",
                    fontSize: "26px",
                    color: "#2e3d4c",
                    fontWeight: "700",
                  }}
                >
                  Recent Orders
                </h2>

                <div
                  style={{
                    overflowX: "auto",
                    borderRadius: "16px",
                    background: "rgba(255,255,255,0.35)",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      minWidth: "620px",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          background: "rgba(255,255,255,0.55)",
                          color: "#4b5563",
                          textAlign: "left",
                        }}
                      >
                        <th style={{ padding: "14px 10px", fontSize: "14px" }}>Order ID</th>
                        <th style={{ padding: "14px 10px", fontSize: "14px" }}>Date</th>
                        <th style={{ padding: "14px 10px", fontSize: "14px" }}>Items</th>
                        <th style={{ padding: "14px 10px", fontSize: "14px" }}>Total</th>
                        <th style={{ padding: "14px 10px", fontSize: "14px" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length > 0 ? (
                        orders.slice(0, 3).map((order, index) => {
                          const itemNames = order.items && order.items.length > 0
                            ? order.items.map((item) => item.name).join(", ")
                            : "Unknown Item";

                          return (
                            <tr key={order._id || index} style={{ borderTop: "1px solid rgba(255,255,255,0.35)" }}>
                              <td style={{ padding: "18px 10px", color: "#374151" }}>
                                #{order._id?.slice(-8) || `ORD${1000 + index}`}
                              </td>
                              <td style={{ padding: "18px 10px", color: "#374151" }}>
                                {formatDate(order.createdAt)}
                              </td>
                              <td style={{ padding: "18px 10px", color: "#374151" }}>
                                {itemNames}
                              </td>
                              <td style={{ padding: "18px 10px", color: "#374151" }}>
                                {formatSAR(order.totalPrice)}
                              </td>
                              <td style={{ padding: "18px 10px" }}>
                                <span style={{
                                  background: "#b99af1",
                                  color: "#5b2fb2",
                                  padding: "6px 12px",
                                  borderRadius: "10px",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                }}>
                                  {order.status || "Pending"}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="5" style={{ padding: "24px 10px", textAlign: "center", color: "#4b5563" }}>
                            No orders found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div style={{ marginTop: "16px" }}>
                  <Button
                    text="View All Orders"
                    variant="secondary"
                    onClick={() => navigate("/order-history")}
                  />
                </div>
              </div>

              {/* Billing Card */}
              <div
                style={{
                  background: "rgba(255,255,255,0.16)",
                  backdropFilter: "blur(15px)",
                  border: "1px solid rgba(255,255,255,0.35)",
                  borderRadius: "28px",
                  padding: "26px 26px 20px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "16px",
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "26px",
                      color: "#2e3d4c",
                      fontWeight: "700",
                    }}
                  >
                    Billing Information
                  </h2>
                </div>

                <img
                  src={billingCard}
                  alt="Billing Card"
                  style={{
                    width: "100%",
                    borderRadius: "18px",
                    display: "block",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          @media (max-width: 1100px) {
            .profile-main-grid {
              grid-template-columns: 1fr !important;
            }
          }

          @media (max-width: 980px) {
            .profile-form-grid,
            .profile-bottom-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </div>
  );
}

export default Profile;