import React from "react";
import { BrowserRouter, Routes, Route, NavLink, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import DoctorsPage from "./pages/DoctorsPage";
import AppointmentsPage from "./pages/AppointmentsPage";

const NAV = [
  { to: "/", label: "Overview", emoji: "▦" },
  { to: "/doctors", label: "Doctors", emoji: "⚕" },
  { to: "/appointments", label: "Appointments", emoji: "◫" },
];

function Sidebar() {
  const location = useLocation();
  return (
    <aside style={{
      width: 240, background: "var(--navy)",
      position: "fixed", top: 0, left: 0, bottom: 0,
      display: "flex", flexDirection: "column", zIndex: 100,
    }}>
      <div style={{ padding: "32px 28px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 4 }}>
          <div style={{
            width: 36, height: 36,
            background: "linear-gradient(135deg, #2d6a52, #3d8a6a)",
            borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 18 }}>✦</span>
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "#fff", letterSpacing: -0.3 }}>
            MediBook
          </span>
        </div>
        <p style={{ color: "rgba(255,255,255,0.28)", fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: 2, textTransform: "uppercase", paddingLeft: 47 }}>
          Clinical Suite
        </p>
      </div>

      <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "0 28px 20px" }} />

      <nav style={{ padding: "0 14px", display: "flex", flexDirection: "column", gap: 2 }}>
        <p style={{ color: "rgba(255,255,255,0.22)", fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: 2, textTransform: "uppercase", padding: "0 12px", marginBottom: 8 }}>
          Navigation
        </p>
        {NAV.map((item) => {
          const active = item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to);
          return (
            <NavLink key={item.to} to={item.to} end={item.to === "/"}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                borderRadius: "var(--radius-sm)", textDecoration: "none", fontSize: 14,
                fontWeight: active ? 600 : 400,
                color: active ? "#fff" : "rgba(255,255,255,0.42)",
                background: active ? "rgba(61,138,106,0.18)" : "transparent",
                borderLeft: active ? "3px solid #3d8a6a" : "3px solid transparent",
                transition: "all 0.15s ease",
              }}
            >
              <span style={{ fontSize: 16, width: 20, textAlign: "center", color: active ? "#3d8a6a" : "inherit" }}>
                {item.emoji}
              </span>
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div style={{ marginTop: "auto", padding: "20px 28px" }}>
        <div style={{ height: 1, background: "rgba(255,255,255,0.07)", marginBottom: 20 }} />
        <div style={{
          background: "rgba(255,255,255,0.05)", borderRadius: "var(--radius-sm)",
          padding: "12px 14px", display: "flex", alignItems: "center", gap: 10
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: "50%",
            background: "linear-gradient(135deg, #1a4a3a, #3d8a6a)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, color: "white", fontWeight: 700,
          }}>A</div>
          <div>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: 500, lineHeight: 1.2 }}>Admin</p>
            <p style={{ color: "rgba(255,255,255,0.28)", fontSize: 10, fontFamily: "var(--font-mono)" }}>v1.0.0</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Layout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ marginLeft: 240, flex: 1, padding: "44px 52px", minHeight: "100vh", maxWidth: "calc(100vw - 240px)" }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return <BrowserRouter><Layout /></BrowserRouter>;
}
