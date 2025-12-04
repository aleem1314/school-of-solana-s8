import { AnchorProvider, Program } from "@coral-xyz/anchor";
import idl from ".//pulse_app.json";
import type { PulseApp } from "./pulse_app";
import { clusterApiUrl, Connection } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

export const program = new Program(idl as PulseApp, {
  connection,
});

export const getProgram = (wallet: any) => {
  const provider = new AnchorProvider(connection, wallet, {
    preflightCommitment: "confirmed",
  });

  return new Program(idl as PulseApp, provider);
};