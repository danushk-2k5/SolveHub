import { useState } from 'react';
import { bookingAPI } from '../services/api';

const BookingForm = ({ technician, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        serviceType: '', description: '', bookingDate: '', bookingTime: '', address: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    // Use technician's own skills as service type options
    const skills = Array.isArray(technician?.skills) ? technician.skills : [];

    const handleChange = async (e) => {
        const { name, value } = e.target;
        if (name === 'bookingDate') {
            setFormData(prev => ({ ...prev, bookingDate: value, bookingTime: '' }));
            if (value) fetchSlots(value);
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const fetchSlots = async (date) => {
        const techId = technician?.id || technician?._id;
        if (!techId) return;
        setLoadingSlots(true);
        try {
            const res = await bookingAPI.getAvailableSlots(techId, date);
            setAvailableSlots(res.data.slots || []);
        } catch {
            setAvailableSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await onSubmit({ ...formData, technicianId: technician.id || technician._id });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create booking');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Book Service</h2>

            {/* Technician summary */}
            <div className="mb-5 p-4 bg-gray-50 rounded-xl">
                <p className="font-semibold text-gray-900">{technician.user?.name}</p>
                <p className="text-sm text-gray-500">{skills.join(', ') || 'Professional Service'}</p>
                <p className="text-sm text-gray-500 mt-1">
                    ⭐ {technician.rating?.toFixed(1) || '0.0'} ({technician.totalReviews || 0} reviews) &nbsp;·&nbsp; ₹{technician.hourlyRate || 0}/hr
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}

                {/* Service Type — from technician's skills */}
                <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1">Service Type</label>
                    <select name="serviceType" value={formData.serviceType} onChange={handleChange} required
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <option value="">Select a service</option>
                        {skills.length > 0
                            ? skills.map(s => <option key={s} value={s}>{s}</option>)
                            : <option value="General Service">General Service</option>
                        }
                    </select>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} required rows={3}
                        placeholder="Describe the problem or service you need..."
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-1">Date</label>
                        <input type="date" name="bookingDate" value={formData.bookingDate} onChange={handleChange} required
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-1">Time</label>
                        {loadingSlots ? (
                            <div className="w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-gray-50 text-sm text-gray-400">Loading slots...</div>
                        ) : availableSlots.length > 0 ? (
                            <select name="bookingTime" value={formData.bookingTime} onChange={handleChange} required
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500">
                                <option value="">Select time</option>
                                {availableSlots.map(slot => (
                                    <option key={slot.time} value={slot.time} disabled={!slot.available}>
                                        {slot.time}{!slot.available ? ' (Booked)' : ''}
                                    </option>
                                ))}
                            </select>
                        ) : formData.bookingDate ? (
                            <div className="w-full px-3 py-2.5 border border-yellow-300 rounded-xl bg-yellow-50 text-sm text-yellow-700">No slots available</div>
                        ) : (
                            <select disabled className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-400 text-sm">
                                <option>Select a date first</option>
                            </select>
                        )}
                    </div>
                </div>

                {/* Address */}
                <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1">Your Address</label>
                    <textarea name="address" value={formData.address} onChange={handleChange} required rows={2}
                        placeholder="Enter your address for the service..."
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
                </div>

                <div className="flex space-x-3 pt-2">
                    <button type="submit" disabled={loading}
                        className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 transition-all">
                        {loading ? 'Booking...' : 'Confirm Booking'}
                    </button>
                    <button type="button" onClick={onCancel}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BookingForm;
