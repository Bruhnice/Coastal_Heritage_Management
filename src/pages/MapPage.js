import { useEffect, useState } from "react";
import API from "../services/api";
import MapView from "../components/MapView";
import { Compass, Waves } from "lucide-react";

export default function MapPage({ selectedSite, onImageUpload }) {
  const [sites, setSites] = useState([]);

  useEffect(() => {
    API.get("/heritage")
      .then((res) => setSites(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div
      style={{
        marginLeft: "260px",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f8fafc",
      }}
    >
      <div
        style={{
          padding: "20px 40px",
          background: "#fff",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "20px",
            color: "#0e2f3d",
            fontWeight: "800",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <Compass className="text-blue-600" /> Maritime Navigator
        </h1>
        {selectedSite && (
          <div
            style={{
              fontSize: "13px",
              color: "#64748b",
              background: "#f1f5f9",
              padding: "6px 12px",
              borderRadius: "8px",
            }}
          >
            Viewing: <strong>{selectedSite.name}</strong>
          </div>
        )}
      </div>

      <div style={{ flex: 1, padding: "24px", position: "relative" }}>
        <div
          style={{
            height: "100%",
            width: "100%",
            borderRadius: "24px",
            overflow: "hidden",
            border: "1px solid #e2e8f0",
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
          }}
        >
          <MapView
            key={selectedSite ? selectedSite.id : "default"}
            heritageSites={sites}
            selectedSite={selectedSite}
            onImageUpload={onImageUpload}
          />
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            left: "40px",
            background: "white",
            padding: "10px 16px",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "12px",
            color: "#1a5f7a",
            fontWeight: "600",
          }}
        >
          <Waves size={16} /> Coastal Heritage Network Active
        </div>
      </div>
    </div>
  );
}
