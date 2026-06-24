import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { technicianAPI, getImageUrl } from '../services/api';
import {
    Search, MapPin, Star, Phone, Clock, CheckCircle,
    Zap, Droplets, Hammer, Paintbrush, Wrench, Car,
    Home as HomeIcon, Scissors, ChefHat, ArrowRight,
    Shield, Users, Award, Clock3
} from 'lucide-react';

// Static service categories
const categories = [
    { id: 'electrician', name: 'Electrician', icon: Zap, color: 'bg-yellow-500' },
    { id: 'plumber', name: 'Plumber', icon: Droplets, color: 'bg-blue-500' },
    { id: 'carpenter', name: 'Carpenter', icon: Hammer, color: 'bg-amber-600' },
    { id: 'painter', name: 'Painter', icon: Paintbrush, color: 'bg-pink-500' },
    { id: 'mechanic', name: 'Mechanic', icon: Car, color: 'bg-gray-600' },
    { id: 'cleaning', name: 'Cleaning', icon: HomeIcon, color: 'bg-green-500' },
    { id: 'beauty', name: 'Beauty & Spa', icon: Scissors, color: 'bg-purple-500' },
    { id: 'cooking', name: 'Cooking', icon: ChefHat, color: 'bg-orange-500' },
];

// How it works steps
const howItWorks = [
    {
        icon: Search,
        title: 'Search',
        description: 'Browse through our verified service providers by category or location'
    },
    {
        icon: CheckCircle,
        title: 'Select',
        description: 'Choose the best technician based on ratings, reviews, and pricing'
    },
    {
        icon: Phone,
        title: 'Book',
        description: 'Schedule your service at your preferred date and time'
    },
    {
        icon: Award,
        title: 'Enjoy',
        description: 'Get quality service delivered to your doorstep hassle-free'
    }
];

// Why choose us features
const whyChooseUs = [
    {
        icon: Shield,
        title: 'Verified Professionals',
        description: 'All technicians are background verified and skilled'
    },
    {
        icon: Clock3,
        title: 'On-Time Service',
        description: 'We value your time and ensure punctual service delivery'
    },
    {
        icon: Award,
        title: 'Quality Assured',
        description: '100% satisfaction guarantee on all services'
    },
    {
        icon: Users,
        title: 'Expert Support',
        description: '24/7 customer support for all your queries'
    }
];

