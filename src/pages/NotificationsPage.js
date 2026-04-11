import { useEffect, useState } from "react";
import API from "../services/api";
import {
  Bell,
  BellOff,
  Info,
  AlertTriangle,
  Calendar,
  ChevronRight,
  Circle,
} from "lucide-react";

export default function NotificationsPage() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    API.get("/notifications", {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => setNotes(res.data));
  }, []);

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
    list: {
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      maxWidth: "800px",
    },
    notificationCard: (isUrgent) => ({
      display: "flex",
      alignItems: "center",
      gap: "16px",
      padding: "20px",
      background: "#fff",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
      borderLeft: isUrgent ? "4px solid #ef4444" : "4px solid #1a5f7a",
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      transition: "transform 0.1s ease",
      cursor: "pointer",
    }),
    iconBox: (isUrgent) => ({
      padding: "10px",
      borderRadius: "10px",
      background: isUrgent ? "#fee2e2" : "#f1f5f9",
      color: isUrgent ? "#ef4444" : "#1a5f7a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }),
    emptyState: {
      textAlign: "center",
      padding: "100px 20px",
      color: "#94a3b8",
    },
  };

  // Helper to check if the message is a disaster alert
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

  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
        .notif-card:hover {
          transform: translateX(4px);
          border-color: #cbd5e1;
        }
      `}</style>

      <div style={styles.header}>
        <h1 style={styles.title}>
          <Bell size={32} /> Notifications
        </h1>
        {notes.length > 0 && (
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
            {notes.length} New Updates
          </span>
        )}
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
          <h3 style={{ color: "#475569" }}>No updates yet</h3>
          <p>We'll notify you when there's activity on your heritage sites.</p>
        </div>
      ) : (
        <div style={styles.list}>
          {notes.map((n) => {
            const isUrgent = checkUrgency(n.message);
            return (
              <div
                key={n.id}
                style={styles.notificationCard(isUrgent)}
                className="notif-card"
              >
                <div style={styles.iconBox(isUrgent)}>
                  {isUrgent ? <AlertTriangle size={24} /> : <Info size={24} />}
                </div>

                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "15px",
                      color: "#1e293b",
                      lineHeight: "1.4",
                      fontWeight: isUrgent ? "600" : "400",
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
                    <span>Just now</span>{" "}
                    {/* Assuming date logic comes from n.createdAt later */}
                  </div>
                </div>

                <ChevronRight size={18} style={{ color: "#cbd5e1" }} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
