"use client";

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';

export default function AgentsPage() {
  const [formData, setFormData] = useState({ airportName: '', username: '', email: '', location: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copySuccess, setCopySuccess] = useState('');

  const [airports, setAirports] = useState([]);
  const [airportsLoading, setAirportsLoading] = useState(true);
  const [isOtherAirport, setIsOtherAirport] = useState(false);

  const base = process.env.NEXT_PUBLIC_API_URL || 'https://cartaxi-backend.onrender.com';

  useEffect(() => {
    const fetchAirports = async () => {
      try {
        const token = Cookies.get('admin_token');
        const res = await axios.get(`${base}/api/airports`, { headers: { Authorization: `Bearer ${token}` } });
        setAirports(res.data || []);
      } catch (err) {
        console.error('Failed to fetch airports', err);
      } finally {
        setAirportsLoading(false);
      }
    };
    fetchAirports();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'airportSelect') {
      if (value === '__other') {
        setIsOtherAirport(true);
        setFormData({ ...formData, airportName: '' });
      } else {
        setIsOtherAirport(false);
        setFormData({ ...formData, airportName: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    if (formData.password !== formData.confirmPassword) {
      setResult({ success: false, message: 'Passwords do not match' });
      setLoading(false);
      return;
    }
    if (!formData.airportName) {
      setResult({ success: false, message: 'Please select or enter an airport' });
      setLoading(false);
      return;
    }

    try {
      const token = Cookies.get('admin_token');
      const res = await axios.post(`${base}/api/auth/admin/agents`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const providedPassword = formData.password;
      setResult({ success: true, data: res.data, password: providedPassword });
      setFormData({ airportName: '', username: '', email: '', location: '', password: '', confirmPassword: '' });
      setIsOtherAirport(false);
    } catch (err) {
      setResult({ success: false, message: err.response?.data?.message || 'Failed to create agent' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result || !result.data) return;
    const text = `Username: ${result.data.agent.username}\nPassword: ${result.password}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess('Copied to clipboard');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      setCopySuccess('Copy failed');
      setTimeout(() => setCopySuccess(''), 2000);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Create Agent</h1>

      <div className="card" style={{ maxWidth: '980px' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Airport</label>
            {airportsLoading ? (
              <div>Loading airports...</div>
            ) : airports.length > 0 ? (
              <div>
                <select name="airportSelect" value={isOtherAirport ? '__other' : formData.airportName} onChange={handleChange} className="form-control" required>
                  <option value="">-- Select airport --</option>
                  {airports.map(a => {
                    const label = `${a.transportName} — ${a.stationName}${a.location ? ' (' + a.location + ')' : ''}`;
                    const value = `${a.transportName} - ${a.stationName}`;
                    return <option key={a._id} value={value}>{label}</option>;
                  })}
                  <option value="__other">Other (enter manually)</option>
                </select>
                {isOtherAirport && (
                  <input name="airportName" value={formData.airportName} onChange={handleChange} className="form-control" placeholder="Enter airport name" style={{ marginTop: 8 }} required />
                )}
              </div>
            ) : (
              <input name="airportName" value={formData.airportName} onChange={handleChange} className="form-control" placeholder="Enter airport name" required />
            )}
          </div>

          <div className="form-group">
            <label>Username</label>
            <input name="username" value={formData.username} onChange={handleChange} className="form-control" required />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input name="email" value={formData.email} onChange={handleChange} className="form-control" type="email" required />
          </div>

          <div className="form-group">
            <label>Location</label>
            <input name="location" value={formData.location} onChange={handleChange} className="form-control" required />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input name="password" value={formData.password} onChange={handleChange} className="form-control" type="password" required />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="form-control" type="password" required />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Creating...' : 'Create Agent'}
          </button>
        </form>

        {result && (
          <div style={{ marginTop: '1rem' }}>
            {result.success ? (
              <div style={{ padding: '0.75rem', background: '#ecfeff', borderRadius: '6px' }}>
                <div style={{ fontWeight: 700 }}>Agent created</div>
                <div style={{ marginTop: 6 }}>Username: {result.data.agent.username}</div>
                <div>Email: {result.data.agent.email}</div>
                <div>Airport: {result.data.agent.airportName}</div>
                <div style={{ marginTop: 6, fontWeight: 700, display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div>Password: {result.password}</div>
                  <button type="button" onClick={handleCopy} className="btn-outline" style={{ padding: '0.25rem 0.6rem' }}>Copy credentials</button>
                  {copySuccess && <div style={{ marginLeft: 8, color: '#065f46', fontSize: '0.9rem' }}>{copySuccess}</div>}
                </div>
                <div style={{ marginTop: 8, color: '#475569' }}>Copy these credentials and share them securely with the agent.</div>
              </div>
            ) : (
              <div style={{ padding: '0.75rem', background: '#fff1f2', borderRadius: '6px', color: '#b91c1c' }}>{result.message}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
