import { useEffect, useState } from 'react';
import type { FC } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export const WalletInfo: FC = () => {
    const { connection } = useConnection();
    const { publicKey } = useWallet();
    const [balance, setBalance] = useState<number | null>(null);

    useEffect(() => {
        if (publicKey) {
            connection.getBalance(publicKey).then(setBalance);
        }
    }, [publicKey, connection]);

    return (
        <div className="flex items-center gap-4">
            {publicKey && (
                <div className="text-sm text-gray-300">
                    Balance: {balance !== null ? ` ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL` : 'Loading...'}
                </div>
            )}
            <WalletMultiButton style={{ backgroundColor: '#4a5568', borderRadius: '0.375rem' }} />
        </div>
    );
};
