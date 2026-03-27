import { Icon } from "./UI";
import { ic } from "../utils/constants";

export default function Sidebar({ currentUser, page, setPage, onLogout }) {
  const isAdmin = currentUser.role === "admin";
  const nav = isAdmin
    ? [
        { id: "dashboard", label: "Dashboard",  icon: ic.dashboard },
        { id: "residents", label: "Cư dân",       icon: ic.users     },
        { id: "history",   label: "Lịch sử",     icon: ic.history   },
        { id: "verify",    label: "ESP32 Test",  icon: ic.key       },
      ]
    : [
        { id: "shipper",   label: "Tạo đơn",    icon: ic.send     },
        { id: "orders",    label: "Đơn của tôi", icon: ic.mail     },
        { id: "history",   label: "Lịch sử",    icon: ic.history  },
        { id: "verify",    label: "ESP32 Test",  icon: ic.key      },
      ];

  return (
    <div style={{ width: 224, background: "#0d1117", borderRight: "1px solid #161b22", display: "flex", flexDirection: "column", flexShrink: 0 }}>
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid #161b22" }}>
        <div style={{ fontSize: 16, fontWeight: 900, color: "#f1f5f9", letterSpacing: "-0.02em" }}>
          <span style={{ color: "#4f46e5" }}>▣</span> LockerOS
        </div>
        <div style={{ fontSize: 11, color: "#475569", marginTop: 3, fontFamily: "monospace" }}>Chung cư Sunrise</div>
      </div>

      <div style={{ padding: "16px 20px", borderBottom: "1px solid #161b22" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, background: isAdmin ? "#1e1b4b" : "#0f2a1a", border: `2px solid ${isAdmin ? "#4f46e5" : "#166534"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon d={ic.user} size={15} color={isAdmin ? "#818cf8" : "#4ade80"} />
          </div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{currentUser.name}</div>
            <div style={{ fontSize: 10, fontWeight: 700, fontFamily: "monospace", letterSpacing: "0.06em", color: isAdmin ? "#818cf8" : "#4ade80" }}>{isAdmin ? "ADMIN" : "SHIPPER"}</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: "14px 12px" }}>
        {nav.map(item => (
          <button key={item.id} onClick={() => setPage(item.id)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", borderRadius: 9, border: "none", cursor: "pointer", marginBottom: 3, textAlign: "left", background: page === item.id ? "#1e1b4b" : "transparent", color: page === item.id ? "#818cf8" : "#475569", fontWeight: page === item.id ? 700 : 500, fontSize: 13 }}>
            <Icon d={item.icon} size={16} color={page === item.id ? "#818cf8" : "#475569"} />
            {item.label}
            {page === item.id && <div style={{ marginLeft: "auto", width: 5, height: 5, borderRadius: "50%", background: "#818cf8" }} />}
          </button>
        ))}
      </nav>

      <div style={{ padding: "14px 12px", borderTop: "1px solid #161b22" }}>
        <button onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", borderRadius: 9, border: "none", cursor: "pointer", background: "transparent", color: "#64748b", fontSize: 13 }}>
          <Icon d={ic.logout} size={16} color="#64748b" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
}