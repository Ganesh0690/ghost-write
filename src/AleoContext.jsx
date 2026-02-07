import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import {
  Transaction,
  WalletAdapterNetwork,
} from "@demox-labs/aleo-wallet-adapter-base";

const PROGRAM_ID = "ghostwrite_v1.aleo";
const NETWORK_URL = "https://api.explorer.provable.com/v1";

const AleoContext = createContext(null);

function generateContentHash(content) {
  let hash = 0n;
  for (let i = 0; i < content.length; i++) {
    const char = BigInt(content.charCodeAt(i));
    hash = ((hash << 5n) - hash + char) & ((1n << 128n) - 1n);
  }
  if (hash === 0n) hash = 1n;
  return hash.toString() + "field";
}

export function AleoProvider({ children }) {
  const { publicKey, requestTransaction, connected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [purchaseStep, setPurchaseStep] = useState("");
  const [error, setError] = useState(null);
  const [contents, setContents] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("gw_contents") || "[]");
    } catch {
      return [];
    }
  });
  const [myPurchases, setMyPurchases] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("gw_purchases") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("gw_contents", JSON.stringify(contents));
  }, [contents]);

  useEffect(() => {
    localStorage.setItem("gw_purchases", JSON.stringify(myPurchases));
  }, [myPurchases]);

  const publishContent = useCallback(async (title, body, priceMicrocredits) => {
    if (!connected || !publicKey) throw new Error("Wallet not connected");
    setLoading(true);
    setError(null);

    try {
      const titleHash = generateContentHash(title);
      const contentHash = generateContentHash(body);
      const timestamp = BigInt(Math.floor(Date.now() / 1000));

      const aleoTransaction = Transaction.createTransaction(
        publicKey,
        WalletAdapterNetwork.TestnetBeta,
        PROGRAM_ID,
        "publish_content",
        [
          titleHash,
          contentHash,
          priceMicrocredits.toString() + "u64",
          timestamp.toString() + "u64",
        ],
        500_000,
        false
      );

      const txId = await requestTransaction(aleoTransaction);

      const newContent = {
        id: contentHash,
        titleHash,
        title,
        body,
        preview: body.substring(0, 200),
        priceMicrocredits: Number(priceMicrocredits),
        author: publicKey,
        timestamp: Number(timestamp),
        txId,
        purchases: 0,
        isActive: true,
      };

      setContents(prev => [newContent, ...prev]);
      return newContent;
    } catch (err) {
      const msg = err?.message || String(err);
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [connected, publicKey, requestTransaction]);

  const purchaseContent = useCallback(async (contentItem) => {
    if (!connected || !publicKey) throw new Error("Wallet not connected");
    if (contentItem.author === publicKey) throw new Error("Cannot purchase your own content");
    setLoading(true);
    setError(null);

    try {
      // ── Step 1: Transfer credits to the author ──
      setPurchaseStep("Sending payment to author...");

      const paymentTx = Transaction.createTransaction(
        publicKey,
        WalletAdapterNetwork.TestnetBeta,
        "credits.aleo",
        "transfer_public",
        [
          contentItem.author,
          contentItem.priceMicrocredits.toString() + "u64",
        ],
        300_000,
        false
      );

      const paymentTxId = await requestTransaction(paymentTx);
      console.log("Payment sent:", paymentTxId);

      // ── Step 2: Create AccessToken on ghostwrite contract ──
      setPurchaseStep("Creating access token...");

      const timestamp = BigInt(Math.floor(Date.now() / 1000));

      const accessTx = Transaction.createTransaction(
        publicKey,
        WalletAdapterNetwork.TestnetBeta,
        PROGRAM_ID,
        "purchase_content",
        [
          contentItem.id,
          contentItem.author,
          contentItem.priceMicrocredits.toString() + "u64",
          timestamp.toString() + "u64",
        ],
        300_000,
        false
      );

      const accessTxId = await requestTransaction(accessTx);
      console.log("Access token created:", accessTxId);

      // ── Update local state ──
      setContents(prev =>
        prev.map(c =>
          c.id === contentItem.id
            ? { ...c, purchases: c.purchases + 1 }
            : c
        )
      );

      const purchase = {
        contentId: contentItem.id,
        buyer: publicKey,
        timestamp: Number(timestamp),
        paymentTxId,
        accessTxId,
      };

      setMyPurchases(prev => [...prev, purchase]);
      return purchase;
    } catch (err) {
      const msg = err?.message || String(err);
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
      setPurchaseStep("");
    }
  }, [connected, publicKey, requestTransaction]);

  const hasAccess = useCallback((contentId) => {
    if (!publicKey) return false;
    const content = contents.find(c => c.id === contentId);
    if (content && content.author === publicKey) return true;
    return myPurchases.some(p => p.contentId === contentId && p.buyer === publicKey);
  }, [publicKey, contents, myPurchases]);

  const getMyContent = useCallback(() => {
    if (!publicKey) return [];
    return contents.filter(c => c.author === publicKey);
  }, [publicKey, contents]);

  const getMyPurchasedContent = useCallback(() => {
    if (!publicKey) return [];
    const purchasedIds = myPurchases
      .filter(p => p.buyer === publicKey)
      .map(p => p.contentId);
    return contents.filter(c => purchasedIds.includes(c.id));
  }, [publicKey, myPurchases, contents]);

  const value = {
    publicKey,
    connected,
    loading,
    purchaseStep,
    error,
    contents,
    publishContent,
    purchaseContent,
    hasAccess,
    getMyContent,
    getMyPurchasedContent,
    generateContentHash,
    setError,
    PROGRAM_ID,
  };

  return <AleoContext.Provider value={value}>{children}</AleoContext.Provider>;
}

export function useAleo() {
  const ctx = useContext(AleoContext);
  if (!ctx) throw new Error("useAleo must be used within AleoProvider");
  return ctx;
}