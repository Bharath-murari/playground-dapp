import type { FC } from "react";
import  { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { toast } from 'react-hot-toast';
import { Loader } from "./Loader";
import { BackButton } from "./BackButton";

export const SendTransaction: FC = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const [to, setTo] = useState('');
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const onClick = async () => {
        if (!publicKey || !sendTransaction) { toast.error("Wallet not connected!"); return; }
        setIsLoading(true);
        const toastId = toast.loading('Sending transaction...');
        try {
            const transaction = new Transaction().add(SystemProgram.transfer({ fromPubkey: publicKey, toPubkey: new PublicKey(to), lamports: Number(amount) * LAMPORTS_PER_SOL }));
            const signature = await sendTransaction(transaction, connection);
            await connection.confirmTransaction(signature, 'confirmed');
            toast.success(`Sent ${amount} SOL successfully!`, { id: toastId });
            setTo(''); setAmount('');
        } catch (error: any) {
            toast.error(`Transaction failed: ${error.message}`, { id: toastId });
        } finally { setIsLoading(false); }
    };

    return (
        <div className="fade-in max-w-2xl mx-auto">
            <BackButton />
            <div className="gradient-border-container">
                <div className="p-8 space-y-6 bg-[#111827] rounded-lg">
                    <h3 className="text-3xl font-bold text-white">Send SOL</h3>
                    <p className="text-gray-400">Transfer SOL to another wallet on the Solana network.</p>
                    <div className="space-y-4">
                        <input type="text" value={to} onChange={(e) => setTo(e.target.value)} className="w-full p-3 bg-slate-800 text-white rounded-md border border-slate-700 focus:ring-2 focus:ring-green-500 focus:outline-none transition-all" placeholder="Recipient's Public Key" />
                        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-3 bg-slate-800 text-white rounded-md border border-slate-700 focus:ring-2 focus:ring-green-500 focus:outline-none transition-all" placeholder="Amount in SOL" />
                    </div>
                    <button onClick={onClick} disabled={!publicKey || isLoading || !to || !amount} className="w-full flex items-center justify-center h-12 mt-4 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-slate-700 disabled:text-gray-400 transition-colors">
                        {isLoading ? <Loader /> : 'Send Transaction'}
                    </button>
                </div>
            </div>
        </div>
    );
};