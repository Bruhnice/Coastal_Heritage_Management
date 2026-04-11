import { useState } from 'react';
import API from '../services/api';

export default function ReportForm() {
  const [desc, setDesc] = useState('');

  const submit = async () => {
    const token = localStorage.getItem('token');
    await API.post('/reports', { description: desc, disasterId: 1, userId: 1 },
      { headers: { Authorization: token } });
    alert('Report submitted!');
  };

  return (
    <div>
      <h3>Submit Report</h3>
      <textarea onChange={e => setDesc(e.target.value)} placeholder="Report details" />
      <button onClick={submit}>Submit</button>
    </div>
  );
}
