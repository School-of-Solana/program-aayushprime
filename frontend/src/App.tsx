import { useState, useEffect } from 'react';
import './App.css';
import { CreatePoll } from './components/CreatePoll';
import { Poll } from './components/Poll';
import { AdminView } from './components/AdminView';
import { WalletInfo } from './components/WalletInfo';
import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import { AnchorProvider, Program, setProvider } from '@coral-xyz/anchor';
import idl from './voting_dapp.json';
import type { VotingDapp } from './voting_dapp';
import { PublicKey } from '@solana/web3.js';


type View = 'voter' | 'admin';
type Network = 'mainnet-beta' | 'devnet' | 'testnet' | 'localnet';

function App() {
  const [view, setView] = useState<View>('voter');
  const [network, setNetwork] = useState<Network>(() => {
    const savedNetwork = localStorage.getItem('solana-voting-app-network');
    return (savedNetwork as Network) || 'devnet';
  });
  const [polls, setPolls] = useState<any[]>([]);
  const [trackedPolls, setTrackedPolls] = useState<string[]>(() => {
    const savedTrackedPolls = localStorage.getItem('solana-voting-app-tracked-polls');
    return savedTrackedPolls ? JSON.parse(savedTrackedPolls) : [];
  });
  const [pollAddressInput, setPollAddressInput] = useState<string>('');
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const [program, setProgram] = useState<Program | null>(null);

  useEffect(() => {
    if (!wallet) {
      return;
    }

    const provider = new AnchorProvider(connection, wallet, {
      commitment: 'confirmed',
    });
    setProvider(provider);
    const programInstance = new Program(idl as VotingDapp, provider);

    setProgram(programInstance);
  }, [connection, wallet]);

  useEffect(() => {
    const fetchPolls = async () => {
      if (program) {
        const pollAccounts = await (program.account as any).poll.all();
        setPolls(pollAccounts);
      }
    };
    fetchPolls();
  }, [program]);

  useEffect(() => {
    localStorage.setItem('solana-voting-app-tracked-polls', JSON.stringify(trackedPolls));
  }, [trackedPolls]);

  const handleCreatePoll = (pollPublicKey: string) => {
    const fetchPolls = async () => {
      if (program) {
        const pollAccounts = await (program.account as any).poll.all();
        setPolls(pollAccounts);
        setTrackedPolls([...trackedPolls, pollPublicKey]);
      }
    };
    fetchPolls();
    setView('voter');
  };

  const handleAddTrackedPoll = () => {
    if (pollAddressInput) {
      try {
        new PublicKey(pollAddressInput);
        setTrackedPolls([...trackedPolls, pollAddressInput]);
        setPollAddressInput('');
      } catch (error) {
        alert('Invalid poll address!');
      }
    }
  };

  const handleUntrackPoll = (pollPublicKey: string) => {
    setTrackedPolls(trackedPolls.filter(p => p !== pollPublicKey));
  };

  const displayedPolls = polls.filter(poll => trackedPolls.includes(poll.publicKey.toString()));

  return (
    <div className="bg-gray-800 min-h-screen text-white font-sans">
      <header className="bg-gray-800/50 backdrop-blur-sm p-4 shadow-lg">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-extrabold text-white">Solana Voting App</h1>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value as Network)}
              className="bg-gray-700/70 border border-gray-600 rounded-full p-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ease-in-out"
            >
              <option value="mainnet-beta">Mainnet Beta</option>
              <option value="devnet">Devnet</option>
              <option value="testnet">Testnet</option>
              <option value="localnet">Localnet</option>
            </select>
            <div className="bg-gray-700/70 rounded-full p-1 flex gap-1 shadow-inner">
              <button
                onClick={() => setView('voter')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-in-out ${view === 'voter' ? 'bg-blue-600 shadow-md' : 'bg-transparent hover:bg-gray-600/50'}`}
              >
                Voter
              </button>
              <button
                onClick={() => setView('admin')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-in-out ${view === 'admin' ? 'bg-blue-600 shadow-md' : 'bg-transparent hover:bg-gray-600/50'}`}
              >
                Admin
              </button>
            </div>
            <WalletInfo />
          </div>
        </div>
      </header>
      <main className="container mx-auto p-6 lg:p-8">
        <div className="mb-8 flex flex-col sm:flex-row items-center gap-4 bg-gray-800/50 p-4 rounded-lg shadow-inner">
          <input
            type="text"
            value={pollAddressInput}
            onChange={(e) => setPollAddressInput(e.target.value)}
            placeholder="Enter poll address to track (e.g., 5x...)"
            className="flex-grow bg-gray-700 border border-gray-600 rounded-full py-2 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ease-in-out"
          />
          <button
            onClick={handleAddTrackedPoll}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all duration-200 ease-in-out transform hover:scale-105"
          >
            Track Poll
          </button>
        </div>
        {view === 'admin' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-800/50 p-6 rounded-lg shadow-xl">
              <CreatePoll onCreatePoll={handleCreatePoll} program={program!} />
            </div>
            <div className="bg-gray-800/50 p-6 rounded-lg shadow-xl">
              <h2 className="text-2xl font-bold mb-6 text-white">Manage Tracked Polls</h2>
              <div className="space-y-4">
                {displayedPolls.length > 0 ? (
                  displayedPolls.map((poll) => (
                    <AdminView
                      program={program}
                      key={poll.publicKey.toString()}
                      pollAddress={poll.publicKey}
                      onUntrackPoll={() => handleUntrackPoll(poll.publicKey.toString())}
                    />
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-8">No tracked polls to manage. Create one or track an existing one!</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-white">Active Polls</h2>
            <div className="space-y-4">
              {displayedPolls.length > 0 ? (
                displayedPolls.map((poll) => (
                  <Poll
                    program={program}
                    key={poll.publicKey.toString()}
                    pollAddress={poll.publicKey}
                    onUntrackPoll={() => handleUntrackPoll(poll.publicKey.toString())}
                  />
                ))
              ) : (
                <p className="text-gray-400 text-center py-8">No active polls. Track one or create one in the admin view.</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
