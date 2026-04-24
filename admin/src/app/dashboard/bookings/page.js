"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { format } from 'date-fns';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');

  const fetchBookings = async () => {
    try {
      const token = Cookies.get('admin_token');
      const res = await axios.get('http://localhost:5000/api/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = filterDate 
    ? bookings.filter(b => b.date.startsWith(filterDate))
    : bookings;

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>All Bookings</h1>
      
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label style={{ fontWeight: 500 }}>Filter by Date:</label>
          <input 
            type="date" 
            className="form-control" 
            style={{ width: 'auto' }}
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
          <button onClick={() => setFilterDate('')} className="btn-outline">Clear Filter</button>
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        {loading ? <p>Loading...</p> : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Passenger</th>
                <th>Mobile</th>
                <th>Route</th>
                <th>Vehicle</th>
                <th>Fare</th>
                <th>Agent/Airport</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map(b => (
                <tr key={b._id}>
                  <td>{format(new Date(b.date), 'dd MMM yyyy, HH:mm')}</td>
                  <td>{b.passengerName} <br/><small>{b.numberOfPersons} pax</small></td>
                  <td>{b.mobileNumber}</td>
                  <td>{b.fromAirport} ➡️ {b.toDestination}</td>
                  <td>{b.vehicleId?.name} ({b.vehicleId?.type})</td>
                  <td>₹{b.manualFarePrice} <br/><small>{b.paymentMode.replace('_', ' ')}</small></td>
                  <td>{b.agentId?.airportName} <br/><small>{b.agentId?.username}</small></td>
                </tr>
              ))}
              {filteredBookings.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center' }}>No bookings found</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
