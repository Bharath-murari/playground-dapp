import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { SunIcon } from '@heroicons/react/24/outline';

export const AppBar: FC = () => (
    <header className="flex justify-between items-center p-4 bg-transparent sticky top-0 z-10">
        <Link to="/" className="text-xl font-semibold text-gray-300 hover:text-white transition-colors">
            Solerum
        </Link>
        <div className="flex items-center gap-4">
            <WalletMultiButton />
            <button className="p-2 rounded-full bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors">
                <SunIcon className="h-6 w-6 text-gray-400" />
            </button>
        </div>
    </header>
);