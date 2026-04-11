import { useEffect, useState } from "react";
import API from "../services/api";
import { Search, MapPin, Info, ArrowRight } from "lucide-react";

export default function DashboardHome({ setPage, setSelectedSite }) {
  const [sites, setSites] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    API.get("/heritage")
      .then((res) => setSites(res.data))
      .catch((err) => console.error(err));
  }, []);

  const filtered = sites.filter((site) =>
    site.name.toLowerCase().includes(search.toLowerCase()),
  );

  // Simplified styles for brevity, keeping your 260px margin logic
  const styles = {
    mainContainer: {
      marginLeft: "260px",
      padding: "40px",
      backgroundColor: "#f8fafc",
      minHeight: "100vh",
    },
    searchWrapper: { position: "relative", width: "300px" },
    searchInput: {
      padding: "12px 12px 12px 40px",
      width: "100%",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
      outline: "none",
    },
  };

  return (
    <div style={styles.mainContainer}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "40px",
        }}
      >
        <h1 style={{ color: "#0e2f3d", fontWeight: "800", margin: 0 }}>
          Heritage Sites
        </h1>
        <div style={styles.searchWrapper}>
          <Search
            size={18}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
            }}
          />
          <input
            style={styles.searchInput}
            placeholder="Search catalog..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: "grid", gap: "20px" }}>
        {filtered.map((site) => (
          <div
            key={site.id}
            style={{
              display: "flex",
              background: "#fff",
              padding: "16px",
              borderRadius: "16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              alignItems: "center",
            }}
          >
            <img
              src={site.imageUrl || "https://via.placeholder.com/150"}
              style={{
                width: "140px",
                height: "90px",
                borderRadius: "12px",
                objectFit: "cover",
              }}
            />
            <div style={{ marginLeft: "24px", flex: 1 }}>
              <h3 style={{ margin: "0 0 4px 0", color: "#1e293b" }}>
                {site.name}
              </h3>
              <div
                style={{
                  display: "flex",
                  gap: "15px",
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                <span
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <MapPin size={14} /> {site.location?.latitude?.toFixed(3)}
                </span>
                <span
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <MapPin size={14} /> {site.location?.longitude?.toFixed(3)}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => {
                  setSelectedSite(site);
                  setPage("viewSite");
                }}
                style={{
                  padding: "10px 16px",
                  border: "none",
                  background: "#f1f5f9",
                  borderRadius: "10px",
                  color: "#1a5f7a",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Info size={16} /> Details
              </button>
              <button
                onClick={() => {
                  setSelectedSite(site);
                  setPage("map");
                }}
                style={{
                  padding: "10px 16px",
                  border: "none",
                  background: "#1a5f7a",
                  borderRadius: "10px",
                  color: "#fff",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                Map <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
