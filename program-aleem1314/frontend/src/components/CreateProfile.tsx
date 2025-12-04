import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { getProgram } from "../solana/anchorClient";
import { profilePda } from "../solana/pdas";
import * as anchor from "@coral-xyz/anchor";
import { uploadToPinata } from "../solana/pinata";

export default function CreateProfile() {
  const wallet = useAnchorWallet();
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);


  const valid = username.trim() !== "" && file !== null;

  const handleFile = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    if (!wallet) return alert("Connect wallet first");
    if (!valid) return alert("All fields required");

    setLoading(true);

    try {
      const imageUrl = await uploadToPinata(file!);
      const pda = profilePda(wallet.publicKey);

      const program = getProgram(wallet);
      await program.methods
        .createProfile(username, bio, imageUrl)
        .accounts({
          profile: pda,
          user: wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      alert("Profile created!");
    } catch (err: any) {
      console.error(err);
      alert("Failed: " + err.message);
    }

    setLoading(false);
  };


  useEffect(() => {
    if (!wallet) return;

    const run = async () => {
      setLoadingProfile(true);

      try {
        const pda = profilePda(wallet.publicKey);
        const program = getProgram(wallet);

        const account = program.account as unknown as any
        const fetched = await account.profile.fetchNullable(pda);

        setProfile(fetched);
      } catch (err) {
        console.error("Error loading profile:", err);
      }

      setLoadingProfile(false);
    };

    run();
  }, [wallet]);

  if (loadingProfile) {
    return (
      <div className="p-8 text-center text-white/70">
        Loading profile...
      </div>
    );
  }

  if (profile) {
    return (
      <div className="rounded-2xl bg-white/10 backdrop-blur-lg p-8 border border-white/10 shadow-2xl space-y-6 text-white">

        <h2 className="text-2xl font-bold">Your Profile</h2>

        <div className="flex flex-col items-center space-y-4">
          <div className="w-32 h-32 rounded-full overflow-hidden border border-white/20 shadow-lg">
            <img
              src={`https://gateway.pinata.cloud/ipfs/${profile.imageCid}`}
              className="w-full h-full object-cover"
            />
          </div>

          <h3 className="text-xl font-semibold">{profile.username}</h3>
          <p className="text-white/60">{profile.bio}</p>

          <p className="text-sm text-white/40">
            Total Posts: {profile.postCount.toNumber()}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white/10 backdrop-blur-lg p-8 border border-white/10 shadow-2xl space-y-6">

      <h2 className="text-2xl font-bold">Create Your Profile</h2>

      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="w-32 h-32 rounded-full bg-white/10 border border-white/20 overflow-hidden shadow-lg">
          {preview ? (
            <img
              src={preview}
              className="w-full h-full object-cover"
              alt="Preview"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/40 text-sm">
              No image
            </div>
          )}
        </div>
        <label className="px-4 py-2 cursor-pointer bg-purple-600 hover:bg-purple-700 rounded-xl font-medium transition-all shadow-md hover:shadow-purple-500/30">
          Select Image
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />
        </label>
      </div>

      <div className="space-y-1">
        <label className="text-sm text-white/70">Username *</label>
        <input
          className="w-full p-3 rounded-xl bg-white/5 border border-white/10 placeholder-white/40 focus:ring-2 focus:ring-purple-500"
          placeholder="Enter your username"
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm text-white/70">Bio</label>
        <textarea
          rows={3}
          required
          className="w-full p-3 rounded-xl bg-white/5 border border-white/10 placeholder-white/40 focus:ring-2 focus:ring-purple-500"
          placeholder="Tell something about yourself..."
          onChange={(e) => setBio(e.target.value)}
        />
      </div>

      <button
        onClick={submit}
        disabled={!valid || loading}
        className={`w-full py-3 rounded-xl font-semibold transition-all ${!valid
          ? "bg-gray-600 cursor-not-allowed"
          : "bg-purple-600 hover:bg-purple-700 shadow-lg hover:shadow-purple-500/30"
          }`}
      >
        {loading ? "Uploading..." : "Create Profile"}
      </button>
    </div>
  );
}
