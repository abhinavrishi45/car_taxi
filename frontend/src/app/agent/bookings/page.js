"use client";

import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function Page() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('agent_token');
    if (!token) {
      router.push('/agent/login');
      return;
    }
    fetchBookings(token);
  }, []);

  const fetchBookings = async (token) => {
    setLoading(true);
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || 'https://cartaxi-backend.onrender.com';
      const res = await axios.get(`${base}/api/bookings/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setBookings(sorted);
    } catch (err) {
      console.error('Failed to load bookings', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString();
  };

  const handlePrintBooking = (booking) => {
    try {
      const agentStr = Cookies.get('agent_data');
      const agentData = agentStr ? JSON.parse(agentStr) : {};

      const vehicle = (booking.vehicleId && typeof booking.vehicleId === 'object') ? booking.vehicleId : {};

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
        : (vehicle.type ? `${vehicle.type}` : '-');

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
    .brand { display: flex; align-items: center; gap: 10px; margin-bottom: 1.25rem; }
    .brand-icon { width: 36px; height: 36px; background: #e8c547; border-radius: 6px; display:flex; align-items:center; justify-content:center; font-size:18px }
    .brand-name { font-size: 20px; font-weight: 600; letter-spacing: -0.3px; color:#fff }
    .brand-tagline { font-size: 11px; color: rgba(255,255,255,0.45); letter-spacing: 1.5px; text-transform: uppercase; margin-top:1px }
    .header-meta { display:flex; justify-content:space-between; align-items:flex-end }
    .receipt-label { font-size:10px; letter-spacing:2px; text-transform:uppercase; color:rgba(255,255,255,0.45); margin-bottom:4px }
    .receipt-id { font-family: 'IBM Plex Mono', monospace; font-size:18px; font-weight:600; color:#e8c547 }
    .status-badge { background: rgba(232,197,71,0.15); border:1px solid rgba(232,197,71,0.35); color:#e8c547; font-size:10px; font-weight:600; letter-spacing:1.5px; text-transform:uppercase; padding:5px 10px; border-radius:2px }

    .route-banner { background: #f8f6f2; padding: 1.25rem 1.75rem; border-bottom:1px solid #ede9e3; display:flex; align-items:center }
    .route-point { flex:1 }
    .route-point-label { font-size:9px; letter-spacing:2px; text-transform:uppercase; color:#999; margin-bottom:4px }
    .route-point-name { font-size:14px; font-weight:600; color:#111; line-height:1.2 }
    .route-divider { display:flex; flex-direction:column; align-items:center; padding:0 0.75rem; flex-shrink:0 }
    .route-dot { width:8px; height:8px; border-radius:50%; border:2px solid #0f1923 }
    .route-line { width:1px; height:24px; background: repeating-linear-gradient(to bottom, #0f1923 0, #0f1923 4px, transparent 4px, transparent 8px); margin:3px 0 }
    .route-dot.dest { background:#e8c547; border-color:#e8c547 }

    .section { padding:1.25rem 1.75rem; border-bottom:1px solid #f0ede8 }
    .section-title { font-size:9px; letter-spacing:2px; text-transform:uppercase; color:#bbb; margin-bottom:0.875rem; font-weight:500 }

    .row { display:flex; justify-content:space-between; align-items:baseline; padding:5px 0 }
    .row + .row { border-top:1px solid #f5f3f0 }
    .row-label { font-size:12px; color:#888; font-weight:400 }
    .row-value { font-size:13px; color:#1a1a1a; font-weight:500; text-align:right; max-width:55% }

    .passenger-block { display:flex; align-items:center; gap:12px; padding-bottom:0.75rem; margin-bottom:0.75rem; border-bottom:1px solid #f0ede8 }
    .avatar { width:42px; height:42px; border-radius:50%; background:#0f1923; color:#e8c547; font-size:14px; font-weight:600; display:flex; align-items:center; justify-content:center }
    .passenger-name { font-size:15px; font-weight:600; color:#111 }
    .passenger-mobile { font-size:12px; color:#888; margin-top:2px; font-family: 'IBM Plex Mono', monospace }
    .pax-pills { display:flex; gap:6px; margin-top:10px; flex-wrap:wrap }
    .pill { font-size:11px; font-weight:500; padding:3px 10px; border-radius:20px; border:1px solid }
    .pill-total { background:#f0ede8; border-color:#ddd; color:#444 }
    .pill-male { background:#e8f0fb; border-color:#c5d9f5; color:#1e5cb3 }
    .pill-female { background:#fce8f4; border-color:#f5c5e3; color:#a3205c }

    .fare-block { background:#0f1923; margin:0 1.75rem 1.25rem; border-radius:4px; padding:1rem 1.25rem; display:flex; justify-content:space-between; align-items:center }
    .fare-label { font-size:11px; letter-spacing:1.5px; text-transform:uppercase; color:rgba(255,255,255,0.45); margin-bottom:4px }
    .fare-amount { font-size:28px; font-weight:600; color:#fff }
    .payment-mode { text-align:right }
    .payment-icon { width:36px; height:36px; background: rgba(232,197,71,0.15); border:1px solid rgba(232,197,71,0.3); border-radius:6px; display:flex; align-items:center; justify-content:center; margin-left:auto; margin-bottom:5px; font-size:16px }
    .payment-label { font-size:11px; color:rgba(255,255,255,0.55) }
    .payment-value { font-size:12px; font-weight:600; color:#e8c547 }

    .tear-line { display:flex; align-items:center; gap:8px; padding:0 1.75rem; margin:0.5rem 0 }
    .tear-segment { flex:1; border-top:1px dashed #ddd }
    .tear-scissors { font-size:14px; color:#ccc; transform: rotate(-90deg); display:inline-block }

    .footer { padding:1rem 1.75rem; background:#f8f6f2; border-top:1px dashed #e0dcd6; display:flex; justify-content:space-between; align-items:center }
    .footer-agent { font-size:11px; color:#888 }
    .footer-agent strong { color:#444; font-weight:600 }
    .footer-printed { font-size:10px; color:#bbb; font-family: 'IBM Plex Mono', monospace; text-align:right }

    @media print {
      body { background:#fff; padding:0; display:block }
      .receipt { box-shadow:none; width:100%; max-width:480px }
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

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <section style={{ maxWidth: '1300px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1 style={{ margin: 0 }}>My Bookings</h1>
          <div>
            <Link href="/agent/counter" className="btn-outline" style={{ marginRight: 8 }}>New Booking</Link>
          </div>
        </div>

        {loading ? (
          <div>Loading bookings…</div>
        ) : bookings.length === 0 ? (
          <div>No bookings found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #e6e6e6' }}>
                  <th style={{ padding: '8px' }}>Booking ID</th>
                  <th style={{ padding: '8px' }}>Passenger</th>
                  <th style={{ padding: '8px' }}>Mobile</th>
                  <th style={{ padding: '8px' }}>Vehicle</th>
                  <th style={{ padding: '8px' }}>Date & Time</th>
                  <th style={{ padding: '8px' }}>From</th>
                  <th style={{ padding: '8px' }}>To</th>
                  <th style={{ padding: '8px' }}>Pax</th>
                  <th style={{ padding: '8px' }}>Fare (₹)</th>
                  <th style={{ padding: '8px' }}>Payment</th>
                  <th style={{ padding: '8px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px', verticalAlign: 'top' }}>{b._id}</td>
                    <td style={{ padding: '10px', verticalAlign: 'top' }}>{b.passengerName}</td>
                    <td style={{ padding: '10px', verticalAlign: 'top' }}>{b.mobileNumber}</td>
                    <td style={{ padding: '10px', verticalAlign: 'top' }}>{(b.vehicleId && (b.vehicleId.name || b.vehicleId.type)) || '-'}</td>
                    <td style={{ padding: '10px', verticalAlign: 'top' }}>{formatDateTime(b.date)}</td>
                    <td style={{ padding: '10px', verticalAlign: 'top' }}>{b.fromAirport}</td>
                    <td style={{ padding: '10px', verticalAlign: 'top' }}>{b.toDestination}</td>
                    <td style={{ padding: '10px', verticalAlign: 'top' }}>{b.numberOfPersons}</td>
                    <td style={{ padding: '10px', verticalAlign: 'top', fontWeight: 700 }}>₹{b.manualFarePrice}</td>
                    <td style={{ padding: '10px', verticalAlign: 'top' }}>{b.paymentMode}</td>
                    <td style={{ padding: '10px', verticalAlign: 'top' }}>
                      <button onClick={() => handlePrintBooking(b)} className="btn-outline">Print</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
