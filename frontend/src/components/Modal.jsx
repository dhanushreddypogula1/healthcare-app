import React, { useEffect } from "react";
export default function Modal({ isOpen, onClose, title, children, maxWidth = 560 }) {
  useEffect(() => {
    if (!isOpen) return;
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()} style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(15,34,53,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(4px)",
      animation: "fadeIn 0.2s ease",
      padding: 24,
    }}>
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "36px 40px",
        width: "100%", maxWidth,
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: "var(--shadow-lg)",
        animation: "slideUp 0.28s cubic-bezier(0.4,0,0.2,1)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--text-primary)", fontWeight: 400, letterSpacing: -0.3 }}>
            {title}
          </h2>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "var(--bg-subtle)", border: "1px solid var(--border)",
            color: "var(--text-muted)", fontSize: 18, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1,
            transition: "all 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--border)"; e.currentTarget.style.color = "var(--text-primary)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-subtle)"; e.currentTarget.style.color = "var(--text-muted)"; }}
          >×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
