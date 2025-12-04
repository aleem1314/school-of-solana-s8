# Project Description

**Deployed Frontend URL:** https://pulse-chi-orpin.vercel.app/

**Solana Program ID:** 

```
2H6bybtLmyJnfNaz8aww51WmWg3wQi8CwxzwVq5pPktw
```

## Project Overview

### Description

**Pulse** is a simple and beginner-friendly decentralized social app built on Solana.
It allows users to create a profile, post messages, and interact with content by liking posts - all stored directly on the blockchain. Instead of relying on traditional servers, every post and profile lives on-chain, giving users full ownership of their data.

The goal of **Pulse** is to demonstrate how everyday social features can be built using Solana's fast, low-cost infrastructure while keeping the interface clean, intuitive, and easy for anyone to use.

### Key Features

- **User Profiles:**

  Each user can create an on-chain profile with a username, bio, and IPFS-stored avatar.

- **Create Posts:**

  Users can publish posts up to 280 characters, stored using PDAs.

- **Like Posts:**

  Any post can be liked on-chain, likes are updated in real time.

- **My Posts / All Posts Tabs:**

  Users can switch between their own posts and a global feed of all posts created by all users.

- **IPFS Image Uploads:**

  Profile images are uploaded to Pinata/IPFS for decentralized storage.
  
### How to Use the Pulse

**1. Connect Your Wallet**

- Click the wallet connection button in the top-right.

**2. Create Your Profile**
- Upload an image
- Enter a username
- Add a short bio
- Your profile is saved on-chain.

**3. Create a Post**
- Enter a title and content
- Publish your message to the Solana blockchain
- It appears instantly in your "My Posts" tab.

**4. Browse Posts**
- Switch to the "All Posts" tab to see posts from every user
- Like posts with a simple heart icon

## Program Architecture

Pulse uses a simple and clean Solana program built with Anchor.

**Main Instructions**
- **create_profile:** Creates a user profile PDA.
- **create_post:** Creates a new post under the user.
- **like_post:** Increases the like counter on an existing post.

**Account Structures**

- **Profile:**
 Stores user public key, username, bio, image CID, and post count.
- **Post:**
Stores the post author, title, content, likes, and timestamp.

### PDA Usage

Pulse uses PDAs to ensure each user and post has a unique, deterministic address.

**PDAs Used:**

**1. Profile PDA**

  **Seeds:** `["profile", user_pubkey]`

  **Purpose:** Stores each user's Profile account. Every wallet has exactly one.

**2. Post PDA**

  **Seeds:** `["post", user_pubkey, post_index]`

  **Purpose:** Stores posts created by a user. The `post_index` comes from the user's profile.

### Program Instructions

- 1. `create_profile(username, bio, image_cid)`
 
      Creates a profile account for the user.

- 2. `create_post(title, content)`

      Creates and stores a new post.
Increments the user's internal post counter.

- 3. `like_post(post_id)`

      Increments the like counter in the Post account.

### Account Structure

Pulse uses two primary on-chain account types: **Profile** and **Post**.

Each account is created using deterministic PDAs and serves a specific purpose in the social system.

- **1. Profile Account**

The Profile account acts as each user's on-chain identity within Pulse. Every wallet can create exactly one Profile account.
This ensures a deterministic, predictable place to store user information.

``` rust
#[account]
pub struct Profile {
    pub user: Pubkey,        // Owner of the profile
    pub username: String,    // Display username
    pub bio: String,         // Short biography
    pub post_count: u64,     // Number of posts created by this user
    pub image_cid: String,   // IPFS CID for profile picture
}
```

- **2.Post Account**
The Post account represents a single, complete social post stored on-chain. Each post is derived from a PDA using the user's profile and post index.

``` rust
#[account]
pub struct Post {
    pub author: Pubkey,      // Wallet that created the post
    pub title: String,       // Post title
    pub content: String,     // Post message content
    pub likes: u64,          // Number of likes the post received
    pub created_at: i64,     // Unix timestamp when the post was created
}
```

## Testing

### Test Coverage
The testing strategy for Pulse focuses on verifying the complete flow of user actions and ensuring the Solana program behaves correctly in both expected and error scenarios.

**Happy Path Tests:**
- Creating a profile
- Creating multiple posts
- Liking posts
- PDA derivation for profile and posts
- Fetching profile and posts from the program

**Unhappy Path Tests:**

- Preventing profile creation if one already exists
- Liking non-existent posts
- Handling invalid PDAs
- Missing accounts during instruction calls

### Running Tests
```bash
anchor test
```

### Additional Notes for Evaluators

Pulse is intentionally simple and beginner-friendly. This project acts as a clear, easy introduction to building real Solana dApps.

  Note: **Pulse** is a learning project and proof-of-concept - not intended for production use.