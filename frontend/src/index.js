import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const style = document.createElement("style");
style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@300;400;500;600&family=Outfit:wght@300;400;500;600;700&display=swap');

  :root {
    --bg:          #f7f5f0;
    --bg-card:     #ffffff;
    --bg-subtle:   #f0ede6;
    --bg-input:    #faf9f6;
    --border:      #e2ddd4;
    --border-focus:#1a4a3a;
    --navy:        #0f2235;
    --navy-mid:    #1e3a52;
    --emerald:     #1a4a3a;
    --emerald-mid: #2d6a52;
    --emerald-lit: #3d8a6a;
    --emerald-pale:#e8f5ef;
    --gold:        #c9a84c;
    --gold-pale:   #fdf6e3;
    --red:         #c0392b;
    --red-pale:    #fdf0ee;
    --text-primary:#0f2235;
    --text-mid:    #4a5568;
    --text-muted:  #8a9bb0;
    --text-faint:  #c4cdd8;
    --shadow-sm:   0 1px 3px rgba(15,34,53,0.08), 0 1px 2px rgba(15,34,53,0.04);
    --shadow-md:   0 4px 16px rgba(15,34,53,0.10), 0 2px 6px rgba(15,34,53,0.06);
    --shadow-lg:   0 12px 40px rgba(15,34,53,0.14), 0 4px 12px rgba(15,34,53,0.08);
    --radius-sm:   8px;
    --radius-md:   12px;
    --radius-lg:   18px;
    --font-display:'Instrument Serif', Georgia, serif;
    --font-body:   'Outfit', sans-serif;
    --font-mono:   'JetBrains Mono', monospace;
    --transition:  0.18s cubic-bezier(0.4, 0, 0.2, 1);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    background: var(--bg);
    color: var(--text-primary);
    font-family: var(--font-body);
    font-size: 15px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    min-height: 100vh;
  }

  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: var(--bg-subtle); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--text-faint); }

  input, select, textarea, button { font-family: var(--font-body); }
  input[type="date"]::-webkit-calendar-picker-indicator { opacity: 0.4; cursor: pointer; }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }

  .animate-in { animation: slideUp 0.35s cubic-bezier(0.4,0,0.2,1) both; }
  .fade-in    { animation: fadeIn 0.25s ease both; }

  .stagger > *:nth-child(1) { animation-delay: 0.05s; }
  .stagger > *:nth-child(2) { animation-delay: 0.10s; }
  .stagger > *:nth-child(3) { animation-delay: 0.15s; }
  .stagger > *:nth-child(4) { animation-delay: 0.20s; }
  .stagger > *:nth-child(5) { animation-delay: 0.25s; }
  .stagger > *:nth-child(6) { animation-delay: 0.30s; }
`;
document.head.appendChild(style);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<React.StrictMode><App /></React.StrictMode>);
