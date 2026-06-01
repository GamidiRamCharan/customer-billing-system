import React, { useState, useEffect } from "react";
import { fetchCustomers, createCustomer, updateCustomer, deleteCustomer } from "../api/customers";
import toast from "react-hot-toast";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [city, setCity] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetchCustomers();
      if (Array.isArray(response.data.data)) {
        setCustomers(response.data.data);
      } else if (Array.isArray(response.data)) {
        setCustomers(response.data);
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
      toast.error("Failed to fetch customer directory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !mobile) {
      toast.error("Name and mobile number are required");
      return;
    }

    try {
      const payload = { name, mobile, city };

      if (editingId) {
        await updateCustomer(editingId, payload);
        toast.success("Customer updated successfully");
      } else {
        await createCustomer(payload);
        toast.success("Customer added successfully");
      }

      resetForm();
      loadCustomers();
    } catch (err) {
      console.error("Error saving customer:", err);
      toast.error(err.response?.data?.error || "Failed to save customer record");
    }
  };

  const handleEdit = (customer) => {
    setEditingId(customer._id);
    setName(customer.name);
    setMobile(customer.mobile);
    setCity(customer.city || "");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Permanently delete this customer record?")) {
      try {
        await deleteCustomer(id);
        toast.success("Customer record removed");
        loadCustomers();
      } catch (err) {
        toast.error("Failed to delete customer");
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setMobile("");
    setCity("");
  };

  const filtered = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.mobile?.includes(search) ||
    c.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.wrapper}>
      {/* Page Header */}
      <div style={styles.pageHeader}>
        <div>
          <h2 style={styles.pageTitle}>👥 Clients Directory</h2>
          <p style={styles.pageSub}>Manage customer profiles and contact details</p>
        </div>
        <span style={styles.countPill}>{customers.length} Registered</span>
      </div>

      {/* Main Grid: Form Left, Table Right */}
      <div style={styles.layout}>
        {/* FORM */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>{editingId ? "✏️ Edit Client Profile" : "➕ Register New Client"}</h3>
          <p style={styles.cardSub}>Provide customer contact and location details</p>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Customer Name *</label>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Mobile Number *</label>
              <input
                type="tel"
                placeholder="E.g. +1 555-0199"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>City (optional)</label>
              <input
                type="text"
                placeholder="E.g. San Francisco"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.btnRow}>
              <button type="submit" style={{ ...styles.submitBtn, background: editingId ? "#f59e0b" : "linear-gradient(135deg, #4f46e5, #7c3aed)" }}>
                {editingId ? "Update Client" : "Register Client"}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} style={styles.cancelBtn}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* DIRECTORY LIST */}
        <div style={{ ...styles.card, flex: 2 }}>
          <div style={styles.tableHeader}>
            <h3 style={styles.cardTitle}>Client Directory</h3>
            <div style={styles.searchBox}>
              <span>🔍</span>
              <input
                type="text"
                placeholder="Search clients..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={styles.searchInput}
              />
            </div>
          </div>

          {loading ? (
            <div style={styles.centerMsg}>⏳ Loading customer records...</div>
          ) : filtered.length === 0 ? (
            <div style={styles.centerMsg}>No clients found in directory.</div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.th}>Customer</th>
                    <th style={styles.th}>Mobile</th>
                    <th style={styles.th}>City</th>
                    <th style={{ ...styles.th, textAlign: "center" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((cust, index) => {
                    const firstChar = cust.name ? cust.name.charAt(0).toUpperCase() : "?";
                    return (
                      <tr key={cust._id || index} style={styles.tdRow}>
                        <td style={styles.td}>
                          <div style={styles.clientCell}>
                            <div style={styles.clientBadge}>{firstChar}</div>
                            <span style={{ fontWeight: 600, color: "#0f172a" }}>{cust.name}</span>
                          </div>
                        </td>
                        <td style={{ ...styles.td, color: "#475569", fontWeight: 500 }}>{cust.mobile}</td>
                        <td style={{ ...styles.td, color: "#64748b" }}>{cust.city || "—"}</td>
                        <td style={{ ...styles.td, textAlign: "center" }}>
                          <div style={styles.actionRow}>
                            <button
                              onClick={() => handleEdit(cust)}
                              style={styles.editBtn}
                              title="Edit Client"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDelete(cust._id)}
                              style={styles.deleteBtn}
                              title="Delete Client"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
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
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
  },
  pageTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: 700,
    color: "#0f172a",
  },
  pageSub: {
    margin: "4px 0 0",
    fontSize: "13px",
    color: "#64748b",
  },
  countPill: {
    background: "#eef2ff",
    color: "#4f46e5",
    padding: "6px 16px",
    borderRadius: "20px",
    fontWeight: 600,
    fontSize: "13px",
  },
  layout: {
    display: "flex",
    gap: "24px",
    flexWrap: "wrap",
    alignItems: "start",
  },
  card: {
    flex: "1 1 300px",
    background: "#ffffff",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.03)",
    border: "1px solid #e2e8f0",
  },
  cardTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 700,
    color: "#1e293b",
  },
  cardSub: {
    margin: "4px 0 16px",
    fontSize: "12px",
    color: "#94a3b8",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#64748b",
    letterSpacing: "0.3px",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    outline: "none",
    fontSize: "13px",
    background: "#f8fafc",
    color: "#334155",
    transition: "all 0.2s",
  },
  btnRow: {
    display: "flex",
    gap: "10px",
    marginTop: "6px",
  },
  submitBtn: {
    flex: 1,
    border: "none",
    color: "#ffffff",
    padding: "12px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(79, 70, 229, 0.2)",
    transition: "transform 0.2s",
  },
  cancelBtn: {
    background: "#fee2e2",
    color: "#ef4444",
    border: "none",
    padding: "12px 18px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "transform 0.2s",
  },
  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    flexWrap: "wrap",
    gap: "12px",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "6px 12px",
  },
  searchInput: {
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: "13px",
    color: "#475569",
    width: "180px",
  },
  tableWrapper: {
    overflowX: "auto",
    borderRadius: "10px",
    border: "1px solid #f1f5f9",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  thRow: {
    background: "#f8fafc",
  },
  th: {
    padding: "12px 16px",
    fontSize: "11px",
    fontWeight: 700,
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    borderBottom: "1px solid #e2e8f0",
    textAlign: "left",
  },
  tdRow: {
    borderBottom: "1px solid #f8fafc",
  },
  td: {
    padding: "12px 16px",
    fontSize: "13px",
    color: "#334155",
  },
  clientCell: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  clientBadge: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #e0e7ff, #c7d2fe)",
    color: "#4f46e5",
    fontSize: "12px",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  actionRow: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
  },
  editBtn: {
    background: "#e0f2fe",
    color: "#0284c7",
    border: "none",
    padding: "5px 10px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: 600,
    cursor: "pointer",
  },
  deleteBtn: {
    background: "#fee2e2",
    color: "#ef4444",
    border: "none",
    padding: "5px 10px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: 600,
    cursor: "pointer",
  },
  centerMsg: {
    textAlign: "center",
    padding: "40px",
    color: "#94a3b8",
    fontSize: "13px",
  },
};

export default Customers;