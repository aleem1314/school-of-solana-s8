import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { PROGRAM_ID } from "./connection";

export const profilePda = (user: PublicKey) =>
  PublicKey.findProgramAddressSync(
    [Buffer.from("profile"), user.toBuffer()],
    PROGRAM_ID
  )[0];

export const postPda = (user: PublicKey, postId: number) =>
  PublicKey.findProgramAddressSync(
    [
      Buffer.from("post"),
      user.toBuffer(),
      new BN(postId).toArrayLike(Buffer, "le", 8),
    ],
    PROGRAM_ID
  )[0];
