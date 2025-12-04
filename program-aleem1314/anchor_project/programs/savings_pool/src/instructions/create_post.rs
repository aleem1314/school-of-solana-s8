use anchor_lang::prelude::*;
use crate::state::{Profile, Post};

#[derive(Accounts)]
pub struct CreatePost<'info> {
    #[account(
        mut,
        seeds = ["profile".as_bytes(), user.key().as_ref()],
        bump
    )]
    pub profile: Account<'info, Profile>,

    #[account(
        init,
        payer = user,
        space = 8 + 32 + (4+80) + (4+280) + 8 + 8,
        seeds = ["post".as_bytes(), user.key().as_ref(), &profile.post_count.to_le_bytes()],
        bump
    )]
    pub post: Account<'info, Post>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreatePost>, title: String,content: String) -> Result<()> {
    let profile = &mut ctx.accounts.profile;
    let post = &mut ctx.accounts.post;

    post.author = ctx.accounts.user.key();
    post.content = content;
    post.title = title;
    post.likes = 0;
    post.created_at = Clock::get()?.unix_timestamp;

    profile.post_count += 1;

    Ok(())
}
