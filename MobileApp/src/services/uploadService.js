import api from "./api";
import { SERVER_URL } from "@constants/config";

export const normalizeImageUrl = (url) => {
  if (!url) return null;
  if (typeof url !== "string") return url;
  if (url.includes("localhost:8000") || url.includes("127.0.0.1:8000")) {
    return url
      .replace("http://localhost:8000", SERVER_URL)
      .replace("http://127.0.0.1:8000", SERVER_URL);
  }
  return url;
};

export const uploadService = {
  uploadImage: async (uri) => {
    if (!uri) return null;

    const filename = uri.split("/").pop() || "photo.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    const formData = new FormData();
    formData.append("file", {
      uri,
      name: filename,
      type,
    });

    const res = await api.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (res.data && res.data.url) {
      res.data.url = normalizeImageUrl(res.data.url);
    }

    return res.data;
  },
};
