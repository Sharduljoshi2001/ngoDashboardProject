import { useState } from "react";
import { submitReport } from "../utils/api";

const currentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const initial = {
  ngo_id: "",
  month: currentMonth(),
  people_helped: "",
  events_conducted: "",
  funds_utilized: "",
};

export default function ReportForm() {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null); // { type, msg }

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function validate() {
    const e = {};
    if (!form.ngo_id.trim()) e.ngo_id = "NGO ID is required.";
    if (!form.month) e.month = "Month is required.";
    if (form.people_helped === "" || Number(form.people_helped) < 0)
      e.people_helped = "Enter a valid number ≥ 0.";
    if (form.events_conducted === "" || Number(form.events_conducted) < 0)
      e.events_conducted = "Enter a valid number ≥ 0.";
    if (form.funds_utilized === "" || Number(form.funds_utilized) < 0)
      e.funds_utilized = "Enter a valid amount ≥ 0.";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    setAlert(null);

    try {
      const payload = {
        ngo_id: form.ngo_id.trim(),
        month: form.month,
        people_helped: parseInt(form.people_helped, 10),
        events_conducted: parseInt(form.events_conducted, 10),
        funds_utilized: parseFloat(form.funds_utilized),
      };

      const res = await submitReport(payload);

      if (res.success) {
        setAlert({ type: "success", msg: "Report submitted successfully!" });
        setForm(initial);
      } else {
        setAlert({
          type: "error",
          msg: res.errors?.join(" ") || "Submission failed.",
        });
      }
    } catch {
      setAlert({ type: "error", msg: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="page-header">
        <h1>Submit Monthly Report</h1>
        <p>Record your NGO's impact for the month.</p>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type}`}>{alert.msg}</div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="ngo_id">NGO ID</label>
              <input
                id="ngo_id"
                type="text"
                placeholder="e.g. NGO-042"
                className={errors.ngo_id ? "input-error" : ""}
                value={form.ngo_id}
                onChange={(e) => set("ngo_id", e.target.value)}
              />
              <span className="field-error">{errors.ngo_id || ""}</span>
            </div>

            <div className="form-group">
              <label htmlFor="month">Month</label>
              <input
                id="month"
                type="month"
                className={errors.month ? "input-error" : ""}
                value={form.month}
                onChange={(e) => set("month", e.target.value)}
              />
              <span className="field-error">{errors.month || ""}</span>
            </div>

            <div className="form-group">
              <label htmlFor="people_helped">People Helped</label>
              <input
                id="people_helped"
                type="number"
                min="0"
                placeholder="0"
                className={errors.people_helped ? "input-error" : ""}
                value={form.people_helped}
                onChange={(e) => set("people_helped", e.target.value)}
              />
              <span className="field-error">{errors.people_helped || ""}</span>
            </div>

            <div className="form-group">
              <label htmlFor="events_conducted">Events Conducted</label>
              <input
                id="events_conducted"
                type="number"
                min="0"
                placeholder="0"
                className={errors.events_conducted ? "input-error" : ""}
                value={form.events_conducted}
                onChange={(e) => set("events_conducted", e.target.value)}
              />
              <span className="field-error">
                {errors.events_conducted || ""}
              </span>
            </div>

            <div className="form-group full-width">
              <label htmlFor="funds_utilized">Funds Utilized (₹)</label>
              <input
                id="funds_utilized"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className={errors.funds_utilized ? "input-error" : ""}
                value={form.funds_utilized}
                onChange={(e) => set("funds_utilized", e.target.value)}
              />
              <span className="field-error">
                {errors.funds_utilized || ""}
              </span>
            </div>

            <div className="form-group full-width">
              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={submitting}
              >
                {submitting ? "Submitting…" : "Submit Report"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
