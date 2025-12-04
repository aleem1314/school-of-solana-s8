import { Link } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function Navbar() {
    const { connected } = useWallet();

    return (
        <header className="w-full px-4 py-3 border-b border-white/10 bg-white/5 backdrop-blur-lg">
            <div className="flex items-center justify-between">

                <div className="flex items-center gap-6">
                    <Link to="/" className="text-2xl font-bold tracking-tight">
                        Pulse App
                    </Link>

                    {connected && (
                        <nav className="flex items-center gap-4 text-white/80">
                            <Link to="/" className="hover:text-white transition-all">
                                Posts
                            </Link>

                            <Link to="/profile" className="hover:text-white transition-all">
                                Profile
                            </Link>
                        </nav>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {connected && (
                        <Link
                            to="/new"
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl transition-all"
                        >
                            + New Post
                        </Link>
                    )}

                    <WalletMultiButton className="!bg-purple-600 !hover:bg-purple-700 !text-white !rounded-xl" />
                </div>

            </div>
        </header>
    );
}
