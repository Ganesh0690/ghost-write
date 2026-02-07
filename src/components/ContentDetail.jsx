import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { useAleo } from "../AleoContext";
import { IconArrowLeft, IconLock, IconUnlock, IconShield, IconHash, IconFileText, IconCheck, IconEyeOff } from "./Icons";

export default function ContentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { connected } = useWallet();
  const { contents, hasAccess, purchaseContent, loading, purchaseStep, publicKey } = useAleo();
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  const decodedId = decodeURIComponent(id);
  const content = useMemo(
    () => contents.find(c => c.id === decodedId),
    [contents, decodedId]
  );

  if (!content) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <IconHash style={{ width: 24, height: 24 }} />
        </div>
        <h3>Content Not Found</h3>
        <p>This content may have been removed or the link is invalid.</p>
        <button className="btn-secondary" style={{ marginTop: 20 }} onClick={() => navigate("/browse")}>
          Browse Content
        </button>
      </div>
    );
  }

  const isAuthor = publicKey && content.author === publicKey;
  const canAccess = hasAccess(content.id);

  async function handlePurchase() {
    try {
      await purchaseContent(content);
      setPurchaseSuccess(true);
    } catch (err) {
      console.error("Purchase failed:", err);
    }
  }

  return (
    <div className="detail-view">
      <button className="back-link" onClick={() => navigate(-1)}>
        <IconArrowLeft style={{ width: 14, height: 14 }} />
        Back
      </button>

      <div className="detail-header">
        {canAccess || isAuthor ? (
          <h1>{content.title}</h1>
        ) : (
          <h1 style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
            Encrypted Content
          </h1>
        )}

        <div className="detail-meta">
          <span className="badge badge-private">
            <IconEyeOff style={{ width: 12, height: 12 }} />
            Anonymous Author
          </span>
          <span className="price-tag">
            {(content.priceMicrocredits / 1_000_000).toFixed(2)} credits
          </span>
          {content.purchases > 0 && (
            <span className="badge badge-purchases">{content.purchases} purchases</span>
          )}
          <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)", fontSize: 12 }}>
            {new Date(content.timestamp * 1000).toLocaleDateString()}
          </span>
        </div>
      </div>

      {canAccess || isAuthor ? (
        <>
          <div className="detail-body">{content.body}</div>

          {isAuthor && (
            <div className="callout callout-info" style={{ marginTop: 28 }}>
              <div className="callout-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <IconFileText style={{ width: 14, height: 14 }} />
                Author Controls
              </div>
              <p style={{ marginBottom: 12 }}>
                You own the AuthorshipProof record for this content. You can reveal
                your identity at any time by calling the reveal_authorship transition.
              </p>
              <div className="hash-display">Content Record Hash: {content.id}</div>
              <div className="hash-display">Title Hash: {content.titleHash}</div>
              <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                <button className="btn-secondary btn-small">
                  <IconUnlock style={{ width: 12, height: 12 }} /> Reveal Authorship
                </button>
              </div>
            </div>
          )}

          {purchaseSuccess && (
            <div className="callout callout-success" style={{ marginTop: 28 }}>
              <div className="callout-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <IconCheck style={{ width: 14, height: 14 }} />
                Purchase Complete
              </div>
              <p>
                An encrypted AccessToken record has been created in your wallet.
                This ZK proof grants you permanent access to this content.
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="detail-body">
          <div className="locked-overlay">
            <div className="locked-icon" style={{
              width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center",
              background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "50%",
              margin: "0 auto 20px", color: "var(--text-muted)"
            }}>
              <IconLock style={{ width: 28, height: 28 }} />
            </div>
            <h3>Content Locked</h3>
            <p>
              Purchase this content to decrypt and read it. Payment is processed
              via Aleo's credit transfer — the author receives funds
              without knowing your identity.
            </p>

            <div style={{ margin: "28px 0 20px" }}>
              <span className="price-tag" style={{ fontSize: 16, padding: "10px 28px" }}>
                {(content.priceMicrocredits / 1_000_000).toFixed(2)} credits
              </span>
            </div>

            {!connected ? (
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                Connect your wallet to purchase
              </p>
            ) : (
              <button
                className="btn-primary"
                onClick={handlePurchase}
                disabled={loading}
              >
                {loading ? (
                  <><span className="spinner" /> {purchaseStep || "Processing..."}</>
                ) : (
                  <><IconUnlock style={{ width: 14, height: 14 }} /> Purchase & Unlock</>
                )}
              </button>
            )}

            <div className="callout callout-privacy" style={{ marginTop: 36, textAlign: "left" }}>
              <div className="callout-title">
                <IconShield style={{ width: 14, height: 14 }} />
                What happens when you purchase
              </div>
              <p>
                Step 1: A public credit transfer sends payment to the author's address.
                Step 2: An encrypted AccessToken record is created in your wallet,
                proving your right to access this content permanently. The on-chain
                purchase counter increments. Your wallet will prompt you to approve
                both transactions.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="callout callout-info" style={{ marginTop: 28 }}>
        <div className="callout-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <IconHash style={{ width: 14, height: 14 }} />
          On-Chain Verification
        </div>
        <p style={{ marginBottom: 12 }}>
          These hashes are stored on-chain in the published_content mapping.
          They prove content existence without revealing the actual text.
        </p>
        <div className="hash-display">Content Hash: {content.id}</div>
        <div className="hash-display">Program: ghostwrite_v1.aleo</div>
        <div className="hash-display">Network: Aleo Testnet</div>
      </div>
    </div>
  );
}