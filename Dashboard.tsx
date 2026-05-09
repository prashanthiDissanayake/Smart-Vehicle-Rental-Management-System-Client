import React from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  Car, 
  Calendar, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { cn } from '../lib/utils';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-3 rounded-xl", color)}>
        <Icon size={24} className="text-white" />
      </div>
      <div className={cn(
        "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
        trend === 'up' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
      )}>
        {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {trendValue}%
      </div>
    </div>
    <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
  </div>
);

interface DashboardProps {
  onNewBooking?: () => void;
}

const MOCK_STATS = {
  totalRevenue: 45280,
  revenueTrend: 'up',
  revenueTrendValue: 12,
  activeRentals: 24,
  rentalsTrend: 'up',
  rentalsTrendValue: 8,
  totalVehicles: 52,
  vehiclesTrend: 'up',
  vehiclesTrendValue: 2,
  avgDailyRate: 85,
  adrTrend: 'up',
  adrTrendValue: 5
};

const MOCK_ANALYTICS = [
  { name: 'Mon', revenue: 4000 },
  { name: 'Tue', revenue: 3000 },
  { name: 'Wed', revenue: 2000 },
  { name: 'Thu', revenue: 2780 },
  { name: 'Fri', revenue: 1890 },
  { name: 'Sat', revenue: 2390 },
  { name: 'Sun', revenue: 3490 },
];

const MOCK_RECENT_BOOKINGS = [
  {
    id: '1',
    userName: 'Alex Johnson',
    userAvatar: 'https://i.pravatar.cc/150?u=u1',
    vehicleName: 'Tesla Model 3',
    duration: 3,
    amount: 360,
    status: 'Paid'
  },
  {
    id: '2',
    userName: 'Sarah Miller',
    userAvatar: 'https://i.pravatar.cc/150?u=u2',
    vehicleName: 'BMW X5',
    duration: 5,
    amount: 750,
    status: 'Paid'
  },
  {
    id: '3',
    userName: 'Michael Chen',
    userAvatar: 'https://i.pravatar.cc/150?u=u3',
    vehicleName: 'Ford F-150',
    duration: 2,
    amount: 180,
    status: 'Pending'
  }
];

const Dashboard: React.FC<DashboardProps> = ({ onNewBooking }) => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
          <p className="text-slate-500">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            Download Report
          </button>
          <button 
            onClick={onNewBooking}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors shadow-sm"
          >
            Add New Booking
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`Rs.${MOCK_STATS.totalRevenue.toLocaleString()}`} 
          icon={DollarSign} 
          trend={MOCK_STATS.revenueTrend} 
          trendValue={MOCK_STATS.revenueTrendValue}
          color="bg-brand-600"
        />
        <StatCard 
          title="Active Rentals" 
          value={MOCK_STATS.activeRentals} 
          icon={Calendar} 
          trend={MOCK_STATS.rentalsTrend} 
          trendValue={MOCK_STATS.rentalsTrendValue}
          color="bg-indigo-600"
        />
        <StatCard 
          title="Total Vehicles" 
          value={MOCK_STATS.totalVehicles} 
          icon={Car} 
          trend={MOCK_STATS.vehiclesTrend} 
          trendValue={MOCK_STATS.vehiclesTrendValue}
          color="bg-slate-800"
        />
        <StatCard 
          title="Avg. Daily Rate" 
          value={`Rs.${MOCK_STATS.avgDailyRate}`} 
          icon={TrendingUp} 
          trend={MOCK_STATS.adrTrend} 
          trendValue={MOCK_STATS.adrTrendValue}
          color="bg-emerald-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800">Revenue Analytics</h3>
            <select className="bg-slate-50 border border-slate-200 rounded-lg text-xs px-2 py-1.5 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_ANALYTICS}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '12px', 
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#0ea5e9" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Recent Bookings</h3>
          <div className="space-y-6">
            {MOCK_RECENT_BOOKINGS.map((booking) => (
              <div key={booking.id} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                  <img src={booking.userAvatar} alt={booking.userName} referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{booking.userName}</p>
                  <p className="text-xs text-slate-500">{booking.vehicleName} • {booking.duration} days</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800">Rs.{booking.amount}</p>
                  <p className={cn(
                    "text-[10px] font-medium uppercase tracking-wider",
                    booking.status === 'Paid' ? "text-emerald-600" : "text-amber-600"
                  )}>{booking.status}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-2.5 text-sm font-medium text-brand-600 hover:bg-brand-50 rounded-xl transition-colors">
            View All Transactions
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
