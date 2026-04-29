"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

export default function AirportsPage() {
  const [airports, setAirports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ transportName: '', stationName: '', location: '' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const base = process.env.NEXT_PUBLIC_API_URL || 'https://cartaxi-backend.onrender.com';

  const fetchAirports = async () => {
    try {
      const token = Cookies.get('admin_token');
      const res = await axios.get(`${base}/api/airports`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAirports(res.data);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to load airports' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAirports(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const token = Cookies.get('admin_token');
      const res = await axios.post(`${base}/api/airports`, form, { headers: { Authorization: `Bearer ${token}` } });
      setAirports(prev => [...prev, res.data]);
      setForm({ transportName: '', stationName: '', location: '' });
      setMessage({ type: 'success', text: 'Airport added' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to add airport' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this airport?')) return;
    try {
      const token = Cookies.get('admin_token');
      await axios.delete(`${base}/api/airports/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setAirports(prev => prev.filter(a => a._id !== id));
      setMessage({ type: 'success', text: 'Airport deleted' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete airport' });
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Manage Airports</h1>

      <div className="card" style={{ maxWidth: 980, padding: '1rem' }}>
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label>Transport / Airways Name</label>
            <input name="transportName" value={form.transportName} onChange={handleChange} className="form-control" required />
          </div>

          <div className="form-group">
            <label>Station Name</label>
            <input name="stationName" value={form.stationName} onChange={handleChange} className="form-control" required />
          </div>

          <div className="form-group">
            <label>Location</label>
            <input name="location" value={form.location} onChange={handleChange} className="form-control" required />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Airport'}
            </button>
          </div>
        </form>

        {message && (
          <div style={{ marginTop: 12, padding: 8, borderRadius: 6, background: message.type === 'error' ? '#fff1f2' : '#ecfeff', color: message.type === 'error' ? '#b91c1c' : '#065f46' }}>
            {message.text}
          </div>
        )}

        <div className="table-responsive" style={{ marginTop: 18 }}>
          {loading ? <p>Loading...</p> : (
            <table>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Transport / Airways</th>
                  <th>Station Name</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {airports.map((a, idx) => (
                  <tr key={a._id}>
                    <td>{idx + 1}</td>
                    <td style={{ fontWeight: 500 }}>{a.transportName}</td>
                    <td>{a.stationName}</td>
                    <td>{a.location}</td>
                    <td>
                      <button type="button" className="btn-outline" onClick={() => handleDelete(a._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {airports.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: 12 }}>No airports added yet</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
