import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Ticket, LayoutDashboard, LogOut, LogIn, Search, History, Tv, Layers } from 'lucide-react';

export default function Navbar() {
  const { user, role, signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="bg-emerald-600 sticky top-0 z-50 h-16 flex items-center shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                <Ticket className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-white font-display">ตรวจหวย</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link 
              to="/check" 
              className="flex items-center space-x-1 text-white/80 hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium"
            >
              <Search className="h-4 w-4" />
              <span>ตรวจรางวัล</span>
            </Link>

            <Link 
              to="/check?mode=multiple" 
              className="flex items-center space-x-1 text-white/80 hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium"
            >
              <Layers className="h-4 w-4" />
              <span>ตรวจหลายใบ</span>
            </Link>

            <Link 
              to="/previous" 
              className="flex items-center space-x-1 text-white/80 hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium"
            >
              <History className="h-4 w-4" />
              <span>ผลย้อนหลัง</span>
            </Link>

            <Link 
              to="/live" 
              className="flex items-center space-x-1 text-white/80 hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium"
            >
              <Tv className="h-4 w-4" />
              <span>ถ่ายทอดสด</span>
            </Link>

            {user && role === 'admin' && (
              <Link 
                to="/admin" 
                className="flex items-center space-x-1 text-white/80 hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>จัดการระบบ</span>
              </Link>
            )}

            {user ? (
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-1 text-white/80 hover:text-red-200 transition-colors px-3 py-2 rounded-md text-sm font-medium"
              >
                <LogOut className="h-4 w-4" />
                <span>ออกจากระบบ</span>
              </button>
            ) : (
              <Link 
                to="/login" 
                className="flex items-center space-x-1 bg-white/20 text-white hover:bg-white/30 transition-colors px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm"
              >
                <LogIn className="h-4 w-4" />
                <span>เข้าสู่ระบบแอดมิน</span>
              </Link>
            )}
          </div>

          {/* Mobile Admin Icon */}
          <div className="md:hidden flex items-center">
            {user ? (
              <button onClick={handleSignOut} className="p-2 text-white/60">
                <LogOut className="h-5 w-5" />
              </button>
            ) : (
              <Link to="/login" className="p-2 text-white/60">
                <LogIn className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
