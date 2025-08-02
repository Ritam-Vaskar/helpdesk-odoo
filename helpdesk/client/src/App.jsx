// src/App.jsx
import React from "react";
import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useLocation } from "react-router-dom";
import ComplaintChatBot from "./components/chatbot"; // <-- Add this import

const App = () => {
  const { pathname } = useLocation();

  // Hide navbar/footer on auth or landing pages if needed
  const hideUI = ["/login", "/register", "/"].includes(pathname);

  return (
    <div className="min-h-screen flex flex-col bg-[#0F0F0F] text-white">
      {!hideUI && <Navbar />}
      <main className="flex-grow px-4 py-6">
        <AppRoutes />
      </main>
      {!hideUI && <Footer />}
      <ComplaintChatBot /> {/* <-- Add the chatbot here so it appears on all pages */}
    </div>
  );
};

export default App;
