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
  const [triggerZoom, setTriggerZoom] = useState(false);
  const [homeRefresh, setHomeRefresh] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/";
      return;
    }

    const payload = JSON.parse(atob(token.split(".")[1]));
    setUser(payload);

    socket.on("notify", (data) => {
      // Optional: Only show browser alert if user is a Reporter
      if (payload.role === "REPORTER") {
        alert(`New report: ${data.description}`);
      }
    });

    return () => socket.off("notify");
  }, []);

  if (!user) return null;

  const renderPage = () => {
    if (page === "home") {
      return (
        <DashboardHome
          key={homeRefresh}
          setPage={setPage}
          setSelectedSite={setSelectedSite}
          setTriggerZoom={setTriggerZoom}
          setHomeRefresh={setHomeRefresh}
        />
      );
    }

    if (page === "viewSite") {
      return (
        <SiteDetails
          site={selectedSite}
          user={user}
          reload={() => setPage("home")}
        />
      );
    }

    if (page === "manage") return <MapManager />;

    if (page === "map") {
      return (
        <MapPage
          selectedSite={selectedSite}
          triggerZoom={triggerZoom}
          onZoomComplete={() => setTriggerZoom(false)}
          onImageUpload={() => setHomeRefresh((prev) => prev + 1)}
        />
      );
    }

    if (page === "suggestions") return <SuggestionsPage />;

    // 🔥 Pass user prop to NotificationsPage
    if (page === "notifications") return <NotificationsPage user={user} />;

    if (page === "reportApproval") return <ReportsApprovalPage />;

    // Role-based fallback dashboards
    if (["ADMIN", "DRRM", "HERITAGE"].includes(user.role))
      return <AdminDashboard />;
    if (user.role === "REPORTER") return <ReporterDashboard />;
    return <ViewerDashboard />;
  };

  return (
    <div style={{ display: "flex", position: "relative" }}>
      <Sidebar
        user={user}
        setPage={setPage}
        currentPage={page} // 🔥 Pass current page for active styling
        setSelectedSite={setSelectedSite}
      />

      <div style={{ flex: 1, padding: "20px" }}>{renderPage()}</div>
    </div>
  );
}
