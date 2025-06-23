import type { FC } from 'react';
import{ useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { ed25519 } from '@noble/curves/ed25519';
import { toast } from 'react-hot-toast';
import { Loader } from './Loader';
import { BackButton } from './BackButton';

export const SignMessage: FC = () => {
    const { publicKey, signMessage } = useWallet();
    const [message, setMessage] = useState('I am proving I own this wallet for the BM dApp.');
    const [isLoading, setIsLoading] = useState(false);

    const onClick = async () => {
        if (!publicKey || !signMessage) { toast.error('Wallet not connected or does not support signing!'); return; }
        setIsLoading(true);
        const toastId = toast.loading('Awaiting signature in wallet...');
        try {
            const encodedMessage = new TextEncoder().encode(message);
            const signature = await signMessage(encodedMessage);
            if (!ed25519.verify(signature, encodedMessage, publicKey.toBytes())) throw new Error('Message signature invalid!');
            toast.success(`Message signed successfully!`, { id: toastId, duration: 5000 });
        } catch (error: any) {
            toast.error(`Signing failed: ${error.message}`, { id: toastId });
        } finally { setIsLoading(false); }
    };

    return (
        <div className="fade-in max-w-2xl mx-auto">
            <BackButton />
            <div className="gradient-border-container">
                <div className="p-8 space-y-6 bg-[#111827] rounded-lg">
                    <h3 className="text-3xl font-bold text-white">Sign a Message</h3>
                    <p className="text-gray-400">Prove your wallet ownership by signing a message. This is a gas-free transaction.</p>
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="w-full p-3 bg-slate-800 text-white rounded-md border border-slate-700 focus:ring-2 focus:ring-yellow-500 focus:outline-none transition-all" placeholder="Enter message to sign" />
                    <button onClick={onClick} disabled={!publicKey || isLoading || !message} className="w-full flex items-center justify-center h-12 mt-4 bg-yellow-500 text-black font-semibold rounded-md hover:bg-yellow-600 disabled:bg-slate-700 disabled:text-gray-400 transition-colors">
                        {isLoading ? <Loader /> : 'Sign Message'}
                    </button>
                </div>
            </div>
        </div>
    );
};