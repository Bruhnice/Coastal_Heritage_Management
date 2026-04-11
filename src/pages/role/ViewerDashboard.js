import { useEffect, useState } from 'react';
import API from '../../services/api';

export default function ViewerDashboard() {
  const [sites, setSites] = useState([]);

  useEffect(() => {
    API.get('/heritage').then(res => setSites(res.data));
  }, []);

  return (
    <div>
      <h1>Public Heritage Viewer</h1>

      {sites.map(site => (
        <div key={site.id} style={boxStyle}>
          <h3>{site.name}</h3>
          <p>{site.description}</p>
        </div>
      ))}
    </div>
  );
}

const boxStyle = {
  border: '1px solid #ccc',
  padding: '10px',
  marginTop: '10px'
};
