import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import NotFound from "../pages/NotFound";

// Role-specific dashboards
import UserDashboard from "../pages/Dashboard/UserDashboard";
import AgentDashboard from "../pages/Dashboard/AgentDashboard";
import AdminDashboard from "../pages/Dashboard/AdminDashboard";

// Admin Pages
import ManageUsers from "../pages/Dashboard/ManageUsers";
import ManageCategories from "../pages/Admin/ManageCategories";
import ManageByAgent from "../pages/Admin/ManageByAgent";

// Ticket Pages
import TicketList from "../pages/Tickets/TicketList";
import TicketDetails from "../pages/Tickets/TicketDetails";
import TicketCreate from "../pages/Tickets/TicketCreate";

import ProtectedRoute from "./ProtectedRoute";
import Landing from "../pages/Landing";
import { useAuth } from "../context/AuthContext";

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Default Dashboard Route - redirects based on user role */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      {/* Role-specific Dashboard Routes */}
      <Route
        path="/user"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/agent"
        element={
          <ProtectedRoute allowedRoles={["agent"]}>
            <AgentDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Agent-specific Routes */}
      <Route
        path="/agent/create-ticket"
        element={
          <ProtectedRoute allowedRoles={["agent"]}>
            <TicketCreate />
          </ProtectedRoute>
        }
      />

      {/* Admin-specific Routes */}
      <Route
        path="/admin/manage-users"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <ManageUsers />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin/manage-categories"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <ManageCategories />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/manage-by-agent"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <ManageByAgent />
          </ProtectedRoute>
        }
      />

      {/* Ticket Routes - accessible by all authenticated users */}
      <Route
        path="/tickets"
        element={
          <ProtectedRoute>
            <TicketList />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/tickets/create"
        element={
          <ProtectedRoute>
            <TicketCreate />
          </ProtectedRoute>
        }
      />

      {/* Ticket Details - accessible by all authenticated users */}
      <Route
        path="/tickets/:id"
        element={
          <ProtectedRoute>
            <TicketDetails />
          </ProtectedRoute>
        }
      />

      {/* Catch-all for 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;