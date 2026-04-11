import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  CircleMarker,
} from "react-leaflet";

import {
  X,
  MapPin,
  Info,
  History,
  Navigation,
  Layers,
  Map as MapIcon,
  ShieldCheck, // Added for the official reporter badge
} from "lucide-react";

import Timeline from "./Timeline";
import { Fragment, useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const API_BASE = "http://localhost:5001";

// Mapping of scores to colors for the official badge
const ratingColors = {
  1: "#ef4444", // Red
  2: "#f97316", // Orange
  3: "#eab308", // Yellow
  4: "#84cc16", // Lime
  5: "#22c55e", // Green
};

function FlyToSite({ selectedSite }) {
  const map = useMap();
  useEffect(() => {
    if (!selectedSite) return;
    const lat = selectedSite.location?.latitude ?? selectedSite.location?.lat;
    const lng = selectedSite.location?.longitude ?? selectedSite.location?.lng;
    if (lat == null || lng == null) return;
    map.invalidateSize();
    setTimeout(() => map.flyTo([lat, lng], 16, { duration: 1.5 }), 250);
  }, [selectedSite, map]);
  return null;
}

function RoutingManager({ destination, userLocation }) {
  const map = useMap();
  const routingRef = useRef(null);

  useEffect(() => {
    if (!destination || !userLocation) {
      if (routingRef.current) {
        routingRef.current.remove();
        routingRef.current = null;
      }
      return;
    }

    if (routingRef.current) {
      routingRef.current.remove();
    }

    routingRef.current = L.Routing.control({
      waypoints: [
        L.latLng(userLocation.latitude, userLocation.longitude),
        L.latLng(destination.latitude, destination.longitude),
      ],
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
      }),
      addWaypoints: false,
      draggableWaypoints: false,
      showAlternatives: false,
      lineOptions: { styles: [{ color: "blue", weight: 5 }] },
      fitSelectedRoutes: true,
      createMarker: () => null,
    }).addTo(map);

    return () => {
      if (routingRef.current) routingRef.current.remove();
    };
  }, [destination, userLocation, map]);

  return null;
}

function TimelinePanel({ site, onClose }) {
  if (!site) return null;

  const styles = {
    panel: {
      position: "absolute",
      top: 0,
      right: 0,
      width: "360px",
      height: "100%",
      background: "#fff",
      boxShadow: "-10px 0px 30px rgba(0,0,0,0.1)",
      zIndex: 2000,
      overflowY: "auto",
      padding: "0",
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Inter', sans-serif",
      animation: "slideIn 0.3s ease-out",
    },
    header: {
      padding: "24px",
      background: "#0e2f3d",
      color: "#fff",
      position: "relative",
    },
    closeBtn: {
      position: "absolute",
      top: "16px",
      right: "16px",
      background: "rgba(255,255,255,0.1)",
      border: "none",
      color: "#fff",
      borderRadius: "50%",
      width: "32px",
      height: "32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
    },
    body: { padding: "24px", flex: 1 },
  };

  return (
    <div style={styles.panel}>
      <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
      <div style={styles.header}>
        <button onClick={onClose} style={styles.closeBtn}>
          <X size={18} />
        </button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "8px",
            opacity: 0.8,
          }}
        >
          <MapPin size={14} />
          <span
            style={{
              fontSize: "12px",
              fontWeight: "600",
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            Heritage Site
          </span>
        </div>
        <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800" }}>
          {site.name}
        </h2>
      </div>
      <div style={styles.body}>
        <div style={{ marginBottom: "30px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#64748b",
              marginBottom: "12px",
            }}
          >
            <Info size={16} />
            <h4 style={{ margin: 0, fontSize: "14px" }}>Overview</h4>
          </div>
          <p
            style={{
              margin: 0,
              color: "#475569",
              fontSize: "14px",
              lineHeight: "1.6",
            }}
          >
            {site.description || "No description available."}
          </p>
        </div>
        <Timeline reports={site.reports || []} />
      </div>
    </div>
  );
}

