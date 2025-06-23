import React, { useState, useEffect, useCallback } from 'react';
//@ts-ignore

import { generateMnemonic, mnemonicToSeedSync } from 'bip39';
//@ts-ignore

import { derivePath } from 'ed25519-hd-key';
import * as nacl from 'tweetnacl';
import { Keypair } from '@solana/web3.js';
//@ts-ignore
import { Wallet } from 'ethers';
//@ts-ignore

import { FiCpu, FiShield, FiLock, FiArrowLeft, FiSun, FiMoon, FiCopy, FiChevronUp, FiEye, FiEyeOff, FiTrash2 } from 'react-icons/fi';

// --- Type Definitions ---
type Page = 'landing' | 'dashboard';
type Theme = 'light' | 'dark';
type ChainType = 'solana' | 'ethereum';
type WalletInfo = {
  path: string;
  publicKey: string;
  privateKey: string;
};

// --- Core Wallet Logic ---
const deriveNewWallet = (chain: ChainType, mnemonic: string, index: number): WalletInfo => {
  let path: string, newWallet: WalletInfo;
  if (chain === 'solana') {
    const seed = mnemonicToSeedSync(mnemonic);
    path = `m/44'/501'/${index}'/0'`;
    const derivedSeed = derivePath(path, seed.toString('hex')).key;
    const keypair = Keypair.fromSecretKey(nacl.sign.keyPair.fromSeed(derivedSeed).secretKey);
    newWallet = { path, publicKey: keypair.publicKey.toBase58(), privateKey: Buffer.from(keypair.secretKey).toString('hex') };
  } else { // Ethereum
    path = `m/44'/60'/0'/0/${index}`;
    const wallet = Wallet.fromPhrase(mnemonic, path);
    newWallet = { path, publicKey: wallet.address, privateKey: wallet.privateKey };
  }
  return newWallet;
};

// --- Theme Management Hook ---
const useTheme = (): [Theme, () => void] => {
  const [theme, setTheme] = useState<Theme>('dark');
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    setTheme(storedTheme || preferredTheme);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme(prev => (prev === 'light' ? 'dark' : 'light')), []);
  return [theme, toggleTheme];
};


// --- UI Components ---

const ThemeToggle: React.FC = () => {
  const [theme, toggleTheme] = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <FiMoon /> : <FiSun />}
    </button>
  );
};

const Header: React.FC<{ onBack?: () => void; showBack?: boolean; }> = ({ onBack, showBack }) => (
  <header className="absolute top-0 left-0 w-full p-4 flex items-center justify-between z-10">
    <div className="flex items-center gap-4">
      {showBack && (
        <button onClick={onBack} className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
          <FiArrowLeft /> Back
        </button>
      )}
      <h1 className="text-lg font-bold text-black dark:text-white">BM's Wallet Generator</h1>
    </div>
    <ThemeToggle />
  </header>
);

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; }> = ({ icon, title, description }) => (
  <div className="flex flex-col items-center gap-2 text-center">
    {icon}
    <h3 className="font-semibold text-black dark:text-white">{title}</h3>
    <p className="text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
  </div>
);

