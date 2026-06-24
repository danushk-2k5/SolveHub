import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wrench, Eye, EyeOff, Shield, CheckCircle, ArrowRight, Mail, Lock } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoginError('');
        setLoading(true);

        const result = await login(email, password);

        setLoading(false);

        if (result.success) {
            const user = JSON.parse(localStorage.getItem('user'));
            if (user?.role === 'technician') {
                navigate('/technician/dashboard');
            } else if (user?.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/customer/dashboard');
            }
        } else {
            setLoginError(result.error || 'Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                            <Wrench className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                            SolvHub
                        </span>
                    </Link>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="p-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Welcome Back
                            </h2>
                            <p className="mt-2 text-gray-600">
                                Sign in to your account to continue
                            </p>
                        </div>



                        {/* Error Message */}
                        {loginError && (
                            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 text-center">
                                {loginError}
                            </div>
                        )}

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        placeholder="your@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        required
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                    />
                                    <span className="text-sm text-gray-600">Remember me</span>
                                </label>
                                <Link to="/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                                    Forgot password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Signing in...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Sign In</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
                        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mb-4">
                            <Shield className="w-4 h-4" />
                            <span>Secure & Encrypted</span>
                        </div>
                        <p className="text-center text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-500">
                                Create one now
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Trust Badges */}
                <div className="mt-8 flex items-center justify-center space-x-6 text-gray-400">
                    <div className="flex items-center space-x-1">
                        <Shield className="w-4 h-4" />
                        <span className="text-xs">SSL Secured</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-xs">Verified</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;