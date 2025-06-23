import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { 
    TOKEN_2022_PROGRAM_ID, getMintLen, createInitializeMetadataPointerInstruction, 
    createInitializeMintInstruction, TYPE_SIZE, LENGTH_SIZE, ExtensionType,
    getAssociatedTokenAddressSync, createAssociatedTokenAccountInstruction, createMintToInstruction
} from "@solana/spl-token";
import { createInitializeInstruction, pack } from '@solana/spl-token-metadata';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

// --- Header specific to the Token Launcher page ---
const CreatorHeader: React.FC = () => {
  return (
    <header className="w-full p-4 flex justify-between items-center animate-fade-in-up container mx-auto">
      <Link to="/" className="text-xl font-bold hover:text-gray-300 transition-colors">← Back to dApp Home</Link>
      <WalletMultiButton />
    </header>
  );
};

// --- The main Token Creation Form ---
const TokenForm: React.FC = () => {
    const { connection } = useConnection();
    const { publicKey, signTransaction } = useWallet();

    const [tokenName, setTokenName] = useState<string>('');
    const [symbol, setSymbol] = useState<string>('');
    const [decimals, setDecimals] = useState<number>(9);
    const [supply, setSupply] = useState<number>(1000);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [signature, setSignature] = useState<string>('');
    const [error, setError] = useState<string>('');
    
    const createToken = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!publicKey || !signTransaction) {
            setError("Please connect your wallet and try again.");
            return;
        }

        setIsLoading(true);
        setError('');
        setSignature('');

        try {
            const mintKeypair = Keypair.generate();
            const metadata = { mint: mintKeypair.publicKey, name: tokenName, symbol: symbol, uri: imageUrl, additionalMetadata: [] };
            const mintLen = getMintLen([ExtensionType.MetadataPointer]);
            const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
            const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);
            const transaction = new Transaction().add(
                SystemProgram.createAccount({ fromPubkey: publicKey, newAccountPubkey: mintKeypair.publicKey, space: mintLen, lamports, programId: TOKEN_2022_PROGRAM_ID }),
                createInitializeMetadataPointerInstruction(mintKeypair.publicKey, publicKey, mintKeypair.publicKey, TOKEN_2022_PROGRAM_ID),
                createInitializeMintInstruction(mintKeypair.publicKey, decimals, publicKey, null, TOKEN_2022_PROGRAM_ID),
                createInitializeInstruction({ programId: TOKEN_2022_PROGRAM_ID, mint: mintKeypair.publicKey, metadata: mintKeypair.publicKey, name: metadata.name, symbol: metadata.symbol, uri: metadata.uri, mintAuthority: publicKey, updateAuthority: publicKey }),
                createAssociatedTokenAccountInstruction(publicKey, getAssociatedTokenAddressSync(mintKeypair.publicKey, publicKey, false, TOKEN_2022_PROGRAM_ID), publicKey, mintKeypair.publicKey, TOKEN_2022_PROGRAM_ID),
                createMintToInstruction(mintKeypair.publicKey, getAssociatedTokenAddressSync(mintKeypair.publicKey, publicKey, false, TOKEN_2022_PROGRAM_ID), publicKey, supply * Math.pow(10, decimals), [], TOKEN_2022_PROGRAM_ID)
            );
            transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
            transaction.feePayer = publicKey;
            transaction.partialSign(mintKeypair);

            const signedTransaction = await signTransaction(transaction);
            const txSignature = await connection.sendRawTransaction(signedTransaction.serialize());
            setSignature(txSignature);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const inputStyles = "w-full p-3 bg-slate-800 rounded-md border border-slate-700 focus:ring-2 focus:ring-purple-500 focus:outline-none transition placeholder-slate-500";
    
    return (
        <main className="flex-grow flex flex-col justify-center items-center w-full px-4">
            <div className="w-full max-w-md bg-slate-900/50 p-8 rounded-2xl border border-slate-700 shadow-xl">
                <h2 className="text-3xl font-bold text-center mb-2 text-white">Token-2022 Creator</h2>
                <p className="text-slate-400 text-center mb-8">Launch a new SPL Token on Solana.</p>
                <form onSubmit={createToken} className="space-y-5">
                    <input type="text" placeholder="Token Name (e.g. My Token)" value={tokenName} onChange={(e) => setTokenName(e.target.value)} required className={inputStyles} />
                    <input type="text" placeholder="Symbol (e.g. TKN)" value={symbol} onChange={(e) => setSymbol(e.target.value)} required className={inputStyles} />
                    <input type="number" placeholder="Decimals" value={decimals} onChange={(e) => setDecimals(Number(e.target.value))} required className={inputStyles} />
                    <input type="number" placeholder="Total Supply" value={supply} onChange={(e) => setSupply(Number(e.target.value))} required className={inputStyles} />
                    <input type="url" placeholder="Image URL (.png, .jpg, .gif)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required className={inputStyles} />
                    <button type="submit" disabled={isLoading || !publicKey} className="w-full p-3 mt-4 font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-all duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center">
                        {isLoading ? <Loader2 className="animate-spin" /> : "Create Token"}
                    </button>
                </form>
                {signature && <div className="mt-6 p-4 bg-green-900/50 border border-green-700 rounded-lg flex items-start space-x-3"><CheckCircle className="text-green-400 mt-1 flex-shrink-0" /><div><p className="font-bold text-green-300">Success!</p><a href={`https://solscan.io/tx/${signature}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className="text-sm text-green-400 hover:underline break-all">View on Solscan</a></div></div>}
                {error && <div className="mt-6 p-4 bg-red-900/50 border border-red-700 rounded-lg flex items-start space-x-3"><AlertTriangle className="text-red-400 mt-1 flex-shrink-0" /><div><p className="font-bold text-red-300">Error</p><p className="text-sm text-red-400 break-words">{error}</p></div></div>}
            </div>
        </main>
    );
};

// --- Main Exported Page Component for the Launcher ---
export const TokenLauncherPage: React.FC = () => {
  return (
    <div className="bg-slate-950 text-white min-h-screen flex flex-col">
      <CreatorHeader />
      <TokenForm />
    </div>
  );
};