import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const UserLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0F0F0F] text-white">
      <Navbar />
      <main className="flex-grow p-6 max-w-5xl mx-auto w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default UserLayout;
