import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAleo } from "../AleoContext";
import { IconSearch, IconLock, IconUnlock } from "./Icons";

export default function BrowsePage() {
  const navigate = useNavigate();
  const { contents, hasAccess, publicKey, connected } = useAleo();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const filtered = useMemo(() => {
    let items = contents.filter(c => c.isActive);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(c => {
        // Only search titles for content the user has access to
        const canSee = connected && (c.author === publicKey || hasAccess(c.id));
        if (canSee) return c.title.toLowerCase().includes(q);
        return c.id.toLowerCase().includes(q);
      });
    }
    if (sortBy === "newest") items.sort((a, b) => b.timestamp - a.timestamp);
    else if (sortBy === "cheapest") items.sort((a, b) => a.priceMicrocredits - b.priceMicrocredits);
    else if (sortBy === "popular") items.sort((a, b) => b.purchases - a.purchases);
    return items;
  }, [contents, search, sortBy, connected, publicKey, hasAccess]);

  function canViewContent(item) {
    if (!connected || !publicKey) return false;
    return item.author === publicKey || hasAccess(item.id);
  }

  return (
    <>
      <div className="section-label">Marketplace</div>
      <h2 className="section-title">Browse Content</h2>

      <div style={{ display: "flex", gap: 12, marginBottom: 32, alignItems: "center" }}>
        <div style={{ position: "relative", maxWidth: 360, flex: 1 }}>
          <IconSearch style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", width: 16, height: 16 }} />
          <input
            className="form-input"
            placeholder="Search by hash or title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 40 }}
          />
        </div>
        <div className="tab-bar" style={{ marginBottom: 0 }}>
          {["newest", "cheapest", "popular"].map(s => (
            <button
              key={s}
              className={`tab ${sortBy === s ? "active" : ""}`}
              onClick={() => setSortBy(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <IconSearch style={{ width: 24, height: 24 }} />
          </div>
          <h3>No content found</h3>
          <p>Be the first to publish something. All content is encrypted and private by default.</p>
        </div>
      ) : (
        <div className="content-grid">
          {filtered.map(item => {
            const unlocked = canViewContent(item);
            return (
              <div
                key={item.id}
                className="content-card"
                onClick={() => navigate(`/content/${encodeURIComponent(item.id)}`)}
              >
                {unlocked ? (
                  <>
                    <div className="content-card-header">
                      <h3>{item.title}</h3>
                    </div>
                    <p className="preview">{item.preview}</p>
                  </>
                ) : (
                  <div className="encrypted-notice">
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, color: "var(--text-secondary)" }}>
                      <IconLock style={{ width: 14, height: 14 }} />
                      <span style={{ fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>Encrypted Content</span>
                    </div>
                    {item.id.substring(0, 32)}...
                    <br />
                    <span style={{ color: "var(--text-muted)", fontSize: 11 }}>
                      Purchase to decrypt and read
                    </span>
                  </div>
                )}
                <div className="content-card-footer">
                  <span className="price-tag">
                    {(item.priceMicrocredits / 1_000_000).toFixed(2)} credits
                  </span>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {item.purchases > 0 && (
                      <span className="badge badge-purchases">
                        {item.purchases} sold
                      </span>
                    )}
                    {unlocked ? (
                      <span className="badge badge-unlocked">
                        <IconUnlock style={{ width: 12, height: 12 }} /> Unlocked
                      </span>
                    ) : (
                      <span className="badge badge-locked">
                        <IconLock style={{ width: 12, height: 12 }} /> Locked
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