export default function MapView({ heritageSites = [], selectedSite }) {
  const markers = useRef({});
  const [timelineSite, setTimelineSite] = useState(null);
  const [routeTo, setRouteTo] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isSatellite, setIsSatellite] = useState(false);

  const defaultCenter = [9.85, 124.14];
  const streetUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const satelliteUrl =
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

  const reportCounts = heritageSites.map((site) => site.reports?.length ?? 0);
  const maxReportCount = Math.max(1, ...reportCounts);

  const getHeatColor = (count) => {
    const scaleMax = Math.max(maxReportCount, 5);
    const ratio = Math.min(1, count / scaleMax);
    if (ratio <= 0.5) {
      const inner = ratio / 0.5;
      return `rgb(${Math.round(inner * 255)}, ${Math.round(120 + inner * 80)}, ${Math.round(255 - inner * 255)})`;
    }
    const inner = (ratio - 0.5) / 0.5;
    return `rgb(255, ${Math.round(200 - inner * 200)}, 0)`;
  };

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) =>
        setUserLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      (err) => console.warn(err),
      { enableHighAccuracy: true },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <button
        onClick={() => setIsSatellite(!isSatellite)}
        style={{
          position: "absolute",
          top: "12px",
          left: "55px",
          zIndex: 1000,
          padding: "8px 14px",
          background: "#fff",
          border: "2px solid rgba(0,0,0,0.1)",
          borderRadius: "8px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontWeight: "700",
          fontSize: "12px",
          color: "#0e2f3d",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      >
        {isSatellite ? <MapIcon size={16} /> : <Layers size={16} />}
        {isSatellite ? "Street View" : "Satellite"}
      </button>

      <MapContainer
        center={defaultCenter}
        zoom={10}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          key={isSatellite ? "sat-layer" : "street-layer"}
          url={isSatellite ? satelliteUrl : streetUrl}
        />
        <FlyToSite selectedSite={selectedSite} />

        {userLocation && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={L.divIcon({
              className: "pulse-marker-wrapper",
              html: `<div class="pulse-marker"></div>`,
            })}
          >
            <Popup>You are here</Popup>
          </Marker>
        )}

        {heritageSites.map((site) => {
          const lat = site?.location?.latitude ?? site?.location?.lat;
          const lng = site?.location?.longitude ?? site?.location?.lng;
          if (lat == null || lng == null) return null;

          const imageUrl = site.imageUrl
            ? site.imageUrl.startsWith("http")
              ? site.imageUrl
              : `${API_BASE}${site.imageUrl}`
            : null;
          const reportCount = site.reports?.length ?? 0;
          const hasOfficialRating = site.officialRating != null;
          const badgeColor = hasOfficialRating
            ? ratingColors[site.officialRating] || "#64748b"
            : null;

          return (
            <Fragment key={site.id}>
              <CircleMarker
                center={[lat, lng]}
                radius={
                  hasOfficialRating
                    ? 22
                    : 14 + (reportCount / maxReportCount) * 22
                }
                fillColor={
                  hasOfficialRating
                    ? badgeColor
                    : reportCount > 0
                      ? getHeatColor(reportCount)
                      : "rgba(0, 140, 255, 0.25)"
                }
                fillOpacity={0.4}
                stroke={hasOfficialRating}
                color="#fff"
                weight={2}
              />
              <Marker
                position={[lat, lng]}
                ref={(ref) => {
                  if (ref) markers.current[site.id] = ref;
                }}
              >
                <Popup>
                  <div
                    style={{
                      minWidth: "240px",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {/* 🔥 OFFICIAL REPORTER BADGE */}
                    {hasOfficialRating && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                          background: `${badgeColor}15`,
                          padding: "10px",
                          borderRadius: "10px",
                          marginBottom: "12px",
                          border: `1px solid ${badgeColor}40`,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <ShieldCheck size={16} color={badgeColor} />
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: "800",
                              color: badgeColor,
                              textTransform: "uppercase",
                            }}
                          >
                            Official Assessment
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: "20px",
                            fontWeight: "900",
                            color: "#0e2f3d",
                          }}
                        >
                          {site.officialRating}{" "}
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: "400",
                              color: "#64748b",
                            }}
                          >
                            / 5 Safety Score
                          </span>
                        </div>
                      </div>
                    )}

                    <h3 style={{ margin: "0 0 10px 0", color: "#0e2f3d" }}>
                      {site.name}
                    </h3>

                    <div
                      style={{
                        width: "100%",
                        height: "140px",
                        background: "#f1f5f9",
                        borderRadius: "12px",
                        overflow: "hidden",
                        marginBottom: "12px",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt=""
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <span style={{ color: "#94a3b8", fontSize: "12px" }}>
                          No image available
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      <button
                        onClick={() => setTimelineSite(site)}
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          background: "#0e2f3d",
                          color: "#fff",
                          border: "none",
                          fontWeight: "600",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                        }}
                      >
                        <History size={16} /> View Timeline
                      </button>
                      <button
                        onClick={() =>
                          setRouteTo({ latitude: lat, longitude: lng })
                        }
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          background: "#fff",
                          color: "#1a5f7a",
                          border: "1px solid #1a5f7a",
                          fontWeight: "600",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                        }}
                      >
                        <Navigation size={16} /> Navigate Here
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </Fragment>
          );
        })}

        <RoutingManager destination={routeTo} userLocation={userLocation} />
      </MapContainer>

      {routeTo && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            zIndex: 1000,
          }}
        >
          <button
            onClick={() => setRouteTo(null)}
            style={{
              padding: "8px 16px",
              background: "#ff6b6b",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Clear Route
          </button>
        </div>
      )}

      <TimelinePanel
        site={timelineSite}
        onClose={() => setTimelineSite(null)}
      />

      <style>{`
        .pulse-marker { width: 12px; height: 12px; background: rgba(0, 123, 255, 0.7); border-radius: 50%; position: relative; animation: pulse 1.5s infinite; }
        .pulse-marker::after { content: ''; width: 24px; height: 24px; border-radius: 50%; position: absolute; top: -6px; left: -6px; background: rgba(0, 123, 255, 0.3); animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { transform: scale(0.7); opacity: 1; } 70% { transform: scale(1.5); opacity: 0; } 100% { transform: scale(1.5); opacity: 0; } }
      `}</style>
    </div>
  );
}
