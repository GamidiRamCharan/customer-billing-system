import React from "react";

function Navbar() {
  const now = new Date();
  const hours = now.getHours();
  const greeting =
    hours < 12 ? "Good Morning" :
    hours < 17 ? "Good Afternoon" :
    "Good Evening";

  const today = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const userEmail = localStorage.getItem("email") || "Merchant";
  const displayName = userEmail.split("@")[0];

  return (
    <div style={styles.navbar}>
      {/* Left: Greeting */}
      <div style={styles.greetingBlock}>
        <h2 style={styles.greeting}>{greeting}, {displayName} 👋</h2>
        <p style={styles.date}>🗓️ {today}</p>
      </div>

      {/* Right: Actions */}
      <div style={styles.actions}>
        {/* Search */}
        <div style={styles.searchBox}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search records..."
            style={styles.searchInput}
          />
        </div>

        {/* Notification Bell */}
        <div style={styles.notifWrapper} title="Notifications">
          <span style={styles.notifIcon}>🔔</span>
          <span style={styles.notifBadge}>2</span>
        </div>

        {/* Avatar */}
        <div style={styles.avatar} title={userEmail}>
          {displayName.charAt(0).toUpperCase()}
        </div>
      </div>
    </div>
  );
}

const styles = {
  navbar: {
    width: "100%",
    background: "#ffffff",
    padding: "14px 24px",
    borderRadius: "14px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
    border: "1px solid #f1f5f9",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "12px",
  },
  greetingBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  greeting: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 700,
    color: "#0f172a",
    letterSpacing: "-0.2px",
  },
  date: {
    margin: 0,
    fontSize: "12px",
    color: "#94a3b8",
    fontWeight: 500,
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "8px 14px",
  },
  searchIcon: {
    fontSize: "14px",
  },
  searchInput: {
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: "13px",
    color: "#475569",
    width: "160px",
  },
  notifWrapper: {
    position: "relative",
    cursor: "pointer",
    padding: "8px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  notifIcon: {
    fontSize: "18px",
  },
  notifBadge: {
    position: "absolute",
    top: "4px",
    right: "4px",
    background: "#ef4444",
    color: "#fff",
    fontSize: "9px",
    fontWeight: 700,
    width: "14px",
    height: "14px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(79, 70, 229, 0.3)",
    flexShrink: 0,
  },
};

export default Navbar;