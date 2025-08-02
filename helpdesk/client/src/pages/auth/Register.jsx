import React, { useState } from "react";
import authService from "../../services/authService";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authService.register(form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      {/* Header */}
      <header className="w-full bg-[#0000] shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-white text-2xl font-bold tracking-wide">
            <span className="text-indigo-500">HelpDesk</span>.io
          </Link>
        
        </div>
      </header>

      {/* Register Form */}
      <div className="flex items-center justify-center px-4 py-12">
        <form
          onSubmit={handleSubmit}
          className="bg-[#1C1C1C] w-full max-w-md p-8 rounded-xl shadow-lg border border-gray-700"
        >
          <h2 className="text-3xl font-bold mb-6 text-white text-center">
            Create an Account
          </h2>
          <p className="text-md font-medium text-purple-500 text-center mb-3">
            Create an account as User
          </p>
          {error && (
            <div className="mb-4 text-sm text-red-400 text-center">{error}</div>
          )}

          <div className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#111] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#111] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#111] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            className="mt-6 w-full py-2 bg-indigo-600 hover:bg-indigo-700 transition rounded-md text-white font-semibold"
          >
            Register
          </button>

          <p className="mt-4 text-sm text-gray-400 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-400 hover:underline">
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
