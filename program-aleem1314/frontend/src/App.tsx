import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { Routes, Route } from "react-router-dom";

import { RPC } from "./solana/connection";
import Navbar from "./components/NavBar";
import Home from "./routes/Home";
import NewPost from "./routes/NewPost";
import Profile from "./routes/Profile";
import ConnectGate from "./components/ConnectGate";

export default function App() {
  const wallets = [new PhantomWalletAdapter()];

  return (
    <ConnectionProvider endpoint={RPC}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
            <Navbar />

            <ConnectGate>

              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/new" element={<NewPost />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </ConnectGate>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
