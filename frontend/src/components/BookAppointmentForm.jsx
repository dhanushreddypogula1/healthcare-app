import React, { useState, useEffect } from "react";
import useStore from "../context/store";
import { doctorService } from "../services/api";
import { generateSlots, formatHour, buildSlot, todayStr } from "../utils/helpers";
import Spinner from "./Spinner";

const field = {
  label: { display: "block", color: "var(--text-mid)", fontSize: 12, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 7 },
  input: {
    width: "100%", background: "var(--bg-input)",
    border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)",
    padding: "10px 14px", color: "var(--text-primary)",
    fontSize: 14, outline: "none", boxSizing: "border-box",
    transition: "border-color 0.15s",
  },
  error: { color: "var(--red)", fontSize: 12, marginTop: 5, fontWeight: 500 },
};

export default function BookAppointmentForm({ onSuccess, preselectedDoctorId }) {
  const { doctors, bookAppointment } = useStore();
  const [form, setForm] = useState({ doctor_id: preselectedDoctorId || "", patient_name: "", date: todayStr(), hour: "" });
  const [errors, setErrors] = useState({});
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const selectedDoctor = doctors.find((d) => d.id === Number(form.doctor_id));

  useEffect(() => {
    if (!form.doctor_id || !form.date) return;
    doctorService.getBookedSlots(form.doctor_id, form.date)
      .then(setBookedSlots).catch(() => setBookedSlots([]));
  }, [form.doctor_id, form.date]);

  const validate = () => {
    const e = {};
    if (!form.doctor_id) e.doctor_id = "Please select a doctor";
    if (!form.patient_name || form.patient_name.trim().length < 2) e.patient_name = "Minimum 2 characters";
    if (!form.date || form.date < todayStr()) e.date = "Date cannot be in the past";
    if (form.hour === "" || form.hour === null) e.hour = "Please select a time slot";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setLoading(true); setApiError("");
    try {
      await bookAppointment({ doctor_id: Number(form.doctor_id), patient_name: form.patient_name.trim(), slot: buildSlot(form.date, form.hour) });
      setForm({ doctor_id: preselectedDoctorId || "", patient_name: "", date: todayStr(), hour: "" });
      setErrors({});
      onSuccess && onSuccess();
    } catch (err) {
      setApiError(err.response?.data?.detail || "Booking failed. Please try again.");
    } finally { setLoading(false); }
  };

  const slots = selectedDoctor ? generateSlots(selectedDoctor.start_hour, selectedDoctor.end_hour) : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Doctor */}
      <div>
        <label style={field.label}>Physician</label>
        <select style={field.input} value={form.doctor_id}
          onChange={(e) => setForm((f) => ({ ...f, doctor_id: e.target.value, hour: "" }))}
          onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
          onBlur={e => e.target.style.borderColor = "var(--border)"}
        >
          <option value="">Select a doctor…</option>
          {doctors.map((d) => <option key={d.id} value={d.id}>{d.name} — {d.specialization}</option>)}
        </select>
        {errors.doctor_id && <p style={field.error}>{errors.doctor_id}</p>}
      </div>

      {/* Patient */}
      <div>
        <label style={field.label}>Patient Name</label>
        <input style={field.input} placeholder="Full legal name" value={form.patient_name}
          onChange={(e) => setForm((f) => ({ ...f, patient_name: e.target.value }))}
          onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
          onBlur={e => e.target.style.borderColor = "var(--border)"}
        />
        {errors.patient_name && <p style={field.error}>{errors.patient_name}</p>}
      </div>

      {/* Date */}
      <div>
        <label style={field.label}>Appointment Date</label>
        <input type="date" style={field.input} value={form.date} min={todayStr()}
          onChange={(e) => setForm((f) => ({ ...f, date: e.target.value, hour: "" }))}
          onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
          onBlur={e => e.target.style.borderColor = "var(--border)"}
        />
        {errors.date && <p style={field.error}>{errors.date}</p>}
      </div>

      {/* Slots */}
      {selectedDoctor && (
        <div>
          <label style={field.label}>
            Available Time Slots
            <span style={{ color: "var(--text-muted)", fontWeight: 400, textTransform: "none", letterSpacing: 0, marginLeft: 8 }}>
              {selectedDoctor.start_hour}:00 – {selectedDoctor.end_hour}:00
            </span>
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {slots.map((h) => {
              const booked = bookedSlots.includes(String(h));
              const selected = Number(form.hour) === h;
              return (
                <button key={h} disabled={booked}
                  onClick={() => !booked && setForm((f) => ({ ...f, hour: h }))}
                  style={{
                    padding: "9px 6px", borderRadius: "var(--radius-sm)",
                    border: selected ? "1.5px solid var(--emerald)" : "1.5px solid var(--border)",
                    background: booked ? "var(--bg-subtle)" : selected ? "var(--emerald-pale)" : "var(--bg-input)",
                    color: booked ? "var(--text-faint)" : selected ? "var(--emerald)" : "var(--text-mid)",
                    fontSize: 12, fontWeight: selected ? 600 : 400,
                    cursor: booked ? "not-allowed" : "pointer",
                    textDecoration: booked ? "line-through" : "none",
                    transition: "all 0.12s",
                  }}
                  title={booked ? "Already booked" : ""}
                >
                  {formatHour(h)}
                </button>
              );
            })}
          </div>
          {errors.hour && <p style={field.error}>{errors.hour}</p>}
        </div>
      )}

      {apiError && (
        <div style={{ background: "var(--red-pale)", border: "1px solid #f5c6c0", borderRadius: "var(--radius-sm)", padding: "12px 16px" }}>
          <p style={{ color: "var(--red)", fontSize: 13, fontWeight: 500 }}>{apiError}</p>
        </div>
      )}

      <button onClick={handleSubmit} disabled={loading} style={{
        marginTop: 4, padding: "13px 0",
        background: loading ? "var(--bg-subtle)" : "var(--emerald)",
        border: "none", borderRadius: "var(--radius-sm)",
        color: loading ? "var(--text-muted)" : "#fff",
        fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        transition: "all 0.15s", letterSpacing: 0.2,
      }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "var(--emerald-mid)"; }}
        onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "var(--emerald)"; }}
      >
        {loading ? <><Spinner size={18} /> Booking…</> : "Confirm Appointment"}
      </button>
    </div>
  );
}
