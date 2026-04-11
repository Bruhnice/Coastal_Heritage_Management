import { useEffect, useState } from "react";
import API from "../services/api";

export default function ReportsApprovalPage() {
  const [reports, setReports] = useState([]);

  const load = async () => {
    const token = localStorage.getItem("token");

    const res = await API.get("/reports/admin", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setReports(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id) => {
    const token = localStorage.getItem("token");

    await API.put(
      `/reports/${id}/approve`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    load();
  };

  const reject = async (id) => {
    const token = localStorage.getItem("token");

    await API.put(
      `/reports/${id}/reject`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    load();
  };

  return (
    <div>
      <h1>Report Approvals</h1>

      {reports.map((r) => (
        <div
          key={r.id}
          style={{ border: "1px solid gray", margin: "10px", padding: "10px" }}
        >
          <h3>{r.site.name}</h3>
          <p>{r.details}</p>
          <p>
            <strong>{r.category}</strong>
          </p>

          <button onClick={() => approve(r.id)}>Approve</button>
          <button onClick={() => reject(r.id)}>Reject</button>
        </div>
      ))}
    </div>
  );
}
