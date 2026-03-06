import React, { useState } from "react";
import { useDoctors } from "../hooks";
import Modal from "../components/Modal";
import Spinner from "../components/Spinner";
import Toast from "../components/Toast";

const fld = {
  label: { display: "block", color: "var(--text-mid)", fontSize: 12, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 7 },
  input: { width: "100%", background: "var(--bg-input)", border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "10px 14px", color: "var(--text-primary)", fontSize: 14, outline: "none", boxSizing: "border-box", transition: "border-color 0.15s" },
  error: { color: "var(--red)", fontSize: 12, marginTop: 5, fontWeight: 500 },
};

const SPEC_PALETTE = {
  "Cardiology":       { bg: "#fef2f2", color: "#c0392b", dot: "#e74c3c" },
  "Neurology":        { bg: "#f5f3ff", color: "#5b21b6", dot: "#7c3aed" },
  "Orthopedics":      { bg: "#ecfdf5", color: "#065f46", dot: "#059669" },
  "Dermatology":      { bg: "#fff7ed", color: "#92400e", dot: "#d97706" },
  "General Practice": { bg: "#eff6ff", color: "#1e40af", dot: "#2563eb" },
};

const getSpec = (s) => SPEC_PALETTE[s] || { bg: "var(--emerald-pale)", color: "var(--emerald)", dot: "var(--emerald-mid)" };

const EMPTY = { name: "", specialization: "", start_hour: "", end_hour: "" };

