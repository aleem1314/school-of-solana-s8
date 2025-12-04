import type { ReactNode } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

interface Props {
    children: ReactNode;
}

export default function ConnectGate({ children }: Props) {
    const { connected } = useWallet();

    if (!connected) {
        return (
            <div className="py-16 flex items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white p-6">

                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 shadow-2xl text-center w-full max-w-md">
                    <p className="text-white/70 mb-8">
                        Connect your wallet to continue.
                    </p>

                    <WalletMultiButton
                        className="
              !bg-purple-600 !hover:bg-purple-700 
              !text-white !rounded-xl !px-6 !py-3 
              !text-lg !font-semibold
              !transition-all !duration-200
              !shadow-lg hover:!shadow-purple-500/40
            "
                    />
                </div>

            </div>
        );
    }

    return <>{children}</>;
}
