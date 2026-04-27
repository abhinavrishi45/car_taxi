"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';
import Navbar from '@/components/Navbar';

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
      const vehicle = vehicles.find(
        v => v._id === booking.vehicleId ||
        (booking.vehicleId && v._id === booking.vehicleId._id)
      ) || {};

      const paymentLabels = {
        cash: 'Cash',
        online_upi: 'Online — UPI',
        online_card: 'Online — Card'
      };

      const now = new Date();
      const printedAt = now.toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
      });

      const bookingDate = booking.date
        ? new Date(booking.date).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
          })
        : '—';

      const shortId = booking._id !== 'Preview'
        ? booking._id.toString().slice(-8).toUpperCase()
        : 'PREVIEW';

      const paymentIcon =
        booking.paymentMode === 'cash' ? '&#128181;' :
        booking.paymentMode === 'online_upi' ? '&#128241;' : '&#128179;';

      const initials = (booking.passengerName || 'P')
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

      const maleCount = parseInt(booking.numberOfMales) || 0;
      const femaleCount = parseInt(booking.numberOfFemales) || 0;

      const malePill = maleCount > 0
        ? `<div class="pill pill-male">&#9794; ${maleCount} male${maleCount > 1 ? 's' : ''}</div>`
        : '';
      const femalePill = femaleCount > 0
        ? `<div class="pill pill-female">&#9792; ${femaleCount} female${femaleCount > 1 ? 's' : ''}</div>`
        : '';

      const vehicleDisplay = vehicle.name
        ? `${vehicle.name}${vehicle.type ? ` <span style="color:#aaa;font-weight:400">(${vehicle.type})</span>` : ''}`
        : '—';

      const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Booking Receipt &mdash; ${shortId}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'IBM Plex Sans', sans-serif;
      background: #f0ede8;
      min-height: 100vh;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: 2.5rem 1rem;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .receipt {
      width: 480px;
      background: #fff;
      border-radius: 2px;
      overflow: hidden;
      box-shadow: 0 4px 40px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08);
    }

    /* Header */
    .header {
      background: #0f1923;
      color: #fff;
      padding: 1.75rem 1.75rem 1.5rem;
      position: relative;
      overflow: hidden;
    }
    .header::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0; right: 0;
      height: 8px;
      background: repeating-linear-gradient(90deg, #fff 0, #fff 12px, transparent 12px, transparent 20px);
      opacity: 0.08;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 1.25rem;
    }
    .brand-icon {
      width: 36px;
      height: 36px;
      background: #e8c547;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }
    .brand-name {
      font-size: 20px;
      font-weight: 600;
      letter-spacing: -0.3px;
      color: #fff;
    }
    .brand-tagline {
      font-size: 11px;
      color: rgba(255,255,255,0.45);
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-top: 1px;
    }
    .header-meta {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .receipt-label {
      font-size: 10px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: rgba(255,255,255,0.45);
      margin-bottom: 4px;
    }
    .receipt-id {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 18px;
      font-weight: 600;
      color: #e8c547;
      letter-spacing: 2px;
    }
    .status-badge {
      background: rgba(232,197,71,0.15);
      border: 1px solid rgba(232,197,71,0.35);
      color: #e8c547;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      padding: 5px 10px;
      border-radius: 2px;
    }

    /* Route Banner */
    .route-banner {
      background: #f8f6f2;
      padding: 1.25rem 1.75rem;
      border-bottom: 1px solid #ede9e3;
      display: flex;
      align-items: center;
    }
    .route-point { flex: 1; }
    .route-point-label {
      font-size: 9px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #999;
      margin-bottom: 4px;
    }
    .route-point-name {
      font-size: 14px;
      font-weight: 600;
      color: #111;
      line-height: 1.2;
    }
    .route-divider {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0 0.75rem;
      flex-shrink: 0;
    }
    .route-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      border: 2px solid #0f1923;
    }
    .route-line {
      width: 1px;
      height: 24px;
      background: repeating-linear-gradient(to bottom, #0f1923 0, #0f1923 4px, transparent 4px, transparent 8px);
      margin: 3px 0;
    }
    .route-dot.dest {
      background: #e8c547;
      border-color: #e8c547;
    }

    /* Sections */
    .section {
      padding: 1.25rem 1.75rem;
      border-bottom: 1px solid #f0ede8;
    }
    .section:last-child { border-bottom: none; }
    .section-title {
      font-size: 9px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #bbb;
      margin-bottom: 0.875rem;
      font-weight: 500;
    }

    /* Rows */
    .row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding: 5px 0;
    }
    .row + .row { border-top: 1px solid #f5f3f0; }
    .row-label {
      font-size: 12px;
      color: #888;
      font-weight: 400;
    }
    .row-value {
      font-size: 13px;
      color: #1a1a1a;
      font-weight: 500;
      text-align: right;
      max-width: 55%;
    }

    /* Passenger */
    .passenger-block {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-bottom: 0.75rem;
      margin-bottom: 0.75rem;
      border-bottom: 1px solid #f0ede8;
    }
    .avatar {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: #0f1923;
      color: #e8c547;
      font-size: 14px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      letter-spacing: 0.5px;
    }
    .passenger-name {
      font-size: 15px;
      font-weight: 600;
      color: #111;
      line-height: 1.2;
    }
    .passenger-mobile {
      font-size: 12px;
      color: #888;
      margin-top: 2px;
      font-family: 'IBM Plex Mono', monospace;
    }
    .pax-pills {
      display: flex;
      gap: 6px;
      margin-top: 10px;
      flex-wrap: wrap;
    }
    .pill {
      font-size: 11px;
      font-weight: 500;
      padding: 3px 10px;
      border-radius: 20px;
      border: 1px solid;
    }
    .pill-total { background: #f0ede8; border-color: #ddd; color: #444; }
    .pill-male  { background: #e8f0fb; border-color: #c5d9f5; color: #1e5cb3; }
    .pill-female { background: #fce8f4; border-color: #f5c5e3; color: #a3205c; }

    /* Fare */
    .fare-block {
      background: #0f1923;
      margin: 0 1.75rem 1.25rem;
      border-radius: 4px;
      padding: 1rem 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .fare-label {
      font-size: 11px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: rgba(255,255,255,0.45);
      margin-bottom: 4px;
    }
    .fare-amount {
      font-size: 28px;
      font-weight: 600;
      color: #fff;
      letter-spacing: -0.5px;
    }
    .fare-amount span {
      font-size: 16px;
      font-weight: 300;
      color: rgba(255,255,255,0.55);
      margin-right: 2px;
    }
    .payment-mode { text-align: right; }
    .payment-icon {
      width: 36px;
      height: 36px;
      background: rgba(232,197,71,0.15);
      border: 1px solid rgba(232,197,71,0.3);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: auto;
      margin-bottom: 5px;
      font-size: 16px;
    }
    .payment-label {
      font-size: 11px;
      color: rgba(255,255,255,0.55);
    }
    .payment-value {
      font-size: 12px;
      font-weight: 600;
      color: #e8c547;
    }

    /* Tear line */
    .tear-line {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 1.75rem;
      margin: 0.5rem 0;
    }
    .tear-segment {
      flex: 1;
      border-top: 1px dashed #ddd;
    }
    .tear-scissors {
      font-size: 14px;
      color: #ccc;
      transform: rotate(-90deg);
      display: inline-block;
    }

    /* Footer */
    .footer {
      padding: 1rem 1.75rem;
      background: #f8f6f2;
      border-top: 1px dashed #e0dcd6;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer-agent { font-size: 11px; color: #888; }
    .footer-agent strong { color: #444; font-weight: 600; }
    .footer-printed {
      font-size: 10px;
      color: #bbb;
      font-family: 'IBM Plex Mono', monospace;
      text-align: right;
    }

    @media print {
      body { background: #fff; padding: 0; display: block; }
      .receipt { box-shadow: none; width: 100%; max-width: 480px; }
    }
  </style>
</head>
<body>
<div class="receipt">

  <div class="header">
    <div class="brand">
      <div class="brand-icon">&#128662;</div>
      <div>
        <div class="brand-name">Cartaxi</div>
        <div class="brand-tagline">Airport Transfer Service</div>
      </div>
    </div>
    <div class="header-meta">
      <div>
        <div class="receipt-label">Booking ID</div>
        <div class="receipt-id">#${shortId}</div>
      </div>
      <div class="status-badge">Confirmed</div>
    </div>
  </div>

  <div class="route-banner">
    <div class="route-point">
      <div class="route-point-label">From</div>
      <div class="route-point-name">${booking.fromAirport || agentData?.airportName || '&mdash;'}</div>
    </div>
    <div class="route-divider">
      <div class="route-dot"></div>
      <div class="route-line"></div>
      <div class="route-dot dest"></div>
    </div>
    <div class="route-point" style="text-align:right">
      <div class="route-point-label">To</div>
      <div class="route-point-name">${booking.toDestination || '&mdash;'}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Passenger Details</div>
    <div class="passenger-block">
      <div class="avatar">${initials}</div>
      <div>
        <div class="passenger-name">${booking.passengerName || '&mdash;'}</div>
        <div class="passenger-mobile">${booking.mobileNumber || '&mdash;'}</div>
      </div>
    </div>
    <div class="pax-pills">
      <div class="pill pill-total">&#128101; ${booking.numberOfPersons} total</div>
      ${malePill}
      ${femalePill}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Trip Details</div>
    <div class="row">
      <span class="row-label">Date &amp; Time</span>
      <span class="row-value">${bookingDate}</span>
    </div>
    <div class="row">
      <span class="row-label">Vehicle</span>
      <span class="row-value">${vehicleDisplay}</span>
    </div>
    <div class="row">
      <span class="row-label">Agent</span>
      <span class="row-value">${agentData?.username || '&mdash;'}</span>
    </div>
    <div class="row">
      <span class="row-label">Airport</span>
      <span class="row-value">${agentData?.airportName || '&mdash;'}</span>
    </div>
  </div>

  <div class="fare-block">
    <div>
      <div class="fare-label">Total Fare</div>
      <div class="fare-amount"><span>&#8377;</span>${booking.manualFarePrice || '0'}</div>
    </div>
    <div class="payment-mode">
      <div class="payment-icon">${paymentIcon}</div>
      <div class="payment-label">Payment</div>
      <div class="payment-value">${paymentLabels[booking.paymentMode] || booking.paymentMode}</div>
    </div>
  </div>

  <div class="tear-line">
    <div class="tear-segment"></div>
    <div class="tear-scissors">&#9986;</div>
    <div class="tear-segment"></div>
  </div>

  <div class="footer">
    <div class="footer-agent">
      <strong>${agentData?.airportName || ''}</strong><br>
      Issued by ${agentData?.username || ''}
    </div>
    <div class="footer-printed">
      Printed<br>${printedAt}
    </div>
  </div>

</div>
</body>
</html>`;

      const printWindow = window.open('', '_blank', 'width=680,height=960');
      if (!printWindow) {
        alert('Please allow popups to print the receipt.');
        return;
      }
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 800);
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