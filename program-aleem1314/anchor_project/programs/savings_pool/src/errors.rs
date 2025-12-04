use anchor_lang::prelude::*;

#[error_code]
pub enum SocialError {
    #[msg("Profile already exists.")]
    ProfileExists,
}
