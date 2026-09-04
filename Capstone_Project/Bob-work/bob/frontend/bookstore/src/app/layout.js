import { Geist } from 'next/font/google';
import './globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata = {
  title: 'BookStore — Your Online Bookshop',
  description: 'Discover, browse and buy books online.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full d-flex flex-column" style={{ backgroundColor: '#f8f9fb' }}>
        <AuthProvider>
          <Navbar />
          <main className="flex-grow-1">{children}</main>
          <footer
            className="text-center py-4 mt-auto small text-muted"
            style={{ borderTop: '1px solid #e5e7eb', backgroundColor: '#fff' }}
          >
            © {new Date().getFullYear()} BookStore. All rights reserved.
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
