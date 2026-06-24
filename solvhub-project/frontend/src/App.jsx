import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import FindTechnicians from './pages/FindTechnicians';
import CustomerDashboard from './pages/CustomerDashboard';
import TechnicianDashboard from './pages/TechnicianDashboard';
import TechnicianProfile from './pages/TechnicianProfile';
import BookingPage from './pages/BookingPage';
import ReviewPage from './pages/ReviewPage';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

// Public Route (redirect if already logged in)
const PublicRoute = ({ children }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (isAuthenticated) {
        if (user?.role === 'technician') {
            return <Navigate to="/technician/dashboard" replace />;
        } else if (user?.role === 'admin') {
            return <Navigate to="/admin/dashboard" replace />;
        }
        return <Navigate to="/customer/dashboard" replace />;
    }

    return children;
};

function AppRoutes() {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();
    // Ensure Navbar is hidden on all auth-related pages
    const isAuthPage = ['/', '/login', '/register'].includes(location.pathname);

    return (
        <div className="min-h-screen bg-gray-50">
            {!isAuthPage && <Navbar />}
            <Routes>
                <Route 
                    path="/" 
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    } 
                />
                <Route path="/home" element={<Home />} />
                <Route path="/technicians" element={<FindTechnicians />} />
                <Route path="/book/:id" element={<BookingPage />} />
                <Route path="/review/:bookingId" element={<ProtectedRoute allowedRoles={['customer']}><ReviewPage /></ProtectedRoute>} />
                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/register"
                    element={
                        <PublicRoute>
                            <Register />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/customer/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['customer']}>
                            <CustomerDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/technician/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['technician']}>
                            <TechnicianDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/technician/profile"
                    element={
                        <ProtectedRoute allowedRoles={['technician']}>
                            <TechnicianProfile />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <div className="p-8">
                                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                                <p>Admin features coming soon...</p>
                            </div>
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
}

function App() {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </Router>
    );
}

export default App;
