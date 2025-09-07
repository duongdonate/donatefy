import axiosClient from "../axiosClient";

const songService = {
  getById: (id) => axiosClient.get(`/songs/${id}`),
  getSongs: (playlistId) =>
    axiosClient.get("/api/songs", { params: { playlistId } }),
  update: (id, data) => axiosClient.put(`/api/songs/${id}`, data),
  delete: (id) => axiosClient.delete(`/api/songs/${id}`),
};

export default songService;
