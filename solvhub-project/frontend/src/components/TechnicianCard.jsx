import { Link } from 'react-router-dom';

const TechnicianCard = ({ technician, onBook }) => {
    const user = technician.userId || {};
    const name = user.name || 'Unknown';
    const avatar = user.avatar || '';
    const rating = technician.rating || 0;
    const totalReviews = technician.totalReviews || 0;
    const skills = technician.skills || [];
    const distance = technician.distance;

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
                <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                        {avatar ? (
                            <img
                                src={avatar}
                                alt={name}
                                className="w-16 h-16 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                                <span className="text-2xl font-bold text-primary-600">
                                    {name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {name}
                        </h3>
                        <div className="flex items-center mt-1">
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <svg
                                        key={i}
                                        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                            <span className="ml-2 text-sm text-gray-600">
                                {rating.toFixed(1)} ({totalReviews} reviews)
                            </span>
                        </div>
                        {distance !== undefined && (
                            <p className="text-sm text-gray-500 mt-1">
                                {distance} km away
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                        {skills.slice(0, 3).map((skill, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full"
                            >
                                {skill}
                            </span>
                        ))}
                        {skills.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                +{skills.length - 3} more
                            </span>
                        )}
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                    {technician.isAvailable ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Available
                        </span>
                    ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                            Unavailable
                        </span>
                    )}
                    <div className="flex space-x-2">
                        <Link
                            to={`/technicians/${technician._id}`}
                            className="px-4 py-2 border border-primary-600 text-primary-600 rounded-md text-sm hover:bg-primary-50"
                        >
                            View Profile
                        </Link>
                        {technician.isAvailable && (
                            <button
                                onClick={() => onBook(technician)}
                                className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700"
                            >
                                Book Now
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TechnicianCard;
