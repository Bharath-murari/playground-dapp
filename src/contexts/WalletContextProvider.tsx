import type { FC, ReactNode } from 'react';
import { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
// WalletAdapterNetwork is no longer needed as we are using a custom endpoint
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';

export const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    // --- THIS IS THE FIX ---

    // You can also provide a custom RPC endpoint.
    // The endpoint is read from the .env file.
    // Make sure the variable starts with VITE_ for Vite projects.
    const endpoint = useMemo(() => import.meta.env.VITE_RPC_URL, []);
    
    // --- END OF FIX ---

    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter()
        ], 
        [] // Wallets do not need to be re-created
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};