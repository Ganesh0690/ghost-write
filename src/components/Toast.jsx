import React, { useEffect } from "react";
import { IconCheck, IconX } from "./Icons";

export default function Toast({ message, type = "error", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`toast ${type}`}>
      {type === "success" ? (
        <IconCheck style={{ width: 16, height: 16, color: "#4ade80", flexShrink: 0 }} />
      ) : (
        <IconX style={{ width: 16, height: 16, color: "#f87171", flexShrink: 0 }} />
      )}
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          color: "var(--text-muted)",
          padding: 4,
          flexShrink: 0,
        }}
      >
        <IconX style={{ width: 14, height: 14 }} />
      </button>
    </div>
  );
}
