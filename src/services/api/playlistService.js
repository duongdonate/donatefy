import axiosClient from "../axiosClient";

const playlistService = {
  getById: (id) => axiosClient.get(`/playlists/${id}`),
  getAll: () => axiosClient.get("/api/playlists"),
  create: (data) => axiosClient.post("/api/playlists", data),
  update: (id, data) => axiosClient.put(`/api/playlists/${id}`, data),
  delete: (id) => axiosClient.delete(`/api/playlists/${id}`),
  addSong: (playlistId, dataSong) =>
    axiosClient.post(`/api/playlists/${playlistId}/add-song/`, dataSong),
  removeSong: (playlistId, dataSong) =>
    axiosClient.post(`/api/playlists/${playlistId}/remove-song/`, dataSong),
};

export default playlistService;
