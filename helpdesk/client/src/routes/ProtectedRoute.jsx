
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Ensure allowedRoles is an array before calling .some()
  const isValidRolesArray = Array.isArray(allowedRoles);

  if (isValidRolesArray && allowedRoles.length > 0) {
    const userRole = user.role?.toLowerCase?.();
    const hasPermission = allowedRoles.some(
      (role) => role.toLowerCase() === userRole
    );

    if (!hasPermission) {
      switch (userRole) {
        case "admin":
          return <Navigate to="/admin" replace />;
        case "agent":
          return <Navigate to="/agent" replace />;
        case "user":
        default:
          return <Navigate to="/user" replace />;
      }
    }
  }

  return children;
};
export default ProtectedRoute;