const Home = () => {
    const [searchSkill, setSearchSkill] = useState('');
    const [featuredTechnicians, setFeaturedTechnicians] = useState([]);
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        technicianAPI.getAll({ limit: 4 })
            .then(res => setFeaturedTechnicians(res.data.data || []))
            .catch(() => {});
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        navigate(`/technicians?q=${encodeURIComponent(searchSkill)}`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Find Trusted Local Technicians
                        </h1>
                        <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
                            Connect with verified professionals for all your home service needs.
                            Quality service at your doorstep.
                        </p>

                        {/* Search Form */}
                        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
                            <div className="flex flex-col md:flex-row gap-4">
                                <input
                                    type="text"
                                    value={searchSkill}
                                    onChange={(e) => setSearchSkill(e.target.value)}
                                    placeholder="Search by skill (e.g., Electrical, Plumbing)"
                                    className="flex-1 px-6 py-4 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 text-lg"
                                />
                                <button
                                    type="submit"
                                    className="px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-colors shadow-lg"
                                >
                                    Search
                                </button>
                            </div>
                        </form>

                        {/* Quick Stats */}
                        <div className="flex flex-wrap justify-center gap-8 text-primary-100">
                            <div className="flex items-center space-x-2">
                                <Users className="w-5 h-5" />
                                <span>500+ Experts</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-5 h-5" />
                                <span>10k+ Services</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Star className="w-5 h-5" />
                                <span>4.8 Rating</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Service Categories */}
            <div className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Services</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Choose from a wide range of home services delivered by verified professionals
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {categories.map((category) => {
                            const Icon = category.icon;
                            return (
                                <Link
                                    key={category.id}
                                    to="/technicians"
                                    className="group p-6 bg-gray-50 rounded-2xl hover:bg-primary-50 transition-all duration-300 text-center"
                                >
                                    <div className={`w-16 h-16 ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                                    <p className="text-sm text-gray-500">Book Now</p>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Featured Technicians */}
            <div className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Technicians</h2>
                            <p className="text-gray-600">Top-rated professionals in your area</p>
                        </div>
                        <Link
                            to="/technicians"
                            className="flex items-center space-x-2 text-primary-600 font-semibold hover:text-primary-700"
                        >
                            <span>View All</span>
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredTechnicians.length === 0 ? (
                            <div className="col-span-4 text-center py-12 text-gray-400">
                                <p>No technicians registered yet.</p>
                                <Link to="/register" className="text-primary-600 font-medium hover:underline mt-2 inline-block">Be the first to join →</Link>
                            </div>
                        ) : (
                            featuredTechnicians.map((tech) => {
                                const skills = Array.isArray(tech.skills) ? tech.skills : [];
                                const photoSrc = getImageUrl(tech.profilePhoto) ||
                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(tech.user?.name || 'T')}&background=3b82f6&color=fff&size=400`;
                                return (
                                    <div key={tech.id}
                                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
                                        {/* Photo */}
                                        <div className="relative h-48 overflow-hidden bg-gray-100">
                                            <img src={photoSrc} alt={tech.user?.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                            <div className="absolute top-3 left-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tech.isAvailable ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                                                    {tech.isAvailable ? 'Available' : 'Busy'}
                                                </span>
                                            </div>
                                            {tech.isVerified && (
                                                <div className="absolute top-3 right-3">
                                                    <span className="px-2 py-1 bg-blue-500 text-white rounded-full text-xs flex items-center space-x-1">
                                                        <CheckCircle className="w-3 h-3" />
                                                        <span>Verified</span>
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-4">
                                            <h3 className="font-semibold text-gray-900 text-base mb-0.5">{tech.user?.name}</h3>
                                            <p className="text-primary-600 text-sm font-medium mb-2">
                                                {skills[0] || 'Professional Service'}
                                            </p>

                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center space-x-1">
                                                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                    <span className="font-semibold text-gray-900 text-sm">{tech.rating?.toFixed(1) || '0.0'}</span>
                                                    <span className="text-gray-400 text-xs">({tech.totalReviews || 0})</span>
                                                </div>
                                                <div className="flex items-center text-gray-400 text-xs">
                                                    <Clock className="w-3.5 h-3.5 mr-1" />
                                                    {tech.experience || 0} yrs
                                                </div>
                                            </div>

                                            {tech.serviceArea && (
                                                <div className="flex items-center text-gray-500 text-xs mb-3">
                                                    <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />
                                                    {tech.serviceArea}
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                                <div>
                                                    <span className="text-lg font-bold text-gray-900">₹{tech.hourlyRate || 0}</span>
                                                    <span className="text-gray-400 text-xs">/hr</span>
                                                </div>
                                                <Link to={`/book/${tech.id}`}
                                                    className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors ${tech.isAvailable ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-gray-100 text-gray-400 pointer-events-none'}`}>
                                                    Book Now
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* How It Works */}
            <div className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Book your service in 4 simple steps
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {howItWorks.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <div key={index} className="text-center">
                                    <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Icon className="w-8 h-8 text-primary-600" />
                                    </div>
                                    <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                                        {index + 1}
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                                    <p className="text-gray-600 text-sm">{step.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Why Choose Us */}
            <div className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            We provide the best service experience for all your home needs
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {whyChooseUs.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div key={index} className="bg-white p-6 rounded-2xl shadow-sm text-center">
                                    <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                        <Icon className="w-7 h-7 text-primary-600" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                                    <p className="text-gray-600 text-sm">{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-16 bg-primary-600">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Ready to Get Started?
                    </h2>
                    <p className="text-primary-100 text-lg mb-8">
                        Join thousands of satisfied customers who trust SolvHub for their home services
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/technicians"
                            className="px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-colors shadow-lg"
                        >
                            Find a Technician
                        </Link>
                        {!isAuthenticated && (
                            <Link
                                to="/register"
                                className="px-8 py-4 bg-primary-700 text-white font-semibold rounded-xl hover:bg-primary-800 transition-colors border border-primary-500"
                            >
                                Join as Technician
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Trust Badges */}
            <div className="py-12 bg-white border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-bold text-primary-600 mb-2">500+</div>
                            <div className="text-gray-600">Verified Experts</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-primary-600 mb-2">10k+</div>
                            <div className="text-gray-600">Services Completed</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-primary-600 mb-2">4.8</div>
                            <div className="text-gray-600">Average Rating</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-primary-600 mb-2">30min</div>
                            <div className="text-gray-600">Avg. Response Time</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;