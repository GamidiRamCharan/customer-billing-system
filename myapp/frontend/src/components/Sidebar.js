import React from "react";

function Sidebar({ onLogout, setActivePage, activePage }) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "sales", label: "Sales Reports", icon: "📈" },
    { id: "customers", label: "Clients Directory", icon: "👥" },
    { id: "bills", label: "Billing Desk", icon: "🧾" },
    { id: "items", label: "Inventory Desk", icon: "📦" },
    { id: "profile", label: "Merchant Profile", icon: "👤" },
  ];

  return (
    <div style={styles.sidebar}>
      <div style={styles.branding}>
        <span style={styles.brandIcon}>💼</span>
        <span style={styles.brandName}>MERCHANT ERP</span>
      </div>

      <ul style={styles.menuList}>
        {menuItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <li
              key={item.id}
              onClick={() => setActivePage(item.id)}
              style={{
                ...styles.menuItem,
                ...(isActive ? styles.activeMenuItem : {}),
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = "#1e293b";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={styles.menuIcon}>{item.icon}</span>
              <span style={styles.menuLabel}>{item.label}</span>
            </li>
          );
        })}
      </ul>

      <button
        onClick={onLogout}
        style={styles.logoutBtn}
        onMouseEnter={(e) => e.currentTarget.style.opacity = 0.9}
        onMouseLeave={(e) => e.currentTarget.style.opacity = 1}
      >
        🚪 Terminate Session
      </button>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "240px",
    background: "#0f172a",
    color: "#f8fafc",
    padding: "24px 16px",
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    position: "fixed",
    left: 0,
    top: 0,
    borderRight: "1px solid #1e293b",
    boxShadow: "4px 0 10px rgba(0, 0, 0, 0.05)",
  },
  branding: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 8px",
    marginBottom: "32px",
    borderBottom: "1px solid #1e293b",
  },
  brandIcon: {
    fontSize: "20px",
  },
  brandName: {
    fontSize: "15px",
    fontWeight: 800,
    color: "#38bdf8",
    letterSpacing: "1px",
  },
  menuList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flexGrow: 1,
  },
  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 14px",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    background: "transparent",
    color: "#94a3b8",
  },
  activeMenuItem: {
    background: "linear-gradient(to right, #4f46e5, #6366f1)",
    color: "#ffffff",
    fontWeight: 600,
    boxShadow: "0 4px 12px rgba(79, 70, 229, 0.25)",
  },
  menuIcon: {
    fontSize: "16px",
  },
  menuLabel: {
    fontSize: "13px",
  },
  logoutBtn: {
    width: "100%",
    padding: "12px",
    background: "linear-gradient(to right, #ef4444, #dc2626)",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
    transition: "opacity 0.2s",
    marginTop: "20px",
    boxShadow: "0 4px 6px rgba(239, 68, 68, 0.15)",
  },
};

export default Sidebar;