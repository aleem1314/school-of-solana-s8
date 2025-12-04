use anchor_lang::prelude::*;
use crate::state::Post;

#[derive(Accounts)]
#[instruction(post_id: u64)]
pub struct LikePost<'info> {
    #[account(
        mut,
        seeds = [
            b"post",
            post.author.as_ref(),
            &post_id.to_le_bytes()
        ],
        bump
    )]
    pub post: Account<'info, Post>,
}

pub fn handler(ctx: Context<LikePost>, _post_id: u64) -> Result<()> {
    let post = &mut ctx.accounts.post;
    post.likes += 1;
    Ok(())
}
