import { STATUS_CONFIG } from "../utils/constants";

export const Icon = ({ d, size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

export const StatusBadge = ({ status }) => {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.EMPTY;
  return (
    <span style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}`, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", fontFamily: "monospace" }}>
      {c.label}
    </span>
  );
};

export const LockerCard = ({ locker, onReset, isAdmin }) => {
  const colors = {
    EMPTY: { glow: "#4ade8033", border: "#166534", dot: "#4ade80" },
    FULL:  { glow: "#fb923c33", border: "#9a3412", dot: "#fb923c" },
    OPEN:  { glow: "#60a5fa33", border: "#1e40af", dot: "#60a5fa" },
  };
  const c = colors[locker.status] || colors.EMPTY;
  return (
    <div style={{ background: "#0d1117", border: `2px solid ${c.border}`, borderRadius: 14, padding: "22px 20px", boxShadow: `0 0 20px ${c.glow}`, transition: "all 0.3s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontFamily: "monospace", fontSize: 22, fontWeight: 900, color: "#f1f5f9", letterSpacing: 2 }}>{locker.locker_code}</div>
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: c.dot, boxShadow: `0 0 10px ${c.dot}` }} />
      </div>
      <StatusBadge status={locker.status} />
      {isAdmin && locker.status !== "EMPTY" && (
        <button onClick={() => onReset(locker.id)} style={{ marginTop: 14, width: "100%", background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", fontSize: 12, padding: "7px 0", borderRadius: 7, cursor: "pointer", fontFamily: "monospace" }}>
          ↺ RESET TỦ
        </button>
      )}
    </div>
  );
};

export const Spinner = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
    <div style={{ width: 32, height: 32, border: "3px solid #1e293b", borderTop: "3px solid #4f46e5", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export const ErrorMsg = ({ msg }) => (
  <div style={{ background: "#1f0a0a", border: "1px solid #7f1d1d", borderRadius: 8, padding: "10px 14px", color: "#f87171", fontSize: 13 }}>⚠ {msg}</div>
);
