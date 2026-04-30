"use client";

import { useEffect, useRef, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter  } from 'next/navigation';
import { useMemo } from 'react';
import gsap from 'gsap';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const heroRef = useRef(null);
  const [agent, setAgent] = useState(null);
  const textRef = useRef(null);
  const cardsRef = useRef([]);
  useEffect(() => {
    // If agent is logged in (agent_token + agent_data), show inline dashboard
    const token = Cookies.get('agent_token');
    const agentStr = Cookies.get('agent_data');
    if (token && agentStr) {
      try { setAgent(JSON.parse(agentStr)); } catch (e) { setAgent(null); }
      return; // skip hero animations
    }

    // otherwise continue with hero animations
    const ctx = gsap.context(() => {
      // Hero Animation
      gsap.fromTo(textRef.current.children,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "power3.out" }
      );

      // Cards Animation
      gsap.fromTo(cardsRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, delay: 0.5, ease: "power3.out" }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const addToRefs = (el) => {
    if (el && !cardsRef.current.includes(el)) {
      cardsRef.current.push(el);
    }
  };
   const mapRef = useRef(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [publicLocations, setPublicLocations] = useState(null);

  const mapLocations = useMemo(() => {
    // Allow backend to provide `serviceLocations` as JSON; fallback to defaults
    const defaults = [
      { name: "Mumbai, India", lat: 19.0760, lng: 72.8777 },
      { name: "Singapore", lat: 1.3521, lng: 103.8198 },
      { name: "Dubai, UAE", lat: 25.2048, lng: 55.2708 },
      { name: "Rotterdam, NL", lat: 51.9225, lng: 4.4791 },
      { name: "London, UK", lat: 51.5074, lng: -0.1278 },
      { name: "Shanghai, CN", lat: 31.2304, lng: 121.4737 },
      { name: "New York, USA", lat: 40.7128, lng: -74.0060 },
      { name: "Santos, BR", lat: -23.9540, lng: -46.3336 },
      { name: "Los Angeles, USA", lat: 34.0522, lng: -118.2437 },
    ];
    if (apiData?.serviceLocations) return safeParse(apiData.serviceLocations, defaults);
    if (publicLocations && Array.isArray(publicLocations)) return safeParse(publicLocations, defaults);
    return defaults;
  }, [apiData?.serviceLocations, publicLocations]);

  // fetch public locations if not provided in frontpage data
  useEffect(() => {
    if (apiData?.serviceLocations) return;
    const fetchPublic = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/locations/public`);
        if (res.ok) {
          const data = await res.json();
          setPublicLocations(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        // ignore silently
        console.error('Failed to fetch public locations', err);
      }
    };
    fetchPublic();
  }, [apiData?.serviceLocations]);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      // If no key, skip loading map gracefully
      console.warn('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY not set — skipping Google Maps load');
      return;
    }

    let mapInstance = null;
    const markers = [];

    const loadScript = () => new Promise((resolve, reject) => {
      if (typeof window === 'undefined') return reject(new Error('no window'));
      if (window.google && window.google.maps) return resolve(window.google);
      const s = document.createElement('script');
      s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly`;
      s.async = true;
      s.defer = true;
      s.onload = () => resolve(window.google);
      s.onerror = (e) => reject(e);
      document.head.appendChild(s);
    });

    let mounted = true;
    loadScript()
      .then(() => {
        if (!mounted) return;
        const g = window.google;
        mapInstance = new g.maps.Map(mapRef.current, {
         center: { lat: 20.5937, lng: 78.9629 }, 
          zoom: 4.5,
          disableDefaultUI: true,
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#f5f7fb' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#8391a1' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
            { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#e6e9ef' }] },
            { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#f8fafc' }] },
            { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#e9eef6' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#eaf2fb' }] },
          ],
        });

        const info = new g.maps.InfoWindow();

        const icon = {
          path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
          fillColor: '#c8a96e',
          fillOpacity: 1,
          strokeWeight: 0,
          scale: 1.6,
          anchor: new g.maps.Point(12, 24),
        };

        mapLocations.forEach((loc) => {
          // Normalize coordinates (DB/JSON may return strings for DECIMAL fields)
          const lat = loc && loc.lat != null ? parseFloat(loc.lat) : NaN;
          const lng = loc && loc.lng != null ? parseFloat(loc.lng) : NaN;
          if (!isFinite(lat) || !isFinite(lng)) {
            console.warn('Skipping location with invalid coordinates:', loc);
            return;
          }

          const m = new g.maps.Marker({
            position: { lat, lng },
            map: mapInstance,
            title: loc.name,
            icon,
          });

          m.addListener('click', () => {
            const content = `<div style="font-weight:600">${loc.name}</div>${loc.address ? `<div style="font-size:12px;color:#666">${loc.address}</div>` : ''}`;
            info.setContent(content);
            info.open(mapInstance, m);
          });
          markers.push(m);
        });

        setMapsLoaded(true);
      })
      .catch((err) => console.error('Google Maps load failed', err));

    return () => {
      mounted = false;
      markers.forEach((mm) => mm.setMap(null));
      if (mapInstance) mapInstance = null;
    };
  }, [mapLocations]);

  // If agent is logged in, show a simple dashboard on the home page
  if (agent) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <section style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' }}>
          <div className="card" style={{ maxWidth: '900px', width: '100%', padding: '2rem' }}>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Welcome back, {agent.username}</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Airport: <strong>{agent.airportName}</strong></p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/agent/counter" className="btn-primary" style={{ padding: '0.75rem 1rem' }}>Counter Booking</Link>
              <Link href="/agent/bookings" className="btn-outline" style={{ padding: '0.75rem 1rem' }}>My Bookings</Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <section ref={heroRef} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', textAlign: 'center', background: 'radial-gradient(circle at center, var(--bg-secondary) 0%, var(--bg-color) 100%)' }}>
        <div ref={textRef} style={{ maxWidth: '800px', marginBottom: '4rem' }}>
          <h1 style={{ fontSize: '4rem', fontWeight: 700, marginBottom: '1.5rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Premium Airport Transfers <br /> <span style={{ color: 'var(--primary-color)' }}>Simplified</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Seamlessly connect passengers to their destinations. Cartaxi provides agents with an intuitive platform to book, manage, and track airport rides.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/admin/login" className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
              Contact Admin
            </Link>
            <Link href="/agent/login" className="btn-outline" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
              Login to Dashboard
            </Link>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '2rem', maxWidth: '1000px', width: '100%', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { title: 'Lightning Fast Booking', desc: 'Book rides in seconds directly from the counter.' },
            { title: 'Real-time Management', desc: 'Track all your bookings and vehicles in one place.' },
            { title: 'Instant Invoicing', desc: 'Generate and print receipts for passengers instantly.' },
            { title: '24/7 Support', desc: 'Always available to assist agents and passengers.' }
          ].map((feature, i) => (
            <div key={i} ref={addToRefs} className="card" style={{ flex: '1 1 300px', textAlign: 'left' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>✨</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 600 }}>{feature.title}</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '3rem 2rem', background: 'linear-gradient(180deg, rgba(247,250,252,1) 0%, rgba(255,255,255,1) 100%)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem', textAlign: 'center' }}>About Cartaxi</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', maxWidth: '820px', margin: '0 auto' }}>
            Cartaxi is a lightweight counter booking platform built for airports and ground-transport agents. This page introduces the service,
            explains how agents use the counter interface, and provides quick access to login and admin tools.
          </p>
        </div>
      </section>

      <section style={{ padding: '3rem 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem', textAlign: 'center' }}>How it works</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Follow these simple steps at the counter.</p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { title: 'Collect Passenger Info', desc: 'Capture passenger name, flight details, pickup and dropoff information.' },
              { title: 'Create Booking', desc: 'Choose vehicle type, set fare, confirm payment and generate receipt.' },
              { title: 'Dispatch & Complete', desc: 'Assign driver, monitor trip status and mark completed when finished.' }
            ].map((s, idx) => (
              <div key={idx} className="card" style={{ flex: '1 1 300px', minWidth: '220px', padding: '1rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(99,102,241,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.05rem' }}>{idx + 1}</span>
                </div>
                <h4 style={{ marginBottom: '0.5rem', fontWeight: 700 }}>{s.title}</h4>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

       <section className="section-responsive px-6 md:px-16 py-24 md:py-15 bg-white" id="service-location-sec">
          <div className="max-w-7xl mx-auto">
            <div className="section-label">Our Service Location</div>
            <h2 className="playfair text-4xl md:text-5xl font-bold leading-tight text-slate-900 mb-8">
              Where We Ship
            </h2>

            <div className="map-wrapper relative rounded-lg p-6 bg-slate-50">
              <style>{`
                .gm-map { width: 100%; height: 650px; border-radius: 8px; overflow: hidden; box-shadow: 0 6px 20px rgba(10,22,40,.06); }
                .locations-list { display:flex; flex-wrap:wrap; gap:8px; margin-top:18px; font-size:13px; color:var(--gray); }
                .locations-list .loc { display:inline-flex; gap:8px; align-items:center; padding:8px 12px; background:#fff; border:1px solid var(--border); border-radius:9999px; }
                @media (max-width:900px){ .gm-map{height:300px} }
              `}</style>

              <div ref={mapRef} id="gm-map" className="gm-map" />

             
            </div>

          </div>
        </section>

    </main>
  );
}
