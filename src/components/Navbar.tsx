import React from 'react';
import { Car, Menu, X, User, Phone, LogOut } from 'lucide-react';
import { motion } from 'motion/react';

interface NavbarProps {
  onNavigate?: (page: string) => void;
  user?: any;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, user, onLogout }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => onNavigate?.('landing')}
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">VehicleHub</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => onNavigate?.('fleet')}
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Vehicles
            </button>
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Services</a>
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Locations</a>
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">About</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-600 mr-4">
              <Phone className="w-4 h-4" />
              <span className="text-sm font-medium">+1 (800) DRIVE</span>
            </div>
            
            {user ? (
              <div className="flex items-center gap-4">
                <div 
                  onClick={() => onNavigate?.('profile')}
                  className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition-all"
                >
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="text-sm font-bold text-slate-900">{user.name}</span>
                </div>
                <button 
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => onNavigate?.('login')}
                  className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors px-4"
                >
                  Login
                </button>
                <button 
                  onClick={() => onNavigate?.('fleet')}
                  className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                >
                  Book Now
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white border-b border-slate-100 p-4 space-y-4"
        >
          <button 
            onClick={() => { onNavigate?.('fleet'); setIsOpen(false); }}
            className="block w-full text-left text-base font-medium text-slate-600 py-2"
          >
            Fleet
          </button>
          <a href="#" className="block text-base font-medium text-slate-600 py-2">Services</a>
          <a href="#" className="block text-base font-medium text-slate-600 py-2">Locations</a>
          <a href="#" className="block text-base font-medium text-slate-600 py-2">About</a>
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-4">
            {user ? (
              <div className="space-y-4">
                <div 
                  onClick={() => { onNavigate?.('profile'); setIsOpen(false); }}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-all"
                >
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
                <button 
                  onClick={() => { onLogout?.(); setIsOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-xl text-sm font-bold"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => { onNavigate?.('login'); setIsOpen(false); }}
                  className="w-full bg-slate-100 text-slate-900 px-6 py-3 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
                >
                  Login
                </button>
                <button 
                  onClick={() => { onNavigate?.('fleet'); setIsOpen(false); }}
                  className="w-full bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-bold"
                >
                  Book Now
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
};
