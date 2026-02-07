import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { useAleo } from "../AleoContext";
import { IconPlug, IconEdit, IconBook, IconKey, IconUnlock } from "./Icons";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { connected, publicKey } = useWallet();
  const { getMyContent, getMyPurchasedContent } = useAleo();
  const [tab, setTab] = useState("published");

  if (!connected) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <IconPlug style={{ width: 24, height: 24 }} />
        </div>
        <h3>Connect Your Wallet</h3>
        <p>Connect your Aleo wallet to view your dashboard.</p>
      </div>
    );
  }

  const myContent = getMyContent();
  const myPurchases = getMyPurchasedContent();
  const totalRevenue = myContent.reduce(
    (sum, c) => sum + c.purchases * c.priceMicrocredits * 0.95, 0
  );

  return (
    <>
      <div className="section-label">Account</div>
      <h2 className="section-title">Dashboard</h2>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{myContent.length}</div>
          <div className="stat-label">Published</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{myPurchases.length}</div>
          <div className="stat-label">Purchased</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {(totalRevenue / 1_000_000).toFixed(2)}
          </div>
          <div className="stat-label">Revenue (Credits)</div>
        </div>
      </div>

      <div className="callout callout-info" style={{ marginBottom: 32 }}>
        <div className="callout-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <IconKey style={{ width: 14, height: 14 }} />
          Your Private Identity
        </div>
        <p style={{ marginBottom: 10 }}>
          All your content is linked to this Aleo address via encrypted records.
          Nobody can associate your publications with your real identity.
        </p>
        <div className="hash-display">{publicKey}</div>
      </div>

      <div className="tab-bar">
        <button
          className={`tab ${tab === "published" ? "active" : ""}`}
          onClick={() => setTab("published")}
        >
          Publications ({myContent.length})
        </button>
        <button
          className={`tab ${tab === "purchased" ? "active" : ""}`}
          onClick={() => setTab("purchased")}
        >
          Purchases ({myPurchases.length})
        </button>
      </div>

      {tab === "published" && (
        <>
          {myContent.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <IconEdit style={{ width: 24, height: 24 }} />
              </div>
              <h3>No publications yet</h3>
              <p>Start writing to see your content here.</p>
              <button className="btn-primary" style={{ marginTop: 20 }} onClick={() => navigate("/publish")}>
                Publish Your First Piece
              </button>
            </div>
          ) : (
            <div className="content-grid">
              {myContent.map(item => (
                <div
                  key={item.id}
                  className="content-card"
                  onClick={() => navigate(`/content/${encodeURIComponent(item.id)}`)}
                >
                  <div className="content-card-header">
                    <h3>{item.title}</h3>
                    <span className="badge badge-purchases">{item.purchases} sold</span>
                  </div>
                  <p className="preview">{item.preview}</p>
                  <div className="content-card-footer">
                    <span className="price-tag">
                      {(item.priceMicrocredits / 1_000_000).toFixed(2)} credits
                    </span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)" }}>
                      Rev: {((item.purchases * item.priceMicrocredits * 0.95) / 1_000_000).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "purchased" && (
        <>
          {myPurchases.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <IconBook style={{ width: 24, height: 24 }} />
              </div>
              <h3>No purchases yet</h3>
              <p>Browse content to find something worth reading.</p>
              <button className="btn-primary" style={{ marginTop: 20 }} onClick={() => navigate("/browse")}>
                Browse Content
              </button>
            </div>
          ) : (
            <div className="content-grid">
              {myPurchases.map(item => (
                <div
                  key={item.id}
                  className="content-card"
                  onClick={() => navigate(`/content/${encodeURIComponent(item.id)}`)}
                >
                  <div className="content-card-header">
                    <h3>{item.title}</h3>
                    <span className="badge badge-unlocked">
                      <IconUnlock style={{ width: 12, height: 12 }} /> Unlocked
                    </span>
                  </div>
                  <p className="preview">{item.preview}</p>
                  <div className="content-card-footer">
                    <span className="price-tag">
                      {(item.priceMicrocredits / 1_000_000).toFixed(2)} credits
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
