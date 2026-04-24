"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

export default function CountersPage() {
  const [counters, setCounters] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCounters = async () => {
    try {
      const token = Cookies.get('admin_token');
      const res = await axios.get('http://localhost:5000/api/counters', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCounters(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounters();
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Registered Counters / Agents</h1>

      <div className="card">
        {loading ? <p>Loading...</p> : (
          <table>
            <thead>
              <tr>
                <th>Airport Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Location</th>
                <th>Registered On</th>
              </tr>
            </thead>
            <tbody>
              {counters.map(c => (
                <tr key={c._id}>
                  <td style={{ fontWeight: 500 }}>{c.airportName}</td>
                  <td>{c.username}</td>
                  <td>{c.email}</td>
                  <td>{c.location}</td>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {counters.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center' }}>No counters registered yet</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
