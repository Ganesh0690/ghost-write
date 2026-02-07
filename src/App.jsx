import React from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import { WalletMultiButton } from "@demox-labs/aleo-wallet-adapter-reactui";
import "@demox-labs/aleo-wallet-adapter-reactui/dist/styles.css";
import { AleoProvider, useAleo } from "./AleoContext";
import HomePage from "./components/HomePage";
import BrowsePage from "./components/BrowsePage";
import PublishPage from "./components/PublishPage";
import DashboardPage from "./components/DashboardPage";
import ContentDetail from "./components/ContentDetail";
import Toast from "./components/Toast";

function AppContent() {
  const { error, setError } = useAleo();

  return (
    <>
      <div className="app-container">
        <nav className="nav">
          <NavLink to="/" className="nav-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C9.24 2 7 4.24 7 7c0 1.76.93 3.31 2.33 4.19C7.36 12.16 6 14.42 6 17v2c0 .55.45 1 1 1h10c.55 0 1-.45 1-1v-2c0-2.58-1.36-4.84-3.33-5.81A4.988 4.988 0 0017 7c0-2.76-2.24-5-5-5z" fill="currentColor" opacity="0.2"/>
              <path d="M9.5 9.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5" stroke="#c8ff00" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M13 9.5c0-.83.67-1.5 1.5-1.5" stroke="#c8ff00" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M12 2C9.24 2 7 4.24 7 7c0 1.76.93 3.31 2.33 4.19C7.36 12.16 6 14.42 6 17v2c0 .55.45 1 1 1h10c.55 0 1-.45 1-1v-2c0-2.58-1.36-4.84-3.33-5.81A4.988 4.988 0 0017 7c0-2.76-2.24-5-5-5z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
            GhostWrite
          </NavLink>

          <div className="nav-links">
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} end>
              Home
            </NavLink>
            <NavLink to="/browse" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              Browse
            </NavLink>
            <NavLink to="/publish" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              Publish
            </NavLink>
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              Dashboard
            </NavLink>
          </div>

          <div className="nav-actions">
            <WalletMultiButton />
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/publish" element={<PublishPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/content/:id" element={<ContentDetail />} />
          </Routes>
        </main>

        <footer className="footer">
          Built on Aleo · Zero-Knowledge Proofs · GhostWrite 2026
        </footer>
      </div>

      {error && (
        <Toast message={error} type="error" onClose={() => setError(null)} />
      )}
    </>
  );
}

export default function App() {
  return (
    <AleoProvider>
      <AppContent />
    </AleoProvider>
  );
}
