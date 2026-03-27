// Dùng relative URL → hoạt động cả dev (vite proxy) lẫn production (same port)
const BASE = "/api";

const getToken = () => localStorage.getItem("locker_token");

const apiFetch = async (path, options = {}) => {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Lỗi server");
  return data;
};

export const authAPI = {
  login:    (email, password) => apiFetch("/auth/login",    { method: "POST", body: JSON.stringify({ email, password }) }),
  register: (form)            => apiFetch("/auth/register", { method: "POST", body: JSON.stringify(form) }),
  me:       ()                => apiFetch("/auth/me"),
};
export const lockerAPI = {
  getAll: ()   => apiFetch("/lockers"),
  reset:  (id) => apiFetch(`/lockers/${id}/reset`, { method: "PUT" }),
};
export const orderAPI = {
  create: (locker_id, room) => apiFetch("/orders", { method: "POST", body: JSON.stringify({ locker_id, room }) }),
  getAll: ()                => apiFetch("/orders"),
};
export const residentAPI = {
  getAll: ()     => apiFetch("/residents"),
  create: (form) => apiFetch("/residents", { method: "POST", body: JSON.stringify(form) }),
  remove: (id)   => apiFetch(`/residents/${id}`, { method: "DELETE" }),
};
export const logAPI = {
  getAll: (action) => apiFetch(`/logs${action && action !== "ALL" ? `?action=${action}` : ""}`),
};
export const esp32API = {
  verifyOTP:  (otp)      => apiFetch("/verify-otp",  { method: "POST", body: JSON.stringify({ otp }) }),
  verifyRFID: (rfid_uid) => apiFetch("/verify-rfid", { method: "POST", body: JSON.stringify({ rfid_uid }) }),
};
