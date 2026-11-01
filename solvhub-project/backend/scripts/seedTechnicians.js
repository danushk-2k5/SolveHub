const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const User = require('../models/User');
const Technician = require('../models/Technician');

const technicians = [
    {
        name: 'Ramesh Kumar',
        email: 'ramesh@solvhub.com',
        phone: '9876543210',
        password: 'ramesh123',
        skills: ['Wiring', 'Switch Repair', 'Fan Installation', 'Inverter Setup'],
        experience: 8,
        hourlyRate: 350,
        serviceArea: 'Anna Nagar, Chennai',
        bio: 'Expert electrician with 8+ years experience in residential and commercial electrical work.',
        profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
        isAvailable: true
    },
    {
        name: 'Suresh Patel',
        email: 'suresh@solvhub.com',
        phone: '9876543211',
        password: 'suresh123',
        skills: ['Pipe Fitting', 'Leak Repair', 'Bathroom Fitting', 'Water Heater'],
        experience: 6,
        hourlyRate: 300,
        serviceArea: 'T Nagar, Chennai',
        bio: 'Professional plumber specializing in bathroom fittings and pipe repairs.',
        profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
        isAvailable: true
    },
    {
        name: 'Mohammed Ali',
        email: 'mohammed@solvhub.com',
        phone: '9876543212',
        password: 'mohammed123',
        skills: ['Furniture Making', 'Door Repair', 'Cabinet Work', 'Wood Polishing'],
        experience: 12,
        hourlyRate: 400,
        serviceArea: 'Adyar, Chennai',
        bio: 'Master carpenter with 12 years of craftsmanship experience.',
        profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
        isAvailable: true
    },
    {
        name: 'Priya Sharma',
        email: 'priya@solvhub.com',
        phone: '9876543213',
        password: 'priya123',
        skills: ['Interior Painting', 'Exterior Painting', 'Texture Work', 'Wallpaper'],
        experience: 5,
        hourlyRate: 280,
        serviceArea: 'Velachery, Chennai',
        bio: 'Creative painter specializing in interior and exterior painting.',
        profilePhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
        isAvailable: true
    },
    {
        name: 'Venkatesh Rao',
        email: 'venkatesh@solvhub.com',
        phone: '9876543214',
        password: 'venkatesh123',
        skills: ['AC Installation', 'AC Repair', 'Gas Refilling', 'Annual Maintenance'],
        experience: 7,
        hourlyRate: 450,
        serviceArea: 'Guindy, Chennai',
        bio: 'Certified AC technician with expertise in all major brands.',
        profilePhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop',
        isAvailable: true
    },
    {
        name: 'Lakshmi Devi',
        email: 'lakshmi@solvhub.com',
        phone: '9876543215',
        password: 'lakshmi123',
        skills: ['Deep Cleaning', 'Kitchen Cleaning', 'Bathroom Cleaning', 'Sofa Cleaning'],
        experience: 4,
        hourlyRate: 200,
        serviceArea: 'Mylapore, Chennai',
        bio: 'Professional home cleaning expert with eco-friendly products.',
        profilePhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
        isAvailable: true
    }
];

(async () => {
    try {
        await connectDB();

        for (const t of technicians) {
            // Skip if email already exists
            const exists = await User.findOne({ email: t.email });
            if (exists) {
                console.log(`⚠️  Skipped (already exists): ${t.email}`);
                continue;
            }

            const user = await User.create({
                name: t.name,
                email: t.email,
                phone: t.phone,
                password: t.password,  // model beforeCreate hook hashes this
                role: 'technician',
                isActive: true,
                isVerified: true
            });

            await Technician.create({
                userId: user._id,
                skills: t.skills,
                experience: t.experience,
                hourlyRate: t.hourlyRate,
                serviceArea: t.serviceArea,
                bio: t.bio,
                profilePhoto: t.profilePhoto,
                isAvailable: t.isAvailable,
                rating: Number((Math.random() * 1 + 4).toFixed(1)),
                totalReviews: Math.floor(Math.random() * 150 + 50)
            });

            console.log(`Created: ${t.name} | ${t.email}`);
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err.message);
        await mongoose.disconnect();
        process.exitCode = 1;
    }
})();
