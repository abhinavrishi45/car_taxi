import './globals.css';

export const metadata = {
  title: 'Cartaxi | Premium Airport Transfer',
  description: 'Book your premium airport transfer with Cartaxi.',
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
