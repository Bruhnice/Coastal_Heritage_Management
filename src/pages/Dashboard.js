import { useEffect, useState } from "react";
import socket from "../socket";
import Sidebar from "../components/Sidebar";

// Pages
import AdminDashboard from "./role/AdminDashboard";
import ReporterDashboard from "./role/ReporterDashboard";
import ViewerDashboard from "./role/ViewerDashboard";
import SuggestionsPage from "./SuggestionsPage";
import MapPage from "./MapPage";
import MapManager from "./MapManager";
import DashboardHome from "./DashboardHome";
import SiteDetails from "./SiteDetails";
import NotificationsPage from "./NotificationsPage";
import ReportsApprovalPage from "./ReportsApprovalPage";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("home");
  const [selectedSite, setSelectedSite] = useState(null);
  const [triggerZoom, setTriggerZoom] = useState(false); // 🔥 added
  const [homeRefresh, setHomeRefresh] = useState(0); // 🔥 refetch trigger

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/";
      return;
    }

    const payload = JSON.parse(atob(token.split(".")[1]));
    setUser(payload);

    socket.on("notify", (data) => {
      alert(`New report: ${data.description}`);
    });

    return () => socket.off("notify");
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  if (!user) return null;

  // 🔥 PAGE SWITCHER
  const renderPage = () => {
    // Home page
    if (page === "home") {
      return (
        <DashboardHome
          key={homeRefresh}
          setPage={setPage}
          setSelectedSite={setSelectedSite}
          setTriggerZoom={setTriggerZoom} // 🔥 pass setter
          setHomeRefresh={setHomeRefresh}
        />
      );
    }

    // Site details page
    if (page === "viewSite") {
      return (
        <SiteDetails
          site={selectedSite}
          user={user}
          reload={() => setPage("home")}
        />
      );
    }

    // Map manager
    if (page === "manage") return <MapManager />;

    // Map page
    if (page === "map") {
      return (
        <MapPage
          selectedSite={selectedSite}
          triggerZoom={triggerZoom} // 🔥 pass triggerZoom
          onZoomComplete={() => setTriggerZoom(false)} // 🔥 reset after zoom
          onImageUpload={() => setHomeRefresh((prev) => prev + 1)} // 🔥 refetch home when image uploaded
        />
      );
    }

    // Suggestions
    if (page === "suggestions") return <SuggestionsPage />;

    // Notifications
    if (page === "notifications") return <NotificationsPage />;

    // Reports approval
    if (page === "reportApproval") return <ReportsApprovalPage />;

    // Role-based fallback dashboards
    if (["ADMIN", "DRRM", "HERITAGE"].includes(user.role))
      return <AdminDashboard />;
    if (user.role === "REPORTER") return <ReporterDashboard />;
    return <ViewerDashboard />;
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar
        user={user}
        setPage={setPage}
        setSelectedSite={setSelectedSite}
        logout={logout}
      />

      <div style={{ flex: 1, padding: "20px" }}>{renderPage()}</div>
    </div>
  );
}
