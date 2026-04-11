import { useEffect, useState } from "react";
import API from "../services/api";
import {
  CheckCircle2,
  XCircle,
  Clock,
  User,
  MapPin,
  MessageSquare,
  Loader2,
  Inbox,
} from "lucide-react";

export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState([]);
  const [loadingId, setLoadingId] = useState(null); // Track which item is being processed

  const load = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await API.get("/suggestions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuggestions(res.data);
    } catch (err) {
      console.error("Failed to load suggestions", err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAction = async (id, action) => {
    setLoadingId(id);
    const token = localStorage.getItem("token");
    try {
      await API.put(
        `/suggestions/${id}/${action}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      await load();
    } catch (err) {
      alert(`Failed to ${action} suggestion`);
    } finally {
      setLoadingId(null);
    }
  };

  const styles = {
    container: {
      marginLeft: "260px", // To account for your sidebar
      padding: "40px",
      fontFamily: "'Inter', sans-serif",
      backgroundColor: "#f1f5f9",
      minHeight: "100vh",
    },
    header: {
      marginBottom: "30px",
    },
    title: {
      fontSize: "24px",
      fontWeight: "800",
      color: "#0e2f3d",
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    card: {
      background: "#fff",
      borderRadius: "16px",
      padding: "24px",
      marginBottom: "16px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      position: "relative",
    },
    metaSection: {
      display: "flex",
      gap: "20px",
      fontSize: "13px",
      color: "#64748b",
      borderBottom: "1px solid #f1f5f9",
      paddingBottom: "12px",
    },
    content: {
      fontSize: "15px",
      lineHeight: "1.6",
      color: "#334155",
      backgroundColor: "#f8fafc",
      padding: "16px",
      borderRadius: "8px",
      borderLeft: "4px solid #1a5f7a",
    },
    btnGroup: {
      display: "flex",
      gap: "12px",
      justifyContent: "flex-end",
    },
    approveBtn: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "8px 16px",
      borderRadius: "8px",
      border: "none",
      background: "#166534",
      color: "#fff",
      fontWeight: "600",
      cursor: "pointer",
      fontSize: "14px",
      transition: "opacity 0.2s",
    },
    rejectBtn: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "8px 16px",
      borderRadius: "8px",
      border: "1px solid #ef4444",
      background: "transparent",
      color: "#ef4444",
      fontWeight: "600",
      cursor: "pointer",
      fontSize: "14px",
      transition: "all 0.2s",
    },
    emptyState: {
      textAlign: "center",
      padding: "80px 20px",
      color: "#94a3b8",
    },
  };

  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <div style={styles.header}>
        <h1 style={styles.title}>
          <Inbox size={28} /> Moderation Queue
        </h1>
        <p style={{ color: "#64748b", marginTop: "4px" }}>
          Review and approve community-suggested edits for heritage sites.
        </p>
      </div>

      {suggestions.length === 0 ? (
        <div style={styles.emptyState}>
          <Clock size={48} style={{ marginBottom: "16px", opacity: 0.5 }} />
          <h3>All caught up!</h3>
          <p>No pending suggestions require your attention.</p>
        </div>
      ) : (
        <div style={{ maxWidth: "1000px" }}>
          {suggestions.map((s) => (
            <div key={s.id} style={styles.card}>
              <div style={styles.metaSection}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <MapPin size={14} /> <strong>{s.site?.name}</strong>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <User size={14} /> {s.user?.name}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginLeft: "auto",
                  }}
                >
                  <span
                    style={{
                      padding: "2px 8px",
                      background: "#fef9c3",
                      color: "#854d0e",
                      borderRadius: "12px",
                      fontWeight: "bold",
                      fontSize: "11px",
                    }}
                  >
                    PENDING REVIEW
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <MessageSquare
                  size={20}
                  style={{ color: "#cbd5e1", flexShrink: 0 }}
                />
                <div style={styles.content}>{s.content}</div>
              </div>

              <div style={styles.btnGroup}>
                <button
                  onClick={() => handleAction(s.id, "reject")}
                  style={styles.rejectBtn}
                  disabled={loadingId === s.id}
                >
                  <XCircle size={16} /> Reject
                </button>
                <button
                  onClick={() => handleAction(s.id, "approve")}
                  style={styles.approveBtn}
                  disabled={loadingId === s.id}
                >
                  {loadingId === s.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  Approve Change
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
