import api from "./api";

export const searchCandidates = async (filters = {}) => {
  const params = {};
  if (filters.q?.trim()) params.q = filters.q.trim();
  if (filters.skill?.trim()) params.skill = filters.skill.trim();
  if (filters.location?.trim()) params.location = filters.location.trim();

  const response = await api.get("/recruiters/candidates/search", { params });
  return response.data;
};

export const getCandidateBySlug = async (slug) => {
  const response = await api.get(`/recruiters/candidates/${encodeURIComponent(slug)}`);
  return response.data;
};
