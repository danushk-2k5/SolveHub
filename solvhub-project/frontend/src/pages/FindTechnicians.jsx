import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { technicianAPI, getImageUrl } from '../services/api';
import {
    Search, MapPin, Star, Clock, CheckCircle, Filter,
    Zap, Droplets, Hammer, Paintbrush, Wrench, Home,
    Car, Scissors, ChefHat, Laptop, Bug, Trees, Flame, Phone
} from 'lucide-react';

const categories = [
    { id: 'all', name: 'All Services', icon: Wrench },
    { id: 'electrician', name: 'Electrician', icon: Zap },
    { id: 'plumber', name: 'Plumber', icon: Droplets },
    { id: 'carpenter', name: 'Carpenter', icon: Hammer },
    { id: 'painter', name: 'Painter', icon: Paintbrush },
    { id: 'mechanic', name: 'Mechanic', icon: Car },
    { id: 'cleaning', name: 'Cleaning', icon: Home },
    { id: 'beauty', name: 'Beauty & Spa', icon: Scissors },
    { id: 'cooking', name: 'Cooking', icon: ChefHat },
    { id: 'technician', name: 'Technician', icon: Laptop },
    { id: 'pest_control', name: 'Pest Control', icon: Bug },
    { id: 'gardening', name: 'Gardening', icon: Trees },
    { id: 'appliance', name: 'Appliance', icon: Flame },
];

const categorySkillMap = {
    electrician: ['wiring', 'electrical', 'switch', 'fan', 'inverter', 'solar', 'electrician'],
    plumber: ['pipe', 'plumb', 'leak', 'bathroom', 'water heater', 'plumber'],
    carpenter: ['furniture', 'door', 'cabinet', 'wood', 'carpenter', 'modular'],
    painter: ['paint', 'texture', 'wallpaper', 'painter'],
    mechanic: ['car', 'engine', 'brake', 'mechanic', 'transmission'],
    cleaning: ['cleaning', 'sanitiz', 'carpet', 'sofa', 'deep clean'],
    beauty: ['facial', 'hair', 'manicure', 'pedicure', 'makeup', 'beautician', 'mehendi'],
    cooking: ['cook', 'chef', 'catering', 'biryani', 'tiffin'],
    technician: ['ac', 'refrigerator', 'washing machine', 'tv', 'led', 'appliance', 'technician'],
    pest_control: ['pest', 'termite', 'cockroach', 'mosquito', 'rodent'],
    gardening: ['garden', 'lawn', 'plant', 'landscape'],
    appliance: ['refrigerator', 'washing machine', 'microwave', 'dishwasher', 'tv', 'led'],
};

const FindTechnicians = () => {
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        fetchTechnicians();
    }, []);

    const fetchTechnicians = async () => {
        try {
            const res = await technicianAPI.getAll();
            setTechnicians(res.data.data || []);
        } catch (err) {
            console.error('Failed to fetch technicians:', err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = technicians.filter(tech => {
        const name = tech.user?.name?.toLowerCase() || '';
        const skillsStr = Array.isArray(tech.skills) ? tech.skills.join(' ').toLowerCase() : '';
        const area = tech.serviceArea?.toLowerCase() || '';
        const q = searchQuery.toLowerCase();
        const matchesSearch = !q || name.includes(q) || skillsStr.includes(q) || area.includes(q);

        let matchesCategory = true;
        if (selectedCategory !== 'all') {
            const keywords = categorySkillMap[selectedCategory] || [selectedCategory];
            matchesCategory = keywords.some(kw => skillsStr.includes(kw.toLowerCase()));
        }

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Find Local Service Providers</h1>
                    <p className="text-primary-100 text-lg mb-8">Connect with verified professionals for all your home service needs</p>
                    <div className="max-w-2xl relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, skill, or location..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
                        />
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-2 overflow-x-auto py-4">
                        {categories.map(cat => {
                            const Icon = cat.icon;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                                        selectedCategory === cat.id
                                            ? 'bg-primary-600 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="text-sm font-medium">{cat.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {loading ? 'Loading...' : `${filtered.length} Service Provider${filtered.length !== 1 ? 's' : ''} Available`}
                    </h2>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No service providers found</h3>
                        <p className="text-gray-500">Technicians will appear here once they register and complete their profile.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map(tech => (
                            <div key={tech.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
                                {/* Image */}
                                <div className="relative h-48 overflow-hidden bg-gray-100">
                                    <img
                                        src={getImageUrl(tech.profilePhoto) || `https://ui-avatars.com/api/?name=${encodeURIComponent(tech.user?.name || 'T')}&background=3b82f6&color=fff&size=400`}
                                        alt={tech.user?.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${tech.isAvailable ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                                            {tech.isAvailable ? 'Available' : 'Busy'}
                                        </span>
                                    </div>
                                    {tech.isVerified && (
                                        <div className="absolute top-4 right-4">
                                            <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-medium flex items-center space-x-1">
                                                <CheckCircle className="w-3 h-3" />
                                                <span>Verified</span>
                                            </span>
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                                        <h3 className="text-white font-semibold text-lg">{tech.user?.name}</h3>
                                        <p className="text-white/90 text-sm">{Array.isArray(tech.skills) && tech.skills[0]}</p>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-1">
                                            <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                            <span className="font-semibold text-gray-900">{tech.rating?.toFixed(1) || '0.0'}</span>
                                            <span className="text-gray-500 text-sm">({tech.totalReviews || 0})</span>
                                        </div>
                                        <div className="flex items-center text-gray-600 text-sm">
                                            <Clock className="w-4 h-4 mr-1" />
                                            {tech.experience} yrs exp
                                        </div>
                                    </div>

                                    {tech.serviceArea && (
                                        <div className="flex items-center text-gray-600 text-sm mb-3">
                                            <MapPin className="w-4 h-4 mr-2 text-primary-600" />
                                            {tech.serviceArea}
                                        </div>
                                    )}

                                    {tech.user?.phone && (
                                        <div className="flex items-center text-gray-600 text-sm mb-3">
                                            <Phone className="w-4 h-4 mr-2 text-primary-600" />
                                            {tech.user.phone}
                                        </div>
                                    )}

                                    {/* Skills */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {(Array.isArray(tech.skills) ? tech.skills : []).slice(0, 3).map((skill, i) => (
                                            <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">{skill}</span>
                                        ))}
                                        {Array.isArray(tech.skills) && tech.skills.length > 3 && (
                                            <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md">+{tech.skills.length - 3}</span>
                                        )}
                                    </div>

                                    {tech.bio && (
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{tech.bio}</p>
                                    )}

                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                        <div>
                                            <span className="text-2xl font-bold text-gray-900">₹{tech.hourlyRate || 0}</span>
                                            <span className="text-gray-500 text-sm">/hr</span>
                                        </div>
                                        <Link
                                            to={`/book/${tech.id}`}
                                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                                                tech.isAvailable
                                                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                                            }`}
                                        >
                                            {tech.isAvailable ? 'Book Now' : 'Unavailable'}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FindTechnicians;
