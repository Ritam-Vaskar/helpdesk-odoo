import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0F0F0F] text-white text-center px-4">
      <h1 className="text-5xl font-bold mb-4">404</h1>
      <p className="text-gray-400 mb-6">Page not found</p>
      <Link to="/" className="text-blue-500 underline">Go back home</Link>
    </div>
  );
};

export default NotFound;
