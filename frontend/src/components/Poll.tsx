import { useEffect, useState } from 'react';
import type { FC } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as anchor from '@coral-xyz/anchor';
import { SystemProgram, PublicKey } from '@solana/web3.js';

interface PollProps {
    pollAddress: PublicKey;
    program: anchor.Program | null;
    onUntrackPoll: () => void;
}

export const Poll: FC<PollProps> = ({ pollAddress, program, onUntrackPoll }) => {
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

  const handleVote = async (optionIndex: number) => {
    if (!publicKey || !program) {
      alert('Please connect your wallet and ensure the program is loaded!');
      return;
    }

        try {
            const [votePda] = await PublicKey.findProgramAddress(
                [
                    anchor.utils.bytes.utf8.encode('vote'),
                    pollAddress.toBuffer(),
                    publicKey.toBuffer(),
                ],
                program.programId
            );

            const transaction = await program.methods
                .vote(optionIndex)
                .accounts({
                    poll: pollAddress,
                    vote: votePda,
                    voter: publicKey,
                    systemProgram: SystemProgram.programId,
                })
                .transaction();

            const signature = await sendTransaction(transaction, connection);
            await connection.confirmTransaction(signature, 'processed');
            const pollAccount = await (program.account as any).poll.fetch(pollAddress);
            setPoll(pollAccount);

        } catch (error) {
            console.error('Error voting:', error);
            alert('Error voting. See console for details.');
        }
    };

    if (!poll) {
        return <div>Loading poll...</div>;
    }

    return (
        <div className="bg-gray-800/60 p-6 rounded-lg shadow-xl border border-gray-700 animate-fade-in">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-white">{poll.options[0]}</h3>
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${poll.hasEnded ? 'bg-red-600' : 'bg-green-600'} shadow-md`}>
                        {poll.hasEnded ? 'Ended' : 'Active'}
                    </span>
                    <button
                        onClick={onUntrackPoll}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded-full text-sm shadow-md transition-all duration-200 ease-in-out transform hover:scale-105"
                    >
                        Untrack
                    </button>
                </div>
            </div>
            <ul className="space-y-3">
                {poll.options.slice(1).map((option: string, index: number) => (
                    <li key={index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-700/50 p-4 rounded-lg shadow-inner border border-gray-600">
                        <span className="text-lg font-medium text-gray-200 mb-2 sm:mb-0">{option}</span>
                        <div className="flex items-center gap-4">
                            <span className="text-blue-300 font-bold">Votes: {poll.votes[index + 1].toString()}</span>
                            {!poll.hasEnded && (
                                <button 
                                    onClick={() => handleVote(index + 1)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full text-sm shadow-md transition-all duration-200 ease-in-out transform hover:scale-105"
                                >
                                    Vote
                                </button>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

