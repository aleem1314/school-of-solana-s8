use anchor_lang::prelude::*;
use crate::state::Profile;

#[derive(Accounts)]
pub struct CreateProfile<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 32 + (4+32) + (4+280) + 8 + (4+128),
        seeds = ["profile".as_bytes(), user.key().as_ref()],
        bump,
    )]
    pub profile: Account<'info, Profile>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateProfile>, username: String, bio: String, image_cid: String) -> Result<()> {
    let profile = &mut ctx.accounts.profile;

    profile.user = ctx.accounts.user.key();
    profile.username = username;
    profile.image_cid = image_cid;
    profile.bio = bio;
    profile.post_count = 0;

    Ok(())
}
