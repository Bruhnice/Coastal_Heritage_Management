import { useEffect, useState } from "react";
import { createPortal } from "react-dom"; // 🔥 Import for the Portal
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
  AlertCircle,
} from "lucide-react";

const socket = io("http://localhost:5001");

export default function Sidebar({
  setPage,
  setSelectedSite,
  user,
  currentPage,
}) {
  const [approvalCount, setApprovalCount] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false); // 🔥 State for custom modal

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

  // Final logout action
  const handleLogout = () => {
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
    boxSizing: "border-box",
  });

  return (
    <div style={sidebarStyle}>
      {/* 🔥 CUSTOM LOGOUT MODAL TELEPORTED TO BODY */}
      {showConfirm &&
        createPortal(
          <div style={modalStyles.overlay}>
            <div style={modalStyles.modal}>
              <div style={modalStyles.iconCircle}>
                <AlertCircle size={28} color="#ef4444" />
              </div>
              <h3 style={modalStyles.title}>End Session?</h3>
              <p style={modalStyles.text}>
                Are you sure you want to log out of the Heritage System?
              </p>
              <div style={modalStyles.btnGroup}>
                <button
                  style={modalStyles.cancelBtn}
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </button>
                <button style={modalStyles.confirmBtn} onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
          </div>,
          document.body, // 🔥 This bypasses z-index issues in Map views
        )}

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
          overflowX: "hidden",
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

        {user?.role !== "ADMIN" && (
          <button
            onClick={() => setPage("notifications")}
            style={navItemStyle(currentPage === "notifications")}
            className="nav-btn"
          >
            <Bell size={18} /> Notifications
          </button>
        )}
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
          onClick={() => setShowConfirm(true)}
          style={navItemStyle(false, true)}
          className="logout-btn"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>

      <style>{`
        .nav-btn:hover { background: rgba(255, 255, 255, 0.08) !important; transform: translateX(4px); }
        .logout-btn:hover { background: rgba(239, 68, 68, 0.08) !important; transform: translateX(4px); }
        nav::-webkit-scrollbar { width: 4px; }
        nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
}

const modalStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    backdropFilter: "blur(4px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99999, // 🔥 High Z-index
    fontFamily: "'Inter', sans-serif",
  },
  modal: {
    backgroundColor: "#fff",
    padding: "32px",
    borderRadius: "20px",
    width: "320px",
    textAlign: "center",
    boxShadow:
      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },
  iconCircle: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    backgroundColor: "#fef2f2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px auto",
  },
  title: {
    margin: "0 0 8px 0",
    color: "#111827",
    fontSize: "18px",
    fontWeight: "700",
  },
  text: {
    margin: "0 0 24px 0",
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: "1.5",
  },
  btnGroup: {
    display: "flex",
    gap: "12px",
  },
  cancelBtn: {
    flex: 1,
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    backgroundColor: "#fff",
    color: "#374151",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  confirmBtn: {
    flex: 1,
    padding: "10px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#ef4444",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
};
