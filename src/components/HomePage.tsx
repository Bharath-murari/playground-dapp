import type { FC } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Link } from 'react-router-dom';
// ADD SparklesIcon for the new launcher button
import { ArrowUpRightIcon, ComputerDesktopIcon, ShieldCheckIcon, LockClosedIcon, WalletIcon, SparklesIcon } from '@heroicons/react/24/outline';

export const HomePage: FC = () => {
    const { publicKey } = useWallet();
    const serviceLinks = [
        { href: '/balance', label: 'Check Balance' },
        { href: '/airdrop', label: 'Request Airdrop' },
        { href: '/send', label: 'Send SOL' },
        { href: '/sign', label: 'Sign Message' },
    ];

    const features = [
        { icon: ComputerDesktopIcon, title: "Client-Side Only", description: "Your secrets never leave your device.", color: "purple" },
        { icon: ShieldCheckIcon, title: "Modern Standards", description: "Built with Token-2022 and BIP39.", color: "blue" },
        { icon: LockClosedIcon, title: "Secure & Private", description: "We don't track or store any data.", color: "green" },
    ];

    return (
        <div className="flex flex-col items-center justify-center text-center mt-10 md:mt-20">
            <div className="fade-in">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
                    Secure dApp Playground
                </h1>
                <p className="mt-4 text-lg text-gray-400 max-w-2xl">
                    Interact with the Solana blockchain directly and securely from your browser.
                    Connect your wallet to begin.
                </p>
            </div>

            <div className="mt-12 w-full max-w-4xl">
                <h2 className="text-2xl font-semibold text-white mb-4 text-left">dApp Services</h2>
                {publicKey ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {serviceLinks.map((link, i) => (
                            <Link key={link.href} to={link.href} className={`fade-in fade-in-delay-${i + 1}`}>
                                <div className="group p-6 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-slate-500 transition-all duration-300 h-full">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xl font-semibold text-white">{link.label}</span>
                                        <ArrowUpRightIcon className="h-6 w-6 text-gray-500 group-hover:text-white transition-colors" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="fade-in fade-in-delay-1 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                        <p className="text-lg text-yellow-400">Please connect your wallet to use the dApp services.</p>
                    </div>
                )}
            </div>

            {/* Developer Tools Section - UPDATED */}
            <div className="mt-16 w-full max-w-4xl">
                <h2 className="text-2xl font-semibold text-white mb-4 text-left">Developer Tools</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* NEW: Link to Token Launcher */}
                    <Link to="/launcher" className={`fade-in fade-in-delay-5`}>
                        <div className="group p-6 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-slate-500 transition-all duration-300 h-full">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <SparklesIcon className="h-8 w-8 text-purple-400"/>
                                    <span className="text-xl font-semibold text-white">Token Launcher</span>
                                </div>
                                <ArrowUpRightIcon className="h-6 w-6 text-gray-500 group-hover:text-white transition-colors" />
                            </div>
                            <p className="text-left mt-2 text-gray-400">
                                Create and launch a new Token-2022 SPL token.
                            </p>
                        </div>
                    </Link>

                    {/* EXISTING: Link to Wallet Generator */}
                    <Link to="/generator" className={`fade-in fade-in-delay-6`}>
                        <div className="group p-6 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-slate-500 transition-all duration-300 h-full">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <WalletIcon className="h-8 w-8 text-indigo-400"/>
                                    <span className="text-xl font-semibold text-white">Wallet Generator</span>
                                </div>
                                <ArrowUpRightIcon className="h-6 w-6 text-gray-500 group-hover:text-white transition-colors" />
                            </div>
                            <p className="text-left mt-2 text-gray-400">
                                Generate new Solana or Ethereum wallets from a mnemonic.
                            </p>
                        </div>
                    </Link>
                 </div>
            </div>

            <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-5xl fade-in fade-in-delay-4">
                {features.map(feature => {
                    const Icon = feature.icon;
                    const colorClass = `text-${feature.color}-400`;
                    const bgClass = `bg-${feature.color}-900/20`;
                    return (
                        <div key={feature.title} className="flex flex-col items-center">
                            <div className={`flex items-center justify-center h-12 w-12 rounded-full ${bgClass}`}>
                                <Icon className={`h-6 w-6 ${colorClass}`} />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-white">{feature.title}</h3>
                            <p className="mt-1 text-sm text-gray-500">{feature.description}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};