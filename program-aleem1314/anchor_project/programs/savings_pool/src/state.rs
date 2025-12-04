use anchor_lang::prelude::*;

#[account]
pub struct Profile {
    pub user: Pubkey,
    pub username: String,
    pub bio: String,
    pub post_count: u64,
    pub image_cid: String,
}

#[account]
pub struct Post {
    pub author: Pubkey,
    pub title: String,
    pub content: String,
    pub likes: u64,
    pub created_at: i64
}
