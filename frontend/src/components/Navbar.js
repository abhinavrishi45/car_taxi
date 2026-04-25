"use client";

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function Navbar() {
  const [isAgent, setIsAgent] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [showBookings, setShowBookings] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('agent_token');
    if (token) {
      setIsAgent(true);
      fetchBookings(token);
    }
  }, []);

  useEffect(() => {
    const onDocClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowBookings(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const fetchBookings = async (token) => {
    setLoadingBookings(true);
    try {
      const res = await axios.get('https://cartaxi-backend.onrender.com/api/bookings/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setBookings(sorted);
    } catch (err) {
      console.error('Failed to load bookings', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleLogout = () => {
    Cookies.remove('agent_token');
    setIsAgent(false);
    router.push('/');
  };

  const formatDateTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString();
  };

  const handlePrintBooking = (booking) => {
    try {
      const agentStr = Cookies.get('agent_data');
      const agent = agentStr ? JSON.parse(agentStr) : {};
      const vehicle = booking.vehicleId || {};
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>Booking Receipt</title><style>
        body{font-family:Arial,Helvetica,sans-serif;color:#111}
        .receipt{max-width:680px;margin:0 auto;border:1px solid #e5e7eb;padding:20px;border-radius:8px}
        h2{margin:0 0 8px}
        .row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dashed #e6e6e6}
        .label{color:#374151}
        .value{font-weight:600}
        .footer{margin-top:12px;font-size:12px;color:#6b7280}
      </style></head><body>
        <div class="receipt">
          <h2>Cartaxi — Booking Receipt</h2>
          <div class="row"><div class="label">Booking ID</div><div class="value">${booking._id}</div></div>
          <div class="row"><div class="label">Passenger</div><div class="value">${booking.passengerName}</div></div>
          <div class="row"><div class="label">Mobile</div><div class="value">${booking.mobileNumber}</div></div>
          <div class="row"><div class="label">Passengers (Total)</div><div class="value">${booking.numberOfPersons}</div></div>
          <div class="row"><div class="label">Vehicle</div><div class="value">${vehicle.name || ''} ${vehicle.type ? `(${vehicle.type})` : ''}</div></div>
          <div class="row"><div class="label">Date & Time</div><div class="value">${formatDateTime(booking.date)}</div></div>
          <div class="row"><div class="label">From</div><div class="value">${booking.fromAirport}</div></div>
          <div class="row"><div class="label">To</div><div class="value">${booking.toDestination}</div></div>
          <div class="row"><div class="label">Fare (₹)</div><div class="value">${booking.manualFarePrice}</div></div>
          <div class="row"><div class="label">Payment</div><div class="value">${booking.paymentMode}</div></div>
          <div class="footer">Agent: ${agent.username || ''} | Airport: ${agent.airportName || ''}</div>
        </div>
      </body></html>`;

      const printWindow = window.open('', '_blank', 'width=700,height=900');
      if (!printWindow) {
        alert('Please allow popups to print the receipt.');
        return;
      }
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    } catch (e) {
      console.error('Print error', e);
      window.print();
    }
  };

  return (
    <nav style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)',
      backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)',
      position: 'sticky', top: 0, zIndex: 100
    }}>
      <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
        Cartaxi
      </Link>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        {isAgent ? (
          <>
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button onClick={() => setShowBookings(s => !s)} className="btn-outline" style={{ padding: '0.5rem 1rem' }}>
                Bookings {bookings.length > 0 && <span style={{ marginLeft: 6, fontWeight: 600 }}>({bookings.length})</span>}
              </button>

              {showBookings && (
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: '360px', background: '#fff', border: '1px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', borderRadius: '8px', padding: '6px', zIndex: 200 }}>
                  {loadingBookings ? (
                    <div style={{ padding: '12px' }}>Loading...</div>
                  ) : bookings.length === 0 ? (
                    <div style={{ padding: '12px' }}>No recent bookings</div>
                  ) : (
                    bookings.slice(0, 5).map((b) => (
                      <div key={b._id} style={{ padding: '8px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ maxWidth: '70%' }}>
                          <div style={{ fontWeight: 600 }}>{b.passengerName}</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>{formatDateTime(b.date)} • {b.toDestination}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700 }}>₹{b.manualFarePrice}</div>
                          <button onClick={() => handlePrintBooking(b)} className="btn-outline" style={{ marginTop: '6px', fontSize: '12px' }}>Print</button>
                        </div>
                      </div>
                    ))
                  )}

                  <div style={{ padding: '8px', textAlign: 'center' }}>
                    <Link href="/agent/counter" className="btn-primary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.9rem' }}>View All</Link>
                  </div>
                </div>
              )}
            </div>

            <button onClick={handleLogout} className="btn-primary" style={{ padding: '0.5rem 1rem' }}>Logout</button>
          </>
        ) : (
          <>
            <Link href="/agent/login" className="btn-outline" style={{ padding: '0.5rem 1rem' }}>Agent Login</Link>
          </>
        )}
      </div>
    </nav>
  );
}
