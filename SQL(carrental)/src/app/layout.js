// src/app/layout.jsx

import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CartProvider } from '@/components/context/CartContext';

export const metadata = {
  title: 'CarGO-A | Car Rental System',
  description: 'Explore premium rides, manage rentals, and drive in style.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <CartProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
