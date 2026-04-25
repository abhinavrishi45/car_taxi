"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('admin_token');
    if (!token) {
      router.push('/login');
    } else {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    Cookies.remove('admin_token');
    Cookies.remove('admin_data');
    router.push('/login');
  };

  if (loading) return null;

  const links = [
    { name: 'Vehicles', path: '/dashboard/vehicles' },
    { name: 'Bookings', path: '/dashboard/bookings' },
    { name: 'Counters', path: '/dashboard/counters' },
    { name: 'Counters-Creation', path: '/dashboard/agents' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{ width: 'var(--sidebar-width)', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Cartaxi Admin</h2>
        </div>
        <nav style={{ flex: 1, padding: '1rem 0' }}>
          <ul style={{ listStyle: 'none' }}>
            {links.map((link) => (
              <li key={link.path}>
                <Link href={link.path} style={{
                  display: 'block', padding: '1rem 1.5rem',
                  backgroundColor: pathname.startsWith(link.path) ? 'var(--primary-hover)' : 'transparent',
                  color: pathname.startsWith(link.path) ? 'white' : '#cbd5e1',
                  transition: 'all 0.2s'
                }}>
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div style={{ padding: '1.5rem' }}>
          <button onClick={handleLogout} style={{ width: '100%', padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.2)' }}>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
