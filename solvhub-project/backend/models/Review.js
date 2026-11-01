const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    technicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'Technician', required: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

reviewSchema.virtual('customer', {
    ref: 'User',
    localField: 'customerId',
    foreignField: '_id',
    justOne: true
});

reviewSchema.virtual('technician', {
    ref: 'Technician',
    localField: 'technicianId',
    foreignField: '_id',
    justOne: true
});

reviewSchema.virtual('booking', {
    ref: 'Booking',
    localField: 'bookingId',
    foreignField: '_id',
    justOne: true
});

module.exports = mongoose.models.Review || mongoose.model('Review', reviewSchema);
