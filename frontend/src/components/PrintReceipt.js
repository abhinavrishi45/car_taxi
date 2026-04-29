"use client";

import React from 'react';
import Image from "next/image";

export default function PrintReceipt({ booking }) {
  const defaultBooking = {
    id: 'CTX-0001',
    date: new Date().toLocaleString(),
    passenger: 'Passenger Name',
    flight: 'Flight / Ref',
    pickup: 'Terminal 1',
    dropoff: 'Hotel / Address',
    vehicle: 'Sedan',
    fare: 45.0,
    agent: 'Counter A',
    reference: 'REF123456'
  };

  const b = booking || defaultBooking;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial', color: '#0f172a' }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          @page { margin: 8mm; size: auto; }
          body { background: white !important; }
          .receipt { box-shadow: none !important; border-radius: 0 !important; border: none !important; margin-top: 12mm !important; }
        }
        .receipt { background: #fff; padding: 26px; max-width: 820px; margin: 24px auto 0; border: 1px solid #eef2f7; border-radius: 10px; }
        .accent { height: 6px; background: linear-gradient(90deg, #06b6d4, #3b82f6); border-radius: 4px; margin-bottom: 14px; }
        .header { text-align: center; margin-bottom: 6px; }
        .company { font-weight: 900; font-size: 2rem; color: #0f172a; letter-spacing: -0.6px; }
        .tagline { color: #475569; font-size: 0.95rem; margin-top: 6px; }
        .contact { margin-top: 6px; color: #6b7280; font-size: 0.92rem; }
        .meta { text-align: center; margin-top: 8px; color: #6b7280; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 14px; }
        .box { padding: 12px; background: #fbfdff; border-radius: 8px; border: 1px solid #f1f5f9; }
        .label { font-size: 0.85rem; color: #6b7280; margin-bottom: 6px; display:block; }
        .value { font-weight: 700; color: #0f172a; }
        .line { height: 1px; background: linear-gradient(90deg, transparent, #e6e6e6, transparent); margin: 14px 0; }
        .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .table td { padding: 10px 6px; border-bottom: 1px dashed #e6e6e6; }
        .total { font-weight: 800; font-size: 1.1rem; }
        .footer { margin-top: 18px; font-size: 0.95rem; color: #475569; text-align: center; }
        .print-btn { display:inline-block; padding: 8px 14px; background: #2563eb; color: white; border-radius: 6px; border: none; cursor: pointer; font-weight:600; }
      `}</style>

      <div className="receipt" role="article" aria-label="CarTaxi Receipt">

        <div className="accent" />

        <div className="header">
          <Image src="/car_taxi/logo2.jpeg" alt="Cartaxi Logo" width={128} height={64} />
          <div className="tagline">Premium Airport Transfers</div>
          <div className="contact">support@cartaxi.com • +1-823-4567</div>
        </div>

        <div className="meta">{b.date} • Ref: {b.reference || b.id}</div>

        <div className="line" />

        <div className="grid">
          <div className="box">
            <span className="label">Passenger</span>
            <div className="value">{b.passenger}</div>
            <div style={{ color: '#475569', marginTop: 6 }}>{b.flight}</div>
          </div>
          <div className="box">
            <span className="label">Pickup / Dropoff</span>
            <div className="value">{b.pickup}</div>
            <div style={{ color: '#475569', marginTop: 6 }}>{b.dropoff}</div>
          </div>
          <div className="box">
            <span className="label">Agent</span>
            <div className="value">{b.agent}</div>
          </div>
          <div className="box">
            <span className="label">Vehicle</span>
            <div className="value">{b.vehicle}</div>
          </div>
        </div>

        <table className="table">
          <tbody>
            <tr>
              <td style={{ fontWeight: 600 }}>Reference</td>
              <td style={{ textAlign: 'right' }}>{b.reference || b.id}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 600 }}>Date</td>
              <td style={{ textAlign: 'right' }}>{b.date}</td>
            </tr>
            <tr>
              <td className="total">Total Paid</td>
              <td style={{ textAlign: 'right' }} className="total">${Number(b.fare).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div className="footer">Thank you for choosing CarTaxi — safe travels.</div>

        <div style={{ marginTop: 14, textAlign: 'center' }} className="no-print">
          <button onClick={handlePrint} className="print-btn" aria-label="Print Receipt">Print</button>
        </div>

      </div>
    </div>
  );

}

export function printReceiptWindow(booking = {}, agentData = {}, vehicles = []) {
  try {
    const vehicle = vehicles.find(
      v => v._id === booking.vehicleId || (booking.vehicleId && v._id === booking.vehicleId._id)
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
      ? (booking._id || '').toString().slice(-8).toUpperCase()
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
  <title>Booking Receipt — ${shortId}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'IBM Plex Sans', sans-serif; background: #f0ede8; min-height: 100vh; display: flex; align-items: flex-start; justify-content: center; padding: 2.5rem 1rem; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .receipt { width: 480px; background: #fff; border-radius: 2px; overflow: hidden; box-shadow: 0 4px 40px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08); }
    .header { background: #0f1923; color: #fff; padding: 1.75rem 1.75rem 1.5rem; position: relative; overflow: hidden; }
    .brand { display: flex; align-items: center; gap: 10px; margin-bottom: 1.25rem; }
    .brand-name { font-size: 20px; font-weight: 600; color: #fff; }
    .brand-tagline { font-size: 11px; color: rgba(255,255,255,0.45); letter-spacing: 1.5px; text-transform: uppercase; margin-top: 1px; }
    .header-meta { display: flex; justify-content: space-between; align-items: flex-end; }
    .receipt-label { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.45); margin-bottom: 4px; }
    .receipt-id { font-family: 'IBM Plex Mono', monospace; font-size: 18px; font-weight: 600; color: #e8c547; letter-spacing: 2px; }
    .status-badge { background: rgba(232,197,71,0.15); border: 1px solid rgba(232,197,71,0.35); color: #e8c547; font-size: 10px; font-weight: 600; padding: 5px 10px; border-radius: 2px; }
    .route-banner { background: #f8f6f2; padding: 1.25rem 1.75rem; border-bottom: 1px solid #ede9e3; display: flex; align-items: center; }
    .route-point { flex: 1; }
    .route-point-label { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #999; margin-bottom: 4px; }
    .route-point-name { font-size: 14px; font-weight: 600; color: #111; line-height: 1.2; }
    .route-divider { display: flex; flex-direction: column; align-items: center; padding: 0 0.75rem; flex-shrink: 0; }
    .route-dot { width: 8px; height: 8px; border-radius: 50%; border: 2px solid #0f1923; }
    .route-line { width: 1px; height: 24px; background: repeating-linear-gradient(to bottom, #0f1923 0, #0f1923 4px, transparent 4px, transparent 8px); margin: 3px 0; }
    .route-dot.dest { background: #e8c547; border-color: #e8c547; }
    .section { padding: 1.25rem 1.75rem; border-bottom: 1px solid #f0ede8; }
    .section-title { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #bbb; margin-bottom: 0.875rem; font-weight: 500; }
    .row { display: flex; justify-content: space-between; align-items: baseline; padding: 5px 0; }
    .row + .row { border-top: 1px solid #f5f3f0; }
    .row-label { font-size: 12px; color: #888; font-weight: 400; }
    .row-value { font-size: 13px; color: #1a1a1a; font-weight: 500; text-align: right; max-width: 55%; }
    .passenger-block { display: flex; align-items: center; gap: 12px; padding-bottom: 0.75rem; margin-bottom: 0.75rem; border-bottom: 1px solid #f0ede8; }
    .avatar { width: 42px; height: 42px; border-radius: 50%; background: #0f1923; color: #e8c547; font-size: 14px; font-weight: 600; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .fare-block { background: #0f1923; margin: 0 1.75rem 1.25rem; border-radius: 4px; padding: 1rem 1.25rem; display: flex; justify-content: space-between; align-items: center; }
    .fare-label { font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.45); margin-bottom: 4px; }
    .fare-amount { font-size: 28px; font-weight: 600; color: #fff; }
    .payment-mode { text-align: right; }
    .payment-icon { width: 36px; height: 36px; background: rgba(232,197,71,0.15); border: 1px solid rgba(232,197,71,0.3);order-radius: 6px; display: flex; align-items: center; justify-content: center; margin-left: auto; margin-bottom: 5px; font-size: 16px; }
     .payment-value{ color: #ffffff; font-weight: 600; font-size: 11px; margin-top: 4px; }
    .tear-line { display: flex; align-items: center; gap: 8px; padding: 0 1.75rem; margin: 0.5rem 0; }
    .tear-segment { flex: 1; border-top: 1px dashed #ddd; }
    .tear-scissors { font-size: 14px; color: #ccc; transform: rotate(-90deg); display: inline-block; }
    .footer { padding: 1rem 1.75rem; background: #f8f6f2; border-top: 1px dashed #e0dcd6; display: flex; justify-content: space-between; align-items: center; }
    .footer-agent { font-size: 11px; color: #888; }
    .footer-printed { font-size: 10px; color: #bbb; font-family: 'IBM Plex Mono', monospace; text-align: right; }
    @media print { body { background: #fff; padding: 0; display: block; } .receipt { box-shadow: none; width: 100%; max-width: 480px; } }
  </style>
</head>
<body>
<div class="receipt">
  <div class="header">
    <div class="brand">
      <img src="/car_taxi/logo2.jpeg" alt="Cartaxi Logo" style="width:66px;height:36px;object-fit:cover;border-radius:4px;margin-right:8px;" />
      <div>
        <div class="brand-name">Cartaxi</div>
        <div class="brand-tagline">An Achal International Service</div>
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
      <div class="pill pill-total">&#128101; ${booking.numberOfPersons} Total</div>
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
      <div class="payment-value">Payment</div>
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
    setTimeout(() => printWindow.print(), 800);
  } catch (e) {
    console.error('Print error', e);
    window.print();
  }
}
