import { useEffect, useState } from "react";

export default function App() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newComment, setNewComment] = useState({});

  const API_URL = "https://gobasera-backend-1.onrender.com";

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  async function fetchAnnouncements() {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch announcements");
      const data = await res.json();
      setAnnouncements(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      if (!res.ok) throw new Error("Failed to create announcement");
      const newItem = await res.json();
      setAnnouncements((prev) => [newItem, ...prev]);
      setTitle("");
      setDescription("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function updateStatus(id, status) {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      const updated = await res.json();
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === id ? updated : a))
      );
    } catch (err) {
      setError(err.message);
    }
  }

  const handleCommentChange = (id, value) => {
    setNewComment((prev) => ({ ...prev, [id]: value }));
  };

  const handleAddComment = (id) => {
    if (!newComment[id]) return;
    setAnnouncements((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, comments: [...(item.comments || []), newComment[id]] }
          : item
      )
    );
    setNewComment((prev) => ({ ...prev, [id]: "" }));
  };

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}> Announcements</h1>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "1.5rem",
        }}
      >
        <span
          style={{
            fontSize: "1.1rem",
            fontWeight: "600",
            color: "#444",
          }}
        >
          GoBasera
        </span>
      </div>
      <hr style={{ border: "0.5px solid #eee", marginBottom: "1.5rem" }} />
      <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
        <div>
          <input
            type="text"
            placeholder="Title (required)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: "70%",
              padding: "0.7rem",
              marginBottom: "0.7rem",
              border: "1px solid #ccc",
              borderRadius: "6px",
              fontSize: "1rem",
              outline: "none",
              transition: "all 0.2s ease-in-out",
            }}
          />
        </div>
        <div>
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              width: "70%",
              padding: "0.7rem",
              marginBottom: "0.7rem",
              border: "1px solid #ccc",
              borderRadius: "6px",
              fontSize: "1rem",
              outline: "none",
              transition: "all 0.2s ease-in-out",
            }}
          />
        </div>
        <button
          type="submit"
          disabled={!title}
          style={{
            padding: "0.5rem 1rem",
            background: title ? "#007bff" : "#ccc",
            color: "white",
            border: "none",
            cursor: title ? "pointer" : "not-allowed",
          }}
        >
          Add Announcement
        </button>
      </form>
      {error && <p style={{ color: "red" }}>⚠ {error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : announcements.length === 0 ? (
        <p>No announcements yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {announcements.map((a) => (
            <li
              key={a.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "0.5rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3 style={{ margin: 0 }}>
                  {a.title}{" "}
                  <span
                    style={{
                      fontSize: "0.9rem",
                      color: a.status === "active" ? "green" : "gray",
                    }}
                  >
                    ({a.status})
                  </span>
                </h3>
                <small
                  style={{
                    color: "#666",
                    fontSize: "0.8rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  {new Date(a.createdAt).toLocaleString()}
                </small>
              </div>
              {a.description && <p>{a.description}</p>}
              {a.status === "closed" && a.closedAt && (
                <p
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.7rem",
                    color: "#d9534f",
                    marginTop: "0.5rem",
                  }}
                >
                  <strong>Closed at:</strong>{" "}
                  {new Date(a.closedAt).toLocaleString()}
                </p>
              )}
              {a.status === "active" && (
                <button
                  onClick={() => updateStatus(a.id, "closed")}
                  style={{
                    padding: "0.3rem 0.6rem",
                    background: "tomato",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginTop: "0.5rem",
                  }}
                >
                  Close
                </button>
              )}
              <div style={{ marginTop: "0.5rem" }}>
                <button
                  style={{ color: "blue", marginRight: "8px" }}
                  onClick={() =>
                    setAnnouncements((prev) =>
                      prev.map((item) =>
                        item.id === a.id
                          ? { ...item, like: (item.like || 0) + 1 }
                          : item
                      )
                    )
                  }
                >
                  Like {a.like || 0}
                </button>
                <button
                  style={{ color: "blue", marginRight: "8px" }}
                  onClick={() =>
                    setAnnouncements((prev) =>
                      prev.map((item) =>
                        item.id === a.id
                          ? { ...item, dislike: (item.dislike || 0) + 1 }
                          : item
                      )
                    )
                  }
                >
                  Dislike {a.dislike || 0}
                </button>
                <span style={{ fontSize: "0.9rem", color: "#555" }}>
                  {a.comments?.length || 0} Comments
                </span>
              </div>
              <div style={{ marginTop: "0.5rem" }}>
                <input
                  type="text"
                  value={newComment[a.id] || ""}
                  onChange={(e) => handleCommentChange(a.id, e.target.value)}
                  placeholder="Add a comment"
                  style={{ marginRight: "8px", padding: "4px" }}
                />
                <button
                  style={{ color: "blue" }}
                  onClick={() => handleAddComment(a.id)}
                >
                  Post
                </button>
                <div style={{ marginTop: "6px" }}>
                  {(a.comments || []).map((c, i) => (
                    <p key={i} style={{ margin: "4px 0" }}>
                      • {c}
                    </p>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
    
  );
}
