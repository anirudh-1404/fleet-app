import api from "./api";

export const journeyService = {
  startJourney: async () => {
    const res = await api.post("/journeys/start");
    return res.data;
  },
  getTodayJourney: async () => {
    const res = await api.get("/journeys/today");
    return res.data;
  },
  endJourney: async () => {
    const res = await api.post("/journeys/end");
    return res.data;
  },
};
