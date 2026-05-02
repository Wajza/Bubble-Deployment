// frontend/src/pages/SignIn.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup, saveUser, setAuthToken } from "../services/api";

const SignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "", email: "", password: "", confirmPassword: "", phone: "", address: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const isValidEmail = (email) => {
    const atIndex = email.indexOf('@');
    if (atIndex === -1) return false;
    const localPart = email.substring(0, atIndex);
    const domainPart = email.substring(atIndex + 1);
    return localPart.length > 0 && domainPart.length > 0 && domainPart.includes('.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    if (!isValidEmail(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const { confirmPassword, ...userData } = formData;
      const data = await signup(userData);
      setAuthToken(data.token);
      saveUser(data.user);
      
      if (data.user.role === "admin") {
        navigate("/admin-dashboard");
      } else if (data.user.role === "customer-service") {
        navigate("/customer-service/tickets");
      } else {
        navigate("/home");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account ✨</h2>
        <p>Join us to start shopping!</p>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label htmlFor="fullName">Full Name *</label>
            <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="Enter your full name" />
          </div>
          
          <div className="auth-form-group">
            <label htmlFor="email">Email Address *</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Enter your email" />
          </div>
          
          <div className="auth-form-group">
            <label htmlFor="password">Password *</label>
            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Create a password (min 6 characters)" />
          </div>
          
          <div className="auth-form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required placeholder="Confirm your password" />
          </div>
          
          <div className="auth-form-group">
            <label htmlFor="phone">Phone Number</label>
            <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter your phone number" />
          </div>
          
          <div className="auth-form-group">
            <label htmlFor="address">Address</label>
            <textarea id="address" name="address" value={formData.address} onChange={handleChange} placeholder="Enter your address" rows="3" />
          </div>
          
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
        
        <p className="auth-link">
          Already have an account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;