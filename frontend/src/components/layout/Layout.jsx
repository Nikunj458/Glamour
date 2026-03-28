import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import Footer from './Footer';
import WhatsAppButton from '../common/WhatsAppButton';

export default function Layout() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [pathname]);
  const isAdmin = pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      {!isAdmin && <Navbar />}
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>
      {!isAdmin && <Footer />}
      {!isAdmin && <BottomNav />}
      {!isAdmin && <WhatsAppButton />}
    </div>
  );
}