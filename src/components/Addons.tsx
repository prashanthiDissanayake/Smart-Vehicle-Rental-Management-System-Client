import React, { useState } from 'react';
import {
  User,
  Map,
  Baby,
  Wifi,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  Check,
  Zap,
  Calendar
} from 'lucide-react';
import { motion } from 'motion/react';

interface Addon {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: React.ReactNode;
}

const AVAILABLE_ADDONS: Addon[] = [
  {
    id: 'gps',
    name: 'GPS Navigation',
    description: 'Latest maps and real-time traffic updates.',
    price: 15,
    icon: <Map className="w-6 h-6" />
  },
  {
    id: 'child-seat',
    name: 'Child Safety Seat',
    description: 'ISOFIX compatible seats for your little ones.',
    price: 10,
    icon: <Baby className="w-6 h-6" />
  },
  {
    id: 'wifi',
    name: 'In-car Wi-Fi',
    description: 'High-speed 5G hotspot for all passengers.',
    price: 12,
    icon: <Wifi className="w-6 h-6" />
  },
  {
    id: 'insurance',
    name: 'Premium Insurance',
    description: 'Zero deductible and full roadside assistance.',
    price: 25,
    icon: <ShieldCheck className="w-6 h-6" />
  }
];

interface AddonsProps {
  onBack: () => void;
  onContinue: (selectedAddons: Addon[], drivingMode: 'self' | 'driver', dates: { pickup: string; return: string }) => void | Promise<void>;
  car: any;
  user?: any;
}

export const Addons: React.FC<AddonsProps> = ({ onBack, onContinue, car, user }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [drivingMode, setDrivingMode] = useState<'self' | 'driver'>('self');
  const [dates, setDates] = useState({
    pickup: new Date().toISOString().split('T')[0],
    return: new Date(Date.now() + 86400000).toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState({
  pickup: '',
  return: ''
});

  const toggleAddon = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectedAddons = AVAILABLE_ADDONS.filter(a => selectedIds.includes(a.id));
  const driverPrice = drivingMode === 'driver' ? 50 : 0;
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0) + driverPrice;

  const [isSubmitting, setIsSubmitting] = useState(false);

//Validation
  const validateDates = (pickup: string, returnDate: string) => {
  let newErrors = { pickup: '', return: '' };

  const today = new Date().toISOString().split('T')[0];

  if (pickup < today) {
    newErrors.pickup = 'Pickup date cannot be in the past';
  }

  if (returnDate < pickup) {
    newErrors.return = 'Return date cannot be before pickup date';
  }

  setErrors(newErrors);

  return !newErrors.pickup && !newErrors.return;
};
//end validation

  const handleContinue = async () => {
    setIsSubmitting(true);
    try {
      await onContinue(selectedAddons, drivingMode, dates);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl w-full">
      <div
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 mb-8 cursor-pointer hover:text-slate-600 transition-colors inline-flex"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Fleet</span>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-8 lg:p-10"
          >
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                {user ? `Welcome, ${user.name}` : 'Enhance your trip'}
              </h2>
              <p className="text-slate-500">Select your dates, driving preference and any add-ons for your {car?.name}.</p>
            </div>

            <div className="mb-12">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Rental Period</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 ml-1">Pick-up Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                   <input 
  type="date" 
  value={dates.pickup}
  min={new Date().toISOString().split('T')[0]}
  onChange={(e) => {
    const newPickup = e.target.value;

    setDates(prev => {
      const updated = {
        pickup: newPickup,
        return: prev.return < newPickup ? newPickup : prev.return
      };

      validateDates(updated.pickup, updated.return);
      return updated;
    });
  }}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 ml-1">Return Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="date"
                      value={dates.return}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setDates(prev => ({ ...prev, return: e.target.value }))}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-700"
                    />
                  </div>
                  {errors.pickup && (
  <p className="text-red-500 text-xs mt-1 ml-1">{errors.pickup}</p>
)}
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Driving Preference</h3>
              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => setDrivingMode('self')}
                  className={`cursor-pointer p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 text-center ${drivingMode === 'self'
                      ? 'border-indigo-600 bg-indigo-50/50'
                      : 'border-slate-100 hover:border-slate-200 bg-white'
                    }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${drivingMode === 'self' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'
                    }`}>
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Self Drive</p>
                    <p className="text-xs text-slate-500">Drive it yourself</p>
                  </div>
                </div>

                <div
                  onClick={() => setDrivingMode('driver')}
                  className={`cursor-pointer p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 text-center ${drivingMode === 'driver'
                      ? 'border-indigo-600 bg-indigo-50/50'
                      : 'border-slate-100 hover:border-slate-200 bg-white'
                    }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${drivingMode === 'driver' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'
                    }`}>
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">With Driver</p>
                    <p className="text-xs text-slate-500">+Rs.50 / day</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Additional Extras</h3>
              <div className="space-y-4">
                {AVAILABLE_ADDONS.map((addon) => {
                  const isSelected = selectedIds.includes(addon.id);
                  return (
                    <motion.div
                      key={addon.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleAddon(addon.id)}
                      className={`group cursor-pointer p-6 rounded-3xl border-2 transition-all flex items-center gap-6 ${isSelected
                          ? 'border-indigo-600 bg-indigo-50/50'
                          : 'border-slate-100 hover:border-slate-200 bg-white'
                        }`}
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:text-slate-600'
                        }`}>
                        {addon.icon}
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-slate-900">{addon.name}</h3>
                          <span className="font-bold text-indigo-600">+Rs.{addon.price}</span>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed">{addon.description}</p>
                      </div>

                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200'
                        }`}>
                        {isSelected && <Check className="w-4 h-4" />}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-4">
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-8 sticky top-8"
          >
            <h3 className="text-xl font-bold mb-6">Your Selection</h3>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{car?.name}</span>
                <span className="font-bold text-slate-900">Rs.{car?.price}</span>
              </div>

              {selectedAddons.length > 0 && (
                <div className="pt-4 border-t border-slate-50 space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Add-ons</p>
                  {selectedAddons.map(addon => (
                    <div key={addon.id} className="flex justify-between text-sm">
                      <span className="text-slate-500">{addon.name}</span>
                      <span className="font-bold text-slate-900">+Rs.{addon.price}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-slate-100 mb-8">
              <div className="space-y-3 mb-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rental Details</p>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Pick-up</span>
                  <span className="font-bold text-slate-900">{dates.pickup}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Return</span>
                  <span className="font-bold text-slate-900">{dates.return}</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Driving Mode</p>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{drivingMode === 'self' ? 'Self Drive' : 'With Driver'}</span>
                  <span className="font-bold text-slate-900">{drivingMode === 'driver' ? '+$50' : 'Included'}</span>
                </div>
              </div>

              <div className="flex justify-between items-end">
                <span className="text-slate-500 text-sm">Subtotal</span>
                <span className="text-2xl font-bold text-slate-900">Rs.{car?.price + addonsTotal}</span>
              </div>
            </div>

            <button
              onClick={handleContinue}
              disabled={isSubmitting}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Continue to Payment
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
