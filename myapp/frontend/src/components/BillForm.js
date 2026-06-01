import React, { useState, useEffect } from "react";
import { fetchBills, createBill, deleteBill } from "../api/bills";
import { fetchItems } from "../api/items";
import { fetchCustomers } from "../api/customers";
import toast from "react-hot-toast";

function BillForm() {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  
  // Available data from DB
  const [availableProducts, setAvailableProducts] = useState([]);
  const [availableCustomers, setAvailableCustomers] = useState([]);
  
  // Current bill items
  const [items, setItems] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [quantity, setQuantity] = useState("");
  
  // Suggestions UI state
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  
  // Recent bills history
  const [bills, setBills] = useState([]);

  // Active print overlay invoice
  const [activePrintBill, setActivePrintBill] = useState(null);

  const loadData = async () => {
    try {
      // Fetch bills, products, and customers concurrently
      const [billsRes, itemsRes, customersRes] = await Promise.all([
        fetchBills(),
        fetchItems(),
        fetchCustomers()
      ]);
      
      const billsData = Array.isArray(billsRes.data.data) ? billsRes.data.data : Array.isArray(billsRes.data) ? billsRes.data : [];
      setBills(billsData);
      
      const itemsData = Array.isArray(itemsRes.data.items) ? itemsRes.data.items : Array.isArray(itemsRes.data.data) ? itemsRes.data.data : Array.isArray(itemsRes.data) ? itemsRes.data : [];
      setAvailableProducts(itemsData);

      const customersData = Array.isArray(customersRes.data.data) ? customersRes.data.data : Array.isArray(customersRes.data) ? customersRes.data : [];
      setAvailableCustomers(customersData);
    } catch (err) {
      console.error("Error loading data:", err);
      toast.error("Failed to load initial data");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addItemToBill = () => {
    if (!selectedProductId || !quantity) {
      toast.error("Select a product and specify quantity");
      return;
    }
    
    const product = availableProducts.find(p => p._id === selectedProductId);
    if (!product) {
      toast.error("Invalid product selected");
      return;
    }

    if (Number(quantity) > product.quantity) {
      toast.error(`Only ${product.quantity} units available in stock`);
      return;
    }
    
    // Check if item is already added to bill
    const existingIndex = items.findIndex(it => it.item === selectedProductId);
    if (existingIndex > -1) {
      const updated = [...items];
      const newQty = updated[existingIndex].quantity + Number(quantity);
      if (newQty > product.quantity) {
        toast.error(`Combined quantity (${newQty}) exceeds stock (${product.quantity})`);
        return;
      }
      updated[existingIndex].quantity = newQty;
      setItems(updated);
      toast.success("Updated product quantity in invoice");
    } else {
      setItems([
        ...items,
        {
          item: product._id,
          itemName: product.name,
          quantity: Number(quantity),
          price: product.price,
        },
      ]);
      toast.success("Added product to invoice list");
    }
    
    setSelectedProductId("");
    setProductSearchQuery("");
    setQuantity("");
  };

  const removeItemFromBill = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleDeleteBill = async (id) => {
    if (window.confirm("Are you sure you want to delete this bill?")) {
      try {
        await deleteBill(id);
        toast.success("Bill deleted successfully");
        loadData();
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.error || "Failed to delete bill");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerName || !phone || !city) {
      toast.error("Customer details required");
      return;
    }
    if (items.length === 0) {
      toast.error("Please add at least one item to the bill");
      return;
    }
    
    // Format the items to match backend Joi validation schema (only item ID and quantity)
    const formattedItems = items.map(it => ({
      item: it.item,
      quantity: it.quantity
    }));
    
    const payload = { customerName, phone, city, items: formattedItems };
    try {
      const res = await createBill(payload);
      toast.success("Bill saved successfully!");
      
      const savedBill = res.data;
      
      // Auto open print modal for the saved bill
      setActivePrintBill(savedBill);

      // reset form
      setCustomerName("");
      setPhone("");
      setCity("");
      setItems([]);
      
      // reload history
      loadData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Network error while saving bill");
    }
  };

  const calculateTotal = () => {
    return items.reduce((sum, it) => sum + it.quantity * it.price, 0);
  };

  const selectedProduct = availableProducts.find(p => p._id === selectedProductId);

  return (
    <div style={styles.container}>
      {/* Dynamic inline styles to prevent page content print in print mode */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-invoice-area, #print-invoice-area * {
            visibility: visible;
          }
          #print-invoice-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div style={styles.header}>
        <div>
          <h2 style={styles.mainTitle}>Create Invoice</h2>
          <p style={styles.subTitleText}>Issue clean bills and print receipts for customers</p>
        </div>
        <div style={styles.pillCount}>
          Active Items: {items.length}
        </div>
      </div>

      <form onSubmit={handleSubmit} style={styles.formGrid}>
        {/* LEFT COLUMN: Customer Information Card */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>👤 Customer Details</h3>
          
          {/* Customer Autocomplete Input */}
          <div style={{ ...styles.fieldGroup, position: "relative" }}>
            <label style={styles.label}>Customer Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                setShowCustomerSuggestions(true);
              }}
              onFocus={() => setShowCustomerSuggestions(true)}
              onBlur={() => setTimeout(() => setShowCustomerSuggestions(false), 200)}
              placeholder="Search or enter name..."
              style={styles.input}
              required
            />
            {showCustomerSuggestions && customerName && (
              <div style={styles.suggestionsContainer}>
                {availableCustomers
                  .filter(c => c.name.toLowerCase().includes(customerName.toLowerCase()) || c.mobile.includes(customerName))
                  .map(c => (
                    <div
                      key={c._id}
                      onClick={() => {
                        setCustomerName(c.name);
                        setPhone(c.mobile);
                        setCity(c.city || "");
                        setShowCustomerSuggestions(false);
                      }}
                      style={styles.suggestionItem}
                    >
                      <div style={{ fontWeight: 600, color: "#0f172a" }}>{c.name}</div>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>📞 {c.mobile} &nbsp;|&nbsp; 📍 {c.city || "N/A"}</div>
                    </div>
                  ))}
                {availableCustomers.filter(c => c.name.toLowerCase().includes(customerName.toLowerCase()) || c.mobile.includes(customerName)).length === 0 && (
                  <div style={styles.noSuggestions}>
                    ✨ Registering as new customer
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter mobile number"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city"
              style={styles.input}
              required
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Add Products / Cart Card */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🛍️ Select Products</h3>
          
          <div style={styles.itemSearchRow}>
            {/* Product Autocomplete Input */}
            <div style={{ ...styles.fieldGroup, position: "relative", flex: 3 }}>
              <label style={styles.label}>Product Search</label>
              <input
                type="text"
                value={productSearchQuery}
                onChange={(e) => {
                  setProductSearchQuery(e.target.value);
                  setShowProductSuggestions(true);
                  setSelectedProductId("");
                }}
                onFocus={() => setShowProductSuggestions(true)}
                onBlur={() => setTimeout(() => setShowProductSuggestions(false), 200)}
                placeholder="Type to search product..."
                style={styles.input}
              />
              {showProductSuggestions && productSearchQuery && (
                <div style={styles.suggestionsContainer}>
                  {availableProducts
                    .filter(p => p.name.toLowerCase().includes(productSearchQuery.toLowerCase()))
                    .map(p => (
                      <div
                        key={p._id}
                        onClick={() => {
                          setSelectedProductId(p._id);
                          setProductSearchQuery(p.name);
                          setShowProductSuggestions(false);
                        }}
                        style={styles.suggestionItem}
                      >
                        <div style={{ fontWeight: 600, color: "#0f172a" }}>{p.name}</div>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>
                          💵 ${parseFloat(p.price).toFixed(2)} &nbsp;|&nbsp; 📦 Stock: {p.quantity}
                        </div>
                      </div>
                    ))}
                  {availableProducts.filter(p => p.name.toLowerCase().includes(productSearchQuery.toLowerCase())).length === 0 && (
                    <div style={styles.noSuggestions}>No matching products</div>
                  )}
                </div>
              )}
            </div>

            <div style={{ ...styles.fieldGroup, flex: 1, minWidth: "80px" }}>
              <label style={styles.label}>Qty</label>
              <input
                placeholder="Qty"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                style={styles.input}
              />
            </div>

            <button
              type="button"
              onClick={addItemToBill}
              style={styles.addBtn}
              title="Add product to current invoice list"
            >
              + Add
            </button>
          </div>

          {/* Selected Product info card */}
          {selectedProduct && (
            <div style={styles.productBadge}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", width: "100%" }}>
                <span>🎯 <strong>Selected:</strong> {selectedProduct.name}</span>
                <span>💵 <strong>Price:</strong> ${parseFloat(selectedProduct.price).toFixed(2)}</span>
                <span>📦 <strong>In Stock:</strong> {selectedProduct.quantity}</span>
              </div>
            </div>
          )}

          {/* Added items list table */}
          {items.length > 0 ? (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.th}>Item</th>
                    <th style={styles.th}>Qty</th>
                    <th style={styles.th}>Price</th>
                    <th style={styles.th}>Total</th>
                    <th style={{ ...styles.th, width: "40px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, i) => (
                    <tr key={i} style={styles.tdRow}>
                      <td style={styles.td}>{it.itemName}</td>
                      <td style={styles.td}>{it.quantity}</td>
                      <td style={styles.td}>${parseFloat(it.price).toFixed(2)}</td>
                      <td style={styles.td}>${(it.quantity * it.price).toFixed(2)}</td>
                      <td style={styles.td}>
                        <button
                          type="button"
                          onClick={() => removeItemFromBill(i)}
                          style={styles.deleteRowBtn}
                          title="Remove item"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={styles.summaryContainer}>
                <span style={styles.summaryText}>Total Cart Value:</span>
                <span style={styles.summaryValue}>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          ) : (
            <div style={styles.emptyCartPlaceholder}>
              🛒 No products added to the invoice yet.
            </div>
          )}

          <button type="submit" style={styles.submitBtn}>
            💾 Save & Print Invoice
          </button>
        </div>
      </form>

      {/* RECENT BILLS HISTORY */}
      <div style={{ ...styles.card, marginTop: "24px" }}>
        <h3 style={styles.cardTitle}>📜 Recent Billings</h3>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>Customer</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>City</th>
                <th style={styles.th}>Grand Total</th>
                <th style={{ ...styles.th, textAlign: "center", width: "120px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((b, i) => (
                <tr key={i} style={styles.tdRow}>
                  <td style={{ ...styles.td, fontWeight: 500 }}>{b.customerName}</td>
                  <td style={styles.td}>{b.phone}</td>
                  <td style={styles.td}>{b.city}</td>
                  <td style={{ ...styles.td, fontWeight: 600, color: "#10b981" }}>
                    ${parseFloat(b.totalAmount || b.total || 0).toFixed(2)}
                  </td>
                  <td style={{ ...styles.td, textAlign: "center" }}>
                    <button
                      onClick={() => setActivePrintBill(b)}
                      style={styles.printActionBtn}
                      title="Print Invoice"
                    >
                      🖨️ Print
                    </button>
                    <button
                      onClick={() => handleDeleteBill(b._id)}
                      style={styles.deleteActionBtn}
                      title="Delete Bill"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
              {bills.length === 0 && (
                <tr>
                  <td colSpan="5" style={styles.noHistoryCell}>
                    No recent bills discovered in system logs.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* HIGH FIDELITY PRINT INVOICE MODAL */}
      {activePrintBill && (
        <div style={styles.modalOverlay} className="no-print">
          <div style={styles.modalContent}>
            {/* Action Header inside modal */}
            <div style={styles.modalHeader}>
              <h4 style={{ margin: 0, fontSize: "16px", color: "#1e293b" }}>Invoice Receipt Preview</h4>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => window.print()}
                  style={styles.printModalBtn}
                >
                  🖨️ Print Receipt
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
            <div id="print-invoice-area" style={styles.invoiceInvoicePage}>
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

const styles = {
  container: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "24px",
    fontFamily: "'Poppins', sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "15px",
  },
  mainTitle: {
    margin: 0,
    fontSize: "24px",
    fontWeight: 700,
    color: "#0f172a",
  },
  subTitleText: {
    margin: "4px 0 0 0",
    fontSize: "14px",
    color: "#64748b",
  },
  pillCount: {
    background: "#eef2ff",
    color: "#4f46e5",
    padding: "6px 16px",
    borderRadius: "20px",
    fontWeight: 600,
    fontSize: "13px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "24px",
  },
  card: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
    border: "1px solid #f1f5f9",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  cardTitle: {
    margin: "0 0 8px 0",
    fontSize: "16px",
    fontWeight: 600,
    color: "#1e293b",
    borderBottom: "2px solid #f1f5f9",
    paddingBottom: "10px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#64748b",
  },
  input: {
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    outline: "none",
    background: "#f8fafc",
    transition: "all 0.2s",
  },
  itemSearchRow: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-end",
  },
  addBtn: {
    padding: "11px 20px",
    background: "linear-gradient(to right, #4f46e5, #7c3aed)",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "14px",
    boxShadow: "0 4px 6px rgba(79, 70, 229, 0.15)",
    transition: "transform 0.1s, opacity 0.2s",
    minWidth: "75px",
    height: "41px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  productBadge: {
    background: "#f0fdf4",
    border: "1px dashed #bbf7d0",
    borderRadius: "10px",
    padding: "10px 14px",
    color: "#166534",
    marginTop: "4px",
  },
  tableWrapper: {
    overflowX: "auto",
    borderRadius: "12px",
    border: "1px solid #f1f5f9",
    background: "#ffffff",
    marginTop: "8px",
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
    padding: "12px 14px",
    fontSize: "12px",
    fontWeight: 600,
    color: "#475569",
    borderBottom: "1px solid #e2e8f0",
  },
  tdRow: {
    borderBottom: "1px solid #f1f5f9",
    transition: "background 0.2s",
  },
  td: {
    padding: "12px 14px",
    fontSize: "13px",
    color: "#334155",
  },
  deleteRowBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    color: "#ef4444",
    padding: 0,
    opacity: 0.8,
    transition: "opacity 0.2s",
  },
  summaryContainer: {
    display: "flex",
    justifyContent: "space-between",
    padding: "14px",
    background: "#f8fafc",
    borderTop: "1px solid #e2e8f0",
    fontWeight: 700,
    fontSize: "14px",
    color: "#0f172a",
  },
  summaryText: {
    color: "#475569",
  },
  summaryValue: {
    color: "#4f46e5",
    fontSize: "16px",
  },
  emptyCartPlaceholder: {
    textAlign: "center",
    padding: "36px 20px",
    color: "#94a3b8",
    fontSize: "13px",
    border: "2px dashed #e2e8f0",
    borderRadius: "12px",
    background: "#f8fafc",
  },
  submitBtn: {
    padding: "12px 20px",
    background: "linear-gradient(to right, #10b981, #059669)",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "15px",
    marginTop: "8px",
    boxShadow: "0 4px 6px rgba(16, 185, 129, 0.15)",
    transition: "all 0.2s",
  },
  printActionBtn: {
    background: "#e0e7ff",
    color: "#4f46e5",
    border: "none",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 600,
    marginRight: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  deleteActionBtn: {
    background: "#fee2e2",
    color: "#ef4444",
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
    color: "#64748b",
    fontSize: "13px",
  },
  suggestionsContainer: {
    position: "absolute",
    top: "calc(100% + 4px)",
    left: 0,
    width: "100%",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    zIndex: 999,
    maxHeight: "180px",
    overflowY: "auto",
  },
  suggestionItem: {
    padding: "10px 14px",
    cursor: "pointer",
    transition: "background 0.2s",
    borderBottom: "1px solid #f1f5f9",
    textAlign: "left",
  },
  noSuggestions: {
    padding: "12px 14px",
    color: "#64748b",
    fontSize: "12px",
    textAlign: "center",
    fontWeight: 500,
    background: "#f8fafc",
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
    animation: "fadeIn 0.25s ease-out",
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

export default BillForm;
