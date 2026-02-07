import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { useAleo } from "../AleoContext";
import { IconShield, IconPlug, IconCheck, IconSend, IconEye, IconEyeOff, IconLock, IconUnlock } from "./Icons";

export default function PublishPage() {
  const navigate = useNavigate();
  const { connected } = useWallet();
  const { publishContent, loading, generateContentHash } = useAleo();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [price, setPrice] = useState("1");
  const [showPreview, setShowPreview] = useState(false);
  const [success, setSuccess] = useState(null);

  const priceMicrocredits = Math.floor(parseFloat(price || "0") * 1_000_000);
  const titleHash = title ? generateContentHash(title) : "";
  const contentHash = body ? generateContentHash(body) : "";

  async function handlePublish() {
    if (!title.trim() || !body.trim() || priceMicrocredits <= 0) return;
    try {
      const result = await publishContent(title, body, priceMicrocredits);
      setSuccess(result);
      setTitle("");
      setBody("");
      setPrice("1");
    } catch (err) {
      console.error("Publish failed:", err);
    }
  }

  if (!connected) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <IconPlug style={{ width: 24, height: 24 }} />
        </div>
        <h3>Connect Your Wallet</h3>
        <p>Connect an Aleo wallet to publish content anonymously on-chain.</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="publish-form">
        <div className="callout callout-success">
          <div className="callout-title">
            <IconCheck style={{ width: 16, height: 16 }} />
            Published Successfully
          </div>
          <p>Your content is now live on the Aleo network. All records are encrypted.</p>
        </div>

        <div className="callout callout-info">
          <div className="callout-title">Authorship Proof Created</div>
          <p style={{ marginBottom: 12 }}>
            An encrypted AuthorshipProof record was created in your wallet.
            Only you can reveal this proof to claim authorship later.
          </p>
          <div className="hash-display">Content Hash: {success.id}</div>
          <div className="hash-display">Title Hash: {success.titleHash}</div>
          {success.txId && (
            <div className="hash-display">Transaction: {success.txId}</div>
          )}
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
          <button className="btn-primary" onClick={() => navigate(`/content/${encodeURIComponent(success.id)}`)}>
            View Content
          </button>
          <button className="btn-secondary" onClick={() => setSuccess(null)}>
            Publish Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="publish-form">
      <div className="section-label">Create</div>
      <h2 className="section-title">Publish Anonymously</h2>

      <div className="callout callout-privacy">
        <div className="callout-title">
          <IconShield style={{ width: 14, height: 14 }} />
          Privacy Guarantee
        </div>
        <p>
          Your identity stays hidden. Publishing creates encrypted records on Aleo —
          your content hash is stored on-chain but the actual text, your name, and
          all metadata remain private. Only ZK proofs verify authenticity.
        </p>
      </div>

      <div className="form-group">
        <label className="form-label">Title</label>
        <input
          className="form-input"
          placeholder="Enter your content title..."
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        {titleHash && (
          <div className="form-hint">On-chain hash: {titleHash.substring(0, 36)}...</div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Content</label>
        <textarea
          className="form-textarea"
          placeholder="Write your article, story, or report here..."
          value={body}
          onChange={e => setBody(e.target.value)}
        />
        {contentHash && (
          <div className="form-hint">Content hash: {contentHash.substring(0, 36)}...</div>
        )}
        <div className="form-hint">{body.length} characters · Full text is never stored on-chain</div>
      </div>

      <div className="form-group">
        <label className="form-label">Price (Aleo Credits)</label>
        <input
          className="form-input"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="1.00"
          value={price}
          onChange={e => setPrice(e.target.value)}
        />
        <div className="form-hint">{priceMicrocredits.toLocaleString()} microcredits</div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button
          className="btn-primary"
          onClick={handlePublish}
          disabled={loading || !title.trim() || !body.trim() || priceMicrocredits <= 0}
        >
          {loading ? (
            <>
              <span className="spinner" />
              Generating ZK Proof...
            </>
          ) : (
            <>
              <IconSend style={{ width: 14, height: 14 }} />
              Publish to Aleo
            </>
          )}
        </button>
        <button className="btn-secondary" onClick={() => setShowPreview(!showPreview)}>
          {showPreview ? (
            <><IconEyeOff style={{ width: 14, height: 14 }} /> Hide Preview</>
          ) : (
            <><IconEye style={{ width: 14, height: 14 }} /> Preview</>
          )}
        </button>
      </div>

      {showPreview && title && body && (
        <div style={{ marginTop: 36 }}>
          <div className="section-label">Preview</div>
          <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr" }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8, fontWeight: 600 }}>What you see (author)</div>
              <div className="content-card" style={{ cursor: "default" }}>
                <h3>{title}</h3>
                <p className="preview">{body.substring(0, 200)}</p>
                <div className="content-card-footer">
                  <span className="price-tag">{parseFloat(price || 0).toFixed(2)} credits</span>
                  <span className="badge badge-unlocked">
                    <IconUnlock style={{ width: 12, height: 12 }} /> Unlocked
                  </span>
                </div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8, fontWeight: 600 }}>What others see (encrypted)</div>
              <div className="content-card" style={{ cursor: "default" }}>
                <div className="encrypted-notice">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, color: "var(--text-secondary)" }}>
                    <IconLock style={{ width: 14, height: 14 }} />
                    <span style={{ fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>Encrypted Content</span>
                  </div>
                  {contentHash ? contentHash.substring(0, 32) + "..." : "Hash will appear here..."}
                  <br />
                  <span style={{ color: "var(--text-muted)", fontSize: 11 }}>Purchase to decrypt and read</span>
                </div>
                <div className="content-card-footer">
                  <span className="price-tag">{parseFloat(price || 0).toFixed(2)} credits</span>
                  <span className="badge badge-locked">
                    <IconLock style={{ width: 12, height: 12 }} /> Locked
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

