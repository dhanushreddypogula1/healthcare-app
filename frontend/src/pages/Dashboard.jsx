import React, { useState } from "react";
import { useStats, useDoctors, useAppointments } from "../hooks";
import Modal from "../components/Modal";
import BookAppointmentForm from "../components/BookAppointmentForm";
import Toast from "../components/Toast";
import { formatSlot } from "../utils/helpers";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const card = {
  background: "var(--bg-card)", border: "1px solid var(--border)",
  borderRadius: "var(--radius-lg)", padding: "28px 28px",
  boxShadow: "var(--shadow-sm)",
};

const PageHeader = ({ title, subtitle, action }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 36 }}>
    <div>
      <p style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "var(--font-mono)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>
        Healthcare Dashboard
      </p>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 400, letterSpacing: -0.5, color: "var(--text-primary)", lineHeight: 1.1 }}>
        {title}
      </h1>
      {subtitle && <p style={{ color: "var(--text-muted)", marginTop: 6, fontSize: 14 }}>{subtitle}</p>}
    </div>
    {action}
  </div>
);

const Btn = ({ onClick, children, variant = "primary" }) => (
  <button onClick={onClick} style={{
    padding: "10px 22px", borderRadius: "var(--radius-sm)", cursor: "pointer",
    fontWeight: 600, fontSize: 14, transition: "all 0.15s", letterSpacing: 0.2,
    ...(variant === "primary"
      ? { background: "var(--emerald)", border: "none", color: "#fff" }
      : { background: "var(--bg-card)", border: "1.5px solid var(--border)", color: "var(--text-mid)" }
    ),
  }}
    onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
  >{children}</button>
);

export default function Dashboard() {
  const stats = useStats();
  const { doctors } = useDoctors();
  const { appointments } = useAppointments();
  const [bookOpen, setBookOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const chartData = doctors.map((d) => ({
    name: d.name.replace(/^Dr\.?\s*/i, ""),
    count: appointments.filter((a) => a.doctor_id === d.id).length,
  }));

  const COLORS = ["#1a4a3a","#2d6a52","#3d8a6a","#4daa82","#5dca9a"];

  const statCards = [
    { label: "Total Physicians", value: stats.total_doctors, sub: "On staff", accent: "#1a4a3a", bg: "var(--emerald-pale)" },
    { label: "Today's Visits", value: stats.appointments_today, sub: "Scheduled today", accent: "#c9a84c", bg: "var(--gold-pale)" },
    { label: "Upcoming", value: stats.upcoming_appointments, sub: "Future bookings", accent: "#2563eb", bg: "#eff6ff" },
  ];

  return (
    <div>
      <PageHeader
        title="Good morning."
        subtitle={new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        action={<Btn onClick={() => setBookOpen(true)}>+ New Appointment</Btn>}
      />

      {/* Stat Cards */}
      <div className="stagger" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 28 }}>
        {statCards.map((s) => (
          <div key={s.label} className="animate-in" style={{ ...card, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: s.accent, borderRadius: "var(--radius-lg) var(--radius-lg) 0 0" }} />
            <p style={{ color: "var(--text-muted)", fontSize: 12, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 16 }}>{s.label}</p>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 52, color: s.accent, lineHeight: 1, letterSpacing: -2 }}>
                {s.value}
              </span>
              <span style={{ background: s.bg, color: s.accent, fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 100, marginBottom: 6 }}>
                {s.sub}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Quick Book */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 28 }}>
        {/* Chart */}
        <div className="animate-in" style={{ ...card }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div>
              <p style={{ color: "var(--text-muted)", fontSize: 12, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>Appointments per Doctor</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} barSize={28}>
              <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 12, fontFamily: "Outfit" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 8, fontFamily: "Outfit", fontSize: 13, boxShadow: "var(--shadow-md)" }}
                cursor={{ fill: "rgba(26,74,58,0.05)" }}
              />
              <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Book card */}
        <div className="animate-in" style={{
          ...card, background: "var(--navy)",
          display: "flex", flexDirection: "column", justifyContent: "center", gap: 18,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: "rgba(61,138,106,0.2)", border: "1px solid rgba(61,138,106,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
          }}>📅</div>
          <div>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>Quick Action</p>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "#fff", fontWeight: 400, lineHeight: 1.2 }}>
              Schedule a new visit
            </h3>
          </div>
          <button onClick={() => setBookOpen(true)} style={{
            background: "var(--emerald-mid)", border: "none", borderRadius: "var(--radius-sm)",
            padding: "11px 20px", color: "#fff", fontWeight: 600, fontSize: 14,
            cursor: "pointer", width: "100%", transition: "background 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--emerald-lit)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--emerald-mid)"}
          >
            + Book Appointment
          </button>
        </div>
      </div>

      {/* Recent */}
      <div className="animate-in" style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <p style={{ color: "var(--text-muted)", fontSize: 12, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>
            Recent Appointments
          </p>
          <span style={{ background: "var(--emerald-pale)", color: "var(--emerald)", fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 100 }}>
            {appointments.length} total
          </span>
        </div>
        {appointments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-faint)" }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>🗓</p>
            <p style={{ fontSize: 14 }}>No appointments yet</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[...appointments].slice(-6).reverse().map((a, i, arr) => (
              <div key={a.id} style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                padding: "14px 16px", alignItems: "center",
                borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
                borderRadius: i === 0 ? "var(--radius-sm) var(--radius-sm) 0 0" : i === arr.length - 1 ? "0 0 var(--radius-sm) var(--radius-sm)" : 0,
                transition: "background 0.12s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--bg-subtle)"}
                onMouseLeave={e => e.currentTarget.style.background = ""}
              >
                <span style={{ color: "var(--text-primary)", fontSize: 14, fontWeight: 500 }}>{a.patient_name}</span>
                <span style={{ color: "var(--emerald-mid)", fontSize: 13, fontWeight: 500 }}>{a.doctor?.name || `Doctor #${a.doctor_id}`}</span>
                <span style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "var(--font-mono)", textAlign: "right" }}>{formatSlot(a.slot)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={bookOpen} onClose={() => setBookOpen(false)} title="Book an Appointment">
        <BookAppointmentForm onSuccess={() => { setBookOpen(false); setToast({ message: "Appointment booked successfully!", type: "success" }); }} />
      </Modal>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
