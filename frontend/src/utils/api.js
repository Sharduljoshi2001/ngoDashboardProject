const BASE =
  import.meta.env.VITE_API_URL || "";

export async function submitReport(data) {
  const res = await fetch(`${BASE}/api/report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getDashboard(month) {
  const res = await fetch(`${BASE}/api/dashboard?month=${month}`);
  return res.json();
}

export async function getMonths() {
  const res = await fetch(`${BASE}/api/months`);
  return res.json();
}
