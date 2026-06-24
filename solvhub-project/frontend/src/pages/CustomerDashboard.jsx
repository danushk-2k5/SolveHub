import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI, getImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CustomerAnalytics } from '../components/DashboardAnalytics';
import {
  MapPin,
  Phone,
  Mail,
  Calendar,
  Star,
  TrendingUp,
  Bell,
  Search,
  Filter
} from 'lucide-react';

const CustomerDashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [showAnalytics, setShowAnalytics] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        fetchBookings();
    }, [activeTab]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const params = activeTab !== 'all' ? { status: activeTab } : {};
            const response = await bookingAPI.getCustomerBookings(params);
            setBookings(response.data.data || []);
        } catch (err) {
            console.error('Error fetching bookings:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            accepted: 'bg-blue-100 text-blue-800 border-blue-200',
            in_progress: 'bg-purple-100 text-purple-800 border-purple-200',
            completed: 'bg-green-100 text-green-800 border-green-200',
            cancelled: 'bg-red-100 text-red-800 border-red-200'
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: '⏳',
            accepted: '✅',
            in_progress: '🔄',
            completed: '🎉',
            cancelled: '❌'
        };
        return icons[status] || '📋';
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const filteredBookings = bookings.filter(booking =>
        booking.serviceType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.technicianId?.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const tabs = [
        { id: 'all', label: 'All Bookings', count: bookings.length },
        { id: 'pending', label: 'Pending', count: bookings.filter(b => b.status === 'pending').length },
        { id: 'accepted', label: 'Accepted', count: bookings.filter(b => b.status === 'accepted').length },
        { id: 'in_progress', label: 'In Progress', count: bookings.filter(b => b.status === 'in_progress').length },
        { id: 'completed', label: 'Completed', count: bookings.filter(b => b.status === 'completed').length },
    ];

    // Quick stats
    const quickStats = {
        activeBookings: bookings.filter(b => ['pending', 'accepted', 'in_progress'].includes(b.status)).length,
        completedThisMonth: bookings.filter(b => b.status === 'completed' && new Date(b.createdAt).getMonth() === new Date().getMonth()).length,
        favoriteTechnicians: [...new Set(bookings.filter(b => b.status === 'completed').map(b => b.technicianId?.userId?._id))].length
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Welcome back, {user?.name}! 👋
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Manage your service bookings and track your activity
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0 flex space-x-3">
                            <button
                                onClick={() => setShowAnalytics(!showAnalytics)}
                                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                <TrendingUp className="w-4 h-4 mr-2" />
                                {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
                            </button>
                            <Link
                                to="/technicians"
                                className="inline-flex items-center px-4 py-2 bg-primary-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                🔍 Find a Technician
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm">Active Bookings</p>
                                <p className="text-3xl font-bold mt-1">{quickStats.activeBookings}</p>
                            </div>
                            <div className="p-3 bg-white/20 rounded-lg">
                                <Calendar className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm">Completed This Month</p>
                                <p className="text-3xl font-bold mt-1">{quickStats.completedThisMonth}</p>
                            </div>
                            <div className="p-3 bg-white/20 rounded-lg">
                                <Star className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm">Favorite Technicians</p>
                                <p className="text-3xl font-bold mt-1">{quickStats.favoriteTechnicians}</p>
                            </div>
                            <div className="p-3 bg-white/20 rounded-lg">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Analytics Section */}
                {showAnalytics && (
                    <div className="mb-8">
                        <CustomerAnalytics bookings={bookings} />
                    </div>
                )}

                {/* Bookings Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    {/* Section Header */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                            <h2 className="text-xl font-semibold text-gray-900">My Bookings</h2>
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search bookings..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-1 px-6 overflow-x-auto">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-4 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                                        activeTab === tab.id
                                            ? 'border-primary-500 text-primary-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    {tab.label}
                                    {tab.count > 0 && (
                                        <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                                            activeTab === tab.id ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Bookings List */}
                    <div className="p-6">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                            </div>
                        ) : filteredBookings.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📋</div>
                                <p className="text-gray-600 text-lg">No bookings found</p>
                                <p className="text-gray-500 text-sm mt-2">
                                    {searchQuery ? 'Try adjusting your search' : 'Start by finding a technician'}
                                </p>
                                <Link
                                    to="/technicians"
                                    className="mt-4 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
                                >
                                    Find a Technician
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredBookings.map((booking) => (
                                    <div
                                        key={booking.id}
                                        className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200 bg-white"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <span className="text-2xl">{getStatusIcon(booking.status)}</span>
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {booking.serviceType}
                                                    </h3>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                                                        {booking.status.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                </div>

                                                <div className="flex items-center space-x-2 mb-2">
                                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center">
                                                        {booking.technician?.profilePhoto
                                                            ? <img src={getImageUrl(booking.technician.profilePhoto)} alt="" className="w-full h-full object-cover" />
                                                            : <span className="text-primary-600 font-semibold text-sm">{booking.technician?.user?.name?.charAt(0) || '?'}</span>
                                                        }
                                                    </div>
                                                    <p className="text-sm text-gray-600">
                                                        Technician: <span className="font-medium">{booking.technician?.user?.name || 'Unknown'}</span>
                                                    </p>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                                                    <span className="flex items-center">
                                                        <Calendar className="w-4 h-4 mr-1" />
                                                        {formatDate(booking.bookingDate)}
                                                    </span>
                                                    <span className="flex items-center">
                                                        <span className="mr-1">🕐</span>
                                                        {booking.bookingTime}
                                                    </span>
                                                    {booking.price && (
                                                        <span className="flex items-center font-medium text-green-600">
                                                            <span className="mr-1">💰</span>
                                                            ₹{booking.price}
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                                    {booking.description}
                                                </p>

                                                {booking.address && (
                                                    <p className="mt-2 text-sm text-gray-500 flex items-center">
                                                        <MapPin className="w-4 h-4 mr-1" />
                                                        {booking.address}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="mt-4 md:mt-0 md:ml-4 flex flex-col space-y-2">
                                                {booking.status === 'completed' && (
                                                    <Link
                                                        to={`/review/${booking.id}`}
                                                        className="px-4 py-2 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600 transition-colors text-center"
                                                    >
                                                        ⭐ Leave Review
                                                    </Link>
                                                )}
                                                {booking.status === 'pending' && (
                                                    <button
                                                        onClick={() => {/* Cancel booking */}}
                                                        className="px-4 py-2 border border-red-300 text-red-600 text-sm rounded-lg hover:bg-red-50 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                                <Link
                                                    to={`/bookings/${booking._id}`}
                                                    className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors text-center"
                                                >
                                                    View Details
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;