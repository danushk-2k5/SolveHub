import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, isAuthenticated, logout, isCustomer, isTechnician } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <span className="text-2xl font-bold text-primary-600">SOLVHUB</span>
                        </Link>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link
                                to="/home"
                                className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-primary-500"
                            >
                                Home
                            </Link>
                            <Link
                                to="/technicians"
                                className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-primary-500"
                            >
                                Find Technicians
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center">
                        {isAuthenticated ? (
                            <div className="flex items-center space-x-4">
                                {isCustomer && (
                                    <Link
                                        to="/customer/dashboard"
                                        className="text-gray-700 hover:text-primary-600"
                                    >
                                        Dashboard
                                    </Link>
                                )}
                                {isTechnician && (
                                    <Link
                                        to="/technician/dashboard"
                                        className="text-gray-700 hover:text-primary-600"
                                    >
                                        Dashboard
                                    </Link>
                                )}
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-700">
                                        {user?.name}
                                    </span>
                                    <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">
                                        {user?.role}
                                    </span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link
                                    to="/login"
                                    className="text-gray-700 hover:text-primary-600"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
