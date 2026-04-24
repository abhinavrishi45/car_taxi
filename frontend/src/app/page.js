"use client";

import { useEffect, useRef, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
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
              <Link href="/agent/counter" className="btn-outline" style={{ padding: '0.75rem 1rem' }}>My Bookings</Link>
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
            Premium Airport Transfers <br/> <span style={{ color: 'var(--primary-color)' }}>Simplified</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Seamlessly connect passengers to their destinations. Cartaxi provides agents with an intuitive platform to book, manage, and track airport rides.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/agent/signup" className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
              Become an Agent
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
            { title: 'Instant Invoicing', desc: 'Generate and print receipts for passengers instantly.' }
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
    </main>
  );
}
