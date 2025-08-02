import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RoleBasedRoute = ({ allowedRoles = [], children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Optionally redirect unauthorized users to dashboard or 403 page
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default RoleBasedRoute;
