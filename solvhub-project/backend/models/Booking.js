const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    technicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'Technician', required: true },
    serviceType: { type: String, required: true },
    description: { type: String, required: true },
    bookingDate: { type: String, required: true },
    bookingTime: { type: String, required: true },
    address: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
        default: 'pending'
    },
    estimatedCost: { type: Number, default: 0 },
    finalCost: { type: Number, default: 0 },
    notes: { type: String },
    cancellationReason: { type: String },
    acceptedAt: { type: Date },
    completedAt: { type: Date },
    cancelledAt: { type: Date },
    technicianNotes: { type: String }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

bookingSchema.virtual('customer', {
    ref: 'User',
    localField: 'customerId',
    foreignField: '_id',
    justOne: true
});

bookingSchema.virtual('technician', {
    ref: 'Technician',
    localField: 'technicianId',
    foreignField: '_id',
    justOne: true
});

module.exports = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
