import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { technicianAPI, getImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Save, Star, Clock, MapPin, Briefcase, Award, Camera } from 'lucide-react';

const TechnicianProfile = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [photoPreview, setPhotoPreview] = useState(null);
    const [profile, setProfile] = useState({
        skills: [],
        experience: 0,
        bio: '',
        serviceArea: '',
        hourlyRate: 0,
        workingHours: {
            monday: { start: '09:00', end: '18:00' },
            tuesday: { start: '09:00', end: '18:00' },
            wednesday: { start: '09:00', end: '18:00' },
            thursday: { start: '09:00', end: '18:00' },
            friday: { start: '09:00', end: '18:00' },
            saturday: { start: '09:00', end: '18:00' },
            sunday: { start: '10:00', end: '16:00' }
        }
    });
    const [newSkill, setNewSkill] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await technicianAPI.getMyProfile();
            const data = response.data.data;
            setProfile(prev => ({ ...prev, ...data }));
            if (data.profilePhoto) setPhotoPreview(getImageUrl(data.profilePhoto));
        } catch (err) {
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setPhotoPreview(URL.createObjectURL(file));
        setUploadingPhoto(true);
        try {
            const fd = new FormData();
            fd.append('photo', file);
            const res = await technicianAPI.uploadPhoto(fd);
            setProfile(prev => ({ ...prev, profilePhoto: res.data.profilePhoto }));
        } catch (err) {
            setError('Photo upload failed. Try again.');
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleWorkingHoursChange = (day, field, value) => {
        setProfile(prev => ({
            ...prev,
            workingHours: {
                ...prev.workingHours,
                [day]: {
                    ...prev.workingHours[day],
                    [field]: value
                }
            }
        }));
    };

    const handleAddSkill = () => {
        if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
            setProfile(prev => ({
                ...prev,
                skills: [...prev.skills, newSkill.trim()]
            }));
            setNewSkill('');
        }
    };

    const handleRemoveSkill = (skillToRemove) => {
        setProfile(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            await technicianAPI.update(profile.id, {
                skills: profile.skills,
                experience: profile.experience,
                bio: profile.bio,
                serviceArea: profile.serviceArea,
                hourlyRate: profile.hourlyRate,
                isAvailable: profile.isAvailable
            });
            setSuccess(true);
            setTimeout(() => {
                navigate('/technician/dashboard');
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <Link
                    to="/technician/dashboard"
                    className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Link>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
                        <p className="text-gray-600 mt-1">Update your professional information</p>
                    </div>

                    {success && (
                        <div className="m-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-700 font-medium">Profile updated successfully!</p>
                        </div>
                    )}

                    {error && (
                        <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Profile Photo Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                <Camera className="w-4 h-4 inline mr-1" />
                                Profile Photo
                            </label>
                            <div className="flex items-center space-x-5">
                                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                                    {photoPreview ? (
                                        <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <Camera className="w-8 h-8 text-gray-400" />
                                    )}
                                </div>
                                <div>
                                    <button type="button" onClick={() => fileInputRef.current?.click()}
                                        disabled={uploadingPhoto}
                                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 text-sm font-medium">
                                        {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
                                    </button>
                                    <p className="text-xs text-gray-500 mt-1">JPG, PNG or WebP · Max 5MB</p>
                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Briefcase className="w-4 h-4 inline mr-1" />
                                    Years of Experience
                                </label>
                                <input
                                    type="number"
                                    name="experience"
                                    value={profile.experience || 0}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <MapPin className="w-4 h-4 inline mr-1" />
                                    Service Area
                                </label>
                                <input
                                    type="text"
                                    name="serviceArea"
                                    value={profile.serviceArea || ''}
                                    onChange={handleChange}
                                    placeholder="e.g., Anna Nagar, Chennai"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Award className="w-4 h-4 inline mr-1" />
                                    Hourly Rate (₹)
                                </label>
                                <input
                                    type="number"
                                    name="hourlyRate"
                                    value={profile.hourlyRate || 0}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                        </div>

                        {/* Bio */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Bio / Description
                            </label>
                            <textarea
                                name="bio"
                                value={profile.bio || ''}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Describe your services and expertise..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>

                        {/* Skills */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Star className="w-4 h-4 inline mr-1" />
                                Skills
                            </label>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                                    placeholder="Add a skill"
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddSkill}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {profile.skills?.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full flex items-center gap-2"
                                    >
                                        {skill}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSkill(skill)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Working Hours */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                <Clock className="w-4 h-4 inline mr-1" />
                                Working Hours
                            </label>
                            <div className="space-y-2">
                                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                                    <div key={day} className="flex items-center gap-4">
                                        <span className="w-24 capitalize text-sm text-gray-600">{day}</span>
                                        <input
                                            type="time"
                                            value={profile.workingHours?.[day]?.start || '09:00'}
                                            onChange={(e) => handleWorkingHoursChange(day, 'start', e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                        <span className="text-gray-400">to</span>
                                        <input
                                            type="time"
                                            value={profile.workingHours?.[day]?.end || '18:00'}
                                            onChange={(e) => handleWorkingHoursChange(day, 'end', e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                        <label className="flex items-center gap-2 ml-auto">
                                            <input
                                                type="checkbox"
                                                checked={!!profile.workingHours?.[day]?.start}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        handleWorkingHoursChange(day, 'start', '09:00');
                                                        handleWorkingHoursChange(day, 'end', '18:00');
                                                    } else {
                                                        handleWorkingHoursChange(day, 'start', '');
                                                        handleWorkingHoursChange(day, 'end', '');
                                                    }
                                                }}
                                                className="w-4 h-4 text-primary-600 rounded"
                                            />
                                            <span className="text-sm text-gray-600">Available</span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-4 border-t border-gray-200">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TechnicianProfile;
