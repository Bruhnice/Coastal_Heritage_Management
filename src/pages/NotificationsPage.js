import { useEffect, useState } from "react";
import API from "../services/api";
import {
  Bell,
  BellOff,
  Info,
  AlertTriangle,
  Calendar,
  Circle,
  FileText,
  CheckCircle,
  Trash2, // Added for Clear All icon
} from "lucide-react";

export default function NotificationsPage({ user }) {
  // 🔥 Receive user prop
  const [notes, setNotes] = useState([]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(res.data);
    } catch (err) {
      console.error("Failed to load notifications");
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await API.delete(`/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(notes.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Failed to clear notification");
    }
  };

  // 🔥 New: Clear All Notifications
  const clearAll = async () => {
    if (!window.confirm("Are you sure you want to clear all notifications?"))
      return;
    try {
      const token = localStorage.getItem("token");
      await API.delete("/notifications/clear-all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes([]);
    } catch (err) {
      console.error("Failed to clear all notifications");
    }
  };

  // 🔥 Restriction: If not a reporter, show an unauthorized state
  if (user?.role !== "REPORTER") {
    return (
      <div
        style={{
          marginLeft: "260px",
          padding: "400px 40px",
          textAlign: "center",
          color: "#64748b",
        }}
      >
        <BellOff size={48} style={{ opacity: 0.3, marginBottom: "10px" }} />
        <h3>Access Restricted</h3>
        <p>Only Reporters can view and manage incident notifications.</p>
      </div>
    );
  }

  const styles = {
    container: {
      marginLeft: "260px",
      padding: "40px",
      fontFamily: "'Inter', sans-serif",
      backgroundColor: "#f8fafc",
      minHeight: "100vh",
    },
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "32px",
    },
    title: {
      fontSize: "28px",
      fontWeight: "800",
      color: "#0e2f3d",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      margin: 0,
    },
    clearAllBtn: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "10px 16px",
      borderRadius: "8px",
      backgroundColor: "#fee2e2",
      color: "#ef4444",
      border: "none",
      fontWeight: "600",
      fontSize: "14px",
      cursor: "pointer",
      transition: "0.2s",
    },
    list: {
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      maxWidth: "800px",
    },
    notificationCard: (isUrgent, isReport) => ({
      display: "flex",
      alignItems: "center",
      gap: "16px",
      padding: "20px",
      background: "#fff",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
      borderLeft: isUrgent
        ? "4px solid #ef4444"
        : isReport
          ? "4px solid #f59e0b"
          : "4px solid #1a5f7a",
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      transition: "transform 0.1s ease",
      cursor: "pointer",
    }),
    iconBox: (isUrgent, isReport) => ({
      padding: "10px",
      borderRadius: "10px",
      background: isUrgent ? "#fee2e2" : isReport ? "#fef3c7" : "#f1f5f9",
      color: isUrgent ? "#ef4444" : isReport ? "#d97706" : "#1a5f7a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }),
    emptyState: {
      textAlign: "center",
      padding: "100px 20px",
      color: "#94a3b8",
    },
    clearBtn: {
      background: "none",
      border: "none",
      color: "#94a3b8",
      cursor: "pointer",
      padding: "8px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "0.2s",
    },
  };

  const checkUrgency = (msg) => {
    const keywords = [
      "flood",
      "fire",
      "earthquake",
      "typhoon",
      "surge",
      "landslide",
    ];
    return keywords.some((word) => msg.toLowerCase().includes(word));
  };

  const checkIsReport = (msg) => {
    return (
      msg.toLowerCase().includes("report") ||
      msg.toLowerCase().includes("incident")
    );
  };

  return (
    <div style={styles.container}>
      <style>{`
        .notif-card:hover { transform: translateX(4px); border-color: #cbd5e1; }
        .clear-btn:hover { background: #fee2e2 !important; color: #ef4444 !important; }
        .clear-all-btn:hover { background: #fecaca !important; }
      `}</style>

      <div style={styles.header}>
        <h1 style={styles.title}>
          <Bell size={32} /> Notifications
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {notes.length > 0 && (
            <>
              <button
                onClick={clearAll}
                style={styles.clearAllBtn}
                className="clear-all-btn"
              >
                <Trash2 size={16} /> Clear All
              </button>
              <span
                style={{
                  fontSize: "13px",
                  color: "#64748b",
                  fontWeight: "600",
                  background: "#e2e8f0",
                  padding: "4px 12px",
                  borderRadius: "20px",
                }}
              >
                {notes.length} Active
              </span>
            </>
          )}
        </div>
      </div>

      {notes.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ position: "relative", display: "inline-block" }}>
            <BellOff size={64} style={{ marginBottom: "16px", opacity: 0.2 }} />
            <Circle
              size={12}
              fill="#94a3b8"
              style={{ position: "absolute", top: 5, right: 5 }}
            />
          </div>
          <h3 style={{ color: "#475569" }}>All clear!</h3>
          <p>No new incident reports or site updates at the moment.</p>
        </div>
      ) : (
        <div style={styles.list}>
          {notes.map((n) => {
            const isUrgent = checkUrgency(n.message);
            const isReport = checkIsReport(n.message);
            return (
              <div
                key={n.id}
                style={styles.notificationCard(isUrgent, isReport)}
                className="notif-card"
              >
                <div style={styles.iconBox(isUrgent, isReport)}>
                  {isUrgent ? (
                    <AlertTriangle size={24} />
                  ) : isReport ? (
                    <FileText size={24} />
                  ) : (
                    <Info size={24} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "15px",
                      color: "#1e293b",
                      lineHeight: "1.4",
                      fontWeight: isUrgent || isReport ? "600" : "400",
                    }}
                  >
                    {n.message}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      marginTop: "6px",
                      color: "#94a3b8",
                      fontSize: "12px",
                    }}
                  >
                    <Calendar size={12} />
                    <span>
                      {n.createdAt
                        ? new Date(n.createdAt).toLocaleString()
                        : "Recently"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => markAsRead(n.id)}
                  style={styles.clearBtn}
                  className="clear-btn"
                  title="Mark as Read"
                >
                  <CheckCircle size={18} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
