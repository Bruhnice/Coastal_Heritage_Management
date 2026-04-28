import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import API from "../services/api";
import "leaflet/dist/leaflet.css";

// Lucide Icons
import {
  PlusCircle,
  Trash2,
  Upload,
  FileText,
  Save,
  X,
  Droplets,
  Wind,
  Globe,
  Waves,
  Mountain,
  Flame,
  ShieldCheck,
  Edit3,
} from "lucide-react";

// Marker Setup
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const categoryOptions = [
  { value: "FLOOD", label: "Flood", icon: <Droplets size={14} /> },
  { value: "TYPHOON", label: "Typhoon", icon: <Wind size={14} /> },
  { value: "EARTHQUAKE", label: "Earthquake", icon: <Globe size={14} /> },
  { value: "STORM_SURGE", label: "Storm Surge", icon: <Waves size={14} /> },
  { value: "LANDSLIDE", label: "Landslide", icon: <Mountain size={14} /> },
  { value: "FIRE", label: "Fire", icon: <Flame size={14} /> },
  { value: "OTHER", label: "Other", icon: <FileText size={14} /> },
];

const safetyLevels = [
  { score: 1, label: "High Risk", color: "#ef4444" },
  { score: 2, label: "At Risk", color: "#f97316" },
  { score: 3, label: "Stable", color: "#eab308" },
  { score: 4, label: "Good", color: "#22c55e" },
  { score: 5, label: "Safe", color: "#065f46" },
];

