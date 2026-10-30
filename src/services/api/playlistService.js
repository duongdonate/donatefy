import axiosClient from "../axiosClient";

const playlistService = {
  getById: (id) => axiosClient.get(`/api/playlists/${id}`),
  getAll: () => axiosClient.get("/api/playlists"),
  create: (data) => axiosClient.post("/api/playlists", data),
  update: (id, data) => axiosClient.put(`/api/playlists/${id}`, data),
  delete: (id) => axiosClient.delete(`/api/playlists/${id}`),
  // name/artist/thumbnail tuỳ chọn; backend chỉ nhận thumbnail i.ytimg.com của đúng videoId
  addSong: (id, { videoId, name, artist, thumbnail }) =>
    axiosClient.post(`/api/playlists/${id}/add-song`, { videoIds: [videoId], name, artist, thumbnail }),
  removeSong: (playlistId, dataSong) =>
    axiosClient.post(`/api/playlists/${playlistId}/remove-song`, dataSong),
  rename: (id, name) => axiosClient.patch(`/api/playlists/${id}`, { name }),
  // `song` thay cả mục meta: luôn gửi đủ id, name, artist, thumbnail
  editSong: (id, song) => axiosClient.patch(`/api/playlists/${id}`, { song }),
};

export default playlistService;
