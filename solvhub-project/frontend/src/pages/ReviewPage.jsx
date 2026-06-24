import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingAPI, reviewAPI } from '../services/api';
import { Star, CheckCircle } from 'lucide-react';

const ReviewPage = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [rating, setRating] = useState(0);
    const [hovered, setHovered] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        bookingAPI.getById(bookingId)
            .then(res => setBooking(res.data.data))
            .catch(() => setError('Booking not found'))
            .finally(() => setLoading(false));
    }, [bookingId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) return setError('Please select a rating');
        if (!comment.trim()) return setError('Please write a comment');

        setSubmitting(true);
        setError('');
        try {
            await reviewAPI.create({
                technicianId: booking.technicianId,
                bookingId: booking.id,
                rating,
                comment
            });
            setSuccess(true);
            setTimeout(() => navigate('/customer/dashboard'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    );

    if (success) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Submitted!</h2>
                <p className="text-gray-600">Thank you for your feedback. Redirecting...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Leave a Review</h2>
                <p className="text-gray-500 mb-6 text-sm">
                    Service: <span className="font-medium text-gray-700">{booking?.serviceType}</span>
                </p>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Star Rating */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">Rating</label>
                        <div className="flex space-x-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHovered(star)}
                                    onMouseLeave={() => setHovered(0)}
                                    className="focus:outline-none"
                                >
                                    <Star
                                        className={`w-10 h-10 transition-colors ${
                                            star <= (hovered || rating)
                                                ? 'text-yellow-400 fill-yellow-400'
                                                : 'text-gray-300'
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                        {rating > 0 && (
                            <p className="mt-1 text-sm text-gray-500">
                                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                            </p>
                        )}
                    </div>

                    {/* Comment */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Your Feedback</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                            placeholder="Share your experience with this technician..."
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                            required
                        />
                    </div>

                    <div className="flex space-x-3">
                        <button
                            type="button"
                            onClick={() => navigate('/customer/dashboard')}
                            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50"
                        >
                            {submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewPage;
