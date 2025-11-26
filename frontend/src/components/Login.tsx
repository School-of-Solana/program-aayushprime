import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
  const wallet = useAnchorWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (wallet) {
      navigate('/');
    }
  }, [wallet, navigate]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
      <h1 className="text-4xl font-bold mb-8">Welcome to Solana Voting App</h1>
      <p className="text-lg mb-8">Please connect your wallet to continue.</p>
      <WalletMultiButton />
    </div>
  );
};
