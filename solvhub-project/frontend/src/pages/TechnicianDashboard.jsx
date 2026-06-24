import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI, technicianAPI, getImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TechnicianAnalytics } from '../components/DashboardAnalytics';
import {
  MapPin,
  Phone,
  Mail,
  Calendar,
  Star,
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Settings,
  Edit
} from 'lucide-react';

const TechnicianDashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending');
    const [showAnalytics, setShowAnalytics] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [activeTab]);

    const fetchProfile = async () => {
        try {
            const response = await technicianAPI.getMyProfile();
            setProfile(response.data.data);
        } catch (err) {
            console.error('Error fetching profile:', err);
        }
    };

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const params = activeTab !== 'all' ? { status: activeTab } : {};
            const response = await bookingAPI.getTechnicianBookings(params);
            setBookings(response.data.data || []);
        } catch (err) {
            console.error('Error fetching bookings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (bookingId, status) => {
        try {
            await bookingAPI.updateStatus(bookingId, { status });
            fetchBookings();
        } catch (err) {
            alert('Failed to update booking status');
        }
    };

    const toggleAvailability = async () => {
        try {
            await technicianAPI.updateAvailability({ isAvailable: !profile?.isAvailable });
            fetchProfile();
        } catch (err) {
            alert('Failed to update availability');
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
        booking.customerId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const tabs = [
        { id: 'pending', label: 'New Requests', count: bookings.filter(b => b.status === 'pending').length },
        { id: 'accepted', label: 'Accepted', count: bookings.filter(b => b.status === 'accepted').length },
        { id: 'in_progress', label: 'In Progress', count: bookings.filter(b => b.status === 'in_progress').length },
        { id: 'completed', label: 'Completed', count: bookings.filter(b => b.status === 'completed').length },
    ];

    // Calculate earnings
    const totalEarnings = bookings
        .filter(b => b.status === 'completed')
        .reduce((acc, b) => acc + (b.price || 250), 0);

    const pendingEarnings = bookings
        .filter(b => ['accepted', 'in_progress'].includes(b.status))
        .reduce((acc, b) => acc + (b.price || 250), 0);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Technician Dashboard
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Manage your service requests and track your performance
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0 flex space-x-3">
                            <button
                                onClick={() => setShowAnalytics(!showAnalytics)}
                                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                <TrendingUp className="w-4 h-4 mr-2" />
                                {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
                            </button>
                            <Link
                                to="/technician/profile"
                                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Profile
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Profile Status Card */}
                {profile && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
                        <div className="p-6">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold">
                                        {profile?.profilePhoto
                                            ? <img src={getImageUrl(profile.profilePhoto)} alt={user?.name} className="w-full h-full object-cover" />
                                            : user?.name?.charAt(0) || '?'
                                        }
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
                                        <p className="text-gray-600">{user?.email}</p>
                                        <div className="mt-2 flex items-center space-x-4">
                                            <span className="flex items-center text-sm text-gray-500">
                                                <Star className="w-4 h-4 mr-1 text-yellow-400" />
                                                <span className="font-semibold text-gray-900">{profile.rating?.toFixed(1) || '0'}</span>
                                                <span className="ml-1">({profile.totalReviews || 0} reviews)</span>
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {profile.experience} years experience
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {profile.skills?.length || 0} skills
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                                    {/* Earnings Summary */}
                                    <div className="flex space-x-4">
                                        <div className="text-center px-4 py-2 bg-green-50 rounded-lg">
                                            <p className="text-xs text-green-600 font-medium">Total Earnings</p>
                                            <p className="text-lg font-bold text-green-700">₹{totalEarnings.toLocaleString()}</p>
                                        </div>
                                        <div className="text-center px-4 py-2 bg-blue-50 rounded-lg">
                                            <p className="text-xs text-blue-600 font-medium">Pending</p>
                                            <p className="text-lg font-bold text-blue-700">₹{pendingEarnings.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    {/* Availability Toggle */}
                                    <div className="flex items-center space-x-3">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            profile.isAvailable
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {profile.isAvailable ? '🟢 Available' : '🔴 Unavailable'}
                                        </span>
                                        <button
                                            onClick={toggleAvailability}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                profile.isAvailable
                                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                            }`}
                                        >
                                            {profile.isAvailable ? 'Go Unavailable' : 'Go Available'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Skills Bar */}
                        {profile.skills && profile.skills.length > 0 && (
                            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills.map((skill, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-700"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Analytics Section */}
                {showAnalytics && (
                    <div className="mb-8">
                        <TechnicianAnalytics bookings={bookings} profile={profile} />
                    </div>
                )}

                {/* Bookings Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    {/* Section Header */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                            <h2 className="text-xl font-semibold text-gray-900">Service Requests</h2>
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search requests..."
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
                                <p className="text-gray-600 text-lg">No service requests found</p>
                                <p className="text-gray-500 text-sm mt-2">
                                    {searchQuery ? 'Try adjusting your search' : 'New requests will appear here'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredBookings.map((booking) => (
                                    <div
                                        key={booking.id}
                                        className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200 bg-white"
                                    >
                                        <div className="flex flex-col lg:flex-row lg:items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <span className="text-2xl">{getStatusIcon(booking.status)}</span>
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {booking.serviceType}
                                                    </h3>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                                                        {booking.status.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                    {booking.price && (
                                                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                                            ₹{booking.price}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center space-x-2 mb-2">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                                        <span className="text-gray-600 font-semibold text-sm">
                                                            {booking.customerId?.name?.charAt(0) || '?'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600">
                                                        Customer: <span className="font-medium">{booking.customerId?.name || 'Unknown'}</span>
                                                    </p>
                                                    {booking.customerId?.phone && (
                                                        <a
                                                            href={`tel:${booking.customerId.phone}`}
                                                            className="text-primary-600 hover:text-primary-700"
                                                        >
                                                            <Phone className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                                                    <span className="flex items-center">
                                                        <Calendar className="w-4 h-4 mr-1" />
                                                        {formatDate(booking.bookingDate)}
                                                    </span>
                                                    <span className="flex items-center">
                                                        <Clock className="w-4 h-4 mr-1" />
                                                        {booking.bookingTime}
                                                    </span>
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
                                            <div className="mt-4 lg:mt-0 lg:ml-4 flex flex-col space-y-2">
                                                {booking.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusUpdate(booking.id, 'accepted')}
                                                            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                                                        >
                                                            <CheckCircle className="w-4 h-4 mr-1" />
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                                                            className="px-4 py-2 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center"
                                                        >
                                                            <AlertCircle className="w-4 h-4 mr-1" />
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {booking.status === 'accepted' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(booking.id, 'in_progress')}
                                                        className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
                                                    >
                                                        🚀 Start Work
                                                    </button>
                                                )}
                                                {booking.status === 'in_progress' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(booking.id, 'completed')}
                                                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                                                    >
                                                        ✨ Complete
                                                    </button>
                                                )}
                                                <Link
                                                    to={`/bookings/${booking.id}`}
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

export default TechnicianDashboard;