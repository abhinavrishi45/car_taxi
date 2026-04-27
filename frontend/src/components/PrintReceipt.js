"use client";

import React from 'react';

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
          <div className="company">CarTaxi</div>
          <div className="tagline">Premium Airport Transfers</div>
          <div className="contact">support@cartaxi.com • +1-800-123-4567</div>
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
