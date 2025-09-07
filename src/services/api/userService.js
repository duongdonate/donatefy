// src/service/api/userService.js
import axiosClient from "../axiosClient";

const userService = {
  getAll: () => axiosClient.get("/users"),
  getById: (id) => axiosClient.get(`/users/${id}`),
  create: (data) => axiosClient.post("/users", data),
  update: (id, data) => axiosClient.put(`/users/${id}`, data),
  delete: (id) => axiosClient.delete(`/users/${id}`),
};

export default userService;
