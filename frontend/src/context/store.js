import { create } from "zustand";
import { doctorService, appointmentService, statsService } from "../services/api";

const useStore = create((set, get) => ({
  // ── Doctors ────────────────────────────────────────────────────────────────
  doctors: [],
  doctorsLoading: false,
  doctorsError: null,

  fetchDoctors: async () => {
    set({ doctorsLoading: true, doctorsError: null });
    try {
      const data = await doctorService.getAll();
      set({ doctors: data, doctorsLoading: false });
    } catch (e) {
      set({ doctorsError: e.response?.data?.detail || "Failed to load doctors", doctorsLoading: false });
    }
  },

  addDoctor: async (doctorData) => {
    const created = await doctorService.create(doctorData);
    set((s) => ({ doctors: [...s.doctors, created] }));
    return created;
  },

  // ── Appointments ───────────────────────────────────────────────────────────
  appointments: [],
  appointmentsLoading: false,
  appointmentsError: null,

  fetchAppointments: async () => {
    set({ appointmentsLoading: true, appointmentsError: null });
    try {
      const data = await appointmentService.getAll();
      set({ appointments: data, appointmentsLoading: false });
    } catch (e) {
      set({ appointmentsError: e.response?.data?.detail || "Failed to load appointments", appointmentsLoading: false });
    }
  },

  bookAppointment: async (appointmentData) => {
    const created = await appointmentService.create(appointmentData);
    set((s) => ({ appointments: [...s.appointments, created] }));
    return created;
  },

  cancelAppointment: async (id) => {
    await appointmentService.cancel(id);
    set((s) => ({ appointments: s.appointments.filter((a) => a.id !== id) }));
  },

  // ── Stats ──────────────────────────────────────────────────────────────────
  stats: { total_doctors: 0, appointments_today: 0, upcoming_appointments: 0 },
  fetchStats: async () => {
    try {
      const data = await statsService.get();
      set({ stats: data });
    } catch (_) {}
  },
}));

export default useStore;
