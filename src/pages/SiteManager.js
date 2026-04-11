import { useState } from "react";
import API from "../services/api";

export default function SiteRatingForm({ site, onUpdate }) {
  const [rating, setRating] = useState(site.officialRating || null);
  const [loading, setLoading] = useState(false);

  const levels = [
    { score: 1, label: "High Risk", color: "#ef4444" },
    { score: 2, label: "At Risk", color: "#f97316" },
    { score: 3, label: "Stable", color: "#eab308" },
    { score: 4, label: "Good", color: "#22c55e" },
    { score: 5, label: "Safe", color: "#065f46" },
  ];

  const handleSave = async () => {
    setLoading(true);
    try {
      await API.patch(`/sites/${site.id}/rate`, { rating });
      onUpdate(); // Refresh the list
      alert("Official Rating Updated!");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "#f8fafc",
        padding: "20px",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
      }}
    >
      <h4 style={{ margin: "0 0 15px 0", color: "#0e2f3d" }}>
        Official Safety Assessment
      </h4>
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {levels.map((l) => (
          <button
            key={l.score}
            onClick={() => setRating(l.score)}
            style={{
              flex: 1,
              padding: "12px 4px",
              borderRadius: "8px",
              border:
                rating === l.score
                  ? `2px solid ${l.color}`
                  : "1px solid #cbd5e1",
              background: rating === l.score ? `${l.color}15` : "#fff",
              cursor: "pointer",
              transition: "0.2s",
            }}
          >
            <div
              style={{ fontWeight: "bold", color: l.color, fontSize: "16px" }}
            >
              {l.score}
            </div>
            <div style={{ fontSize: "10px", color: "#64748b" }}>{l.label}</div>
          </button>
        ))}
      </div>
      <button
        onClick={handleSave}
        disabled={loading}
        style={{
          width: "100%",
          padding: "12px",
          background: "#1a5f7a",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          fontWeight: "600",
          cursor: "pointer",
        }}
      >
        {loading ? "Updating..." : "Save Official Rating"}
      </button>
    </div>
  );
}
