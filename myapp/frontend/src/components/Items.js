import React, { useState, useEffect } from "react";
import { fetchItems, createItem, updateItem, deleteItem } from "../api/items";
import toast from "react-hot-toast";

function Items() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await fetchItems();
      if (Array.isArray(response.data.items)) {
        setItems(response.data.items);
      } else if (Array.isArray(response.data.data)) {
        setItems(response.data.data);
      } else if (Array.isArray(response.data)) {
        setItems(response.data);
      }
    } catch (err) {
      console.error("Error fetching items:", err);
      toast.error("Failed to fetch product items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !quantity) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const payload = {
        name,
        price: parseFloat(price),
        quantity: parseInt(quantity, 10),
      };

      if (editingId) {
        await updateItem(editingId, payload);
        toast.success("Item updated successfully");
      } else {
        await createItem(payload);
        toast.success("Item added successfully");
      }

      resetForm();
      loadItems();
    } catch (err) {
      console.error("Error saving item:", err);
      toast.error(err.response?.data?.error || "Failed to save item");
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setName(item.name);
    setPrice(item.price);
    setQuantity(item.quantity);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Permanently delete this item from inventory?")) {
      try {
        await deleteItem(id);
        toast.success("Item removed from catalogue");
        loadItems();
      } catch (err) {
        toast.error("Failed to delete item");
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setPrice("");
    setQuantity("");
  };

  const filtered = items.filter(item =>
    item.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.wrapper}>
      {/* Page Header */}
      <div style={styles.pageHeader}>
        <div>
          <h2 style={styles.pageTitle}>📦 Inventory Catalogue</h2>
          <p style={styles.pageSub}>Manage products, pricing, and stock levels</p>
        </div>
        <span style={styles.countPill}>{items.length} Products</span>
      </div>

      {/* Layout Split: Add/Edit Left, List Right */}
      <div style={styles.layout}>
        {/* ADD/EDIT FORM */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>{editingId ? "✏️ Edit Product Details" : "➕ Add New Product"}</h3>
          <p style={styles.cardSub}>Update inventory record parameters</p>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Product Name *</label>
              <input
                type="text"
                placeholder="E.g. Wireless Headset"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Price ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Quantity In Stock *</label>
              <input
                type="number"
                min="0"
                placeholder="E.g. 24"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.btnRow}>
              <button type="submit" style={{ ...styles.submitBtn, background: editingId ? "#f59e0b" : "linear-gradient(135deg, #4f46e5, #7c3aed)" }}>
                {editingId ? "Update Item" : "Add Product"}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} style={styles.cancelBtn}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* CATALOGUE LIST */}
        <div style={{ ...styles.card, flex: 2 }}>
          <div style={styles.tableHeader}>
            <h3 style={styles.cardTitle}>Product Catalogue</h3>
            <div style={styles.searchBox}>
              <span>🔍</span>
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={styles.searchInput}
              />
            </div>
          </div>

          {loading ? (
            <div style={styles.centerMsg}>⏳ Loading product catalogue...</div>
          ) : filtered.length === 0 ? (
            <div style={styles.centerMsg}>No product matches found.</div>
          ) : (
            <div style={styles.grid}>
              {filtered.map((item, index) => {
                const qty = item.quantity ?? 0;
                let statusLabel = "In Stock";
                let statusStyle = styles.stockOk;

                if (qty === 0) {
                  statusLabel = "Sold Out";
                  statusStyle = styles.stockOut;
                } else if (qty < 10) {
                  statusLabel = "Low Stock";
                  statusStyle = styles.stockLow;
                }

                return (
                  <div key={item._id || index} style={styles.productCard}>
                    {/* Status Badge */}
                    <span style={{ ...styles.statusBadge, ...statusStyle }}>{statusLabel}</span>

                    {/* Name */}
                    <h4 style={styles.productName}>{item.name}</h4>

                    {/* Price */}
                    <div style={styles.productPrice}>${parseFloat(item.price || 0).toFixed(2)}</div>

                    {/* Quantity indicator bar */}
                    <div style={styles.stockMeter}>
                      <span style={styles.qtyText}>Stock Qty: {qty}</span>
                      <div style={styles.meterContainer}>
                        <div style={{ ...styles.meterFill, width: `${Math.min(qty, 100)}%`, background: qty === 0 ? "#ef4444" : qty < 10 ? "#f59e0b" : "#10b981" }} />
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={styles.cardActions}>
                      <button onClick={() => handleEdit(item)} style={styles.cardEditBtn}>✏️ Edit</button>
                      <button onClick={() => handleDelete(item._id)} style={styles.cardDeleteBtn}>🗑️ Delete</button>
                    </div>
                  </div>
                );
              })}
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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "16px",
    maxHeight: "600px",
    overflowY: "auto",
    paddingRight: "6px",
  },
  productCard: {
    background: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    position: "relative",
    boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  statusBadge: {
    position: "absolute",
    top: "10px",
    left: "10px",
    fontSize: "9px",
    fontWeight: 700,
    padding: "2px 8px",
    borderRadius: "10px",
    textTransform: "uppercase",
  },
  stockOk: {
    background: "#dcfce7",
    color: "#15803d",
  },
  stockLow: {
    background: "#fef3c7",
    color: "#b45309",
  },
  stockOut: {
    background: "#fee2e2",
    color: "#b91c1c",
  },
  productName: {
    margin: "18px 0 6px",
    fontSize: "14px",
    fontWeight: 700,
    color: "#1e293b",
    textTransform: "capitalize",
  },
  productPrice: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#4f46e5",
    marginBottom: "12px",
  },
  stockMeter: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    marginBottom: "14px",
  },
  qtyText: {
    fontSize: "11px",
    color: "#64748b",
    fontWeight: 600,
  },
  meterContainer: {
    width: "100%",
    height: "5px",
    background: "#f1f5f9",
    borderRadius: "3px",
    overflow: "hidden",
  },
  meterFill: {
    height: "100%",
    borderRadius: "3px",
  },
  cardActions: {
    display: "flex",
    width: "100%",
    gap: "8px",
  },
  cardEditBtn: {
    flex: 1,
    background: "#f0fdf4",
    color: "#16a34a",
    border: "1px solid #bbf7d0",
    padding: "6px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: 600,
    cursor: "pointer",
    margin: 0,
    transition: "background 0.2s",
  },
  cardDeleteBtn: {
    flex: 1,
    background: "#fef2f2",
    color: "#dc2626",
    border: "1px solid #fecaca",
    padding: "6px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: 600,
    cursor: "pointer",
    margin: 0,
    transition: "background 0.2s",
  },
  centerMsg: {
    textAlign: "center",
    padding: "40px",
    color: "#94a3b8",
    fontSize: "13px",
  },
};

export default Items;