import api from "./api";

export const noteService = {
  getNotes: async () => {
    const res = await api.get("/notes");
    return res.data;
  },
  createNote: async (data) => {
    const res = await api.post("/notes", data);
    return res.data;
  },
  updateNote: async (id, data) => {
    const res = await api.patch(`/notes/${id}`, data);
    return res.data;
  },
  deleteNote: async (id) => {
    const res = await api.delete(`/notes/${id}`);
    return res.data;
  },
};
