import { useEffect, useState } from 'react';
import type { FC } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as anchor from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

interface AdminViewProps {
    pollAddress: PublicKey;
    program: anchor.Program | null;
    onUntrackPoll: () => void;
}

export const AdminView: FC<AdminViewProps> = ({ pollAddress, program, onUntrackPoll }) => {
    const [poll, setPoll] = useState<any>(null);
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    useEffect(() => {
        const fetchPoll = async () => {
            if (program) {
                const pollAccount = await (program.account as any).poll.fetch(pollAddress);
                setPoll(pollAccount);
            }
        };
        fetchPoll();
    }, [pollAddress, program]);

    const handleEndPoll = async () => {
        if (!publicKey || !program) {
            alert('Please connect your wallet and ensure the program is loaded!');
            return;
        }

        try {
            const transaction = await program.methods
                .endPoll()
                .accounts({
                    poll: pollAddress,
                    admin: publicKey,
                })
                .transaction();

            const signature = await sendTransaction(transaction, connection);
            await connection.confirmTransaction(signature, 'processed');

            const pollAccount = await (program.account as any).poll.fetch(pollAddress);
            setPoll(pollAccount);
        } catch (error) {
            console.error('Error ending poll:', error);
            alert('Error ending poll. See console for details.');
        }
    };

    if (!poll) {
        return <div>Loading poll...</div>;
    }

    const isAdmin = publicKey && poll.admin.equals(publicKey);

    return (
        <div>
            {isAdmin && (
                <div className="bg-gray-700/50 p-4 rounded-lg shadow-inner border border-gray-600 animate-fade-in">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold text-gray-100">{poll.options[0]}</h3>
                        <button
                            onClick={onUntrackPoll}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded-full text-sm shadow-md transition-all duration-200 ease-in-out transform hover:scale-105"
                        >
                            Untrack
                        </button>
                    </div>
                    {!poll.hasEnded && (
                        <button 
                            onClick={handleEndPoll}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full shadow-lg transition-all duration-200 ease-in-out transform hover:scale-105"
                        >
                            End Poll
                        </button>
                    )}
                    {poll.hasEnded && (
                        <p className="text-center text-gray-400 mt-2">Poll has ended.</p>
                    )}
                </div>
            )}
        </div>
    );
};
