import { Clock, History, AlertCircle } from "lucide-react";

export default function Timeline({ reports = [] }) {
  if (!reports.length) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "40px 20px",
          background: "#f8fafc",
          borderRadius: "12px",
          border: "1px dashed #cbd5e1",
          color: "#94a3b8",
        }}
      >
        <History size={32} style={{ marginBottom: "8px", opacity: 0.5 }} />
        <p style={{ margin: 0, fontSize: "14px" }}>
          No historical events recorded yet.
        </p>
      </div>
    );
  }

  // Sort newest → oldest
  const sorted = [...reports].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  const getTheme = (category) => {
    switch (category) {
      case "FLOOD":
        return { icon: "💧", color: "#3b82f6", bg: "#dbeafe" };
      case "TYPHOON":
        return { icon: "🌪️", color: "#64748b", bg: "#f1f5f9" };
      case "EARTHQUAKE":
        return { icon: "🌎", color: "#92400e", bg: "#fef3c7" };
      case "STORM_SURGE":
        return { icon: "🌊", color: "#0891b2", bg: "#cffafe" };
      case "LANDSLIDE":
        return { icon: "⛰️", color: "#166534", bg: "#dcfce7" };
      case "FIRE":
        return { icon: "🔥", color: "#ef4444", bg: "#fee2e2" };
      default:
        return { icon: "📝", color: "#1e293b", bg: "#f1f5f9" };
    }
  };

  const styles = {
    container: {
      marginTop: "24px",
      fontFamily: "'Inter', sans-serif",
    },
    title: {
      fontSize: "16px",
      fontWeight: "700",
      color: "#0e2f3d",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "20px",
    },
    track: {
      position: "relative",
      paddingLeft: "32px",
      borderLeft: "2px solid #e2e8f0",
      marginLeft: "12px",
    },
    item: {
      marginBottom: "28px",
      position: "relative",
    },
    dot: (bg) => ({
      position: "absolute",
      left: "-41px",
      top: "2px",
      width: "16px",
      height: "16px",
      borderRadius: "50%",
      background: "#fff",
      border: `3px solid ${bg}`,
      zIndex: 2,
    }),
    badge: (theme) => ({
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "4px 10px",
      borderRadius: "6px",
      background: theme.bg,
      color: theme.color,
      fontSize: "12px",
      fontWeight: "700",
      marginBottom: "6px",
    }),
  };

  return (
    <div style={styles.container}>
      <h4 style={styles.title}>
        <History size={18} /> Site Timeline
      </h4>

      <div style={styles.track}>
        {sorted.map((report) => {
          const theme = getTheme(report.category);
          return (
            <div key={report.id} style={styles.item}>
              {/* Timeline Connector Dot */}
              <div style={styles.dot(theme.color)} />

              <div style={styles.badge(theme)}>
                <span>{theme.icon}</span>
                {report.category}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  color: "#94a3b8",
                  marginBottom: "8px",
                }}
              >
                <Clock size={12} />
                {new Date(report.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>

              <div
                style={{
                  fontSize: "14px",
                  color: "#475569",
                  lineHeight: "1.5",
                  background: "#fff",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #f1f5f9",
                }}
              >
                {report.details}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
