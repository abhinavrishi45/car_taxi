"use client";

import { useState } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';

export default function AgentsPage() {
  const [formData, setFormData] = useState({ airportName: '', username: '', email: '', location: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const token = Cookies.get('admin_token');
      const res = await axios.post('https://cartaxi-backend.onrender.com/api/auth/admin/agents', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // keep the provided password to show to admin after creation
      const providedPassword = formData.password;
      setResult({ success: true, data: res.data, password: providedPassword });
      setFormData({ airportName: '', username: '', email: '', location: '', password: '' });
    } catch (err) {
      setResult({ success: false, message: err.response?.data?.message || 'Failed to create agent' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Create Agent</h1>

      <div className="card" style={{ maxWidth: '680px' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Airport Name</label>
            <input name="airportName" value={formData.airportName} onChange={handleChange} className="form-control" required />
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
                <div style={{ marginTop: 6, fontWeight: 700 }}>Password: {result.password}</div>
                <div style={{ marginTop: 8, color: '#475569' }}>Copy this password and share it securely with the agent.</div>
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
