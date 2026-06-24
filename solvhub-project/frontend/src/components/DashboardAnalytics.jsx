import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  Users,
  Calendar,
  Star,
  DollarSign,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

// Mock data generators for real-time simulation
const generateBookingData = () => {
  const data = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      bookings: Math.floor(Math.random() * 20) + 5,
      completed: Math.floor(Math.random() * 15) + 3,
      revenue: Math.floor(Math.random() * 5000) + 1000
    });
  }
  return data;
};

const generateServiceData = () => [
  { name: 'Plumbing', value: 35, color: '#0ea5e9' },
  { name: 'Electrical', value: 25, color: '#8b5cf6' },
  { name: 'Carpentry', value: 20, color: '#10b981' },
  { name: 'Painting', value: 15, color: '#f59e0b' },
  { name: 'Other', value: 5, color: '#6b7280' }
];

const generatePerformanceData = () => {
  const data = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    data.push({
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      rating: (Math.random() * 2 + 3).toFixed(1),
      bookings: Math.floor(Math.random() * 50) + 20
    });
  }
  return data;
};

// Stat Card Component
const StatCard = ({ title, value, change, icon: Icon, trend }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        {change && (
          <p className={`text-sm mt-1 flex items-center ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingUp className="w-4 h-4 mr-1 rotate-180" />}
            {change}
          </p>
        )}
      </div>
      <div className="p-3 bg-primary-50 rounded-lg">
        <Icon className="w-6 h-6 text-primary-600" />
      </div>
    </div>
  </div>
);

// Activity Feed Component
const ActivityFeed = ({ activities }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
    <div className="space-y-4 max-h-80 overflow-y-auto">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
          <div className={`p-2 rounded-full ${activity.type === 'success' ? 'bg-green-100' : activity.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'}`}>
            {activity.type === 'success' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
             activity.type === 'warning' ? <AlertCircle className="w-4 h-4 text-yellow-600" /> :
             <Activity className="w-4 h-4 text-blue-600" />}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{activity.title}</p>
            <p className="text-xs text-gray-500 mt-1">{activity.description}</p>
            <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Customer Analytics Dashboard
export const CustomerAnalytics = ({ bookings = [] }) => {
  const [bookingData, setBookingData] = useState(generateBookingData());
  const [serviceData] = useState(generateServiceData());
  const [activities, setActivities] = useState([
    { type: 'success', title: 'Booking Completed', description: 'Your plumbing service was completed successfully', time: '2 hours ago' },
    { type: 'info', title: 'New Booking', description: 'You booked an electrical repair service', time: '5 hours ago' },
    { type: 'warning', title: 'Booking Rescheduled', description: 'Your carpentry appointment was moved to tomorrow', time: '1 day ago' },
    { type: 'success', title: 'Review Submitted', description: 'You left a 5-star review for John Doe', time: '2 days ago' },
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setBookingData(generateBookingData());
      // Add random activity
      if (Math.random() > 0.7) {
        const newActivities = [
          { type: 'info', title: 'Service Reminder', description: 'You have an upcoming appointment in 1 hour', time: 'Just now' },
          { type: 'success', title: 'Payment Successful', description: 'Payment of ₹1500 processed successfully', time: 'Just now' },
          { type: 'warning', title: 'Technician En Route', description: 'Your technician is 10 minutes away', time: 'Just now' },
        ];
        const randomActivity = newActivities[Math.floor(Math.random() * newActivities.length)];
        setActivities(prev => [randomActivity, ...prev.slice(0, 9)]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const stats = {
    totalBookings: bookings.length || 12,
    completedServices: bookings.filter(b => b.status === 'completed').length || 8,
    totalSpent: bookings.reduce((acc, b) => acc + (b.price || 0), 0) || 2450,
    averageRating: 4.5
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          change="+12% from last month"
          trend="up"
          icon={Calendar}
        />
        <StatCard
          title="Completed Services"
          value={stats.completedServices}
          change="+8% from last month"
          trend="up"
          icon={CheckCircle}
        />
        <StatCard
          title="Total Spent"
          value={`₹${stats.totalSpent.toLocaleString()}`}
          change="+15% from last month"
          trend="up"
          icon={DollarSign}
        />
        <StatCard
          title="Average Rating"
          value={stats.averageRating}
          change="+0.3 from last month"
          trend="up"
          icon={Star}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings Over Time */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bookings Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={bookingData}>
              <defs>
                <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                labelStyle={{ color: '#111827' }}
              />
              <Area
                type="monotone"
                dataKey="bookings"
                stroke="#0ea5e9"
                fillOpacity={1}
                fill="url(#colorBookings)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Service Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Services Used</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={serviceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {serviceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity Feed */}
      <ActivityFeed activities={activities} />
    </div>
  );
};

// Technician Analytics Dashboard
export const TechnicianAnalytics = ({ bookings = [], profile = {} }) => {
  const [performanceData, setPerformanceData] = useState(generatePerformanceData());
  const [revenueData, setRevenueData] = useState(generateBookingData());
  const [activities, setActivities] = useState([
    { type: 'success', title: 'New Booking Received', description: 'You have a new plumbing request from Jane Smith', time: '10 minutes ago' },
    { type: 'info', title: 'Payment Received', description: 'Payment of ₹2000 for electrical work', time: '1 hour ago' },
    { type: 'success', title: '5-Star Review', description: 'John Doe left you a 5-star review', time: '3 hours ago' },
    { type: 'warning', title: 'Booking Cancelled', description: 'A customer cancelled their appointment', time: '5 hours ago' },
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRevenueData(generateBookingData());
      if (Math.random() > 0.7) {
        const newActivities = [
          { type: 'success', title: 'New Lead', description: 'A new customer viewed your profile', time: 'Just now' },
          { type: 'info', title: 'Message Received', description: 'You have a new message from a customer', time: 'Just now' },
          { type: 'success', title: 'Booking Confirmed', description: 'A customer confirmed their booking', time: 'Just now' },
        ];
        const randomActivity = newActivities[Math.floor(Math.random() * newActivities.length)];
        setActivities(prev => [randomActivity, ...prev.slice(0, 9)]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const stats = {
    totalEarnings: bookings.reduce((acc, b) => acc + (b.price || 250), 0) || 3250,
    totalJobs: bookings.length || 24,
    completionRate: 94,
    rating: profile?.rating || 4.8,
    responseTime: '15 min',
    repeatCustomers: 8
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard
          title="Total Earnings"
          value={`₹${stats.totalEarnings.toLocaleString()}`}
          change="+18% this month"
          trend="up"
          icon={DollarSign}
        />
        <StatCard
          title="Total Jobs"
          value={stats.totalJobs}
          change="+5 this week"
          trend="up"
          icon={CheckCircle}
        />
        <StatCard
          title="Rating"
          value={stats.rating}
          change="+0.2 this month"
          trend="up"
          icon={Star}
        />
        <StatCard
          title="Completion Rate"
          value={`${stats.completionRate}%`}
          change="+2% this month"
          trend="up"
          icon={Activity}
        />
        <StatCard
          title="Response Time"
          value={stats.responseTime}
          change="-3 min improvement"
          trend="up"
          icon={Clock}
        />
        <StatCard
          title="Repeat Customers"
          value={stats.repeatCustomers}
          change="+2 this month"
          trend="up"
          icon={Users}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Over Time */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
              <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} domain={[0, 5]} />
              <YAxis yAxisId="right" orientation="right" stroke="#6b7280" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="rating"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: '#8b5cf6' }}
                name="Rating"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="bookings"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={{ fill: '#0ea5e9' }}
                name="Bookings"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                formatter={(value) => [`₹${value}`, 'Revenue']}
              />
              <Bar
                dataKey="revenue"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity Feed */}
      <ActivityFeed activities={activities} />
    </div>
  );
};

export default { CustomerAnalytics, TechnicianAnalytics };