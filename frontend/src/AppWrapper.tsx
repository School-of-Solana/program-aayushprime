import { useState, createContext, useContext, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { WalletContextProvider } from './components/WalletContextProvider';

type Network = 'mainnet-beta' | 'devnet' | 'testnet' | 'localnet';

interface NetworkContextState {
    network: Network;
    setNetwork: (network: Network) => void;
}

export const NetworkContext = createContext<NetworkContextState | undefined>(undefined);

export function useNetwork() {
    const context = useContext(NetworkContext);
    if (!context) {
        throw new Error('useNetwork must be used within a NetworkProvider');
    }
    return context;
}

export function AppWrapper() {
    const [network, setNetwork] = useState<Network>(() => {
        const savedNetwork = localStorage.getItem('solana-voting-app-network');
        return (savedNetwork as Network) || 'devnet';
    });

    useEffect(() => {
        localStorage.setItem('solana-voting-app-network', network);
    }, [network]);

    return (
        <NetworkContext.Provider value={{ network, setNetwork }}>
            <WalletContextProvider network={network}>
                <Outlet />
            </WalletContextProvider>
        </NetworkContext.Provider>
    );
}
