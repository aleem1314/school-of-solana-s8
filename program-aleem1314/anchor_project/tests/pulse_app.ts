import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PulseApp } from "../target/types/pulse_app";
import { assert } from "chai";

describe("pulse-app", () => {
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);

  const program = anchor.workspace.SocialApp as Program<PulseApp>;

  const userA = anchor.web3.Keypair.generate();
  const userB = anchor.web3.Keypair.generate();

  async function airdrop(pubkey: anchor.web3.PublicKey) {
    const sig = await provider.connection.requestAirdrop(pubkey, 1e9);
    await provider.connection.confirmTransaction(sig, "confirmed");
  }

  const profilePda = (user: anchor.web3.PublicKey) => {
    return anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("profile"), user.toBuffer()],
      program.programId
    )[0];
  };

  const postPda = (user: anchor.web3.PublicKey, postId: number) => {
    return anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("post"),
        user.toBuffer(),
        new anchor.BN(postId).toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    )[0];
  };

  before(async () => {
    await airdrop(userA.publicKey);
    await airdrop(userB.publicKey);
  });

  // CREATE PROFILE
  it("Create profile for userA", async () => {
    const pda = profilePda(userA.publicKey);

    await program.methods
      .createProfile("alice", "I am Alice", "cid")
      .accounts({
        profile: pda,
        user: userA.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([userA])
      .rpc();

    const profile = await program.account.profile.fetch(pda);

    assert.equal(profile.user.toString(), userA.publicKey.toString());
    assert.equal(profile.username, "alice");
    assert.equal(profile.bio, "I am Alice");
    assert.equal(profile.postCount.toNumber(), 0);
  });

  it("Create profile for userB", async () => {
    const pda = profilePda(userB.publicKey);

    await program.methods
      .createProfile("bob", "I am Bob", "cid")
      .accounts({
        profile: pda,
        user: userB.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([userB])
      .rpc();

    const profile = await program.account.profile.fetch(pda);

    assert.equal(profile.user.toString(), userB.publicKey.toString());
    assert.equal(profile.username, "bob");
    assert.equal(profile.bio, "I am Bob");
  });

  // CREATE POST
  it("UserA creates a post", async () => {
    const profile = profilePda(userA.publicKey);
    const postId = 0;
    const post = postPda(userA.publicKey, postId);

    await program.methods
      .createPost("Post title", "Hello world!")
      .accounts({
        profile: profile,
        post: post,
        user: userA.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([userA])
      .rpc();

    const stored = await program.account.post.fetch(post);
    const updatedProfile = await program.account.profile.fetch(profile);

    assert.equal(stored.author.toString(), userA.publicKey.toString());
    assert.equal(stored.content, "Hello world!");
    assert.equal(stored.likes.toNumber(), 0);
    assert.equal(updatedProfile.postCount.toNumber(), 1);
  });

  it("UserA creates another post", async () => {
    const profile = profilePda(userA.publicKey);
    const postId = 1;
    const post = postPda(userA.publicKey, postId);

    await program.methods
      .createPost("Post title","Second post!")
      .accounts({
        profile: profile,
        post: post,
        user: userA.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([userA])
      .rpc();

    const stored = await program.account.post.fetch(post);
    const updatedProfile = await program.account.profile.fetch(profile);

    assert.equal(stored.content, "Second post!");
    assert.equal(updatedProfile.postCount.toNumber(), 2);
  });

  // LIKE POST
  it("UserB likes UserA's post (postId = 0)", async () => {
    const postId = 0;
    const post = postPda(userA.publicKey, postId);

    const before = await program.account.post.fetch(post);

    await program.methods
      .likePost(new anchor.BN(postId))
      .accounts({
        post: post,
      })
      .rpc();

    const after = await program.account.post.fetch(post);

    assert.equal(after.likes.toNumber(), before.likes.toNumber() + 1);
  });

  it("UserA likes their own post (postId = 1)", async () => {
    const postId = 1;
    const post = postPda(userA.publicKey, postId);

    const before = await program.account.post.fetch(post);

    await program.methods
      .likePost(new anchor.BN(postId))
      .accounts({
        post: post,
      })
      .rpc();

    const after = await program.account.post.fetch(post);

    assert.equal(after.likes.toNumber(), before.likes.toNumber() + 1);
  });

  // FAILURE CASES
  it("Cannot like non-existent post", async () => {
    const fakePost = postPda(userA.publicKey, 99);

    try {
      await program.methods
        .likePost(new anchor.BN(99))
        .accounts({
          post: fakePost,
        })
        .rpc();
      assert.fail("Should have failed");
    } catch (err) {
      assert.include(err.toString(), "AccountNotInitialized");
    }
  });

  it("Cannot create profile twice", async () => {
    const pda = profilePda(userA.publicKey);

    try {
      await program.methods
        .createProfile("duplicate", "fail","cid")
        .accounts({
          profile: pda,
          user: userA.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([userA])
        .rpc();

      assert.fail("Should fail");
    } catch (err) {
      assert.include(err.toString(), "already in use");
    }
  });
});
