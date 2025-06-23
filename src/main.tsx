import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { WalletContextProvider } from './contexts/WalletContextProvider.tsx';
import { Toaster } from 'react-hot-toast';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WalletContextProvider>
      <App />
      <Toaster position="bottom-right" toastOptions={{
        style: { background: '#1e293b', color: '#e5e7eb', border: '1px solid #334155' },
      }} />
    </WalletContextProvider>
  </React.StrictMode>,
);