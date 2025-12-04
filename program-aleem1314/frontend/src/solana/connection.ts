import { Connection, PublicKey } from "@solana/web3.js";

export const RPC = "https://api.devnet.solana.com";
export const connection = new Connection(RPC, "confirmed");

export const PROGRAM_ID = new PublicKey(
  "2H6bybtLmyJnfNaz8aww51WmWg3wQi8CwxzwVq5pPktw"
);
