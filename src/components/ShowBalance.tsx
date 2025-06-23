import type { FC } from "react";
import  { useEffect, useState } from "react";
// The import is correct, we just need to use both hooks
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { toast } from 'react-hot-toast';
import { Loader } from "./Loader";
import { BackButton } from "./BackButton";

export const ShowBalance: FC = () => {
    // --- THIS IS THE FIX ---
    // Get the connection object from the useConnection hook
    const { connection } = useConnection();
    // Get the publicKey from the useWallet hook
    const { publicKey } = useWallet();
    // --- END OF FIX ---

    const [balance, setBalance] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const getBalance = async (showToast = false) => {
        if (!publicKey || !connection) return; // Guard against null connection
        setIsLoading(true);
        try {
            const lamports = await connection.getBalance(publicKey);
            setBalance(lamports / LAMPORTS_PER_SOL);
            if (showToast) toast.success('Balance updated!');
        } catch (error) {
            console.error("Failed to get balance", error);
            if (showToast) toast.error('Failed to update balance.');
        } finally { 
            setIsLoading(false); 
        }
    };

    // The useEffect hook is correct and will now work as intended
    useEffect(() => {
        if (publicKey && connection) {
            getBalance();
        }
    }, [publicKey, connection]);

    return (
        <div className="fade-in max-w-2xl mx-auto">
            <BackButton />
            <div className="gradient-border-container">
                <div className="p-8 space-y-6 bg-[#111827] rounded-lg">
                    <h3 className="text-3xl font-bold text-white">Your Wallet Balance</h3>
                    <div className="flex items-center justify-between bg-slate-800 p-4 rounded-md border border-slate-700">
                        <div className="text-xl font-mono text-gray-300">
                            {balance !== null ? (
                                <span className="text-green-400">{balance.toFixed(4)} SOL</span>
                            ) : (
                                <span className="text-gray-500">Loading...</span>
                            )}
                        </div>
                        <button onClick={() => getBalance(true)} disabled={!publicKey || isLoading} className="flex items-center justify-center w-36 h-11 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-slate-700 disabled:text-gray-400 transition-colors">
                            {isLoading ? <Loader /> : 'Refresh'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};