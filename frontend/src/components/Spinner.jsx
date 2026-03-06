import React from "react";
export default function Spinner({ size = 20, color = "var(--emerald-mid)" }) {
  return (
    <span style={{
      display: "inline-block", width: size, height: size,
      border: `2px solid rgba(45,106,82,0.2)`,
      borderTop: `2px solid ${color}`,
      borderRadius: "50%",
      animation: "spin 0.65s linear infinite",
      flexShrink: 0,
    }} role="status" aria-label="Loading" />
  );
}
