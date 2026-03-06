import { useEffect } from "react";
import useStore from "../context/store";

export function useDoctors() {
  const { doctors, doctorsLoading, doctorsError, fetchDoctors, addDoctor } = useStore();

  useEffect(() => {
    if (doctors.length === 0) fetchDoctors();
  }, []); // eslint-disable-line

  return { doctors, loading: doctorsLoading, error: doctorsError, fetchDoctors, addDoctor };
}

export function useAppointments(pollInterval = null) {
  const {
    appointments, appointmentsLoading, appointmentsError,
    fetchAppointments, bookAppointment, cancelAppointment,
  } = useStore();

  useEffect(() => {
    fetchAppointments();
    if (!pollInterval) return;
    const id = setInterval(fetchAppointments, pollInterval);
    return () => clearInterval(id);
  }, []); // eslint-disable-line

  return {
    appointments, loading: appointmentsLoading, error: appointmentsError,
    fetchAppointments, bookAppointment, cancelAppointment,
  };
}

export function useStats() {
  const { stats, fetchStats } = useStore();
  useEffect(() => { fetchStats(); }, []); // eslint-disable-line
  return stats;
}
