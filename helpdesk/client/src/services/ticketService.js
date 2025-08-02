import axios from "axios";

// Safely get API base URL with fallback
let API_BASE_URL = "http://localhost:8000/api";

try {
  if (import.meta.env && import.meta.env.VITE_API_BASE_URL) {
    API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  }
} catch (err) {
  console.warn("VITE_API_BASE_URL not found, using default:", API_BASE_URL);
}

const getTickets = async (token) => {
  const res = await axios.get(`${API_BASE_URL}/tickets`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

const getTicketById = async (id, token) => {
  const res = await axios.get(`${API_BASE_URL}/tickets/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

const createTicket = async (data, token) => {
  const res = await axios.post(`${API_BASE_URL}/tickets`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

const updateTicket = async (id, data, token) => {
  const res = await axios.put(`${API_BASE_URL}/tickets/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

const ticketService = {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
};

export default ticketService;
