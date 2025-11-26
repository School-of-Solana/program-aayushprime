import { useState } from 'react';
import type { FC } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Program, getProvider } from '@coral-xyz/anchor';
import { Keypair, SystemProgram } from '@solana/web3.js';

interface CreatePollProps {
    onCreatePoll: (pollPublicKey: string) => void;
    program: Program;
}

export const CreatePoll: FC<CreatePollProps> = ({ onCreatePoll, program }) => {
    const [topic, setTopic] = useState('');
    const [options, setOptions] = useState('');
    const { publicKey, wallet } = useWallet();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!publicKey || !wallet) {
            alert('Please connect your wallet!');
            return;
        }

        const allOptions = [topic, ...options.split(',').map(opt => opt.trim()).filter(opt => opt.length > 0)];
        if (allOptions.length < 2) {
            alert('Please provide at least a topic and one option.');
            return;
        }


        const pollKeypair = Keypair.generate();
        try {
            console.log("options", allOptions)
            const transaction = await program.rpc.createPoll(allOptions, {
                accounts: {
                    poll: pollKeypair.publicKey,
                    admin: publicKey,
                    systemProgram: SystemProgram.programId,
                },
                signers: [pollKeypair],
            });
            console.log("Creating poll with transaction:", pollKeypair.publicKey.toBase58(), transaction);

            onCreatePoll(pollKeypair.publicKey.toBase58());
            setTopic('');
            setOptions('');
        } catch (error) {
            console.error('Error creating poll:', error);
            alert('Error creating poll. See console for details.');
        }
    };

    return (
        <div className="p-6 rounded-lg shadow-lg border border-gray-700 bg-gray-800/60">
            <h2 className="text-2xl font-bold mb-6 text-center text-white">Create a New Poll</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="topic" className="block text-sm font-medium text-gray-300 mb-1">Poll Topic</label>
                    <input
                        type="text"
                        id="topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="mt-1 block w-full bg-gray-700/70 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out"
                        placeholder="e.g., Favorite programming language?"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="options" className="block text-sm font-medium text-gray-300 mb-1">Options (comma-separated)</label>
                    <input
                        type="text"
                        id="options"
                        value={options}
                        onChange={(e) => setOptions(e.target.value)}
                        className="mt-1 block w-full bg-gray-700/70 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out"
                        placeholder="e.g., TypeScript, Python, Rust"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-lg transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
                >
                    Create Poll
                </button>
            </form>
        </div>
    );
};
