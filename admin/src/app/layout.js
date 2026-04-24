import './globals.css';

export const metadata = {
  title: 'Cartaxi | Admin Dashboard',
  description: 'Admin dashboard for Cartaxi',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
