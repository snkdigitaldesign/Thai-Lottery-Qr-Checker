import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { LogOut, LogIn, Home, Search, History, Tv, Layers, Menu, X, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, role, signOut } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => {
    if (path === '/check?mode=multiple') {
      return location.pathname === '/check' && location.search === '?mode=multiple';
    }
    if (path === '/check') {
      return location.pathname === '/check' && !location.search;
    }
    return location.pathname === path;
  };

  const navItems = [
    { path: '/', icon: Home, label: 'หน้าแรก' },
    { path: '/check', icon: Search, label: 'ตรวจหวย' },
    { path: '/check?mode=multiple', icon: Layers, label: 'หลายใบ' },
    { path: '/live', icon: Tv, label: 'สด' },
    { path: '/previous', icon: History, label: 'ย้อนหลัง' },
  ];

  return (
    <nav className="bg-logo-primary sticky top-0 z-50 shadow-lg border-b border-logo-dark/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="bg-white/10 p-2 rounded-xl group-hover:bg-white/20 transition-colors">
                <Search className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-black text-white tracking-tighter">ตรวจหวยวันนี้</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    active 
                      ? 'bg-white text-logo-primary shadow-md' 
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            
            {user && role === 'admin' && (
              <Link 
                to="/admin" 
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  isActive('/admin') 
                    ? 'bg-white text-logo-primary shadow-md' 
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>จัดการระบบ</span>
              </Link>
            )}

            <div className="h-6 w-px bg-white/20 mx-2"></div>

            {user ? (
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-1 text-white/80 hover:text-logo-light transition-colors px-3 py-2 rounded-md text-sm font-medium"
              >
                <LogOut className="h-4 w-4" />
                <span>ออกจากระบบ</span>
              </button>
            ) : (
              <Link 
                to="/login" 
                className="flex items-center space-x-1 bg-white/10 text-white hover:bg-white/20 border border-white/20 transition-colors px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm"
              >
                <LogIn className="h-4 w-4" />
                <span>แอดมิน</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-logo-dark border-t border-white/10 px-4 py-4 space-y-2 animate-in slide-in-from-top duration-300">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-bold transition-all ${
                  active 
                    ? 'bg-logo-primary text-white shadow-lg' 
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          
          {user && role === 'admin' && (
            <Link 
              to="/admin" 
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-bold transition-all ${
                isActive('/admin') 
                  ? 'bg-logo-primary text-white shadow-lg' 
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>จัดการระบบ</span>
            </Link>
          )}

          <div className="pt-4 border-t border-white/10">
            {user ? (
              <button
                onClick={handleSignOut}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-300 font-bold hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>ออกจากระบบ</span>
              </button>
            ) : (
              <Link 
                to="/login" 
                onClick={() => setIsMenuOpen(false)}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-colors"
              >
                <LogIn className="h-5 w-5" />
                <span>เข้าสู่ระบบแอดมิน</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
