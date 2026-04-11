import { useState } from 'react';
import API from '../services/api';

export default function HeritageForm() {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');

  const submit = async () => {
    const token = localStorage.getItem('token');
    await API.post('/heritage', { name, locationId: parseInt(location) },
      { headers: { Authorization: token } });
    alert('Heritage site added!');
  };

  return (
    <div>
      <h3>Add Heritage Site</h3>
      <input placeholder="Name" onChange={e => setName(e.target.value)} />
      <input placeholder="Location ID" onChange={e => setLocation(e.target.value)} />
      <button onClick={submit}>Submit</button>
    </div>
  );
}
