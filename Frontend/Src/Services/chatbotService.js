import api from "./api";

const VISITOR_KEY = "prolio_chat_visitor";

const getVisitorId = () => {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = globalThis.crypto?.randomUUID?.() || `visitor-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
};

export const askPortfolioChatbot = async (slug, question) => {
  const response = await api.post(
    `/public/profile/${encodeURIComponent(slug)}/chat`,
    { question },
    {
      headers: {
        "x-prolio-visitor": getVisitorId(),
      },
    }
  );

  return response.data;
};
