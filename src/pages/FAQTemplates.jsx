// frontend/src/pages/FAQTemplates.jsx
import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

function FAQTemplates() {
  const { themeData } = useTheme();
  const [faqs, setFaqs] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [form, setForm] = useState({ question: "", answer: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadFaqs();
  }, []);

  const loadFaqs = async () => {
    const res = await fetch("http://localhost:5000/api/faqs");
    const data = await res.json();
    setFaqs(data);
  };

  const handleAdd = async () => {
    if (!form.question || !form.answer) return;
    await fetch("http://localhost:5000/api/faqs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ question: "", answer: "" });
    loadFaqs();
    setMessage("✅ FAQ added!");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleEdit = async () => {
    if (!form.question || !form.answer) return;
    await fetch(`http://localhost:5000/api/faqs/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ question: "", answer: "" });
    setIsEditing(false);
    setEditId(null);
    loadFaqs();
    setMessage("✅ FAQ updated!");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this FAQ?")) {
      await fetch(`http://localhost:5000/api/faqs/${id}`, { method: "DELETE" });
      loadFaqs();
      setMessage("✅ FAQ deleted!");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const visibleFaqs = showAll ? faqs : faqs.slice(0, 5);

  return (
    <div style={{
      background: themeData.cardBg,
      borderRadius: "28px",
      padding: "24px",
    }}>
      <h1 style={{ margin: "0 0 24px", color: themeData.textColor }}>📋 FAQ Templates</h1>

      {message && (
        <div style={{
          background: message.includes("✅") ? "rgba(57,168,111,0.2)" : "rgba(255,77,109,0.2)",
          color: message.includes("✅") ? "#39a86f" : "#ff4d6d",
          padding: "12px",
          borderRadius: "12px",
          marginBottom: "20px",
          textAlign: "center",
        }}>
          {message}
        </div>
      )}

      {/* FAQ List */}
      <div style={{
        background: "rgba(255,255,255,0.08)",
        borderRadius: "20px",
        padding: "20px",
        marginBottom: "24px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ margin: 0, fontSize: "20px", color: themeData.textColor }}>FAQs</h2>
          <button onClick={() => {
            setIsEditing(false);
            setForm({ question: "", answer: "" });
          }} style={{
            background: themeData.primary,
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "8px 16px",
            cursor: "pointer",
          }}>+ Add FAQ</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {visibleFaqs.map(faq => (
            <div key={faq._id} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "12px",
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "bold", color: themeData.textColor }}>{faq.question}</div>
                <div style={{ fontSize: "13px", color: themeData.textLight, marginTop: "4px" }}>{faq.answer}</div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => {
                  setIsEditing(true);
                  setEditId(faq._id);
                  setForm({ question: faq.question, answer: faq.answer });
                }} style={{
                  background: themeData.primary,
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  padding: "6px 12px",
                  cursor: "pointer",
                }}>Edit</button>
                <button onClick={() => handleDelete(faq._id)} style={{
                  background: "#ff4d6d",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  padding: "6px 12px",
                  cursor: "pointer",
                }}>Delete</button>
              </div>
            </div>
          ))}
        </div>

        {faqs.length > 5 && (
          <button onClick={() => setShowAll(!showAll)} style={{
            marginTop: "16px",
            background: "transparent",
            border: "none",
            color: themeData.primary,
            cursor: "pointer",
            textAlign: "center",
            width: "100%",
          }}>
            {showAll ? "▲ Show Less" : "▼ Show More"}
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(form.question || form.answer || isEditing) && (
        <div style={{
          background: "rgba(255,255,255,0.08)",
          borderRadius: "20px",
          padding: "20px",
        }}>
          <h2 style={{ margin: "0 0 16px", fontSize: "20px", color: themeData.textColor }}>
            {isEditing ? "Edit FAQ" : "Add New FAQ"}
          </h2>
          <input
            type="text"
            placeholder="Question"
            value={form.question}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #ccc",
              marginBottom: "12px",
            }}
          />
          <textarea
            placeholder="Answer"
            value={form.answer}
            onChange={(e) => setForm({ ...form, answer: e.target.value })}
            rows={3}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #ccc",
              marginBottom: "12px",
              resize: "vertical",
            }}
          />
          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={isEditing ? handleEdit : handleAdd} style={{
              background: themeData.primary,
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "10px 20px",
              cursor: "pointer",
            }}>{isEditing ? "Save Changes" : "Add FAQ"}</button>
            <button onClick={() => {
              setIsEditing(false);
              setEditId(null);
              setForm({ question: "", answer: "" });
            }} style={{
              background: "#ccc",
              color: "#333",
              border: "none",
              borderRadius: "8px",
              padding: "10px 20px",
              cursor: "pointer",
            }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FAQTemplates;