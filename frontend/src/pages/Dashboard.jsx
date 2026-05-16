import { useState, useEffect, useCallback } from "react";
import { getDashboard } from "../utils/api";

const currentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

/** ≥ 1 crore: show value in crores (avoids broken en-IN + notation:"compact" strings like "LCr") */
const LARGE_NUMBER = 1e7;

const formatStatInteger = (n) => {
  if (n == null) return { text: "—" };
  const num = Number(n);
  const full = Math.trunc(num).toLocaleString("en-IN");
  if (Math.abs(num) < LARGE_NUMBER)
    return { text: full, title: undefined };
  const crores = Math.abs(Math.trunc(num)) / 1e7;
  const text =
    (num < 0 ? "-" : "") +
    crores.toLocaleString("en-IN", { maximumFractionDigits: 2 }) +
    " Cr";
  return { text, title: full };
};

const formatStatMoney = (n) => {
  if (n == null) return { text: "—" };
  const num = Number(n);
  const full =
    "₹" +
    num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  if (Math.abs(num) < LARGE_NUMBER)
    return { text: full, title: undefined };
  const crores = Math.abs(num) / 1e7;
  const text =
    (num < 0 ? "-₹" : "₹") +
    crores.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) +
    " Cr";
  return { text, title: full };
};

const STATS_META = [
  { key: "total_ngos", label: "NGOs Reporting", icon: "🏛", color: "amber", fmt: formatStatInteger },
  { key: "total_people_helped", label: "People Helped", icon: "👥", color: "emerald", fmt: formatStatInteger },
  { key: "total_events_conducted", label: "Events Conducted", icon: "📅", color: "sky", fmt: formatStatInteger },
  { key: "total_funds_utilized", label: "Funds Utilized", icon: "💰", color: "violet", fmt: formatStatMoney },
];

export default function Dashboard() {
  const [month, setMonth] = useState(currentMonth());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getDashboard(month);
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.errors?.join(" ") || "Failed to load.");
      }
    } catch {
      setError("Network error. Is the server running?");
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isEmpty =
    data &&
    data.total_ngos === 0 &&
    data.total_people_helped === 0 &&
    data.total_events_conducted === 0 &&
    data.total_funds_utilized === 0;

  const monthLabel = new Date(month + "-15").toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Aggregated impact metrics across all reporting NGOs.</p>
      </div>

      <div className="month-selector">
        <label htmlFor="dash-month">Viewing</label>
        <input
          id="dash-month"
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="stats-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="loading-shimmer" />
          ))}
        </div>
      ) : isEmpty ? (
        <div className="card">
          <div className="empty-state">
            <div className="icon">📭</div>
            <h3>No reports for {monthLabel}</h3>
            <p>Once NGOs submit reports for this month, data will appear here.</p>
          </div>
        </div>
      ) : (
        <div className="stats-grid">
          {STATS_META.map(({ key, label, icon, color, fmt }) => {
            const { text, title } = fmt(data[key]);
            return (
              <div key={key} className="stat-card">
                <div className={`stat-icon ${color}`}>{icon}</div>
                <div className="stat-label">{label}</div>
                <div className="stat-value" title={title}>
                  {text}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
