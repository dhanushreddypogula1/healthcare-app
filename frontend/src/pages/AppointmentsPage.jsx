import React, { useState } from "react";
import { useAppointments, useDoctors } from "../hooks";
import Modal from "../components/Modal";
import BookAppointmentForm from "../components/BookAppointmentForm";
import Spinner from "../components/Spinner";
import Toast from "../components/Toast";
import { formatSlot } from "../utils/helpers";

const POLL = 20000;

export default function AppointmentsPage() {
  const { appointments, loading, error, cancelAppointment } = useAppointments(POLL);
  const { doctors } = useDoctors();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("slot");
  const [sortDir, setSortDir] = useState("asc");
  const [confirmId, setConfirmId] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const getDoctorName = (id) => doctors.find((d) => d.id === id)?.name || `Doctor #${id}`;
  const getSpec = (id) => doctors.find((d) => d.id === id)?.specialization || "";

  const filtered = appointments.filter((a) => {
    const q = search.toLowerCase();
    return getDoctorName(a.doctor_id).toLowerCase().includes(q) || a.patient_name.toLowerCase().includes(q);
  });

  const sorted = [...filtered].sort((a, b) => {
    let va, vb;
    if (sortKey === "doctor") { va = getDoctorName(a.doctor_id); vb = getDoctorName(b.doctor_id); }
    else if (sortKey === "patient") { va = a.patient_name; vb = b.patient_name; }
    else { va = a.slot; vb = b.slot; }
    if (va < vb) return sortDir === "asc" ? -1 : 1;
    if (va > vb) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const handleCancel = async () => {
    setCancelLoading(true);
    try {
      await cancelAppointment(confirmId);
      setConfirmId(null);
      setToast({ message: "Appointment cancelled.", type: "info" });
    } catch (err) {
      setToast({ message: err.response?.data?.detail || "Cancellation failed.", type: "error" });
    } finally { setCancelLoading(false); }
  };

  const SortBtn = ({ col, label }) => (
    <button onClick={() => handleSort(col)} style={{
      background: "none", border: "none", cursor: "pointer", padding: 0,
      color: sortKey === col ? "var(--emerald)" : "var(--text-muted)",
      fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase",
      display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-body)",
      whiteSpace: "nowrap",
    }}>
      {label}
      {sortKey === col && <span style={{ fontSize: 10 }}>{sortDir === "asc" ? "↑" : "↓"}</span>}
    </button>
  );

  const isUpcoming = (slot) => new Date(slot) >= new Date();

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 36 }}>
        <div>
          <p style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "var(--font-mono)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Schedule</p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 400, letterSpacing: -0.5, color: "var(--text-primary)", lineHeight: 1.1 }}>
            Appointments
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block", animation: "pulse 2s infinite" }} />
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Auto-refreshes every 20s · {appointments.length} total</p>
          </div>
        </div>
        <button onClick={() => setBookOpen(true)} style={{
          background: "var(--emerald)", border: "none", borderRadius: "var(--radius-sm)",
          padding: "10px 22px", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer",
        }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--emerald-mid)"}
          onMouseLeave={e => e.currentTarget.style.background = "var(--emerald)"}
        >+ Book Appointment</button>
      </div>

      {/* Filter bar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, alignItems: "center" }}>
        <div style={{ position: "relative", maxWidth: 340 }}>
          <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--text-faint)" }}>⌕</span>
          <input style={{
            background: "var(--bg-card)", border: "1.5px solid var(--border)",
            borderRadius: "var(--radius-sm)", padding: "10px 14px 10px 36px",
            color: "var(--text-primary)", fontSize: 14, outline: "none", width: 340,
            transition: "border-color 0.15s",
          }}
            placeholder="Search by doctor or patient…"
            value={search} onChange={(e) => setSearch(e.target.value)}
            onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
            onBlur={e => e.target.style.borderColor = "var(--border)"}
          />
        </div>
        <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
          {filtered.length} {filtered.length === 1 ? "result" : "results"}
        </span>
      </div>

      {loading && <div style={{ textAlign: "center", padding: 60 }}><Spinner size={28} /></div>}
      {error && <p style={{ color: "var(--red)" }}>{error}</p>}

      {!loading && (
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--shadow-sm)",
        }}>
          {/* Table head */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1.4fr auto",
            padding: "12px 20px", background: "var(--bg-subtle)",
            borderBottom: "1px solid var(--border)",
          }}>
            <SortBtn col="doctor" label="Physician" />
            <SortBtn col="patient" label="Patient" />
            <SortBtn col="slot" label="Date & Time" />
            <span style={{ width: 72 }} />
          </div>

          {sorted.length === 0 ? (
            <div style={{ textAlign: "center", padding: "56px 0", color: "var(--text-faint)" }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>📭</p>
              <p style={{ fontSize: 14 }}>No appointments found</p>
            </div>
          ) : sorted.map((a, i) => {
            const upcoming = isUpcoming(a.slot);
            return (
              <div key={a.id} style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 1.4fr auto",
                padding: "16px 20px", alignItems: "center",
                borderBottom: i < sorted.length - 1 ? "1px solid var(--border)" : "none",
                transition: "background 0.12s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--bg-subtle)"}
                onMouseLeave={e => e.currentTarget.style.background = ""}
              >
                <div>
                  <p style={{ color: "var(--text-primary)", fontSize: 14, fontWeight: 500 }}>{getDoctorName(a.doctor_id)}</p>
                  {getSpec(a.doctor_id) && (
                    <p style={{ color: "var(--text-muted)", fontSize: 11, marginTop: 2 }}>{getSpec(a.doctor_id)}</p>
                  )}
                </div>
                <p style={{ color: "var(--text-mid)", fontSize: 14 }}>{a.patient_name}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                    background: upcoming ? "#22c55e" : "var(--text-faint)",
                  }} />
                  <span style={{ color: "var(--text-mid)", fontSize: 13, fontFamily: "var(--font-mono)" }}>
                    {formatSlot(a.slot)}
                  </span>
                </div>
                <button onClick={() => setConfirmId(a.id)} style={{
                  background: "none", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)", padding: "6px 14px",
                  color: "var(--text-muted)", fontSize: 12, fontWeight: 500, cursor: "pointer",
                  transition: "all 0.15s", width: 72,
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--red)"; e.currentTarget.style.color = "var(--red)"; e.currentTarget.style.background = "var(--red-pale)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "none"; }}
                >Cancel</button>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm Cancel Modal */}
      <Modal isOpen={!!confirmId} onClose={() => setConfirmId(null)} title="Cancel Appointment" maxWidth={420}>
        <div style={{
          background: "var(--red-pale)", border: "1px solid #f5c6c0",
          borderRadius: "var(--radius-sm)", padding: "16px 18px", marginBottom: 24,
          display: "flex", gap: 12, alignItems: "flex-start",
        }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <p style={{ color: "var(--red)", fontSize: 14, lineHeight: 1.5 }}>
            This will permanently cancel the appointment. The patient will need to rebook. This action cannot be undone.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => setConfirmId(null)} style={{
            flex: 1, padding: "11px 0", background: "var(--bg-card)",
            border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)",
            color: "var(--text-mid)", fontWeight: 600, fontSize: 14, cursor: "pointer",
          }}>Keep Appointment</button>
          <button onClick={handleCancel} disabled={cancelLoading} style={{
            flex: 1, padding: "11px 0",
            background: cancelLoading ? "var(--bg-subtle)" : "var(--red)",
            border: "none", borderRadius: "var(--radius-sm)",
            color: cancelLoading ? "var(--text-muted)" : "#fff",
            fontWeight: 600, fontSize: 14, cursor: cancelLoading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            {cancelLoading ? <><Spinner size={16} color="#fff" /> Cancelling…</> : "Yes, Cancel"}
          </button>
        </div>
      </Modal>

      <Modal isOpen={bookOpen} onClose={() => setBookOpen(false)} title="Book an Appointment">
        <BookAppointmentForm onSuccess={() => { setBookOpen(false); setToast({ message: "Appointment booked!", type: "success" }); }} />
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
