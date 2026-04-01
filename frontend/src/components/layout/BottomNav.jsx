import { NavLink, useLocation } from 'react-router-dom';
import { Home, Grid, Heart, MessageCircle, User } from 'lucide-react';
import { useFavourite } from '../../context/FavouriteContext';
import { useAuth } from '../../context/AuthContext';

export default function BottomNav() {
  const { favourites } = useFavourite();
  const { user } = useAuth();
  const { pathname } = useLocation();

  const links = [
    { to: '/',           icon: Home,          label: 'Home'                           },
    { to: '/collections', icon: Grid,          label: 'Shop'                           },
    { to: '/favourites', icon: Heart,          label: 'Saved', badge: favourites.length },
    { to: '/contact',    icon: MessageCircle,  label: 'Contact'                        },
    { to: '/account',    icon: User,           label: user ? 'Account' : 'Login'       },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-ivory border-t border-gray-100 mt-[-3px] shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-stretch">
        {links.map(({ to, icon: Icon, label, badge }) => {
          const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={`relative flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors duration-200 ${isActive ? 'text-rose' : 'text-mink'}`}
            >
              <div className="relative">
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose text-white text-[9px] flex items-center justify-center rounded-full font-sans font-bold">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-sans tracking-wide ${isActive ? 'font-medium' : ''}`}>
                {label}
              </span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-rose" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
