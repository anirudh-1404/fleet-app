import api from "./api";

export const workshopNoteService = {
  getNotes: async (filters = {}) => {
    const res = await api.get("/workshop/notes", { params: filters });
    return res.data;
  },

  getNoteById: async (id) => {
    const res = await api.get(`/workshop/notes/${id}`);
    return res.data;
  },

  createNote: async (noteData) => {
    const res = await api.post("/workshop/notes", noteData);
    return res.data;
  },

  updateNote: async (id, noteData) => {
    const res = await api.patch(`/workshop/notes/${id}`, noteData);
    return res.data;
  },

  deleteNote: async (id) => {
    const res = await api.delete(`/workshop/notes/${id}`);
    return res.data;
  },
};
