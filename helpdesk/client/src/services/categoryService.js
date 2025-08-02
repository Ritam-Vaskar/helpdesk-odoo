import axios from "../utils/axios";

const getCategories = async () => {
  const response = await axios.get("/categories"); // Removed /api prefix
  return response.data;
};

const createCategory = async (category) => {
  const response = await axios.post("/categories", category); // Removed /api prefix
  return response.data;
};

const deleteCategory = async (categoryId) => {
  const response = await axios.delete(`/categories/${categoryId}`); // Removed /api prefix
  return response.data;
};

const assignAgentsToCategory = async (categoryId, agentIds) => {
  const response = await axios.post(`/categories/${categoryId}/assign`, { agentIds }); // Removed /api prefix
  return response.data;
};

const getCategoryTickets = async (categoryId) => {
  const response = await axios.get(`/categories/${categoryId}/tickets`); // Removed /api prefix
  return response.data;
};

const categoryService = {
  getCategories,
  createCategory,
  deleteCategory,
  assignAgentsToCategory,
  getCategoryTickets,
};

export default categoryService;