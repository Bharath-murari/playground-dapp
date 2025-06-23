import type { FC } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AppBar } from './components/AppBar';
import { HomePage } from './components/HomePage';
import { RequestAirdrop } from './components/RequestAirdrop';
import { ShowBalance } from './components/ShowBalance';
import { SendTransaction } from './components/SendTransaction';
import { SignMessage } from './components/SignMessage';
import { WalletGeneratorPage } from './components/WalletGenerator';

// ADD THE IMPORT for the new Token Launcher page
import { TokenLauncherPage } from './components/TokenLauncher';

// This layout includes the main AppBar and is used for the dApp pages
const MainLayout: FC = () => (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">
        <AppBar />
        <main className="flex-grow container mx-auto px-4 py-8">
            <Outlet />
        </main>
    </div>
);

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Routes that use the MainLayout with the AppBar */}
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="balance" element={<ShowBalance />} />
                    <Route path="airdrop" element={<RequestAirdrop />} />
                    <Route path="send" element={<SendTransaction />} />
                    <Route path="sign" element={<SignMessage />} />
                </Route>
                
                {/* Standalone route for the wallet generator */}
                <Route path="generator" element={<WalletGeneratorPage />} />
                
                {/* ADDED: Standalone route for the new token launcher */}
                <Route path="launcher" element={<TokenLauncherPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;