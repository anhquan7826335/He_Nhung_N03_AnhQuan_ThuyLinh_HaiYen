export const ic = {
  dashboard: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  users:     "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 1-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  history:   "M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0",
  key:       "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4",
  send:      "M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7z",
  logout:    "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  eye:       "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  eyeoff:    "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24 M1 1l22 22",
  user:      "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  mail:      "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
  orders:    "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2 M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2 M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2",
};

export const STATUS_CONFIG = {
  EMPTY:     { bg: "#0f2a1a", text: "#4ade80", border: "#166534", label: "TRỐNG"      },
  FULL:      { bg: "#2a1a0f", text: "#fb923c", border: "#9a3412", label: "CÓ HÀNG"    },
  OPEN:      { bg: "#0f1a2a", text: "#60a5fa", border: "#1e40af", label: "ĐANG MỞ"    },
  PENDING:   { bg: "#2a1a0f", text: "#fbbf24", border: "#92400e", label: "CHỜ NHẬN"   },
  COMPLETED: { bg: "#0f2a1a", text: "#4ade80", border: "#166534", label: "HOÀN THÀNH" },
  DELIVERED: { bg: "#0f1a2a", text: "#818cf8", border: "#3730a3", label: "ĐÃ GIAO"    },
  DELIVERY:  { bg: "#0f1a2a", text: "#818cf8", border: "#3730a3", label: "GIAO HÀNG"  },
  PICKUP:    { bg: "#0f2a1a", text: "#4ade80", border: "#166534", label: "NHẬN HÀNG"  },
  CANCELLED: { bg: "#1a0f0f", text: "#f87171", border: "#7f1d1d", label: "ĐÃ HỦY"     },
  RESET:     { bg: "#1a1a0f", text: "#fbbf24", border: "#92400e", label: "RESET"      },
};

export const generateRFID = () => {
  const hex = "0123456789ABCDEF";
  return Array.from({ length: 8 }, () => hex[Math.floor(Math.random() * 16)]).join("");
};
