use anchor_lang::prelude::*;

declare_id!("Haw6ZfqxgWXRigGt52a6BHNtWYGRqSNi1VpETXppHLej");

#[program]
pub mod voting_dapp {
    use super::*;

    pub fn create_poll(ctx: Context<CreatePoll>, options: Vec<String>) -> Result<()> {
        let poll = &mut ctx.accounts.poll;
        poll.admin = *ctx.accounts.admin.key;
        poll.options = options;
        poll.votes = vec![0; poll.options.len()];
        poll.is_active = true;
        poll.has_ended = false;
        Ok(())
    }

    pub fn vote(ctx: Context<Vote>, option_index: u8) -> Result<()> {
        let poll = &mut ctx.accounts.poll;
        require!(!poll.has_ended, ErrorCode::PollEnded);

        let vote = &mut ctx.accounts.vote;
        vote.poll = poll.key();
        vote.voter = *ctx.accounts.voter.key;

        poll.votes[option_index as usize] += 1;
        Ok(())
    }

    pub fn end_poll(ctx: Context<EndPoll>) -> Result<()> {
        let poll = &mut ctx.accounts.poll;
        require!(poll.admin == *ctx.accounts.admin.key, ErrorCode::Unauthorized);
        poll.has_ended = true;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreatePoll<'info> {
    #[account(init, payer = admin, space = 8 + 32 + 4 + 200 + 4 + 64 + 1 + 1)]
    pub poll: Account<'info, Poll>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Vote<'info> {
    #[account(mut)]
    pub poll: Account<'info, Poll>,
    #[account(init, payer = voter, space = 8 + 32 + 32, seeds = [b"vote", poll.key().as_ref(), voter.key().as_ref()], bump)]
    pub vote: Account<'info, VoteRecord>,
    #[account(mut)]
    pub voter: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct EndPoll<'info> {
    #[account(mut)]
    pub poll: Account<'info, Poll>,
    pub admin: Signer<'info>,
}

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

#[error_code]
pub enum ErrorCode {
    #[msg("This poll is not active.")]
    PollNotActive,
    #[msg("This poll has ended.")]
    PollEnded,
    #[msg("Unauthorized.")]
    Unauthorized,
}