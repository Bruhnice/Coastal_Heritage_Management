import { useEffect, useState } from "react";
import API from "../../services/api";
import socket from "../../socket";

export default function AdminDashboard() {
  const [sites, setSites] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);

  useEffect(() => {
    API.get("/heritage").then((res) => setSites(res.data));

    API.get("/users/pending").then((res) => setPendingUsers(res.data));

    socket.on("notify", (data) => {
      console.log("New report:", data);
      alert("New report received!");
    });

    return () => {
      socket.off("notify");
    };
  }, []);

  const approveUser = async (id) => {
    await API.put(`/users/${id}/approve`);
    setPendingUsers(pendingUsers.filter((u) => u.id !== id));
  };

  const rejectUser = async (id) => {
    await API.put(`/users/${id}/reject`);
    setPendingUsers(pendingUsers.filter((u) => u.id !== id));
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>

      <h2>Pending Users</h2>
      {pendingUsers.map((user) => (
        <div
          key={user.id}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            margin: "10px 0",
          }}
        >
          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>
          <button onClick={() => approveUser(user.id)}>Approve</button>
          <button onClick={() => rejectUser(user.id)}>Reject</button>
        </div>
      ))}

      <h2>Heritage Sites</h2>
      {sites.map((s) => (
        <div key={s.id}>{s.name}</div>
      ))}
    </div>
  );
}
