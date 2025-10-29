// src/App.jsx
import React, { useState, useMemo } from "react";

/**
 * Replace these with your actual URLs:
 */
const WEBHOOK_URL = "https://webhook.site/your-uuid-here"; // <-- put your webhook.site URL here
const GITHUB_REPO_URL = "https://github.com/laknarasimha/React-SEgment_Project-"; // <-- put your GitHub repo URL here

const ALL_OPTIONS = [
  { label: "First Name", value: "first_name" },
  { label: "Last Name", value: "last_name" },
  { label: "Gender", value: "gender" },
  { label: "Age", value: "age" },
  { label: "Account Name", value: "account_name" },
  { label: "City", value: "city" },
  { label: "State", value: "state" },
];

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [segmentName, setSegmentName] = useState("");
  // selectedValues is an array where each element is either '' (unselected) or a value like 'first_name'
  const [selectedValues, setSelectedValues] = useState([""]); // start with one dropdown
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // convenience map value -> label
  const valueToLabel = useMemo(() => {
    const m = {};
    ALL_OPTIONS.forEach((o) => (m[o.value] = o.label));
    return m;
  }, []);

  // compute options available for a dropdown at index `idx`
  const availableOptions = (idx) =>
    ALL_OPTIONS.filter(
      (o) =>
        // include option if not selected elsewhere OR if it's currently selected by this dropdown
        !selectedValues.includes(o.value) || selectedValues[idx] === o.value
    );

  function openDrawer() {
    setDrawerOpen(true);
    setMessage(null);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setMessage(null);
  }

  function handleSelectChange(idx, value) {
    setSelectedValues((prev) => {
      const copy = [...prev];
      copy[idx] = value;
      return copy;
    });
  }

  function addNewSchema() {
    // add new empty dropdown
    setSelectedValues((prev) => [...prev, ""]);
    // Also reset the top "Add schema to segment" select placeholder — if you have a specific select representing that,
    // the UI already shows selects; this resets the first select only if you want. Here we simply ensure no implicit selection.
  }

  function removeSchema(idx) {
    setSelectedValues((prev) => {
      const copy = [...prev];
      copy.splice(idx, 1);
      // if no dropdowns remain, keep one empty
      return copy.length ? copy : [""];
    });
  }

  async function saveSegment() {
    // validation
    if (!segmentName.trim()) {
      setMessage({ type: "error", text: "Please enter a segment name." });
      return;
    }
    // gather selected schemas (only those which have a selection)
    const picked = selectedValues.filter((v) => v && v.trim());
    if (!picked.length) {
      setMessage({ type: "error", text: "Please add at least one schema." });
      return;
    }

    const schemaArray = picked.map((value) => {
      return { [value]: valueToLabel[value] || value };
    });

    const payload = {
      segment_name: segmentName,
      schema: schemaArray,
    };

    setIsSaving(true);
    setMessage(null);
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Server responded ${res.status} ${text}`);
      }

      setMessage({ type: "success", text: "Segment saved & sent to server." });
      // Optionally close drawer or reset UI:
      // setDrawerOpen(false);
    } catch (err) {
      setMessage({
        type: "error",
        text: `Failed to send: ${err.message}`,
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button style={styles.saveBtn} onClick={openDrawer}>
            Save segment
          </button>
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noreferrer"
            style={styles.githubLink}
            title="Open GitHub repository"
          >
            View on GitHub
          </a>
        </div>
      </header>

      <main style={styles.content}>
        <div style={styles.leftPlaceholder}>
          {/* This area is intentionally blurred/placeholder to match the example */}
          <div style={styles.placeholderBox}>Audience preview / page content</div>
        </div>

        {/* Drawer */}
        <aside
          style={{
            ...styles.drawer,
            right: drawerOpen ? 0 : -420,
            boxShadow: drawerOpen ? "0 0 30px rgba(0,0,0,0.2)" : "none",
          }}
        >
          <div style={styles.drawerHeader}>
            <button onClick={closeDrawer} style={styles.backButton}>
              ←
            </button>
            <h3 style={{ margin: 0 }}>Saving Segment</h3>
          </div>

          <div style={styles.drawerBody}>
            <label style={styles.label}>Enter the Name of the Segment</label>
            <input
              placeholder="Name of the segment"
              value={segmentName}
              onChange={(e) => setSegmentName(e.target.value)}
              style={styles.input}
            />

            <p style={{ marginTop: 8 }}>
              To save your segment, you need to add the schemas to build the query
            </p>

            <div style={styles.legend}>
              <span style={{ ...styles.legendDot, background: "#4CAF50" }} />
              <small>User Traits</small>
              <span style={{ ...styles.legendDot, background: "#E91E63", marginLeft: 12 }} />
              <small>Group Traits</small>
            </div>

            {/* Blue box */}
            <div style={styles.blueBox}>
              {selectedValues.map((sel, idx) => (
                <div key={idx} style={styles.schemaRow}>
                  <span style={styles.schemaDot} />
                  <select
                    value={sel}
                    onChange={(e) => handleSelectChange(idx, e.target.value)}
                    style={styles.select}
                  >
                    <option value="">Add schema to segment</option>
                    {availableOptions(idx).map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <button
                    title="Remove"
                    onClick={() => removeSchema(idx)}
                    style={styles.minusBtn}
                  >
                    −
                  </button>
                </div>
              ))}

              <div style={{ marginTop: 8 }}>
                <button style={styles.addLink} onClick={addNewSchema}>
                  + Add new schema
                </button>
              </div>
            </div>

            <div style={styles.actionsRow}>
              <button
                style={{ ...styles.primaryBtn, opacity: isSaving ? 0.7 : 1 }}
                onClick={saveSegment}
                disabled={isSaving}
              >
                Save the Segment
              </button>
              <button style={styles.cancelBtn} onClick={closeDrawer}>
                Cancel
              </button>
            </div>

            {message && (
              <div
                style={{
                  marginTop: 12,
                  color: message.type === "error" ? "#b00020" : "#0a8f3b",
                }}
              >
                {message.text}
              </div>
            )}

            {/* debug / show JSON preview */}
            <div style={{ marginTop: 14 }}>
              <strong>Payload preview:</strong>
              <pre style={styles.pre}>
{JSON.stringify(
  {
    segment_name: segmentName || "<name>",
    schema: selectedValues
      .filter((v) => v)
      .map((v) => ({ [v]: valueToLabel[v] || v })),
  },
  null,
  2
)}
              </pre>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

/** styles (simple inline for demo) */
const styles = {
  page: { fontFamily: "Inter, Arial, sans-serif", height: "100vh", background: "#f6f7f8" },
  header: {
    padding: "16px 24px",
    borderBottom: "1px solid #e6e6e6",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  saveBtn: {
    background: "transparent",
    border: "2px solid #e0e0e0",
    padding: "10px 18px",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 14,
  },
  githubLink: {
    marginLeft: 8,
    textDecoration: "none",
    color: "#0073e6",
    fontSize: 14,
  },
  content: { display: "flex", height: "calc(100vh - 64px)" },
  leftPlaceholder: {
    flex: 1,
    padding: 24,
  },
  placeholderBox: {
    background: "#fff",
    height: "100%",
    borderRadius: 6,
    boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.02)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#9b9b9b",
    fontSize: 16,
  },
  drawer: {
    width: 420,
    position: "relative",
    transition: "right 0.25s ease",
    background: "#ffffff",
    borderLeft: "1px solid #e6e6e6",
    display: "flex",
    flexDirection: "column",
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: 16,
    borderBottom: "1px solid #f1f1f1",
  },
  backButton: {
    background: "transparent",
    border: "none",
    fontSize: 18,
    cursor: "pointer",
  },
  drawerBody: { padding: 18, overflowY: "auto", flex: 1 },
  label: { display: "block", marginBottom: 6, fontWeight: 600, fontSize: 13 },
  input: {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 4,
    border: "1px solid #cfcfcf",
    marginBottom: 12,
    boxSizing: "border-box",
  },
  legend: { display: "flex", alignItems: "center", gap: 8, marginBottom: 10 },
  legendDot: { width: 10, height: 10, borderRadius: 10, display: "inline-block", marginRight: 6 },
  blueBox: {
    border: "2px solid #cfeaf6",
    padding: 12,
    borderRadius: 6,
    background: "#fbfeff",
    minHeight: 72,
  },
  schemaRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  schemaDot: {
    width: 10,
    height: 10,
    borderRadius: 10,
    background: "#4CAF50",
    display: "inline-block",
  },
  select: {
    flex: 1,
    padding: "8px 10px",
    borderRadius: 4,
    border: "1px solid #d0d0d0",
    fontSize: 14,
  },
  minusBtn: {
    border: "none",
    background: "#f5f5f5",
    padding: "6px 10px",
    borderRadius: 6,
    cursor: "pointer",
  },
  addLink: {
    border: "none",
    background: "transparent",
    color: "#007a6c",
    cursor: "pointer",
    textDecoration: "underline",
    padding: 0,
    fontSize: 14,
  },
  actionsRow: { display: "flex", gap: 8, marginTop: 12 },
  primaryBtn: {
    padding: "10px 14px",
    background: "#2ab27b",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  cancelBtn: {
    padding: "10px 14px",
    background: "#fff",
    color: "#666",
    border: "1px solid #eee",
    borderRadius: 6,
    cursor: "pointer",
  },
  pre: {
    background: "#111",
    color: "#fff",
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
    fontSize: 12,
    overflowX: "auto",
  },
};

export default App;

