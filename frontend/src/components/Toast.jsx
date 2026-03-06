import React, { useEffect } from "react";
export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3800);
    return () => clearTimeout(t);
  }, [onClose]);

  const cfg = {
    success: { bg: "#f0faf5", border: "#2d6a52", icon: "✓", color: "#1a4a3a" },
    error:   { bg: "#fef5f5", border: "#c0392b", icon: "✕", color: "#c0392b" },
    info:    { bg: "#f5f8fe", border: "#2563eb", icon: "i", color: "#1d4ed8" },
  }[type] || {};

  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 9999,
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      borderLeft: `4px solid ${cfg.border}`,
      borderRadius: "var(--radius-sm)",
      padding: "14px 18px",
      display: "flex", alignItems: "center", gap: 12,
      boxShadow: "var(--shadow-lg)",
      animation: "slideUp 0.3s cubic-bezier(0.4,0,0.2,1)",
      maxWidth: 380, minWidth: 280,
    }} role="alert">
      <span style={{
        width: 24, height: 24, borderRadius: "50%",
        background: cfg.border, color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, fontWeight: 700, flexShrink: 0,
      }}>{cfg.icon}</span>
      <span style={{ flex: 1, color: cfg.color, fontSize: 14, fontWeight: 500 }}>{message}</span>
      <button onClick={onClose} style={{
        background: "none", border: "none", color: "var(--text-muted)",
        cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 2,
      }}>×</button>
    </div>
  );
}
