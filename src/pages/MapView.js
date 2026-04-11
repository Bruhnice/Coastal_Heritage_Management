import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  CircleMarker,
  Circle,
} from "react-leaflet";

import {
  X,
  MapPin,
  Info,
  History,
  Navigation,
  Layers,
  Map as MapIcon,
  Crosshair,
  CheckCircle, // Added for the Verified Badge
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

// 🔥 COLOR CONFIG FOR RATINGS
const ratingColors = {
  1: "#ef4444", // High Risk (Red)
  2: "#f97316", // At Risk (Orange)
  3: "#eab308", // Stable (Yellow)
  4: "#22c55e", // Good (Green)
  5: "#065f46", // Safe (Dark Green)
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
        map.removeControl(routingRef.current);
        routingRef.current = null;
      }
      return;
    }
    if (routingRef.current) map.removeControl(routingRef.current);

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
      lineOptions: { styles: [{ color: "#1a5f7a", weight: 5 }] },
      fitSelectedRoutes: true,
      createMarker: () => null,
    }).addTo(map);

    return () => {
      if (routingRef.current) map.removeControl(routingRef.current);
    };
  }, [destination, userLocation, map]);

  return null;
}

export default function MapView({ heritageSites = [], selectedSite }) {
  const mapRef = useRef(null);
  const [timelineSite, setTimelineSite] = useState(null);
  const [routeTo, setRouteTo] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isSatellite, setIsSatellite] = useState(false);

  const defaultCenter = [9.85, 124.14];
  const streetUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const satelliteUrl =
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

  const handleLocate = () => {
    const map = mapRef.current;
    if (!map) return;
    map.locate({ setView: true, maxZoom: 16, enableHighAccuracy: true });
    map.on("locationfound", (e) => {
      setUserLocation({
        latitude: e.latlng.lat,
        longitude: e.latlng.lng,
        accuracy: e.accuracy,
      });
    });
  };

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) =>
        setUserLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
      (err) => console.warn(err),
      { enableHighAccuracy: true },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const getHeatColor = (count) => {
    const ratio = Math.min(1, count / 5);
    if (ratio <= 0.5)
      return `rgb(${Math.round((ratio / 0.5) * 255)}, 150, 255)`;
    return `rgb(255, ${Math.round(200 - ((ratio - 0.5) / 0.5) * 200)}, 0)`;
  };

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      <div
        style={{
          position: "absolute",
          top: "12px",
          left: "55px",
          zIndex: 1000,
          display: "flex",
          gap: "8px",
        }}
      >
        <button
          onClick={() => setIsSatellite(!isSatellite)}
          style={controlBtnStyle}
        >
          {isSatellite ? <MapIcon size={16} /> : <Layers size={16} />}{" "}
          {isSatellite ? "Streets" : "Satellite"}
        </button>
        <button onClick={handleLocate} style={controlBtnStyle}>
          <Crosshair size={16} /> Locate Me
        </button>
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={10}
        style={{ height: "100%", width: "100%" }}
        ref={mapRef}
      >
        <TileLayer
          key={isSatellite ? "sat" : "str"}
          url={isSatellite ? satelliteUrl : streetUrl}
        />
        <FlyToSite selectedSite={selectedSite} />

        {userLocation && (
          <>
            <Circle
              center={[userLocation.latitude, userLocation.longitude]}
              radius={userLocation.accuracy}
              pathOptions={{ color: "blue", fillOpacity: 0.1, weight: 1 }}
            />
            <Marker
              position={[userLocation.latitude, userLocation.longitude]}
              icon={L.divIcon({
                className: "user-loc",
                html: '<div class="pulse"></div>',
              })}
            />
          </>
        )}

        {heritageSites.map((site) => {
          const lat = site?.location?.latitude ?? site?.location?.lat;
          const lng = site?.location?.longitude ?? site?.location?.lng;
          if (!lat || !lng) return null;

          const hasRating = site.officialRating != null;
          const markerColor = hasRating
            ? ratingColors[site.officialRating]
            : getHeatColor(site.reports?.length || 0);

          return (
            <Fragment key={site.id}>
              <CircleMarker
                center={[lat, lng]}
                radius={hasRating ? 18 : 12 + (site.reports?.length || 0) * 2}
                fillColor={markerColor}
                fillOpacity={0.6}
                stroke={hasRating}
                color="#fff"
                weight={2}
              />
              <Marker position={[lat, lng]}>
                <Popup>
                  <div
                    style={{
                      minWidth: "220px",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {hasRating && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          background: `${markerColor}15`,
                          padding: "6px",
                          borderRadius: "6px",
                          marginBottom: "8px",
                          border: `1px solid ${markerColor}`,
                        }}
                      >
                        <CheckCircle size={14} color={markerColor} />
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "800",
                            color: markerColor,
                          }}
                        >
                          OFFICIAL RATING: {site.officialRating}/5
                        </span>
                      </div>
                    )}
                    <h3 style={{ margin: "0 0 8px 0" }}>{site.name}</h3>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      <button
                        onClick={() => setTimelineSite(site)}
                        style={popupBtnStyle(true)}
                      >
                        <History size={14} /> Timeline
                      </button>
                      <button
                        onClick={() =>
                          setRouteTo({ latitude: lat, longitude: lng })
                        }
                        style={popupBtnStyle(false)}
                      >
                        <Navigation size={14} /> Navigate
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

      <style>{`
        .pulse { width: 12px; height: 12px; background: #007bff; border-radius: 50%; box-shadow: 0 0 0 rgba(0,123,255,0.4); animation: pulse 2s infinite; }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(0,123,255,0.4); } 70% { box-shadow: 0 0 0 15px rgba(0,123,255,0); } 100% { box-shadow: 0 0 0 0 rgba(0,123,255,0); } }
      `}</style>
    </div>
  );
}

const controlBtnStyle = {
  padding: "8px 12px",
  background: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontWeight: "700",
  fontSize: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
};

const popupBtnStyle = (primary) => ({
  width: "100%",
  padding: "8px",
  borderRadius: "6px",
  border: primary ? "none" : "1px solid #1a5f7a",
  background: primary ? "#1a5f7a" : "#fff",
  color: primary ? "#fff" : "#1a5f7a",
  fontWeight: "600",
  fontSize: "12px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
});
