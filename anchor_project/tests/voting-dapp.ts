const assert = require("assert");
const anchor = require("@coral-xyz/anchor");
const { SystemProgram } = anchor.web3;

describe("voting-dapp", () => {
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);

  const program = anchor.workspace.VotingDapp;
  const admin = provider.wallet;
  const voter1 = anchor.web3.Keypair.generate();
  const voter2 = anchor.web3.Keypair.generate();

  let poll;

  it("Creates a poll", async () => {
    poll = anchor.web3.Keypair.generate();
    const options = ["Option 1", "Option 2", "Option 3"];

    await program.rpc.createPoll(options, {
      accounts: {
        poll: poll.publicKey,
        admin: admin.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [poll],
    });

    const pollAccount = await program.account.poll.fetch(poll.publicKey);
    assert.ok(pollAccount.admin.equals(admin.publicKey));
    assert.deepStrictEqual(pollAccount.options, options);
    assert.deepStrictEqual(pollAccount.votes.map(v => v.toNumber()), [0, 0, 0]);
    assert.ok(pollAccount.isActive);
    assert.ok(!pollAccount.hasEnded);
  });

  it("Allows a user to vote", async () => {
    const [votePda] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("vote"), poll.publicKey.toBuffer(), provider.wallet.publicKey.toBuffer()],
      program.programId
    );

    await program.rpc.vote(0, {
      accounts: {
        poll: poll.publicKey,
        vote: votePda,
        voter: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
    });

    const pollAccount = await program.account.poll.fetch(poll.publicKey);
    assert.deepStrictEqual(pollAccount.votes.map(v => v.toNumber()), [1, 0, 0]);
  });

  it("Prevents a user from voting twice", async () => {
    const [votePda] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("vote"), poll.publicKey.toBuffer(), provider.wallet.publicKey.toBuffer()],
      program.programId
    );

    try {
      await program.rpc.vote(1, {
        accounts: {
          poll: poll.publicKey,
          vote: votePda,
          voter: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      });
      assert.fail("Should have failed");
    } catch (err) {
      assert.ok(err);
    }
  });

  it("Ends a poll", async () => {
    await program.rpc.endPoll({
      accounts: {
        poll: poll.publicKey,
        admin: admin.publicKey,
      },
    });

    const pollAccount = await program.account.poll.fetch(poll.publicKey);
    assert.ok(pollAccount.hasEnded);
  });

  it("Prevents voting on an ended poll", async () => {
    const voter2 = anchor.web3.Keypair.generate();
    const airdropSignature = await provider.connection.requestAirdrop(voter2.publicKey, 1000000000);
    await provider.connection.confirmTransaction(airdropSignature);
    const [votePda] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("vote"), poll.publicKey.toBuffer(), voter2.publicKey.toBuffer()],
      program.programId
    );
    try {
      await program.rpc.vote(2, {
        accounts: {
          poll: poll.publicKey,
          vote: votePda,
          voter: voter2.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [voter2],
      });
      assert.fail("Should have failed");
    } catch (err) {
      assert.equal(err.error.errorCode.code, "PollEnded");
    }
  });
});