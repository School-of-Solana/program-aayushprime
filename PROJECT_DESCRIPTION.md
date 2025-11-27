# Project Description

**Deployed Frontend URL:** https://school-of-solana-task-xwu9.vercel.app/

**Solana Program ID:** Haw6ZfqxgWXRigGt52a6BHNtWYGRqSNi1VpETXppHLej

## Project Overview

### Description
This project is a decentralized voting application (dApp) built on the Solana blockchain. It allows users to create polls, vote on them, and view the results in real-time. The dApp provides a transparent and tamper-proof voting system, where all data is stored on-chain.

### Key Features
- **Create Polls:** Users can create new polls with a topic and multiple options.
- **Vote on Polls:** Authenticated users can cast their vote for one of the options in a poll.
- **End Polls:** The creator of the poll (admin) has the authority to end the poll, which prevents any further votes from being cast.
- **Real-time Results:** Poll results are updated in real-time as users vote.

### How to Use the dApp
1. **Connect Wallet:** Connect your Solana wallet (e.g., Phantom) to the dApp.
2. **Create a Poll:**
   - Navigate to the "Create Poll" section.
   - Enter a topic for the poll and a comma-separated list of options.
   - Click "Create Poll" and approve the transaction in your wallet.
3. **Vote on a Poll:**
   - Once a poll is created, it will be displayed on the main page.
   - Click the "Vote" button next to your desired option and approve the transaction.
4. **End a Poll:**
   - If you are the creator of a poll, you will see an "End Poll" button.
   - Click this button to close the poll to new votes.

## Program Architecture
The Solana program for this dApp is built using the Anchor framework. It defines the on-chain logic for creating polls, voting, and ending polls.

### PDA Usage
Program Derived Addresses (PDAs) are used to ensure that each user can only vote once per poll.

**PDAs Used:**
- **VoteRecord PDA:** This PDA is created for each vote, with the seeds `b"vote"`, the poll's public key, and the voter's public key. This ensures that a user cannot create more than one `VoteRecord` account for the same poll, thus preventing them from voting multiple times.

### Program Instructions
**Instructions Implemented:**
- `create_poll`: Initializes a new poll account, setting the poll's topic, options, and the creator as the admin.
- `vote`: Allows a user to cast a vote on a specific poll. It creates a `VoteRecord` PDA to prevent double-voting.
- `end_poll`: Can only be called by the poll's admin to mark the poll as ended.

### Account Structure
```rust
#[account]
pub struct Poll {
    pub admin: Pubkey,
    pub options: Vec<String>,
    pub votes: Vec<u64>,
    pub is_active: bool,
    pub has_ended: bool,
}

#[account]
pub struct VoteRecord {
    pub poll: Pubkey,
    pub voter: Pubkey,
}
```

## Testing

### Test Coverage
The tests for this program are located in `tests/voting-dapp.ts`.

**Happy Path Tests:**
- **Create a poll:** Tests that a new poll can be created successfully.
- **Vote on a poll:** Tests that a user can vote on a poll.
- **End a poll:** Tests that the admin can end a poll.

**Unhappy Path Tests:**
- **Unauthorized end poll:** Tests that a non-admin user cannot end a poll.
- **Vote on ended poll:** Tests that a user cannot vote on a poll that has ended.
- **Double voting:** Tests that a user cannot vote twice on the same poll.

### Running Tests
```bash
# Commands to run your tests
anchor test
```
