import { useState } from "react";
import API from "../services/api";
import {
  Save,
  Send,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  History,
  FileEdit,
} from "lucide-react";

export default function SiteDetails({ site, user, reload }) {
  const [editText, setEditText] = useState(site.description || "");
  const [suggestion, setSuggestion] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reportCategory, setReportCategory] = useState("FLOOD");

  // Feedback states
  const [loadingAction, setLoadingAction] = useState(null); // 'edit', 'suggestion', 'report'
  const [successAction, setSuccessAction] = useState(null);

  const token = localStorage.getItem("token");

  const triggerSuccess = (type) => {
    setSuccessAction(type);
    setTimeout(() => setSuccessAction(null), 3000);
  };

  const saveEdit = async () => {
    setLoadingAction("edit");
    try {
      await API.put(
        `/heritage/${site.id}`,
        { description: editText },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      triggerSuccess("edit");
      reload();
    } catch (err) {
      alert("Error updating site");
    } finally {
      setLoadingAction(null);
    }
  };

  const submitSuggestion = async () => {
    if (!suggestion.trim()) return alert("Please write a suggestion");
    setLoadingAction("suggestion");
    try {
      await API.post(
        "/suggestions",
        { siteId: site.id, content: suggestion },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setSuggestion("");
      triggerSuccess("suggestion");
    } catch (err) {
      alert("Error submitting suggestion");
    } finally {
      setLoadingAction(null);
    }
  };

  const submitReport = async () => {
    if (!reportDetails.trim()) return alert("Please enter report details");
    setLoadingAction("report");
    try {
      await API.post(
        "/reports",
        {
          heritageSiteId: site.id,
          category: reportCategory,
          details: reportDetails,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setReportDetails("");
      triggerSuccess("report");
    } catch (err) {
      alert("Error submitting report");
    } finally {
      setLoadingAction(null);
    }
  };

  const styles = {
    page: {
      padding: "40px",
      fontFamily: "'Inter', sans-serif",
      color: "#1e293b",
      maxWidth: "900px",
      margin: "0 auto",
    },
    card: {
      background: "#fff",
      padding: "24px",
      borderRadius: "16px",
      border: "1px solid #e2e8f0",
      marginBottom: "24px",
    },
    input: {
      width: "100%",
      padding: "12px",
      borderRadius: "8px",
      border: "1px solid #cbd5e1",
      fontSize: "14px",
      fontFamily: "inherit",
      outline: "none",
      marginTop: "8px",
    },
    btn: (variant, active) => ({
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "10px 20px",
      borderRadius: "8px",
      border: "none",
      fontWeight: "600",
      fontSize: "14px",
      cursor: "pointer",
      marginTop: "12px",
      transition: "all 0.2s",
      background: active
        ? "#dcfce7"
        : variant === "primary"
          ? "#1a5f7a"
          : "#0e2f3d",
      color: active ? "#166534" : "#fff",
    }),
  };

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <h1
        style={{
          fontSize: "32px",
          fontWeight: "800",
          color: "#0e2f3d",
          marginBottom: "20px",
        }}
      >
        {site.name}
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "400px 1fr",
          gap: "30px",
          marginBottom: "40px",
        }}
      >
        <img
          src={
            site.imageUrl ||
            "https://via.placeholder.com/400x300?text=No+Image+Available"
          }
          alt={site.name}
          style={{
            width: "100%",
            height: "300px",
            objectFit: "cover",
            borderRadius: "16px",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          }}
        />
        <div>
          <h3
            style={{
              fontSize: "14px",
              textTransform: "uppercase",
              color: "#64748b",
              letterSpacing: "1px",
              marginBottom: "8px",
            }}
          >
            Historical Context
          </h3>
          <p style={{ lineHeight: "1.6", color: "#475569", fontSize: "16px" }}>
            {site.description || "No description available for this site."}
          </p>
        </div>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}
      >
        {/* ADMIN EDIT */}
        {user?.role === "ADMIN" && (
          <div style={styles.card}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#1a5f7a",
              }}
            >
              <FileEdit size={20} />
              <h3 style={{ margin: 0 }}>Update Details</h3>
            </div>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              style={{ ...styles.input, height: "120px" }}
            />
            <button
              onClick={saveEdit}
              style={styles.btn("primary", successAction === "edit")}
            >
              {loadingAction === "edit" ? (
                <Loader2 size={18} className="animate-spin" />
              ) : successAction === "edit" ? (
                <CheckCircle2 size={18} />
              ) : (
                <Save size={18} />
              )}
              {successAction === "edit" ? "Changes Saved" : "Save Changes"}
            </button>
          </div>
        )}

        {/* VIEWER SUGGESTION */}
        {user?.role === "VIEWER" && (
          <div style={styles.card}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#0e2f3d",
              }}
            >
              <History size={20} />
              <h3 style={{ margin: 0 }}>Suggest a Correction</h3>
            </div>
            <textarea
              placeholder="Notice something incorrect? Provide the improved description here..."
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              style={{ ...styles.input, height: "120px" }}
            />
            <button
              onClick={submitSuggestion}
              style={styles.btn("secondary", successAction === "suggestion")}
            >
              {loadingAction === "suggestion" ? (
                <Loader2 size={18} className="animate-spin" />
              ) : successAction === "suggestion" ? (
                <CheckCircle2 size={18} />
              ) : (
                <Send size={18} />
              )}
              {successAction === "suggestion"
                ? "Submitted"
                : "Submit Suggestion"}
            </button>
          </div>
        )}

        {/* DISASTER REPORTING */}
        {(user?.role === "REPORTER" || user?.role === "ADMIN") && (
          <div
            style={{
              ...styles.card,
              gridColumn: user?.role === "ADMIN" ? "span 1" : "span 2",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#ef4444",
              }}
            >
              <AlertTriangle size={20} />
              <h3 style={{ margin: 0 }}>Disaster Report</h3>
            </div>
            <select
              value={reportCategory}
              onChange={(e) => setReportCategory(e.target.value)}
              style={styles.input}
            >
              <option value="FLOOD">💧 Flood</option>
              <option value="TYPHOON">🌪️ Typhoon</option>
              <option value="EARTHQUAKE">🌎 Earthquake</option>
              <option value="STORM_SURGE">🌊 Storm Surge</option>
              <option value="LANDSLIDE">⛰️ Landslide</option>
              <option value="FIRE">🔥 Fire</option>
              <option value="OTHER">📝 Other</option>
            </select>
            <textarea
              placeholder="Describe the current status or damages..."
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              style={{ ...styles.input, height: "80px" }}
            />
            <button
              onClick={submitReport}
              style={styles.btn("secondary", successAction === "report")}
            >
              {loadingAction === "report" ? (
                <Loader2 size={18} className="animate-spin" />
              ) : successAction === "report" ? (
                <CheckCircle2 size={18} />
              ) : (
                <Send size={18} />
              )}
              {successAction === "report" ? "Report Sent" : "Submit Report"}
            </button>
          </div>
        )}
      </div>

      {/* REPORTS DISPLAY */}
      <div style={{ marginTop: "40px" }}>
        <h2
          style={{
            fontSize: "20px",
            fontWeight: "800",
            color: "#0e2f3d",
            marginBottom: "20px",
            borderBottom: "2px solid #e2e8f0",
            paddingBottom: "10px",
          }}
        >
          Approved Incident Reports
        </h2>

        {site.reports && site.reports.length > 0 ? (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {site.reports.map((r) => (
              <div
                key={r.id}
                style={{
                  ...styles.card,
                  padding: "16px",
                  marginBottom: 0,
                  display: "flex",
                  gap: "16px",
                  alignItems: "start",
                }}
              >
                <div
                  style={{
                    padding: "8px",
                    background: "#fee2e2",
                    borderRadius: "8px",
                    color: "#ef4444",
                  }}
                >
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <strong style={{ fontSize: "14px", color: "#0e2f3d" }}>
                    {r.category}
                  </strong>
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      fontSize: "14px",
                      color: "#64748b",
                      lineHeight: "1.5",
                    }}
                  >
                    {r.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              background: "#f8fafc",
              borderRadius: "16px",
              border: "1px dashed #cbd5e1",
              color: "#94a3b8",
            }}
          >
            No approved reports recorded for this site.
          </div>
        )}
      </div>
    </div>
  );
}
