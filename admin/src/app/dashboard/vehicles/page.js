"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', type: '' });
  const [error, setError] = useState('');

  const fetchVehicles = async () => {
    try {
      const token = Cookies.get('admin_token');
      const base = process.env.NEXT_PUBLIC_API_URL || 'https://cartaxi-backend.onrender.com';
      const res = await axios.get(`${base}/api/vehicles/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVehicles(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const token = Cookies.get('admin_token');
      await axios.post(`${base}/api/vehicles`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData({ name: '', type: '' });
      fetchVehicles();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add vehicle');
    }
  };

  const handleRemove = async (id) => {
    if (!confirm('Are you sure you want to deactivate this vehicle?')) return;
    try {
      const token = Cookies.get('admin_token');
      await axios.delete(`${base}/api/vehicles/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchVehicles();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Vehicles Management</h1>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Add New Vehicle</h2>
        {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>Vehicle Name (e.g. Innova)</label>
            <input type="text" name="name" className="form-control" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
          </div>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>Type (e.g. SUV)</label>
            <input type="text" name="type" className="form-control" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} required />
          </div>
          <button type="submit" className="btn-primary">Add Vehicle</button>
        </form>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Vehicle List</h2>
        {loading ? <p>Loading...</p> : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map(v => (
                <tr key={v._id}>
                  <td>{v.name}</td>
                  <td>{v.type}</td>
                  <td>{v.isActive ? <span style={{ color: 'green' }}>Active</span> : <span style={{ color: 'red' }}>Inactive</span>}</td>
                  <td>
                    {v.isActive && (
                      <button onClick={() => handleRemove(v._id)} className="btn-danger">Remove</button>
                    )}
                  </td>
                </tr>
              ))}
              {vehicles.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center' }}>No vehicles found</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
