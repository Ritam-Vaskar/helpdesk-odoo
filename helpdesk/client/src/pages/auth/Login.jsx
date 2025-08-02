import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import authService from "../../services/authService";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const { login, setLoading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const res = await authService.login(form);
      
      if (res?.user && res?.token) {
        login(res);
        
        // Role-based navigation
        const userRole = res.user.role.toLowerCase();
        switch (userRole) {
          case 'admin':
            navigate("/admin");
            break;
          case 'agent':
            navigate("/agent");
            break;
          case 'user':
          default:
            navigate("/user");
            break;
        }
      } else {
        setError("Unexpected login response. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      <header className="w-full bg-[#000000] shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-white text-2xl font-bold tracking-wide">
            <span className="text-indigo-500">HelpDesk</span>.io
          </Link>
        </div>
      </header>

      <div className="flex items-center justify-center px-4 py-12">
        <form
          onSubmit={handleSubmit}
          className="bg-[#1C1C1C] w-full max-w-md p-8 rounded-xl shadow-lg border border-gray-700"
        >
          <h2 className="text-3xl font-bold mb-6 text-white text-center">
            Welcome Back
          </h2>
          {error && (
            <div className="mb-4 text-sm text-red-400 text-center font-mono overflow-x-auto whitespace-normal break-words">
              {error}
            </div>
          )}

          <div className="space-y-4">

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
            Login
          </button>

          <p className="mt-4 text-sm text-gray-400 text-center">
            Don't have an account?{" "}
            <Link to="/register" className="text-indigo-400 hover:underline">
              Register here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;