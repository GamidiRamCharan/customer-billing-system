import React, { useState, useEffect } from "react";
import BillForm from "./BillForm";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Sales from "./Sales";
import Customers from "./Customers";
import Items from "./Items";
import Profile from "./Profile";
import { fetchBills } from "../api/bills";
import { fetchCustomers } from "../api/customers";
import { fetchItems } from "../api/items";

function Dashboard({ onLogout }) {
  const [activePage, setActivePage] = useState("dashboard");
  const [stats, setStats] = useState({ sales: 0, customers: 0, items: 0 });
  const [recentBills, setRecentBills] = useState([]);
  
  // Printing preview inside Dashboard
  const [activePrintBill, setActivePrintBill] = useState(null);

  useEffect(() => {
    if (activePage === "dashboard") {
      const loadStats = async () => {
        try {
          const [billsRes, custRes, itemsRes] = await Promise.all([
            fetchBills(),
            fetchCustomers(),
            fetchItems()
          ]);
          
          const billsData = billsRes.data.data || billsRes.data || [];
          const custData = custRes.data.data || custRes.data || [];
          const itemsData = itemsRes.data.items || itemsRes.data.data || itemsRes.data || [];

          // Compute total sales from all bills
          const totalSales = billsData.reduce((sum, bill) => sum + (Number(bill.totalAmount || bill.total || 0)), 0);

          setStats({
            sales: totalSales,
            customers: custData.length,
            items: itemsData.length
          });

          // Sort bills by date descending and capture the last 5
          const sortedBills = [...billsData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setRecentBills(sortedBills.slice(0, 5));
        } catch (err) {
          console.error("Error loading dashboard stats", err);
        }
      };
      loadStats();
    }
  }, [activePage]);

  const renderPage = () => {
    switch(activePage) {
      case "sales":
        return <Sales />;
      case "customers":
        return <Customers />;
      case "bills":
        return <BillForm />;
      case "items":
        return <Items />;
      case "profile":
        return <Profile />;
      default:
        return (
          <div style={styles.dashboardContainer}>
            {/* INLINE CSS STYLES FOR THE GRAPH AND OTHER CUSTOM ANIMATIONS */}
            <style>{`
              @keyframes hoverCard {
                to { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.08); }
              }
              .hover-card-el {
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              }
              .hover-card-el:hover {
                transform: translateY(-4px);
                box-shadow: 0 10px 20px rgba(0,0,0,0.06) !important;
                border-color: #cbd5e1 !important;
              }
              .action-card {
                transition: all 0.25s;
                cursor: pointer;
              }
              .action-card:hover {
                background: #f8fafc !important;
                transform: scale(1.02);
                border-color: #6366f1 !important;
              }
              @media print {
                body * {
                  visibility: hidden;
                }
                #dashboard-print-area, #dashboard-print-area * {
                  visibility: visible;
                }
                #dashboard-print-area {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100%;
                  background: white !important;
                  color: black !important;
                }
              }
            `}</style>

            {/* PERFORMANCE WIDGET STATS CARD ROW */}
            <div style={styles.statsRow}>
              {/* Sales Card */}
              <div style={{ ...styles.statsCard, borderLeft: "5px solid #10b981" }} className="hover-card-el">
                <div style={styles.cardTop}>
                  <span style={styles.statsCardLabel}>TOTAL SALES REVENUE</span>
                  <span style={styles.growPill}>+12.5%</span>
                </div>
                <div style={styles.statsCardValue}>
                  ${stats.sales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div style={styles.progressContainer}>
                  <div style={{ ...styles.progressBar, width: "75%", background: "#10b981" }}></div>
                </div>
                <span style={styles.progressLabel}>Goal Progress (75% Achieved)</span>
              </div>

              {/* Customers Card */}
              <div style={{ ...styles.statsCard, borderLeft: "5px solid #4f46e5" }} className="hover-card-el">
                <div style={styles.cardTop}>
                  <span style={styles.statsCardLabel}>ACTIVE CLIENTELE</span>
                  <span style={{ ...styles.growPill, background: "#e0e7ff", color: "#4f46e5" }}>+4.2%</span>
                </div>
                <div style={{ ...styles.statsCardValue, color: "#4f46e5" }}>
                  {stats.customers}
                </div>
                <div style={styles.progressContainer}>
                  <div style={{ ...styles.progressBar, width: "60%", background: "#4f46e5" }}></div>
                </div>
                <span style={styles.progressLabel}>Monthly Client Target (60%)</span>
              </div>

              {/* Items Card */}
              <div style={{ ...styles.statsCard, borderLeft: "5px solid #7c3aed" }} className="hover-card-el">
                <div style={styles.cardTop}>
                  <span style={styles.statsCardLabel}>REGISTERED CATALOG ITEMS</span>
                  <span style={{ ...styles.growPill, background: "#f3e8ff", color: "#7c3aed" }}>Active</span>
                </div>
                <div style={{ ...styles.statsCardValue, color: "#7c3aed" }}>
                  {stats.items}
                </div>
                <div style={styles.progressContainer}>
                  <div style={{ ...styles.progressBar, width: "95%", background: "#7c3aed" }}></div>
                </div>
                <span style={styles.progressLabel}>Inventory Health Status (Excellent)</span>
              </div>
            </div>

            {/* SPLIT ROW: ANALYTICS BAR GRAPH & QUICK ACTIONS */}
            <div style={styles.splitRow}>
              {/* Visual CSS Analytics Chart Widget */}
              <div style={{ ...styles.mainCard, flex: 2 }}>
                <h3 style={styles.cardHeading}>📊 Weekly Revenue Streams</h3>
                <p style={styles.cardSubtext}>Visualized sales distribution over cyclic merchant intervals</p>
                <div style={styles.chartContainer}>
                  {/* Columns */}
                  <div style={styles.chartBarCol}>
                    <div style={{ ...styles.chartBar, height: "45px" }} title="Mon: $120.00"></div>
                    <span style={styles.chartLabel}>Mon</span>
                  </div>
                  <div style={styles.chartBarCol}>
                    <div style={{ ...styles.chartBar, height: "70px", background: "linear-gradient(to top, #4f46e5, #818cf8)" }} title="Tue: $210.00"></div>
                    <span style={styles.chartLabel}>Tue</span>
                  </div>
                  <div style={styles.chartBarCol}>
                    <div style={{ ...styles.chartBar, height: "95px", background: "linear-gradient(to top, #10b981, #34d399)" }} title="Wed: $320.00"></div>
                    <span style={styles.chartLabel}>Wed</span>
                  </div>
                  <div style={styles.chartBarCol}>
                    <div style={{ ...styles.chartBar, height: "60px" }} title="Thu: $180.00"></div>
                    <span style={styles.chartLabel}>Thu</span>
                  </div>
                  <div style={styles.chartBarCol}>
                    <div style={{ ...styles.chartBar, height: "130px", background: "linear-gradient(to top, #10b981, #34d399)" }} title="Fri: $450.00"></div>
                    <span style={styles.chartLabel}>Fri</span>
                  </div>
                  <div style={styles.chartBarCol}>
                    <div style={{ ...styles.chartBar, height: "115px", background: "linear-gradient(to top, #6366f1, #8b5cf6)" }} title="Sat: $380.00"></div>
                    <span style={styles.chartLabel}>Sat</span>
                  </div>
                  <div style={styles.chartBarCol}>
                    <div style={{ ...styles.chartBar, height: "85px" }} title="Sun: $260.00"></div>
                    <span style={styles.chartLabel}>Sun</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions Matrix */}
              <div style={{ ...styles.mainCard, flex: 1.2 }}>
                <h3 style={styles.cardHeading}>⚡ Quick Desk Tasks</h3>
                <p style={styles.cardSubtext}>Navigate immediately to critical merchant operations</p>
                <div style={styles.quickActionGrid}>
                  <div style={styles.quickActionBtn} className="action-card" onClick={() => setActivePage("bills")}>
                    <span style={styles.actionIcon}>🧾</span>
                    <span style={styles.actionLabel}>New Invoice</span>
                  </div>
                  <div style={styles.quickActionBtn} className="action-card" onClick={() => setActivePage("items")}>
                    <span style={styles.actionIcon}>📦</span>
                    <span style={styles.actionLabel}>Inventory</span>
                  </div>
                  <div style={styles.quickActionBtn} className="action-card" onClick={() => setActivePage("customers")}>
                    <span style={styles.actionIcon}>👥</span>
                    <span style={styles.actionLabel}>Clients Log</span>
                  </div>
                  <div style={styles.quickActionBtn} className="action-card" onClick={() => setActivePage("sales")}>
                    <span style={styles.actionIcon}>📈</span>
                    <span style={styles.actionLabel}>Sales Report</span>
                  </div>
                </div>
              </div>
            </div>

            {/* LIVE RECENT TRANSACTIONS FEED */}
            <div style={{ ...styles.mainCard, marginTop: "24px" }}>
              <h3 style={styles.cardHeading}>🛒 Live Invoice Activity Feed</h3>
              <p style={styles.cardSubtext}>Recent transaction logs finalized across local registers</p>
              
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.thRow}>
                      <th style={styles.th}>Customer</th>
                      <th style={styles.th}>City</th>
                      <th style={styles.th}>Total Revenue</th>
                      <th style={styles.th}>Finalized Date</th>
                      <th style={{ ...styles.th, textAlign: "center", width: "100px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBills.map((b, i) => (
                      <tr key={i} style={styles.tdRow}>
                        <td style={{ ...styles.td, fontWeight: 600 }}>{b.customerName}</td>
                        <td style={styles.td}>{b.city}</td>
                        <td style={{ ...styles.td, fontWeight: 700, color: "#10b981" }}>
                          ${parseFloat(b.totalAmount || b.total || 0).toFixed(2)}
                        </td>
                        <td style={styles.td}>{new Date(b.createdAt).toLocaleDateString()}</td>
                        <td style={{ ...styles.td, textAlign: "center" }}>
                          <button
                            onClick={() => setActivePrintBill(b)}
                            style={styles.printBtn}
                          >
                            🖨️ Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                    {recentBills.length === 0 && (
                      <tr>
                        <td colSpan="5" style={styles.noHistoryCell}>
                          Waiting for cashiers to finalize sales registers...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* INTEGRATED INSTANT PRINT INVOICE MODAL */}
            {activePrintBill && (
              <div style={styles.modalOverlay} className="no-print">
                <div style={styles.modalContent}>
                  {/* Action Header inside modal */}
                  <div style={styles.modalHeader}>
                    <h4 style={{ margin: 0, fontSize: "15px", color: "#1e293b" }}>Quick Receipt Preview</h4>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => window.print()}
                        style={styles.printModalBtn}
                      >
                        🖨️ Print
                      </button>
                      <button
                        onClick={() => setActivePrintBill(null)}
                        style={styles.closeModalBtn}
                      >
                        ✕ Close
                      </button>
                    </div>
                  </div>

                  {/* Printable Invoice Page */}
                  <div id="dashboard-print-area" style={styles.invoiceInvoicePage}>
                    <div style={styles.invoiceHeader}>
                      <div>
                        <h1 style={styles.invoiceCompany}>SHOP SYSTEM INC.</h1>
                        <p style={styles.invoiceDetails}>Premium Retail Management Dashboard</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <h2 style={styles.invoiceHeading}>INVOICE</h2>
                        <p style={styles.invoiceDetails}><strong>Invoice No:</strong> {activePrintBill._id?.substring(0, 8).toUpperCase() || "N/A"}</p>
                        <p style={styles.invoiceDetails}><strong>Date:</strong> {new Date(activePrintBill.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <hr style={styles.invoiceDivider} />

                    <div style={styles.invoiceSplit}>
                      <div>
                        <h4 style={styles.invoiceSubheading}>BILL TO:</h4>
                        <div style={styles.invoiceCustName}>{activePrintBill.customerName}</div>
                        <div style={styles.invoiceDetails}>📞 {activePrintBill.phone}</div>
                        <div style={styles.invoiceDetails}>📍 {activePrintBill.city}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <h4 style={styles.invoiceSubheading}>STATUS:</h4>
                        <div style={styles.paidStatusPill}>PAID IN FULL</div>
                      </div>
                    </div>

                    <table style={styles.invoiceTable}>
                      <thead>
                        <tr style={styles.invoiceThRow}>
                          <th style={styles.invoiceTh}>Item Description</th>
                          <th style={{ ...styles.invoiceTh, textAlign: "center" }}>Qty</th>
                          <th style={{ ...styles.invoiceTh, textAlign: "right" }}>Price</th>
                          <th style={{ ...styles.invoiceTh, textAlign: "right" }}>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activePrintBill.items && activePrintBill.items.map((it, idx) => (
                          <tr key={idx} style={styles.invoiceTdRow}>
                            <td style={styles.invoiceTd}>{it.name || it.itemName || (it.item && it.item.name) || "Item"}</td>
                            <td style={{ ...styles.invoiceTd, textAlign: "center" }}>{it.quantity}</td>
                            <td style={{ ...styles.invoiceTd, textAlign: "right" }}>${parseFloat(it.price || 0).toFixed(2)}</td>
                            <td style={{ ...styles.invoiceTd, textAlign: "right", fontWeight: 600 }}>
                              ${(it.quantity * (it.price || 0)).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div style={styles.invoiceTotalBlock}>
                      <div style={styles.invoiceTotalRow}>
                        <span>Subtotal:</span>
                        <span>${parseFloat(activePrintBill.totalAmount || activePrintBill.total || 0).toFixed(2)}</span>
                      </div>
                      <div style={styles.invoiceTotalRow}>
                        <span>Tax (Included 5%):</span>
                        <span>${((activePrintBill.totalAmount || activePrintBill.total || 0) * 0.05).toFixed(2)}</span>
                      </div>
                      <hr style={{ margin: "8px 0", borderColor: "#e2e8f0" }} />
                      <div style={{ ...styles.invoiceTotalRow, fontSize: "18px", fontWeight: 800, color: "#4f46e5" }}>
                        <span>Grand Total:</span>
                        <span>${parseFloat(activePrintBill.totalAmount || activePrintBill.total || 0).toFixed(2)}</span>
                      </div>
                    </div>

                    <div style={styles.invoiceFooter}>
                      <p style={{ fontWeight: 600, margin: "0 0 4px 0", color: "#475569" }}>Thank you for your business!</p>
                      <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>For billing inquiries, contact us at contact@shopsystem.com</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="dashboard">
      <Sidebar onLogout={onLogout} setActivePage={setActivePage} activePage={activePage} />
      <div className="main">
        <Navbar />
        {renderPage()}
      </div>
    </div>
  );
}

const styles = {
  dashboardContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    fontFamily: "'Poppins', sans-serif",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
  },
  statsCard: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.02)",
    border: "1px solid #e2e8f0",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statsCardLabel: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#64748b",
    letterSpacing: "0.5px",
  },
  growPill: {
    fontSize: "11px",
    fontWeight: 700,
    background: "#dcfce7",
    color: "#15803d",
    padding: "3px 8px",
    borderRadius: "12px",
  },
  statsCardValue: {
    fontSize: "26px",
    fontWeight: 800,
    color: "#0f172a",
    letterSpacing: "-0.5px",
  },
  progressContainer: {
    width: "100%",
    height: "6px",
    background: "#f1f5f9",
    borderRadius: "3px",
    overflow: "hidden",
    marginTop: "4px",
  },
  progressBar: {
    height: "100%",
    borderRadius: "3px",
  },
  progressLabel: {
    fontSize: "11px",
    color: "#94a3b8",
    fontWeight: 500,
  },
  splitRow: {
    display: "flex",
    gap: "24px",
    flexWrap: "wrap",
  },
  mainCard: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.02)",
    border: "1px solid #e2e8f0",
  },
  cardHeading: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 700,
    color: "#1e293b",
  },
  cardSubtext: {
    margin: "4px 0 16px 0",
    fontSize: "12px",
    color: "#94a3b8",
  },
  chartContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: "150px",
    padding: "10px 10px 0 10px",
    borderBottom: "2px solid #e2e8f0",
  },
  chartBarCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    flex: 1,
  },
  chartBar: {
    width: "24px",
    background: "linear-gradient(to top, #6366f1, #8b5cf6)",
    borderRadius: "4px 4px 0 0",
    cursor: "pointer",
    transition: "transform 0.2s",
  },
  chartLabel: {
    fontSize: "11px",
    fontWeight: 600,
    color: "#64748b",
  },
  quickActionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "12px",
    height: "150px",
  },
  quickActionBtn: {
    background: "#ffffff",
    border: "1px dashed #cbd5e1",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
  },
  actionIcon: {
    fontSize: "24px",
  },
  actionLabel: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#475569",
  },
  tableWrapper: {
    overflowX: "auto",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  thRow: {
    background: "#f8fafc",
    textAlign: "left",
  },
  th: {
    padding: "12px 16px",
    fontSize: "11px",
    fontWeight: 700,
    color: "#475569",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    borderBottom: "1px solid #e2e8f0",
  },
  tdRow: {
    borderBottom: "1px solid #f1f5f9",
    transition: "background 0.2s",
  },
  td: {
    padding: "14px 16px",
    fontSize: "13px",
    color: "#334155",
  },
  printBtn: {
    background: "#e0e7ff",
    color: "#4f46e5",
    border: "none",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  noHistoryCell: {
    padding: "24px",
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "13px",
  },
  // INVOICE PRINT MODAL OVERLAY
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
    maxWidth: "700px",
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
  invoiceInvoicePage: {
    padding: "40px",
    background: "#ffffff",
    fontFamily: "Arial, sans-serif",
    color: "#334155",
  },
  invoiceHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
  },
  invoiceCompany: {
    fontSize: "26px",
    fontWeight: 800,
    color: "#1e293b",
    letterSpacing: "-0.5px",
    margin: 0,
  },
  invoiceHeading: {
    fontSize: "28px",
    fontWeight: 900,
    color: "#4f46e5",
    margin: "0 0 10px 0",
    letterSpacing: "1px",
  },
  invoiceDetails: {
    fontSize: "13px",
    color: "#64748b",
    margin: "2px 0",
  },
  invoiceDivider: {
    border: "none",
    borderTop: "2px solid #f1f5f9",
    margin: "20px 0",
  },
  invoiceSplit: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "30px",
  },
  invoiceSubheading: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#94a3b8",
    margin: "0 0 6px 0",
    letterSpacing: "0.5px",
  },
  invoiceCustName: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#0f172a",
    margin: "0 0 4px 0",
  },
  paidStatusPill: {
    display: "inline-block",
    background: "#dcfce7",
    color: "#15803d",
    padding: "4px 12px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.5px",
  },
  invoiceTable: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "30px",
  },
  invoiceThRow: {
    borderBottom: "2px solid #cbd5e1",
  },
  invoiceTh: {
    padding: "10px 0",
    fontSize: "12px",
    fontWeight: 700,
    color: "#475569",
    textTransform: "uppercase",
  },
  invoiceTdRow: {
    borderBottom: "1px solid #f1f5f9",
  },
  invoiceTd: {
    padding: "12px 0",
    fontSize: "13px",
    color: "#334155",
  },
  invoiceTotalBlock: {
    width: "250px",
    marginLeft: "auto",
    marginBottom: "40px",
  },
  invoiceTotalRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    color: "#475569",
    margin: "6px 0",
  },
  invoiceFooter: {
    textAlign: "center",
    borderTop: "1px solid #f1f5f9",
    paddingTop: "20px",
    fontSize: "12px",
  },
};

export default Dashboard;