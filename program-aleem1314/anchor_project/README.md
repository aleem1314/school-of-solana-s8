# Pulse App

A simple decentralized social application built on Solana using the Anchor framework.
Users can create profiles, create posts, and store their content on-chain using Solana PDAs.

## Features

### Profiles

- Create a profile with:
    - Username
    - Bio
    - Profile Image (uploaded to Pinata → IPFS)

- Profile stored in a PDA: `profile = seeds["profile", user_pubkey]`

### Posts

- Users can create posts with:
    - Title
    - Content
    - Timestamp
    - Likes count (default: 0)

- Each post stored at  `post = seeds["post", user_pubkey, post_id]`

## State

- Profile account
    - Post account
    - Auto-incremented post counter per user

## Security

- Only the owner can create posts for their profile
    - PDA seeds prevent collisions
    - Data stored immutably on-chain

## Development

###  Install dependencies

``` sh
anchor build
yarn install
```

### Run local validator (localnet)

``` sh
anchor test
```

## Deploying

### Build the program

``` sh
anchor build
```

### Update Program ID

Find the program ID:

``` sh
solana address -k target/deploy/social_app-keypair.json
```

Update it inside:

`Anchor.toml`

``` toml
[programs.devnet]
social_app = "<PROGRAM_ID>"
```

`programs/social_app/src/lib.rs`

``` rust
declare_id!("<PROGRAM_ID>");
```

## Deploy to Devnet

``` sh
anchor deploy
```