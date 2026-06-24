import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { technicianAPI } from '../services/api';
import { User, Wrench, Shield, Eye, EyeOff, CheckCircle, MapPin, Plus, X } from 'lucide-react';

const Register = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'customer'
    });
    const [techProfile, setTechProfile] = useState({
        skills: [], bio: '', serviceArea: '', hourlyRate: '', profilePhoto: '', experience: ''
    });
    const [newSkill, setNewSkill] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const totalSteps = formData.role === 'technician' ? 3 : 2;

    const handleChange = e => { setFormData({ ...formData, [e.target.name]: e.target.value }); setError(''); };
    const handleTechChange = e => setTechProfile({ ...techProfile, [e.target.name]: e.target.value });

    const addSkill = () => {
        if (newSkill.trim() && !techProfile.skills.includes(newSkill.trim())) {
            setTechProfile({ ...techProfile, skills: [...techProfile.skills, newSkill.trim()] });
            setNewSkill('');
        }
    };
    const removeSkill = s => setTechProfile({ ...techProfile, skills: techProfile.skills.filter(x => x !== s) });

    const validateStep1 = () => {
        if (!formData.name.trim()) return setError('Please enter your full name'), false;
        if (!formData.phone.trim() || formData.phone.length < 10) return setError('Please enter a valid phone number'), false;
        if (!formData.email.trim() || !formData.email.includes('@')) return setError('Please enter a valid email'), false;
        return true;
    };
    const validateStep2 = () => {
        if (!formData.password || formData.password.length < 6) return setError('Password must be at least 6 characters'), false;
        if (formData.password !== formData.confirmPassword) return setError('Passwords do not match'), false;
        return true;
    };

    const handleNext = () => {
        if (step === 1 && validateStep1()) { setStep(2); setError(''); }
        else if (step === 2 && validateStep2()) { setStep(3); setError(''); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (step === 2 && !validateStep2()) return;

        setLoading(true);
        setError('');

        const result = await register({
            name: formData.name, email: formData.email,
            phone: formData.phone, password: formData.password, role: formData.role
        });

        if (!result.success) {
            setLoading(false);
            return setError(result.error || 'Registration failed');
        }

        // If technician, save profile details
        if (formData.role === 'technician' && step === 3) {
            try {
                await technicianAPI.update(result.technicianId || 'me', {
                    skills: techProfile.skills,
                    bio: techProfile.bio,
                    serviceArea: techProfile.serviceArea,
                    hourlyRate: parseFloat(techProfile.hourlyRate) || 0,
                    profilePhoto: techProfile.profilePhoto,
                    experience: parseInt(techProfile.experience) || 0
                });
            } catch (err) {
                // Profile update fails silently — they can edit later
            }
        }

        setLoading(false);
        navigate(formData.role === 'technician' ? '/technician/dashboard' : '/customer/dashboard');
    };

    const handleTechProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const profileRes = await technicianAPI.getMyProfile();
            const techId = profileRes.data.data.id;

            // Upload photo first if a file was selected
            let photoUrl = techProfile.profilePhoto;
            if (techProfile.profilePhotoFile) {
                const fd = new FormData();
                fd.append('photo', techProfile.profilePhotoFile);
                const uploadRes = await technicianAPI.uploadPhoto(fd);
                photoUrl = uploadRes.data.profilePhoto;
            }

            await technicianAPI.update(techId, {
                skills: techProfile.skills,
                bio: techProfile.bio,
                serviceArea: techProfile.serviceArea,
                hourlyRate: parseFloat(techProfile.hourlyRate) || 0,
                profilePhoto: photoUrl,
                experience: parseInt(techProfile.experience) || 0
            });
        } catch (err) {
            // ignore, they can update from profile page
        }
        setLoading(false);
        navigate('/technician/dashboard');
    };

    const progressLabels = formData.role === 'technician'
        ? ['Details', 'Password', 'Profile']
        : ['Details', 'Password'];

    return (
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                            <Wrench className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">SolvHub</span>
                    </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Progress */}
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center">
                            {progressLabels.map((label, i) => (
                                <div key={i} className="flex items-center flex-1 last:flex-none">
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                            {step > i + 1 ? <CheckCircle className="w-4 h-4" /> : i + 1}
                                        </div>
                                        <span className={`text-sm font-medium ${step >= i + 1 ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
                                    </div>
                                    {i < progressLabels.length - 1 && (
                                        <div className="flex-1 h-1 mx-3 bg-gray-200 rounded-full">
                                            <div className={`h-full bg-primary-600 rounded-full transition-all ${step > i + 1 ? 'w-full' : 'w-0'}`} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-6">
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
                        )}

                        {/* Step 1: Basic Details */}
                        {step === 1 && (
                            <div className="space-y-5">
                                <div className="space-y-3">
                                    {[
                                        { id: 'customer', title: 'Customer', desc: 'Find technicians for your needs', icon: User, color: 'blue' },
                                        { id: 'technician', title: 'Technician', desc: 'Offer your professional services', icon: Wrench, color: 'green' }
                                    ].map(role => {
                                        const Icon = role.icon;
                                        const sel = formData.role === role.id;
                                        return (
                                            <button key={role.id} type="button" onClick={() => setFormData({ ...formData, role: role.id })}
                                                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${sel ? (role.color === 'blue' ? 'border-blue-500 bg-blue-50' : 'border-green-500 bg-green-50') : 'border-gray-200 hover:bg-gray-50'}`}>
                                                <div className="flex items-center space-x-3">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${sel ? (role.color === 'blue' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600') : 'bg-gray-100 text-gray-500'}`}>
                                                        <Icon className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-gray-900">{role.title}</p>
                                                        <p className="text-sm text-gray-500">{role.desc}</p>
                                                    </div>
                                                    {sel && <CheckCircle className={`w-5 h-5 ${role.color === 'blue' ? 'text-blue-600' : 'text-green-600'}`} />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                                {[
                                    { id: 'name', label: 'Full Name', type: 'text', placeholder: 'Enter your full name' },
                                    { id: 'phone', label: 'Phone Number', type: 'tel', placeholder: 'XXXXXXXXXX' },
                                    { id: 'email', label: 'Email', type: 'email', placeholder: 'your@email.com' }
                                ].map(f => (
                                    <div key={f.id}>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">{f.label}</label>
                                        <input name={f.id} type={f.type} placeholder={f.placeholder} value={formData[f.id]}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all" />
                                    </div>
                                ))}
                                <button type="button" onClick={handleNext}
                                    className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg">
                                    Continue
                                </button>
                            </div>
                        )}

                        {/* Step 2: Password */}
                        {step === 2 && (
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                if (!validateStep2()) return;
                                if (formData.role === 'customer') {
                                    handleSubmit(e);
                                } else {
                                    // Register first, then go to step 3
                                    setLoading(true);
                                    setError('');
                                    const result = await register({
                                        name: formData.name, email: formData.email,
                                        phone: formData.phone, password: formData.password, role: formData.role
                                    });
                                    setLoading(false);
                                    if (!result.success) return setError(result.error || 'Registration failed');
                                    setStep(3);
                                }
                            }} className="space-y-5">
                                <div className="text-center mb-4">
                                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Shield className="w-6 h-6 text-primary-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Create Password</h3>
                                </div>
                                {[
                                    { id: 'password', label: 'Password', show: showPassword, toggle: () => setShowPassword(!showPassword) },
                                    { id: 'confirmPassword', label: 'Confirm Password', show: showConfirm, toggle: () => setShowConfirm(!showConfirm) }
                                ].map(f => (
                                    <div key={f.id}>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">{f.label}</label>
                                        <div className="relative">
                                            <input name={f.id} type={f.show ? 'text' : 'password'} value={formData[f.id]}
                                                onChange={handleChange} placeholder={f.id === 'password' ? 'Min 6 characters' : 'Repeat password'}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 pr-12 transition-all" />
                                            <button type="button" onClick={f.toggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                                {f.show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex space-x-3">
                                    <button type="button" onClick={() => setStep(1)} className="flex-1 py-3.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50">Back</button>
                                    <button type="submit" disabled={loading}
                                        className="flex-1 py-3.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 transition-all shadow-lg">
                                        {loading ? 'Creating...' : formData.role === 'technician' ? 'Next' : 'Create Account'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Step 3: Technician Profile */}
                        {step === 3 && formData.role === 'technician' && (
                            <form onSubmit={handleTechProfileSubmit} className="space-y-5">
                                <div className="text-center mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900">Your Professional Profile</h3>
                                    <p className="text-sm text-gray-500">This info appears on your technician card</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Profile Photo</label>
                                    <div className="flex items-center space-x-4">
                                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex items-center justify-center flex-shrink-0">
                                            {techProfile.profilePhoto ? (
                                                <img src={techProfile.profilePhoto} alt="preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-2xl">👤</span>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <input type="file" accept="image/*" id="regPhoto" className="hidden"
                                                onChange={e => {
                                                    const file = e.target.files[0];
                                                    if (file) setTechProfile({ ...techProfile, profilePhotoFile: file, profilePhoto: URL.createObjectURL(file) });
                                                }} />
                                            <label htmlFor="regPhoto" className="cursor-pointer px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 inline-block">
                                                Choose Photo
                                            </label>
                                            <p className="text-xs text-gray-400 mt-1">JPG, PNG · Max 5MB</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">Experience (years)</label>
                                        <input name="experience" type="number" min="0" value={techProfile.experience}
                                            onChange={handleTechChange} placeholder="e.g. 5"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">Hourly Rate (₹)</label>
                                        <input name="hourlyRate" type="number" min="0" value={techProfile.hourlyRate}
                                            onChange={handleTechChange} placeholder="e.g. 350"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        <MapPin className="w-4 h-4 inline mr-1" />Service Area / Location
                                    </label>
                                    <input name="serviceArea" type="text" value={techProfile.serviceArea}
                                        onChange={handleTechChange} placeholder="e.g. Anna Nagar, Chennai"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all" />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Skills</label>
                                    <div className="flex gap-2 mb-2">
                                        <input type="text" value={newSkill} onChange={e => setNewSkill(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                            placeholder="e.g. Wiring, AC Repair..."
                                            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all" />
                                        <button type="button" onClick={addSkill}
                                            className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700">
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {techProfile.skills.map((s, i) => (
                                            <span key={i} className="flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
                                                {s}
                                                <button type="button" onClick={() => removeSkill(s)}><X className="w-3 h-3" /></button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Bio / Description</label>
                                    <textarea name="bio" value={techProfile.bio} onChange={handleTechChange} rows={3}
                                        placeholder="Describe your expertise and services..."
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none transition-all" />
                                </div>

                                <div className="flex space-x-3">
                                    <button type="button" onClick={() => navigate('/technician/dashboard')}
                                        className="flex-1 py-3.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50">
                                        Skip for now
                                    </button>
                                    <button type="submit" disabled={loading}
                                        className="flex-1 py-3.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 transition-all shadow-lg">
                                        {loading ? 'Saving...' : 'Complete Profile'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-center text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500">Sign in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
