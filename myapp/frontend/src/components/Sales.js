import React, { useState, useEffect } from "react";
import { fetchBills, deleteBill } from "../api/bills";
import toast from "react-hot-toast";

function Sales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Date filtering state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Printing report preview modal state
  const [showReportPreview, setShowReportPreview] = useState(false);

  const loadSales = async () => {
    try {
      setLoading(true);
      const response = await fetchBills();
      const data = response.data.data || response.data || [];
      setSales(data);
    } catch (err) {
      console.error("Error fetching sales data", err);
      toast.error("Failed to load sales data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Delete this sale record permanently?")) {
      try {
        await deleteBill(id);
        toast.success("Sale record deleted");
        loadSales();
      } catch (err) {
        toast.error("Failed to delete sale record");
      }
    }
  };

  // Helper to format date object to YYYY-MM-DD string locally
  const getLocalDateString = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Preset Filters
  const applyPreset = (preset) => {
    const today = new Date();
    
    switch (preset) {
      case "today":
        setStartDate(getLocalDateString(today));
        setEndDate(getLocalDateString(today));
        toast.success("Filtered for Today");
        break;
      case "yesterday":
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        setStartDate(getLocalDateString(yesterday));
        setEndDate(getLocalDateString(yesterday));
        toast.success("Filtered for Yesterday");
        break;
      case "thisWeek":
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
        const monday = new Date(today.setDate(diff));
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        setStartDate(getLocalDateString(monday));
        setEndDate(getLocalDateString(sunday));
        toast.success("Filtered for This Week");
        break;
      case "thisMonth":
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        setStartDate(getLocalDateString(firstDay));
        setEndDate(getLocalDateString(lastDay));
        toast.success("Filtered for This Month");
        break;
      case "allTime":
      default:
        setStartDate("");
        setEndDate("");
        toast.success("Cleared Date Filters");
        break;
    }
  };

  // Apply filters: Search query + Date range
  const filtered = sales.filter(s => {
    // 1. Text Search
    const matchesText = s.customerName?.toLowerCase().includes(search.toLowerCase()) ||
                        s.city?.toLowerCase().includes(search.toLowerCase());
    if (!matchesText) return false;

    // 2. Date Boundaries
    const createdAt = new Date(s.createdAt);

    if (startDate) {
      const startLimit = new Date(startDate + "T00:00:00");
      if (createdAt < startLimit) return false;
    }

    if (endDate) {
      const endLimit = new Date(endDate + "T23:59:59.999");
      if (createdAt > endLimit) return false;
    }

    return true;
  });

  // Calculate stats based on filtered set
  const totalRevenue = filtered.reduce((sum, s) => sum + (parseFloat(s.totalAmount || s.total || 0)), 0);
  const avgOrder = filtered.length > 0 ? totalRevenue / filtered.length : 0;
  const highestBill = filtered.length > 0 
    ? Math.max(...filtered.map(s => parseFloat(s.totalAmount || s.total || 0))) 
    : 0;

  // Format date readable for the printed report
  const getReadableRange = () => {
    if (!startDate && !endDate) return "All Time";
    if (startDate && endDate) {
      if (startDate === endDate) return new Date(startDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      return `${new Date(startDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${new Date(endDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    }
    if (startDate) return `From ${new Date(startDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    return `Up to ${new Date(endDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  };

  return (
    <div style={styles.wrapper}>
      {/* LOCAL MEDIA PRINT STYLES */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #sales-print-area, #sales-print-area * {
            visibility: visible;
          }
          #sales-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
          }
        }
      `}</style>

      {/* Page Header */}
      <div style={styles.pageHeader}>
        <div>
          <h2 style={styles.pageTitle}>📈 Sales Analytics</h2>
          <p style={styles.pageSub}>Full transactional history and date-range reporting</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            onClick={() => setShowReportPreview(true)}
            style={styles.printReportBtn}
            disabled={filtered.length === 0}
          >
            📋 Print Sales Report
          </button>
          <span style={styles.countPill}>{filtered.length} Records Shown</span>
        </div>
      </div>

      {/* Summary Stats Row */}
      <div style={styles.statsRow}>
        <div style={{ ...styles.statCard, borderLeft: "5px solid #10b981" }}>
          <span style={styles.statLabel}>TOTAL REVENUE</span>
          <div style={styles.statValue}>${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <span style={styles.statHint}>Across {filtered.length} matching bills</span>
        </div>
        <div style={{ ...styles.statCard, borderLeft: "5px solid #4f46e5" }}>
          <span style={styles.statLabel}>AVERAGE ORDER VALUE</span>
          <div style={{ ...styles.statValue, color: "#4f46e5" }}>${avgOrder.toFixed(2)}</div>
          <span style={styles.statHint}>Mean bill value in window</span>
        </div>
        <div style={{ ...styles.statCard, borderLeft: "5px solid #7c3aed" }}>
          <span style={styles.statLabel}>HIGHEST BILL</span>
          <div style={{ ...styles.statValue, color: "#7c3aed" }}>
            ${highestBill.toFixed(2)}
          </div>
          <span style={styles.statHint}>Single largest transaction in filter</span>
        </div>
      </div>

      {/* Date Filtering Bar */}
      <div style={styles.filterBar}>
        <div style={styles.dateInputs}>
          <div style={styles.inputField}>
            <label style={styles.fieldLabel}>Start Date</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              style={styles.dateInput} 
            />
          </div>
          <div style={styles.inputField}>
            <label style={styles.fieldLabel}>End Date</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              style={styles.dateInput} 
            />
          </div>
        </div>

        <div style={styles.presetsRow}>
          <button style={styles.presetBtn} onClick={() => applyPreset("today")}>Today</button>
          <button style={styles.presetBtn} onClick={() => applyPreset("yesterday")}>Yesterday</button>
          <button style={styles.presetBtn} onClick={() => applyPreset("thisWeek")}>This Week</button>
          <button style={styles.presetBtn} onClick={() => applyPreset("thisMonth")}>This Month</button>
          <button style={{ ...styles.presetBtn, color: "#ef4444", background: "#fef2f2" }} onClick={() => applyPreset("allTime")}>Clear</button>
        </div>
      </div>

      {/* Search + Table */}
      <div style={styles.card}>
        <div style={styles.tableHeader}>
          <h3 style={styles.tableTitle}>Transaction Log</h3>
          <div style={styles.searchBox}>
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search by customer or city..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>

        {loading ? (
          <div style={styles.centerMsg}>⏳ Loading transaction records...</div>
        ) : filtered.length === 0 ? (
          <div style={styles.centerMsg}>No matching sales records found.</div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={styles.th}>#</th>
                  <th style={styles.th}>Customer</th>
                  <th style={styles.th}>City</th>
                  <th style={styles.th}>Items</th>
                  <th style={styles.th}>Revenue</th>
                  <th style={styles.th}>Date</th>
                  <th style={{ ...styles.th, textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((sale, index) => (
                  <tr key={sale._id || index} style={styles.tdRow}>
                    <td style={{ ...styles.td, color: "#94a3b8", fontSize: "12px" }}>{index + 1}</td>
                    <td style={{ ...styles.td, fontWeight: 600, color: "#0f172a" }}>{sale.customerName}</td>
                    <td style={styles.td}>{sale.city || "—"}</td>
                    <td style={styles.td}>
                      <span style={styles.itemsBadge}>{sale.items?.length || 0} items</span>
                    </td>
                    <td style={{ ...styles.td, fontWeight: 700, color: "#10b981" }}>
                      ${parseFloat(sale.totalAmount || sale.total || 0).toFixed(2)}
                    </td>
                    <td style={styles.td}>
                      {new Date(sale.createdAt || Date.now()).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric"
                      })}
                    </td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      <button
                        onClick={() => handleDelete(sale._id)}
                        style={styles.deleteBtn}
                        title="Delete record"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PRINT PREVIEW REPORT MODAL */}
      {showReportPreview && (
        <div style={styles.modalOverlay} className="no-print">
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h4 style={{ margin: 0, fontSize: "15px", color: "#1e293b" }}>Sales Summary Report Preview</h4>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => window.print()} style={styles.printModalBtn}>🖨️ Print Report</button>
                <button onClick={() => setShowReportPreview(false)} style={styles.closeModalBtn}>✕ Close</button>
              </div>
            </div>

            {/* Printable Report Sheet */}
            <div id="sales-print-area" style={styles.printPage}>
              <div style={styles.printHeader}>
                <div>
                  <h1 style={styles.printTitle}>SHOP SYSTEM INC.</h1>
                  <p style={styles.printSubtitle}>Sales Summary & Business Audit Report</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <h2 style={styles.reportLabel}>SALES REPORT</h2>
                  <p style={styles.printMeta}><strong>Interval:</strong> {getReadableRange()}</p>
                  <p style={styles.printMeta}><strong>Date Generated:</strong> {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              <hr style={styles.printDivider} />

              {/* Stat Boxes for printed page */}
              <div style={styles.printStatsRow}>
                <div style={styles.printStatCard}>
                  <div style={styles.printStatLabel}>TOTAL REVENUE</div>
                  <div style={styles.printStatValue}>${totalRevenue.toFixed(2)}</div>
                </div>
                <div style={styles.printStatCard}>
                  <div style={styles.printStatLabel}>TOTAL INVOICES</div>
                  <div style={styles.printStatValue}>{filtered.length}</div>
                </div>
                <div style={styles.printStatCard}>
                  <div style={styles.printStatLabel}>AVG ORDER VALUE</div>
                  <div style={styles.printStatValue}>${avgOrder.toFixed(2)}</div>
                </div>
              </div>

              {/* Transactions list */}
              <h3 style={styles.printListHeading}>Transaction History Breakdown</h3>
              <table style={styles.printTable}>
                <thead>
                  <tr style={styles.printThRow}>
                    <th style={styles.printTh}>No.</th>
                    <th style={styles.printTh}>Customer Name</th>
                    <th style={styles.printTh}>City</th>
                    <th style={styles.printTh}>Items</th>
                    <th style={{ ...styles.printTh, textAlign: "right" }}>Total Amount</th>
                    <th style={styles.printTh}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((sale, index) => (
                    <tr key={sale._id || index} style={styles.printTdRow}>
                      <td style={styles.printTd}>{index + 1}</td>
                      <td style={{ ...styles.printTd, fontWeight: 700 }}>{sale.customerName}</td>
                      <td style={styles.printTd}>{sale.city || "—"}</td>
                      <td style={styles.printTd}>{sale.items?.length || 0}</td>
                      <td style={{ ...styles.printTd, textAlign: "right", fontWeight: 700 }}>
                        ${parseFloat(sale.totalAmount || sale.total || 0).toFixed(2)}
                      </td>
                      <td style={styles.printTd}>{new Date(sale.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={styles.printFooter}>
                <p>Generated automatically via Merchant Command Center ERP System.</p>
                <p style={{ fontSize: "10px", color: "#94a3b8", marginTop: "4px" }}>Confidential Business Records — For Internal Audit Only</p>
              </div>
            </div>
          </div>
        </div>
      )}
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
  printReportBtn: {
    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
    color: "#ffffff",
    border: "none",
    padding: "10px 18px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(79, 70, 229, 0.2)",
    transition: "transform 0.2s",
  },
  countPill: {
    background: "#eef2ff",
    color: "#4f46e5",
    padding: "10px 16px",
    borderRadius: "10px",
    fontWeight: 600,
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
  },
  statCard: {
    background: "#ffffff",
    borderRadius: "14px",
    padding: "20px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.03)",
    border: "1px solid #e2e8f0",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  statLabel: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#64748b",
    letterSpacing: "0.5px",
  },
  statValue: {
    fontSize: "24px",
    fontWeight: 800,
    color: "#10b981",
    letterSpacing: "-0.5px",
  },
  statHint: {
    fontSize: "11px",
    color: "#94a3b8",
  },
  filterBar: {
    background: "#ffffff",
    borderRadius: "14px",
    padding: "16px 20px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.03)",
    border: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
  },
  dateInputs: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
  },
  inputField: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  fieldLabel: {
    fontSize: "10px",
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
  },
  dateInput: {
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    padding: "6px 12px",
    fontSize: "13px",
    color: "#334155",
    outline: "none",
    background: "#f8fafc",
  },
  presetsRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  presetBtn: {
    background: "#f1f5f9",
    color: "#475569",
    border: "none",
    padding: "8px 14px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.2s",
  },
  card: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.03)",
    border: "1px solid #e2e8f0",
  },
  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "12px",
  },
  tableTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 600,
    color: "#1e293b",
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
  searchInput: {
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: "13px",
    color: "#475569",
    width: "200px",
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
    transition: "background 0.15s",
  },
  td: {
    padding: "14px 16px",
    fontSize: "13px",
    color: "#334155",
  },
  itemsBadge: {
    background: "#eef2ff",
    color: "#4f46e5",
    padding: "3px 10px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: 600,
  },
  deleteBtn: {
    background: "#fee2e2",
    color: "#ef4444",
    border: "none",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
  },
  centerMsg: {
    textAlign: "center",
    padding: "40px",
    color: "#94a3b8",
    fontSize: "14px",
  },
  // MODAL STYLING
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(15, 23, 42, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "20px",
    overflowY: "auto",
  },
  modalContent: {
    background: "#ffffff",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "800px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    overflow: "hidden",
  },
  modalHeader: {
    padding: "16px 24px",
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  printModalBtn: {
    padding: "8px 16px",
    background: "#4f46e5",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
  },
  closeModalBtn: {
    padding: "8px 16px",
    background: "#e2e8f0",
    color: "#475569",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
  },
  printPage: {
    padding: "40px",
    background: "#ffffff",
    color: "#334155",
  },
  printHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
  },
  printTitle: {
    fontSize: "26px",
    fontWeight: 800,
    color: "#1e293b",
    margin: 0,
  },
  printSubtitle: {
    fontSize: "13px",
    color: "#64748b",
    margin: "2px 0 0 0",
  },
  reportLabel: {
    fontSize: "22px",
    fontWeight: 900,
    color: "#4f46e5",
    margin: "0 0 8px 0",
  },
  printMeta: {
    fontSize: "12px",
    color: "#64748b",
    margin: "2px 0",
  },
  printDivider: {
    border: "none",
    borderTop: "2px solid #f1f5f9",
    margin: "20px 0",
  },
  printStatsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
    marginBottom: "30px",
  },
  printStatCard: {
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    padding: "12px",
    textAlign: "center",
  },
  printStatLabel: {
    fontSize: "10px",
    color: "#64748b",
    fontWeight: 700,
    marginBottom: "4px",
  },
  printStatValue: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#0f172a",
  },
  printListHeading: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#1e293b",
    marginBottom: "12px",
  },
  printTable: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "30px",
  },
  printThRow: {
    borderBottom: "2px solid #cbd5e1",
  },
  printTh: {
    padding: "8px 0",
    fontSize: "11px",
    fontWeight: 700,
    color: "#475569",
    textAlign: "left",
    textTransform: "uppercase",
  },
  printTdRow: {
    borderBottom: "1px solid #f1f5f9",
  },
  printTd: {
    padding: "10px 0",
    fontSize: "12px",
    color: "#334155",
  },
  printFooter: {
    textAlign: "center",
    borderTop: "1px solid #f1f5f9",
    paddingTop: "20px",
    fontSize: "11px",
    color: "#64748b",
  },
};

export default Sales;