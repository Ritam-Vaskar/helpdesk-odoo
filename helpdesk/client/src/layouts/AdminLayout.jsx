import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const AdminLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0F0F0F] text-white">
      <Navbar />
      <div className="flex flex-grow">
        {/* Sidebar (can be added here) */}
        <aside className="w-64 bg-gray-900 p-4">
          <nav className="flex flex-col space-y-4 text-gray-300">
            <a href="/admin/dashboard" className="hover:text-white">Dashboard</a>
            <a href="/admin/manage-users" className="hover:text-white">Manage Users</a>
            <a href="/admin/manage-categories" className="hover:text-white">Manage Categories</a>
            {/* Add more admin links */}
          </nav>
        </aside>
        <main className="flex-grow p-6">{children}</main>
      </div>
      <Footer />
    </div>
  );
};

export default AdminLayout;
