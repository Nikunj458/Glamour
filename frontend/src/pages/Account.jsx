import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFavourite } from '../context/FavouriteContext';
import { Heart, ShoppingBag, Settings, LogOut, Shield, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Account() {
  const { user, logout } = useAuth();
  const { favourites } = useFavourite();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="pt-28 pb-6 min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-16 h-16 bg-champagne/60 rounded-full flex items-center justify-center mb-5">
          <Shield size={28} className="text-mink" />
        </div>
        <h1 className="font-display text-2xl italic text-charcoal mb-2">Sign In to Your Account</h1>
        <p className="font-sans text-sm text-mink mb-8 text-center">
          Log in to view favourites, track orders, and manage your profile.
        </p>
        <Link to="/login" className="btn-primary w-full max-w-xs text-center">Sign In / Register</Link>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const menuItems = [
    { icon: Heart, label: 'My Favourites', sub: `${favourites.length} saved items`, to: '/favourites' },
    { icon: ShoppingBag, label: 'Collections', sub: 'Browse all products', to: '/collections' },
    ...(user.role === 'admin' ? [{ icon: Settings, label: 'Admin Dashboard', sub: 'Manage products & orders', to: '/admin' }] : []),
  ];

  return (
    <div className="pt-28 pb-6 min-h-screen">
      {/* Header */}
      <div className="bg-champagne/40 px-4 pt-6 pb-8 text-center mb-6">
        <div className="w-16 h-16 bg-charcoal rounded-full flex items-center justify-center mx-auto mb-3 text-ivory font-display text-2xl italic">
          {user.name?.[0]?.toUpperCase()}
        </div>
        <h1 className="font-display text-2xl text-charcoal">{user.name}</h1>
        <p className="font-sans text-xs text-mink mt-0.5">{user.email}</p>
        {user.role === 'admin' && (
          <span className="inline-block mt-2 bg-gold/20 text-gold text-[10px] font-sans tracking-widest uppercase px-3 py-1">
            Administrator
          </span>
        )}
      </div>

      <div className="px-4 max-w-sm mx-auto space-y-2">
        {menuItems.map(item => (
          <Link key={item.to} to={item.to}
            className="flex items-center gap-4 bg-white border border-gray-100 p-4 active:bg-champagne/30 transition-colors">
            <div className="w-10 h-10 bg-champagne/60 flex items-center justify-center flex-shrink-0">
              <item.icon size={18} className="text-charcoal" />
            </div>
            <div className="flex-1">
              <p className="font-sans text-sm font-medium text-charcoal">{item.label}</p>
              <p className="font-sans text-xs text-mink">{item.sub}</p>
            </div>
            <ArrowRight size={14} className="text-mink" />
          </Link>
        ))}

        <button onClick={handleLogout}
          className="w-full flex items-center gap-4 bg-white border border-gray-100 p-4 active:bg-rose/5 transition-colors mt-4">
          <div className="w-10 h-10 bg-rose/10 flex items-center justify-center flex-shrink-0">
            <LogOut size={18} className="text-rose" />
          </div>
          <span className="font-sans text-sm text-rose font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}