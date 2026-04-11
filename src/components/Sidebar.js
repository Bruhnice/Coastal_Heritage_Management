import { useEffect, useState } from "react";
import API from "../services/api";
import { io } from "socket.io-client";
import {
  LayoutDashboard,
  Map as MapIcon,
  Anchor,
  Settings,
  CheckCircle,
  Bell,
  LogOut,
  User,
} from "lucide-react";

const socket = io("http://localhost:5001");

export default function Sidebar({
  setPage,
  setSelectedSite,
  user,
  currentPage,
}) {
  const [approvalCount, setApprovalCount] = useState(0);

  const fetchCount = () => {
    const token = localStorage.getItem("token");
    API.get("/suggestions/count", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => setApprovalCount(res.data.count))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    if (user?.role === "ADMIN") fetchCount();
  }, [user]);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      socket.on("suggestionUpdated", () => fetchCount());
    }
    return () => socket.off("suggestionUpdated");
  }, [user]);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const sidebarStyle = {
    width: "260px",
    height: "100vh",
    background: "linear-gradient(180deg, #1a5f7a 0%, #0e2f3d 100%)",
    color: "#fff",
    padding: "24px 16px 40px 16px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "4px 0 15px rgba(0,0,0,0.1)",
    position: "fixed",
    left: 0,
    top: 0,
    zIndex: 100,
    fontFamily: "'Inter', sans-serif",
    // 🔥 FIXES FOR SCROLLBAR
    boxSizing: "border-box",
    overflowX: "hidden",
  };

  const navItemStyle = (isActive, isLogout = false) => ({
    padding: "12px 16px",
    background: isActive ? "rgba(255, 255, 255, 0.15)" : "transparent",
    border: "none",
    color: isLogout ? "#ff8a8a" : "#fff",
    cursor: "pointer",
    borderRadius: "12px",
    textAlign: "left",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "15px",
    fontWeight: isActive ? "600" : "400",
    transition: "all 0.2s ease",
    marginBottom: "4px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box", // Prevents padding from expanding width
  });

  return (
    <div style={sidebarStyle}>
      <div style={{ padding: "0 16px 32px 16px" }}>
        <h2
          style={{
            fontSize: "18px",
            fontWeight: "800",
            letterSpacing: "-0.5px",
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Anchor size={20} /> Heritage System
        </h2>
        <div
          style={{
            fontSize: "11px",
            opacity: 0.6,
            marginTop: "6px",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          {user?.role} Access
        </div>
      </div>

      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden", // Added here as well for safety
        }}
      >
        <button
          onClick={() => setPage("home")}
          style={navItemStyle(currentPage === "home")}
          className="nav-btn"
        >
          <LayoutDashboard size={18} /> Home
        </button>

        <button
          onClick={() => {
            setSelectedSite(null);
            setPage("map");
          }}
          style={navItemStyle(currentPage === "map")}
          className="nav-btn"
        >
          <MapIcon size={18} /> View Map
        </button>

        {["ADMIN", "HERITAGE", "REPORTER"].includes(user?.role) && (
          <button
            onClick={() => setPage("manage")}
            style={navItemStyle(currentPage === "manage")}
            className="nav-btn"
          >
            <Settings size={18} /> Manage Map
          </button>
        )}

        {user?.role === "ADMIN" && (
          <button
            onClick={() => setPage("suggestions")}
            style={navItemStyle(currentPage === "suggestions")}
            className="nav-btn"
          >
            <CheckCircle size={18} /> Approvals
            {approvalCount > 0 && (
              <span
                style={{
                  background: "#ef4444",
                  color: "white",
                  fontSize: "10px",
                  padding: "2px 6px",
                  borderRadius: "10px",
                  marginLeft: "auto",
                }}
              >
                {approvalCount}
              </span>
            )}
          </button>
        )}

        <button
          onClick={() => setPage("notifications")}
          style={navItemStyle(currentPage === "notifications")}
          className="nav-btn"
        >
          <Bell size={18} /> Notifications
        </button>
      </nav>

      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.1)",
          paddingTop: "20px",
          marginTop: "auto",
        }}
      >
        <div
          style={{
            padding: "0 16px 12px 16px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <User size={16} />
          </div>
          <div style={{ fontSize: "13px", fontWeight: "500", opacity: 0.9 }}>
            {user?.email?.split("@")[0]}
          </div>
        </div>
        <button
          onClick={logout}
          style={navItemStyle(false, true)}
          className="logout-btn"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>

      <style>{`
        /* Changed translateX slightly to 2px to be safer, combined with overflowX: hidden */
        .nav-btn:hover { 
          background: rgba(255, 255, 255, 0.08) !important; 
          transform: translateX(4px); 
        }
        .logout-btn:hover { 
          background: rgba(239, 68, 68, 0.08) !important; 
          transform: translateX(4px); 
        }
        /* Scrollbar styling for the nav section */
        nav::-webkit-scrollbar {
          width: 4px;
        }
        nav::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.2);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
