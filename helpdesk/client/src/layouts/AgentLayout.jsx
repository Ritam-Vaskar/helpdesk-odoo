import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const AgentLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0F0F0F] text-white">
      <Navbar />
      <div className="flex flex-grow">
        {/* Sidebar */}
        <aside className="w-56 bg-gray-900 p-4">
          <nav className="flex flex-col space-y-3 text-gray-300">
            <a href="/agent/dashboard" className="hover:text-white">Dashboard</a>
            <a href="/agent/tickets" className="hover:text-white">Tickets</a>
            {/* Add more agent links */}
          </nav>
        </aside>
        <main className="flex-grow p-6">{children}</main>
      </div>
      <Footer />
    </div>
  );
};

export default AgentLayout;
