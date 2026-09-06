import api from "./api";

export const searchCandidates = async (filters = {}) => {
  const params = {};
  if (filters.q?.trim()) params.q = filters.q.trim();
  if (filters.skill?.trim()) params.skill = filters.skill.trim();
  if (filters.location?.trim()) params.location = filters.location.trim();

  const response = await api.get("/recruiter/candidates/search", { params });
  return response.data;
};

export const getCandidateBySlug = async (slug) => {
  const response = await api.get(`/recruiter/candidates/${encodeURIComponent(slug)}`);
  return response.data;
};

export const getPublicResumes = async () => {
  const response = await api.get("/recruiter/resumes/public");
  return response.data;
};

export const getPublicResume = async (id) => {
  const response = await api.get(`/recruiter/resumes/${id}`);
  return response.data;
};

export const comparePublicResumes = async (payload) => {
  const response = await api.post("/recruiter/resumes/compare", payload);
  return response.data;
};

export const getPublicResumeDownload = async (id) => {
  const response = await api.get(`/recruiter/resumes/${id}/download`);
  return response.data;
};

export const analyzePublicProject = async (projectId, payload = {}) => {
  const response = await api.post(`/recruiter/projects/${projectId}/analyze`, payload);
  return response.data;
};

export const getRecruiterJobs = async () => {
  const response = await api.get("/recruiter/jobs");
  return response.data;
};

export const createRecruiterJob = async (payload) => {
  const response = await api.post("/recruiter/jobs", payload);
  return response.data;
};

export const updateRecruiterJob = async (id, payload) => {
  const response = await api.put(`/recruiter/jobs/${id}`, payload);
  return response.data;
};

export const deleteRecruiterJob = async (id) => {
  const response = await api.delete(`/recruiter/jobs/${id}`);
  return response.data;
};

export const getRecruiterInvitations = async () => {
  const response = await api.get("/recruiter/invitations");
  return response.data;
};

export const sendRecruiterInvitation = async (payload) => {
  const response = await api.post("/recruiter/invitations", payload);
  return response.data;
};
