import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { technicianAPI, bookingAPI, getImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BookingForm from '../components/BookingForm';
import { ArrowLeft, MapPin, Star, Clock, CheckCircle, Phone } from 'lucide-react';

const BookingPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [technician, setTechnician] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [bookingSuccess, setBookingSuccess] = useState(false);

    useEffect(() => { fetchTechnician(); }, [id]);

    const fetchTechnician = async () => {
        try {
            const res = await technicianAPI.getById(id);
            setTechnician(res.data.data);
        } catch (err) {
            setError('Technician not found');
        } finally {
            setLoading(false);
        }
    };

    const handleBookingSubmit = async (bookingData) => {
        await bookingAPI.create(bookingData);
        setBookingSuccess(true);
        setTimeout(() => navigate('/customer/dashboard'), 2000);
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    );

    if (error || !technician) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <p className="text-red-600 mb-4">{error || 'Technician not found'}</p>
                <Link to="/technicians" className="text-primary-600 hover:underline">Back to Technicians</Link>
            </div>
        </div>
    );

    if (bookingSuccess) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Request Sent!</h2>
                <p className="text-gray-600 mb-4">
                    Your request has been sent to <span className="font-semibold">{technician.user?.name}</span>. They will accept shortly.
                </p>
                <p className="text-sm text-gray-500">Redirecting to your dashboard...</p>
            </div>
        </div>
    );

    if (!isAuthenticated) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
                <p className="text-gray-600 mb-6">Please login to book a service.</p>
                <div className="flex space-x-4 justify-center">
                    <Link to="/login" className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Login</Link>
                    <Link to="/register" className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Register</Link>
                </div>
            </div>
        </div>
    );

    if (user?.role !== 'customer') return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Customers Only</h2>
                <p className="text-gray-600 mb-6">Only customers can book services.</p>
                <Link to="/" className="text-primary-600 hover:underline">Go to Home</Link>
            </div>
        </div>
    );

    const skills = Array.isArray(technician.skills) ? technician.skills : [];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link to="/technicians" className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Technicians
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Technician Info Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="h-52 overflow-hidden bg-gray-100">
                                <img
                                    src={getImageUrl(technician.profilePhoto) || `https://ui-avatars.com/api/?name=${encodeURIComponent(technician.user?.name || 'T')}&background=3b82f6&color=fff&size=400`}
                                    alt={technician.user?.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="p-5">
                                <div className="flex items-center justify-between mb-1">
                                    <h2 className="text-xl font-bold text-gray-900">{technician.user?.name}</h2>
                                    {technician.isVerified && <CheckCircle className="w-5 h-5 text-blue-500" />}
                                </div>

                                {skills.length > 0 && (
                                    <p className="text-primary-600 font-medium text-sm mb-3">{skills.join(', ')}</p>
                                )}

                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-center">
                                        <Star className="w-4 h-4 text-yellow-400 mr-2" />
                                        <span className="font-medium">{technician.rating?.toFixed(1) || '0.0'}</span>
                                        <span className="text-gray-400 ml-1">({technician.totalReviews || 0} reviews)</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="w-4 h-4 mr-2" />
                                        <span>{technician.experience || 0} years experience</span>
                                    </div>
                                    {technician.serviceArea && (
                                        <div className="flex items-center">
                                            <MapPin className="w-4 h-4 mr-2" />
                                            <span>{technician.serviceArea}</span>
                                        </div>
                                    )}
                                    {technician.user?.phone && (
                                        <div className="flex items-center">
                                            <Phone className="w-4 h-4 mr-2" />
                                            <span>{technician.user.phone}</span>
                                        </div>
                                    )}
                                </div>

                                {technician.bio && (
                                    <p className="mt-3 text-sm text-gray-500 line-clamp-3">{technician.bio}</p>
                                )}

                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-gray-500 text-sm">Hourly Rate</span>
                                    <span className="text-2xl font-bold text-gray-900">₹{technician.hourlyRate || 0}</span>
                                </div>

                                <div className={`mt-3 px-3 py-2 rounded-lg text-center text-sm font-medium ${technician.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {technician.isAvailable ? '🟢 Available for Booking' : '🔴 Currently Unavailable'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Booking Form */}
                    <div className="lg:col-span-2">
                        <BookingForm
                            technician={technician}
                            onSubmit={handleBookingSubmit}
                            onCancel={() => navigate('/technicians')}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;
