import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import { FaBell } from "react-icons/fa";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Debug: Log user data
  console.log("User data:", user);
  console.log("User role:", user?.role);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (user) {
        try {
          const { data } = await api.get("/api/notifications");
          setNotifications(data);
        } catch (error) {
          console.error("Error fetching notifications:", error);
        }
      }
    };

    fetchNotifications();
    // Optional: Poll for new notifications every 30 seconds
    const intervalId = setInterval(fetchNotifications, 30000);
    return () => clearInterval(intervalId);
  }, [user]);

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.put(`/api/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleLinkClick = () => {
    // If user is logged in, close notifications panel if open
    if (showNotifications) {
      setShowNotifications(false);
    }
  };

  return (
    <nav className="bg-[#121212] border-b border-gray-800 px-6 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link 
          to="/" // Changed from "/home" to "/"
          onClick={handleLinkClick}
          className="text-white text-2xl font-bold tracking-wide"
        >
          <span className="text-indigo-500">HelpDesk</span>.io
        </Link>

        <div className="flex items-center space-x-6">
          {user ? (
            <>
              <NavLink
                to={
                  user.role === "admin" ? "/admin" : 
                  user.role === "Agent" ? "/agent" : 
                  "/dashboard"
                }
                className={({ isActive }) =>
                  `text-gray-300 hover:text-white font-medium ${
                    isActive ? "border-b-2 border-blue-500" : ""
                  }`
                }
              >
                Dashboard
              </NavLink>

              <NavLink
                to="/tickets"
                className={({ isActive }) =>
                  `text-gray-300 hover:text-white font-medium ${
                    isActive ? "border-b-2 border-blue-500" : ""
                  }`
                }
              >
                Tickets
              </NavLink>
              
              {/* Remove individual Admin and Agent links since Dashboard handles routing */}

              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="text-gray-300 hover:text-white relative"
                >
                  <FaBell size={20} />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-[#1C1C1C] border border-gray-700 rounded-md shadow-lg z-20">
                    <div className="p-3 border-b border-gray-700">
                      <h3 className="text-sm font-semibold text-white">Notifications</h3>
                    </div>
                    {notifications.length === 0 ? (
                      <p className="text-gray-400 text-sm p-3">No new notifications.</p>
                    ) : (
                      <ul className="max-h-80 overflow-y-auto">
                        {notifications.map(notification => (
                          <li 
                            key={notification._id} 
                            className={`p-3 hover:bg-gray-700 cursor-pointer ${notification.read ? 'opacity-60' : ''}`}
                            onClick={() => !notification.read && handleMarkAsRead(notification._id)}
                          >
                            <p className="text-sm text-gray-300">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="ml-4 bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white font-semibold"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `text-gray-300 hover:text-white font-medium ${
                    isActive ? "border-b-2 border-blue-500" : ""
                  }`
                }
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  `text-gray-300 hover:text-white font-medium ${
                    isActive ? "border-b-2 border-blue-500" : ""
                  }`
                }
              >
                Register
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;