import React from "react";
import { useNavigate } from "react-router-dom";
import { useAleo } from "../AleoContext";
import { IconShield, IconHash, IconCreditCard, IconEyeOff, IconFileText, IconKey } from "./Icons";

export default function HomePage() {
  const navigate = useNavigate();
  const { contents } = useAleo();
  const totalPurchases = contents.reduce((sum, c) => sum + c.purchases, 0);

  return (
    <>
      <div className="hero">
        <div className="hero-label">Powered by Aleo Zero-Knowledge Proofs</div>
        <h1>Write Freely.<br/>Publish <em>Privately.</em></h1>
        <p>
          A confidential content platform where writers publish anonymously,
          readers pay via private transactions, and authorship is proven
          only when you choose.
        </p>
        <div className="hero-actions">
          <button className="btn-primary" onClick={() => navigate("/publish")}>
            Start Writing
          </button>
          <button className="btn-secondary" onClick={() => navigate("/browse")}>
            Browse Content
          </button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{contents.length}</div>
          <div className="stat-label">Published Works</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalPurchases}</div>
          <div className="stat-label">Total Purchases</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{new Set(contents.map(c => c.author)).size}</div>
          <div className="stat-label">Anonymous Authors</div>
        </div>
      </div>

      <div className="section-label">Architecture</div>
      <h2 className="section-title">How Privacy Works</h2>

      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon"><IconShield /></div>
          <h3>Private Records</h3>
          <p>Content ownership is stored as an encrypted Aleo Record. Only you can decrypt and prove ownership using your private key.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon"><IconHash /></div>
          <h3>ZK Content Hashing</h3>
          <p>Content is hashed on-chain. The hash proves existence and uniqueness without revealing the actual text to anyone.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon"><IconCreditCard /></div>
          <h3>Private Payments</h3>
          <p>Readers pay via Aleo's private credit transfers. Transaction amounts and participant identities remain confidential.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon"><IconEyeOff /></div>
          <h3>Anonymous Publishing</h3>
          <p>Publish under a cryptographic identity. No name, no email, no metadata — just your Aleo address shielded by ZK proofs.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon"><IconFileText /></div>
          <h3>Authorship Proofs</h3>
          <p>An AuthorshipProof record is created at publish time. Reveal it later to prove you wrote something — on your terms.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon"><IconKey /></div>
          <h3>Access Tokens</h3>
          <p>Purchases generate encrypted AccessToken records. Only the buyer can decrypt and verify their access rights.</p>
        </div>
      </div>

      {contents.length > 0 && (
        <>
          <div className="section-label">Network Activity</div>
          <h2 className="section-title">Recent Publications</h2>
          <div className="content-grid">
            {contents.slice(0, 3).map(item => (
              <div
                key={item.id}
                className="content-card"
                onClick={() => navigate(`/content/${encodeURIComponent(item.id)}`)}
              >
                <div className="encrypted-notice">
                  Content Hash: {item.id.substring(0, 24)}...
                  <br />
                  Title & body encrypted — connect wallet to view
                </div>
                <div className="content-card-footer">
                  <span className="price-tag">
                    {(item.priceMicrocredits / 1_000_000).toFixed(2)} credits
                  </span>
                  <span className="badge badge-private">Encrypted</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
