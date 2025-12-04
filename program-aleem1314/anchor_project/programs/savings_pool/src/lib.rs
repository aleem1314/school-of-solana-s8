use anchor_lang::prelude::*;

pub mod errors;
pub mod state;
pub mod instructions;

use instructions::*;

declare_id!("2H6bybtLmyJnfNaz8aww51WmWg3wQi8CwxzwVq5pPktw");

#[program]
pub mod pulse_app {
    use super::*;

    pub fn create_profile(ctx: Context<CreateProfile>, username: String, bio: String, image_cid: String) -> Result<()> {
        create_profile::handler(ctx, username, bio, image_cid)
    }

    pub fn create_post(ctx: Context<CreatePost>,title:String, content: String) -> Result<()> {
        create_post::handler(ctx, title, content)
    }

    pub fn like_post(ctx: Context<LikePost>, post_id: u64) -> Result<()> {
        like_post::handler(ctx, post_id)
    }
}
