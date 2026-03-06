import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

// ─── Doctors ──────────────────────────────────────────────────────────────────

export const doctorService = {
  getAll: () => api.get("/doctors/").then((r) => r.data),
  create: (data) => api.post("/doctors/", data).then((r) => r.data),
  getBookedSlots: (doctorId, date) =>
    api.get(`/doctors/${doctorId}/booked-slots`, { params: { date } }).then((r) => r.data),
};

// ─── Appointments ─────────────────────────────────────────────────────────────

export const appointmentService = {
  getAll: () => api.get("/appointments/").then((r) => r.data),
  create: (data) => api.post("/appointments/", data).then((r) => r.data),
  cancel: (id) => api.delete(`/appointments/${id}`).then((r) => r.data),
};

// ─── Stats ────────────────────────────────────────────────────────────────────

export const statsService = {
  get: () => api.get("/stats/").then((r) => r.data),
};
