import api from "./api";

export const getPlans = async (role = "") => {
  const response = await api.get("/billing/plans", {
    params: role ? { role } : undefined,
  });
  return response.data;
};

export const getMySubscription = async () => {
  const response = await api.get("/billing/subscription");
  return response.data;
};

export const createCheckout = async ({ planId, billingCycle }) => {
  const response = await api.post("/billing/checkout", {
    plan_id: planId,
    billing_cycle: billingCycle,
  });
  return response.data;
};

export const updateAutoPay = async (autoPay) => {
  const response = await api.patch("/billing/subscription/autopay", {
    auto_pay: autoPay,
  });
  return response.data;
};

export const cancelSubscription = async () => {
  const response = await api.patch("/billing/subscription/cancel");
  return response.data;
};

export const resumeSubscription = async () => {
  const response = await api.patch("/billing/subscription/resume");
  return response.data;
};
