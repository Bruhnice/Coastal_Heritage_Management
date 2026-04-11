import { useEffect, useState } from 'react';
import API from '../../services/api';
import socket from '../../socket';

export default function AdminDashboard() {
  const [sites, setSites] = useState([]);

  useEffect(() => {
    
    API.get('/heritage').then(res => setSites(res.data));

   
    socket.on('notify', (data) => {
      console.log("New report:", data);
      alert("New report received!");
    });

    
    return () => {
      socket.off('notify');
    };
  }, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>

      {sites.map(s => (
        <div key={s.id}>{s.name}</div>
      ))}
    </div>
  );
}
