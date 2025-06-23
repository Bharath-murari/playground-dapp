import type { FC } from "react";
import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { toast } from 'react-hot-toast';
import { Loader } from "./Loader";
import { BackButton } from "./BackButton";

export const RequestAirdrop: FC = () => {
    const { connection } = useConnection();
    const { publicKey } = useWallet();
    const [amount, setAmount] = useState('1');
    const [isLoading, setIsLoading] = useState(false);

    const onClick = async () => {
        if (!publicKey) { toast.error("Wallet not connected!"); return; }
        setIsLoading(true);
        const toastId = toast.loading('Requesting airdrop...');
        try {
            const signature = await connection.requestAirdrop(publicKey, Number(amount) * LAMPORTS_PER_SOL);
            await connection.confirmTransaction(signature, 'confirmed');
            toast.success(`Airdrop of ${amount} SOL successful!`, { id: toastId });
        } catch (error: any) {
            toast.error(`Airdrop failed: ${error.message}`, { id: toastId });
        } finally { setIsLoading(false); }
    };

    return (
        <div className="fade-in max-w-2xl mx-auto">
            <BackButton />
            <div className="gradient-border-container">
                <div className="p-8 space-y-6 bg-[#111827] rounded-lg">
                    <h3 className="text-3xl font-bold text-white">Request Airdrop</h3>
                    <p className="text-gray-400">Get free SOL for testing on Devnet. This will not work on Mainnet.</p>
                    <div className="flex items-center gap-4">
                        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="flex-grow p-3 bg-slate-800 text-white rounded-md border border-slate-700 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all" placeholder="Amount in SOL" />
                        <button onClick={onClick} disabled={!publicKey || isLoading} className="flex items-center justify-center w-40 h-12 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 disabled:bg-slate-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors">
                            {isLoading ? <Loader /> : 'Request SOL'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};