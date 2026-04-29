"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';
import Navbar from '@/components/Navbar';
import { printReceiptWindow } from '@/components/PrintReceipt';

export default function CounterBooking() {
  const router = useRouter();
  const [agentData, setAgentData] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    passengerName: '',
    mobileNumber: '',
    numberOfPersons: '',
    numberOfMales: '',
    numberOfFemales: '',
    vehicleId: '',
    date: '',
    toDestination: '',
    manualFarePrice: '',
    paymentMode: 'cash'
  });
  const [lastBooking, setLastBooking] = useState(null);

  useEffect(() => {
    const token = Cookies.get('agent_token');
    const agentStr = Cookies.get('agent_data');
    if (!token || !agentStr) {
      router.push('/agent/login');
      return;
    }

    const agent = JSON.parse(agentStr);
    setAgentData(agent);

    const base = process.env.NEXT_PUBLIC_API_URL || 'https://cartaxi-backend.onrender.com';
    axios.get(`${base}/api/vehicles`)
      .then(res => {
        setVehicles(res.data);
        if (res.data.length > 0) {
          setFormData(prev => ({ ...prev, vehicleId: res.data[0]._id }));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load vehicles', err);
        setLoading(false);
      });
  }, [router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setMessage('');

    try {
      const token = Cookies.get('agent_token');
      const base = process.env.NEXT_PUBLIC_API_URL || 'https://cartaxi-backend.onrender.com';
      const res = await axios.post(`${base}/api/bookings`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const saved = res.data;
      setLastBooking(saved);
      setMessage('Booking successful! Preparing receipt...');

      printBooking(saved);

      setFormData({
        passengerName: '',
        mobileNumber: '',
        numberOfPersons: '',
        numberOfMales: '',
        numberOfFemales: '',
        vehicleId: vehicles[0]?._id || '',
        date: formData.date,
        toDestination: '',
        manualFarePrice: '',
        paymentMode: 'cash'
      });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  const printBooking = (booking) => {
    try {
      printReceiptWindow(booking, agentData, vehicles);
    } catch (e) {
      console.error('Print error', e);
      window.print();
    }
  };

  const handlePrint = () => {
    if (lastBooking) {
      printBooking(lastBooking);
      return;
    }

    const preview = {
      _id: 'Preview',
      passengerName: formData.passengerName || '',
      mobileNumber: formData.mobileNumber || '',
      numberOfPersons: formData.numberOfPersons || '',
      numberOfMales: formData.numberOfMales || '',
      numberOfFemales: formData.numberOfFemales || '',
      vehicleId: formData.vehicleId || '',
      date: formData.date || new Date().toISOString(),
      fromAirport: agentData?.airportName || '',
      toDestination: formData.toDestination || '',
      manualFarePrice: formData.manualFarePrice || '',
      paymentMode: formData.paymentMode || 'cash'
    };

    printBooking(preview);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-secondary)' }}>
      <Navbar />

      <div className="container" style={{ padding: '2rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Counter Booking</h1>
          <div style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>
            <strong>Airport:</strong> {agentData?.airportName} | <strong>Agent:</strong> {agentData?.username}
          </div>
        </div>

        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          {message && (
            <div style={{
              padding: '1rem',
              marginBottom: '1.5rem',
              backgroundColor: message.includes('success') ? '#dcfce7' : '#fee2e2',
              color: message.includes('success') ? '#166534' : '#991b1b',
              borderRadius: '0.5rem',
              textAlign: 'center'
            }}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} id="booking-form">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label>Passenger Name</label>
                <input type="text" name="passengerName" className="form-control" value={formData.passengerName} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Mobile Number</label>
                <input type="tel" name="mobileNumber" className="form-control" value={formData.mobileNumber} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Total Persons</label>
                <input type="number" name="numberOfPersons" className="form-control" value={formData.numberOfPersons} onChange={handleChange} required min="1" />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Males</label>
                  <input type="number" name="numberOfMales" className="form-control" value={formData.numberOfMales} onChange={handleChange} required min="0" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Females</label>
                  <input type="number" name="numberOfFemales" className="form-control" value={formData.numberOfFemales} onChange={handleChange} required min="0" />
                </div>
              </div>

              <div className="form-group">
                <label>Select Vehicle</label>
                <select name="vehicleId" className="form-control" value={formData.vehicleId} onChange={handleChange} required>
                  {vehicles.map(v => (
                    <option key={v._id} value={v._id}>{v.name} ({v.type})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Date &amp; Time</label>
                <input type="datetime-local" name="date" className="form-control" value={formData.date} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>From Airport</label>
                <input
                  type="text"
                  className="form-control"
                  value={agentData?.airportName}
                  readOnly
                  style={{ backgroundColor: '#f1f5f9', color: '#64748b' }}
                />
              </div>
              <div className="form-group">
                <label>To Destination</label>
                <input type="text" name="toDestination" className="form-control" value={formData.toDestination} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Manual Fare Price (&#8377;)</label>
                <input type="number" name="manualFarePrice" className="form-control" value={formData.manualFarePrice} onChange={handleChange} required min="0" />
              </div>
              <div className="form-group">
                <label>Payment Mode</label>
                <select name="paymentMode" className="form-control" value={formData.paymentMode} onChange={handleChange} required>
                  <option value="cash">Cash</option>
                  <option value="online_upi">Online (UPI)</option>
                  <option value="online_card">Online (Card)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button type="button" onClick={handlePrint} className="btn-outline" style={{ flex: 1 }}>
                🖨️ Print Details
              </button>
              <button type="submit" className="btn-primary" style={{ flex: 2 }} disabled={submitLoading}>
                {submitLoading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}