export default function DoctorsPage() {
  const { doctors, loading, error, addDoctor } = useDoctors();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const filtered = doctors.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization.toLowerCase().includes(search.toLowerCase())
  );

  const validate = () => {
    const e = {};
    if (!form.name || form.name.trim().length < 3) e.name = "Name must be at least 3 characters";
    if (!form.specialization) e.specialization = "Specialization is required";
    const s = parseInt(form.start_hour, 10), en = parseInt(form.end_hour, 10);
    if (isNaN(s) || s < 0 || s > 23) e.start_hour = "Must be 0–23";
    if (isNaN(en) || en < 0 || en > 23) e.end_hour = "Must be 0–23";
    if (!e.start_hour && !e.end_hour && s >= en) e.end_hour = "Must be greater than start";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate(); setFormErrors(e);
    if (Object.keys(e).length > 0) return;
    setSubmitting(true);
    try {
      await addDoctor({ name: form.name.trim(), specialization: form.specialization.trim(), start_hour: parseInt(form.start_hour, 10), end_hour: parseInt(form.end_hour, 10) });
      setForm(EMPTY); setFormErrors({}); setModalOpen(false);
      setToast({ message: `${form.name} has been added.`, type: "success" });
    } catch (err) {
      setFormErrors({ api: err.response?.data?.detail || "Failed to add doctor" });
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 36 }}>
        <div>
          <p style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "var(--font-mono)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Staff Directory</p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 400, letterSpacing: -0.5, color: "var(--text-primary)", lineHeight: 1.1 }}>
            Our Physicians
          </h1>
          <p style={{ color: "var(--text-muted)", marginTop: 6, fontSize: 14 }}>{doctors.length} doctors registered</p>
        </div>
        <button onClick={() => setModalOpen(true)} style={{
          background: "var(--emerald)", border: "none", borderRadius: "var(--radius-sm)",
          padding: "10px 22px", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer",
        }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--emerald-mid)"}
          onMouseLeave={e => e.currentTarget.style.background = "var(--emerald)"}
        >+ Add Doctor</button>
      </div>

      {/* Search */}
      <div style={{ position: "relative", maxWidth: 380, marginBottom: 28 }}>
        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-faint)", fontSize: 16 }}>⌕</span>
        <input style={{ ...fld.input, paddingLeft: 38, maxWidth: "100%" }}
          placeholder="Search by name or specialty…"
          value={search} onChange={(e) => setSearch(e.target.value)}
          onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
          onBlur={e => e.target.style.borderColor = "var(--border)"}
        />
      </div>

      {loading && <div style={{ textAlign: "center", padding: 60 }}><Spinner size={28} /></div>}
      {error && <p style={{ color: "var(--red)", padding: 12 }}>{error}</p>}

      {/* Grid */}
      <div className="stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 18 }}>
        {filtered.map((d) => {
          const sp = getSpec(d.specialization);
          return (
            <div key={d.id} className="animate-in" style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)", padding: "24px 24px 20px",
              boxShadow: "var(--shadow-sm)", transition: "all 0.18s",
              cursor: "default",
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow-md)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--shadow-sm)"; e.currentTarget.style.transform = ""; }}
            >
              {/* Avatar */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: `linear-gradient(135deg, ${sp.dot}33, ${sp.dot}22)`,
                  border: `1px solid ${sp.dot}33`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, color: sp.color, fontFamily: "var(--font-display)",
                }}>
                  {d.name.split(" ").filter(w => w.match(/^[A-Z]/)).slice(0,2).map(w => w[0]).join("")}
                </div>
                <div>
                  <h3 style={{ fontFamily: "var(--font-body)", fontSize: 16, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{d.name}</h3>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: sp.dot, flexShrink: 0 }} />
                    <span style={{ background: sp.bg, color: sp.color, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 100 }}>{d.specialization}</span>
                  </span>
                </div>
              </div>
              {/* Hours */}
              <div style={{ background: "var(--bg-subtle)", borderRadius: "var(--radius-sm)", padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14 }}>🕐</span>
                <span style={{ color: "var(--text-mid)", fontSize: 13, fontFamily: "var(--font-mono)" }}>
                  {d.start_hour}:00 – {d.end_hour}:00
                </span>
                <span style={{ marginLeft: "auto", color: "var(--text-faint)", fontSize: 11 }}>
                  {d.end_hour - d.start_hour}h window
                </span>
              </div>
            </div>
          );
        })}
        {!loading && filtered.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 60, color: "var(--text-faint)" }}>
            <p style={{ fontSize: 36, marginBottom: 8 }}>👨‍⚕️</p>
            <p>No doctors found</p>
          </div>
        )}
      </div>

      {/* Add Doctor Modal */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setForm(EMPTY); setFormErrors({}); }} title="Register New Physician">
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label style={fld.label}>Full Name</label>
            <input style={fld.input} placeholder="Dr. Jane Smith" value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
            {formErrors.name && <p style={fld.error}>{formErrors.name}</p>}
          </div>
          <div>
            <label style={fld.label}>Specialization</label>
            <input style={fld.input} placeholder="e.g. Cardiology" value={form.specialization}
              onChange={(e) => setForm((f) => ({ ...f, specialization: e.target.value }))}
              onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
            {formErrors.specialization && <p style={fld.error}>{formErrors.specialization}</p>}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={fld.label}>Start Hour (0–23)</label>
              <input type="number" min={0} max={23} style={fld.input} placeholder="9" value={form.start_hour}
                onChange={(e) => setForm((f) => ({ ...f, start_hour: e.target.value }))}
                onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
              />
              {formErrors.start_hour && <p style={fld.error}>{formErrors.start_hour}</p>}
            </div>
            <div>
              <label style={fld.label}>End Hour (0–23)</label>
              <input type="number" min={0} max={23} style={fld.input} placeholder="17" value={form.end_hour}
                onChange={(e) => setForm((f) => ({ ...f, end_hour: e.target.value }))}
                onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
              />
              {formErrors.end_hour && <p style={fld.error}>{formErrors.end_hour}</p>}
            </div>
          </div>
          {formErrors.api && (
            <div style={{ background: "var(--red-pale)", border: "1px solid #f5c6c0", borderRadius: "var(--radius-sm)", padding: "12px 16px" }}>
              <p style={{ color: "var(--red)", fontSize: 13, fontWeight: 500 }}>{formErrors.api}</p>
            </div>
          )}
          <button onClick={handleSubmit} disabled={submitting} style={{
            marginTop: 4, padding: "13px 0",
            background: submitting ? "var(--bg-subtle)" : "var(--emerald)",
            border: "none", borderRadius: "var(--radius-sm)",
            color: submitting ? "var(--text-muted)" : "#fff",
            fontSize: 15, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          }}>
            {submitting ? <><Spinner size={18} /> Adding…</> : "Register Doctor"}
          </button>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
