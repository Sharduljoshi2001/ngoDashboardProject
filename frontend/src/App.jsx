import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import ReportForm from "./pages/ReportForm";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-wrapper">
        <nav className="navbar">
          <NavLink to="/" className="navbar-brand">
            Impact<span>Tracker</span>
          </NavLink>
          <div className="navbar-links">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `nav-link${isActive ? " active" : ""}`
              }
            >
              Submit Report
            </NavLink>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `nav-link${isActive ? " active" : ""}`
              }
            >
              Dashboard
            </NavLink>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<ReportForm />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
