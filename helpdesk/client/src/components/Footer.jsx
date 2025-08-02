// src/components/Footer.jsx
import React from "react";

const Footer = () => {
  return (
    <footer className="bg-[#1F1F1F] text-gray-400 text-center py-6 mt-auto">
      <p>
        &copy; {new Date().getFullYear()} Helpdesk Application. All rights reserved.
      </p>
      <p className="text-sm mt-1">
        Developed by YourName
      </p>
    </footer>
  );
};

export default Footer;
