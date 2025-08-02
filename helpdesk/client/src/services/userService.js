import axios from "../utils/axios";

const getAllUsers = async () => {
  const response = await axios.get("/users/role/Agent"); // Changed from /admin/users to /users
  return response.data;
};

const updateUserRole = async (userId, role) => {
  const response = await axios.patch(`/users/${userId}/role`, { role }); // Changed from /admin/users/${userId} to /users/${userId}/role
  return response.data;
};

const deleteUser = async (userId) => {
  const response = await axios.delete(`/users/${userId}`);
  return response.data;
};

const getUserProfile = async () => {
  const response = await axios.get("/users/profile");
  return response.data;
};

const updateUserProfile = async (userData) => {
  const response = await axios.put("/users/profile", userData);
  return response.data;
};

const userService = {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getUserProfile,
  updateUserProfile,
};

export default userService;