function MapClickHandler({ setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return null;
}

export default function MapManager() {
  const [sites, setSites] = useState([]);
  const [position, setPosition] = useState(null);
  const [name, setName] = useState("");
  const [history, setHistory] = useState("");
  const [selectedSite, setSelectedSite] = useState(null);
  const [reportCategory, setReportCategory] = useState("FLOOD");
  const [reportDetails, setReportDetails] = useState("");

  const [siteReports, setSiteReports] = useState([]);
  const [editingReportId, setEditingReportId] = useState(null);
  const [isAssessing, setIsAssessing] = useState(false);
  const [tempRating, setTempRating] = useState(null);

  const loadSites = async () => {
    try {
      const res = await API.get("/heritage");
      setSites(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadReports = async (siteId) => {
    try {
      const token = localStorage.getItem("token");
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};
      const res = await API.get(`/reports/site/${siteId}`, config);
      setSiteReports(res.data);
    } catch (err) {
      console.error("Error loading reports:", err);
    }
  };

  useEffect(() => {
    loadSites();
  }, []);

  useEffect(() => {
    if (selectedSite) {
      loadReports(selectedSite.id);
    }
  }, [selectedSite]);

  const createSite = async () => {
    const token = localStorage.getItem("token");
    if (!position || !name.trim())
      return alert("Mark a location and enter a name.");
    try {
      const locRes = await API.post(
        "/locations",
        {
          name: `Loc-${name}`,
          latitude: position.lat,
          longitude: position.lng,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      await API.post(
        "/heritage",
        {
          name,
          description: history,
          status: "Active",
          locationId: locRes.data.id,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setName("");
      setHistory("");
      setPosition(null);
      loadSites();
    } catch (err) {
      alert("Error creating site");
    }
  };

  const handleReportSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!reportDetails.trim()) return alert("Please enter details.");

    try {
      if (editingReportId) {
        await API.put(
          `/reports/${editingReportId}`,
          { category: reportCategory, details: reportDetails },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } else {
        await API.post(
          "/reports",
          {
            heritageSiteId: selectedSite.id,
            category: reportCategory,
            details: reportDetails,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }

      setReportDetails("");
      setEditingReportId(null);
      loadReports(selectedSite.id);
    } catch (err) {
      alert("Failed to process report.");
    }
  };

  // Fixed Delete Logic
  const deleteReport = async (reportId) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    const token = localStorage.getItem("token");

    try {
      await API.delete(`/reports/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Immediately refresh the list for the current site
      loadReports(selectedSite.id);
    } catch (err) {
      console.error(err);
      alert(
        "Delete failed. You may not have permission to delete this report.",
      );
    }
  };

  const handleOfficialRating = async () => {
    if (!tempRating) return alert("Select a rating score.");
    const token = localStorage.getItem("token");
    try {
      await API.patch(
        `/heritage/${selectedSite.id}/rate`,
        { rating: tempRating },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setIsAssessing(false);
      setSelectedSite(null);
      loadSites();
    } catch (err) {
      alert("Failed to update official rating.");
    }
  };

  const styles = {
    container: {
      marginLeft: "260px",
      display: "flex",
      height: "100vh",
      backgroundColor: "#f1f5f9",
    },
    sidebar: {
      width: "350px",
      background: "#fff",
      borderRight: "1px solid #e2e8f0",
      padding: "24px",
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
      gap: "20px",
    },
    mapArea: { flex: 1, position: "relative" },
    input: {
      width: "100%",
      padding: "10px",
      borderRadius: "8px",
      border: "1px solid #cbd5e1",
      fontSize: "14px",
      outline: "none",
    },
    button: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      padding: "10px",
      borderRadius: "8px",
      border: "none",
      fontWeight: "600",
      cursor: "pointer",
    },
    primaryBtn: { background: "#1a5f7a", color: "#fff" },
    reportCard: {
      padding: "12px",
      borderRadius: "8px",
      background: "#f8fafc",
      border: "1px solid #e2e8f0",
      marginTop: "10px",
      position: "relative",
    },
    ratingBadge: (score) => ({
      padding: "4px 8px",
      borderRadius: "4px",
      fontSize: "10px",
      fontWeight: "800",
      background: `${safetyLevels.find((l) => l.score === score)?.color}15`,
      color: safetyLevels.find((l) => l.score === score)?.color,
      border: `1px solid ${safetyLevels.find((l) => l.score === score)?.color}`,
    }),
  };

  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
        .leaflet-popup-content-wrapper { font-family: 'Inter', sans-serif !important; border-radius: 12px !important; }
        .report-card-action:hover { opacity: 0.7; }
      `}</style>

      <div style={styles.sidebar}>
        {!selectedSite && (
          <div>
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "800",
                color: "#0e2f3d",
                marginBottom: "4px",
              }}
            >
              Manage Registry
            </h2>
            <p
              style={{
                fontSize: "12px",
                color: "#64748b",
                marginBottom: "20px",
              }}
            >
              Mark a location on the map to add a site.
            </p>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <input
                style={styles.input}
                placeholder="Site Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <textarea
                style={{ ...styles.input, height: "80px", resize: "none" }}
                placeholder="Historical Description"
                value={history}
                onChange={(e) => setHistory(e.target.value)}
              />
              <button
                onClick={createSite}
                style={{
                  ...styles.button,
                  ...styles.primaryBtn,
                  opacity: position ? 1 : 0.5,
                }}
              >
                <PlusCircle size={18} /> Register New Site
              </button>
            </div>
          </div>
        )}

        {selectedSite && (
          <div style={{ borderTop: "2px solid #f1f5f9", paddingTop: "10px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <h3 style={{ fontSize: "15px", margin: 0, fontWeight: "800" }}>
                {isAssessing
                  ? "Official Assessment"
                  : editingReportId
                    ? "Edit Report"
                    : "Incident Report"}
              </h3>
              <button
                onClick={() => {
                  setSelectedSite(null);
                  setIsAssessing(false);
                  setEditingReportId(null);
                  setReportDetails("");
                }}
                style={{
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {isAssessing ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px",
                }}
              >
                <p style={{ fontSize: "12px", color: "#64748b" }}>
                  Assign safety score for <b>{selectedSite.name}</b>.
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5, 1fr)",
                    gap: "5px",
                  }}
                >
                  {safetyLevels.map((l) => (
                    <button
                      key={l.score}
                      onClick={() => setTempRating(l.score)}
                      style={{
                        padding: "10px 0",
                        borderRadius: "6px",
                        border:
                          tempRating === l.score
                            ? `2px solid ${l.color}`
                            : "1px solid #e2e8f0",
                        background:
                          tempRating === l.score ? `${l.color}15` : "#fff",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontWeight: "800", color: l.color }}>
                        {l.score}
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleOfficialRating}
                  style={{
                    ...styles.button,
                    background: "#065f46",
                    color: "#fff",
                  }}
                >
                  <ShieldCheck size={18} /> Confirm Rating
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <select
                  style={styles.input}
                  value={reportCategory}
                  onChange={(e) => setReportCategory(e.target.value)}
                >
                  {categoryOptions.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <textarea
                  style={{ ...styles.input, height: "80px" }}
                  placeholder="Incident details..."
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                />
                <button
                  onClick={handleReportSubmit}
                  style={{
                    ...styles.button,
                    background: "#0e2f3d",
                    color: "#fff",
                  }}
                >
                  <Save size={18} />{" "}
                  {editingReportId ? "Update Changes" : "Submit Report"}
                </button>
                {editingReportId && (
                  <button
                    onClick={() => {
                      setEditingReportId(null);
                      setReportDetails("");
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#64748b",
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    Cancel Edit
                  </button>
                )}

                <div style={{ marginTop: "20px" }}>
                  <h4
                    style={{
                      fontSize: "11px",
                      fontWeight: "800",
                      color: "#94a3b8",
                      textTransform: "uppercase",
                    }}
                  >
                    Reports for this Site
                  </h4>
                  {siteReports.length === 0 && (
                    <p style={{ fontSize: "11px", color: "#cbd5e1" }}>
                      No reports found.
                    </p>
                  )}
                  {siteReports.map((r) => (
                    <div key={r.id} style={styles.reportCard}>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: "700",
                          marginBottom: "4px",
                        }}
                      >
                        {r.category}
                      </div>
                      <p
                        style={{
                          fontSize: "12px",
                          margin: 0,
                          color: "#475569",
                        }}
                      >
                        {r.details}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          marginTop: "8px",
                        }}
                      >
                        <button
                          onClick={() => {
                            setEditingReportId(r.id);
                            setReportDetails(r.details);
                            setReportCategory(r.category);
                          }}
                          className="report-card-action"
                          style={{
                            background: "none",
                            border: "none",
                            color: "#1a5f7a",
                            fontSize: "11px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Edit3 size={12} /> Edit
                        </button>
                        <button
                          onClick={() => deleteReport(r.id)}
                          className="report-card-action"
                          style={{
                            background: "none",
                            border: "none",
                            color: "#ef4444",
                            fontSize: "11px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={styles.mapArea}>
        <MapContainer
          center={[9.85, 124.14]}
          zoom={10}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapClickHandler setPosition={setPosition} />
          {position && <Marker position={[position.lat, position.lng]} />}
          {sites.map((site) => {
            const lat = site.location?.latitude ?? site.location?.lat;
            const lng = site.location?.longitude ?? site.location?.lng;
            if (!lat || !lng) return null;
            return (
              <Marker key={site.id} position={[lat, lng]}>
                <Popup>
                  <div style={{ minWidth: "240px" }}>
                    <div
                      style={{
                        width: "100%",
                        height: "100px",
                        background: "#f1f5f9",
                        borderRadius: "8px",
                        overflow: "hidden",
                        marginBottom: "10px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      {site.imageUrl ? (
                        <img
                          src={site.imageUrl}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#94a3b8",
                          }}
                        >
                          <Upload size={20} />
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <h3 style={{ margin: "0 0 4px 0", fontSize: "14px" }}>
                        {site.name}
                      </h3>
                      {site.officialRating && (
                        <div style={styles.ratingBadge(site.officialRating)}>
                          {site.officialRating}/5
                        </div>
                      )}
                    </div>
                    <div
                      style={{ display: "flex", gap: "6px", margin: "10px 0" }}
                    >
                      <button
                        onClick={() => {
                          setSelectedSite(site);
                          setIsAssessing(false);
                        }}
                        style={{
                          flex: 1,
                          padding: "6px",
                          background: "#f1f5f9",
                          border: "1px solid #cbd5e1",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "11px",
                          fontWeight: "600",
                        }}
                      >
                        Report
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSite(site);
                          setIsAssessing(true);
                          setTempRating(site.officialRating);
                        }}
                        style={{
                          flex: 1,
                          padding: "6px",
                          background: "#0e2f3d",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "11px",
                          fontWeight: "600",
                        }}
                      >
                        Assess
                      </button>
                    </div>
                    <button
                      onClick={async () => {
                        if (window.confirm("Delete site?")) {
                          await API.delete(`/heritage/${site.id}`, {
                            headers: {
                              Authorization: `Bearer ${localStorage.getItem("token")}`,
                            },
                          });
                          loadSites();
                        }
                      }}
                      style={{
                        width: "100%",
                        background: "none",
                        border: "none",
                        color: "#ef4444",
                        fontSize: "10px",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                    >
                      REMOVE SITE
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
