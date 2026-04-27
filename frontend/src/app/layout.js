import './globals.css';

export const metadata = {
  title: 'Cartaxi | Premium Airport Transfer',
  description: 'Book your premium airport transfer with Cartaxi.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {children}
        <footer style={{ padding: '1rem 1.25rem', borderTop: '1px solid #e6e6e6', textAlign: 'center', marginTop: 'auto' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', color: '#475569' }}>
            <div style={{ fontWeight: 700 }}>Cartaxi</div>
            <div style={{ fontSize: '0.95rem' }}>Contact: support@cartaxi.com — +1-800-123-4567</div>
          </div>
        </footer>
      </body>
    </html>
  );
}
