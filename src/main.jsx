import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { WalletModalProvider } from "@demox-labs/aleo-wallet-adapter-reactui";
import { WalletProvider } from "@demox-labs/aleo-wallet-adapter-react";
import {
  DecryptPermission,
  WalletAdapterNetwork,
} from "@demox-labs/aleo-wallet-adapter-base";
import { useMemo } from "react";
import { LeoWalletAdapter } from "@demox-labs/aleo-wallet-adapter-leo";
import { BrowserRouter } from "react-router-dom";

function Root() {
  const wallets = useMemo(
    () => [
      new LeoWalletAdapter({
        appName: "GhostWrite",
      }),
    ],
    []
  );

  return (
    <WalletProvider
      wallets={wallets}
      decryptPermission={DecryptPermission.UponRequest}
      network={WalletAdapterNetwork.TestnetBeta}
      autoConnect
    >
      <WalletModalProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </WalletModalProvider>
    </WalletProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
