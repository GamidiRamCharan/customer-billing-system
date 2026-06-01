import React from "react";

function Profile() {
  const firstName = localStorage.getItem("firstName") || "—";
  const lastName  = localStorage.getItem("lastName")  || "—";
  const mobile    = localStorage.getItem("mobile")    || "—";
  const email     = localStorage.getItem("email")     || "—";

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  const fullName = `${firstName} ${lastName}`.trim();

  const fields = [
    { icon: "👤", label: "First Name",  value: firstName },
    { icon: "👤", label: "Last Name",   value: lastName  },
    { icon: "📞", label: "Mobile",      value: mobile    },
    { icon: "📧", label: "Email",       value: email     },
  ];

  return (
    <div style={styles.wrapper}>
      {/* Page Header */}
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>👤 Merchant Profile</h2>
        <p style={styles.pageSub}>Your registered identity and account credentials</p>
      </div>

      <div style={styles.layout}>
        {/* LEFT: Avatar card */}
        <div style={styles.avatarCard}>
          <div style={styles.avatarCircle}>{initials}</div>
          <div style={styles.avatarName}>{fullName}</div>
          <div style={styles.avatarEmail}>{email}</div>
          <div style={styles.rolePill}>🏪 Merchant Owner</div>

          <div style={styles.divider} />

          <div style={styles.sessionInfo}>
            <div style={styles.sessionRow}>
              <span style={styles.sessionKey}>Status</span>
              <span style={styles.onlinePill}>● Online</span>
            </div>
            <div style={styles.sessionRow}>
              <span style={styles.sessionKey}>Login Date</span>
              <span style={styles.sessionVal}>
                {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
            <div style={styles.sessionRow}>
              <span style={styles.sessionKey}>Platform</span>
              <span style={styles.sessionVal}>Merchant ERP v1.0</span>
            </div>
          </div>
        </div>

        {/* RIGHT: Account Details */}
        <div style={styles.detailsCard}>
          <h3 style={styles.detailsTitle}>Account Details</h3>
          <p style={styles.detailsSub}>Your personal information registered on this system</p>

          <div style={styles.fieldList}>
            {fields.map((f) => (
              <div key={f.label} style={styles.fieldRow}>
                <div style={styles.fieldLeft}>
                  <span style={styles.fieldIcon}>{f.icon}</span>
                  <span style={styles.fieldLabel}>{f.label}</span>
                </div>
                <span style={styles.fieldValue}>{f.value}</span>
              </div>
            ))}
          </div>

          <div style={styles.noticeBox}>
            <span style={styles.noticeIcon}>🔒</span>
            <span style={styles.noticeText}>
              To update your account information, please contact your system administrator or use the settings panel.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    fontFamily: "'Poppins', sans-serif",
  },
  pageHeader: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  pageTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: 700,
    color: "#0f172a",
  },
  pageSub: {
    margin: 0,
    fontSize: "13px",
    color: "#64748b",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "280px 1fr",
    gap: "24px",
    alignItems: "start",
    flexWrap: "wrap",
  },
  avatarCard: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "30px 24px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
    border: "1px solid #e2e8f0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },
  avatarCircle: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
    color: "#ffffff",
    fontSize: "28px",
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 20px rgba(79, 70, 229, 0.3)",
    marginBottom: "6px",
  },
  avatarName: {
    fontSize: "17px",
    fontWeight: 700,
    color: "#0f172a",
    textAlign: "center",
  },
  avatarEmail: {
    fontSize: "12px",
    color: "#64748b",
    textAlign: "center",
  },
  rolePill: {
    background: "#eef2ff",
    color: "#4f46e5",
    fontSize: "12px",
    fontWeight: 600,
    padding: "5px 14px",
    borderRadius: "20px",
    marginTop: "4px",
  },
  divider: {
    width: "100%",
    height: "1px",
    background: "#f1f5f9",
    margin: "10px 0",
  },
  sessionInfo: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  sessionRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sessionKey: {
    fontSize: "12px",
    color: "#94a3b8",
    fontWeight: 500,
  },
  sessionVal: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#475569",
  },
  onlinePill: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#15803d",
    background: "#dcfce7",
    padding: "2px 10px",
    borderRadius: "12px",
  },
  detailsCard: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "30px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
    border: "1px solid #e2e8f0",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  detailsTitle: {
    margin: 0,
    fontSize: "17px",
    fontWeight: 700,
    color: "#1e293b",
  },
  detailsSub: {
    margin: "0 0 12px",
    fontSize: "12px",
    color: "#94a3b8",
  },
  fieldList: {
    display: "flex",
    flexDirection: "column",
    gap: "0px",
    border: "1px solid #f1f5f9",
    borderRadius: "12px",
    overflow: "hidden",
  },
  fieldRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid #f8fafc",
    background: "#ffffff",
  },
  fieldLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  fieldIcon: {
    fontSize: "16px",
  },
  fieldLabel: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#64748b",
  },
  fieldValue: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#0f172a",
    background: "#f8fafc",
    padding: "5px 14px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  },
  noticeBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    background: "#fffbeb",
    border: "1px solid #fde68a",
    borderRadius: "10px",
    padding: "14px",
    marginTop: "8px",
  },
  noticeIcon: {
    fontSize: "16px",
    flexShrink: 0,
  },
  noticeText: {
    fontSize: "12px",
    color: "#92400e",
    lineHeight: "1.6",
  },
};

export default Profile;