const MnemonicDisplay: React.FC<{ mnemonic: string }> = ({ mnemonic }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copyStatus, setCopyStatus] = useState("Click Anywhere To Copy");

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(mnemonic).then(() => {
      setCopyStatus("Copied!");
      setTimeout(() => setCopyStatus("Click Anywhere To Copy"), 2000);
    });
  }, [mnemonic]);

  return (
    <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg">
      <button onClick={() => setIsExpanded(!isExpanded)} className="flex justify-between items-center w-full p-4 text-left">
        <h2 className="text-xl font-semibold text-black dark:text-white">Your Secret Phrase</h2>
        <FiChevronUp className={`text-neutral-500 dark:text-neutral-400 transition-transform ${!isExpanded && "rotate-180"}`} />
      </button>
      {isExpanded && (
        <div className="px-4 pb-4 cursor-pointer" onClick={handleCopy}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4 pointer-events-none">
            {mnemonic.split(" ").map((word, index) => (
              <div key={index} className="bg-neutral-100 dark:bg-neutral-800 text-center text-black dark:text-neutral-200 rounded-md py-2 px-3">
                {word}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-500">
            <FiCopy /> {copyStatus}
          </div>
        </div>
      )}
    </div>
  );
};

const WalletCard: React.FC<{ wallet: WalletInfo; index: number; onDelete: (index: number) => void; }> = ({ wallet, index, onDelete }) => {
  const [isPrivateKeyVisible, setIsPrivateKeyVisible] = useState(false);
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-black dark:text-white">Wallet {index + 1}</h3>
        <div className="flex items-center gap-4">
           <span className="text-xs font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 px-2 py-1 rounded-md">{wallet.path}</span>
           <button onClick={() => onDelete(index)} className="text-neutral-500 hover:text-red-500 transition-colors">
            <FiTrash2 size={18} />
          </button>
        </div>
      </div>
      <div className="space-y-4 font-mono text-sm">
        <div>
          <label className="text-neutral-500 dark:text-neutral-400 block mb-1">Public Key</label>
          <div className="text-black dark:text-neutral-200 break-all">
            <span>{wallet.publicKey}</span>
          </div>
        </div>
        <div>
          <label className="text-neutral-500 dark:text-neutral-400 block mb-1">Private Key</label>
          <div className="flex items-center justify-between gap-4 text-black dark:text-neutral-200 break-all">
            <span>{isPrivateKeyVisible ? wallet.privateKey : "•".repeat(64)}</span>
            <button onClick={() => setIsPrivateKeyVisible(!isPrivateKeyVisible)} className="text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white">
              {isPrivateKeyVisible ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- Page Components ---

const LandingPage: React.FC<{ onStart: (chain: ChainType) => void; }> = ({ onStart }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center animate-fade-in relative bg-gray-50 dark:bg-gray-950">
    <Header showBack={false} />
    <h1 className="text-4xl md:text-6xl font-bold text-black dark:text-white mb-4">Secure Wallet Generator</h1>
    <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mb-12">
      Instantly generate Hierarchical Deterministic wallets for Solana and Ethereum. Your keys are created securely in your browser.
    </p>
    <div className="flex flex-col sm:flex-row gap-4 mb-16">
      <button onClick={() => onStart("solana")} className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(192,132,252,0.3)] dark:shadow-[0_0_30px_rgba(192,132,252,0.4)]">
        Generate Solana Wallet
      </button>
      <button onClick={() => onStart("ethereum")} className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(96,165,250,0.3)] dark:shadow-[0_0_30px_rgba(96,165,250,0.4)]">
        Generate Ethereum Wallet
      </button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
      <FeatureCard icon={<FiCpu size={24} className="text-purple-500" />} title="Client-Side Only" description="Your secrets never leave your device." />
      <FeatureCard icon={<FiShield size={24} className="text-blue-500" />} title="BIP39 Standard" description="Industry-standard mnemonic phrases." />
      <FeatureCard icon={<FiLock size={24} className="text-green-500" />} title="Secure & Private" description="We don't track or store any data." />
    </div>
  </div>
);

const DashboardPage: React.FC<{
  chain: ChainType;
  mnemonic: string;
  wallets: WalletInfo[];
  onAddWallet: () => void;
  onDeleteWallet: (index: number) => void;
  onClearWallets: () => void;
  onBack: () => void;
}> = ({ chain, mnemonic, wallets, onAddWallet, onDeleteWallet, onClearWallets, onBack }) => (
  <div className="bg-gray-50 dark:bg-gray-950">
    <Header onBack={onBack} showBack={true} />
    <main className="flex flex-col items-center p-4 pt-24 pb-12 space-y-8 animate-fade-in">
      <MnemonicDisplay mnemonic={mnemonic} />
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-black dark:text-white">{chain === 'solana' ? 'Solana' : 'Ethereum'} Wallets</h2>
          <div className="flex items-center gap-3">
            <button onClick={onAddWallet} className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 text-sm font-semibold rounded-md hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors">Add Wallet</button>
            <button onClick={onClearWallets} className="bg-red-600 text-white px-4 py-2 text-sm font-semibold rounded-md hover:bg-red-700 transition-colors">Clear Wallets</button>
          </div>
        </div>
        <div className="space-y-4">
          {wallets.map((wallet, index) => (
            <WalletCard key={wallet.publicKey} wallet={wallet} index={index} onDelete={onDeleteWallet} />
          ))}
        </div>
      </div>
    </main>
  </div>
);


// --- This is the main component for the generator page ---
export const WalletGeneratorPage: React.FC = () => {
  const [page, setPage] = useState<Page>('landing');
  const [chain, setChain] = useState<ChainType | null>(null);
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [wallets, setWallets] = useState<WalletInfo[]>([]);

  const handleStart = (selectedChain: ChainType) => {
    setChain(selectedChain);
    setMnemonic(generateMnemonic());
    setWallets([]);
    setPage('dashboard');
  };

  const handleAddWallet = () => {
    if (!mnemonic || !chain) return;
    const newWallet = deriveNewWallet(chain, mnemonic, wallets.length);
    setWallets(prev => [...prev, newWallet]);
  };

  const handleDeleteWallet = (indexToDelete: number) => {
    setWallets(currentWallets => currentWallets.filter((_, index) => index !== indexToDelete));
  };
  
  const handleClearWallets = () => setWallets([]);

  const handleBack = () => {
    setPage('landing');
    setMnemonic(null);
    setChain(null);
    setWallets([]);
  };

  if (page === 'landing') {
    return <LandingPage onStart={handleStart} />;
  }
  
  if (page === 'dashboard' && chain && mnemonic) {
    return (
      <DashboardPage
        chain={chain}
        mnemonic={mnemonic}
        wallets={wallets}
        onAddWallet={handleAddWallet}
        onDeleteWallet={handleDeleteWallet}
        onClearWallets={handleClearWallets}
        onBack={handleBack}
      />
    );
  }

  return <LandingPage onStart={handleStart} />;
};