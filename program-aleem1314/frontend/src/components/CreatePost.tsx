import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useState, useEffect, useRef } from "react";
import { getProgram } from "../solana/anchorClient";
import { profilePda, postPda } from "../solana/pdas";
import * as anchor from "@coral-xyz/anchor";
import { Link } from "react-router-dom";

export default function CreatePost() {
  const wallet = useAnchorWallet();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [isPosting, setIsPosting] = useState(false);
  const [success, setSuccess] = useState<boolean | null>(null);


  const MAX_TITLE = 80;
  const MAX_CONTENT = 280;

  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);


  useEffect(() => {
    if (!wallet) return;

    const load = async () => {
      setLoadingProfile(true);

      try {
        const program = getProgram(wallet);
        const pda = profilePda(wallet.publicKey);

        const account = program.account as unknown as any
        const fetched = await account.profile.fetchNullable(pda);

        setProfile(fetched);
        if (fetched) setProfileImage(fetched.imageCid);
      } catch (err) {
        console.error("Error loading profile:", err);
      }

      setLoadingProfile(false);
    };

    load();
  }, [wallet]);


  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
  }, [content]);

  const valid =
    title.trim() !== "" &&
    content.trim() !== "" &&
    title.length <= MAX_TITLE &&
    content.length <= MAX_CONTENT;

  const submit = async () => {
    if (!wallet || !valid) return;

    setIsPosting(true);
    setSuccess(null);
    try {

      if (!profile) {
        const program = getProgram(wallet);
        const pda = profilePda(wallet.publicKey);

        const account = program.account as unknown as any
        const fetched = await account.profile.fetchNullable(pda);

        setProfile(fetched);
      }

      const program = getProgram(wallet);

      const profileP = profilePda(wallet.publicKey);

      const postId = profile.postCount.toNumber();
      const post = postPda(wallet.publicKey, postId);

      await program.methods
        .createPost(title, content)
        .accounts({
          profile: profileP,
          post,
          user: wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();


      setSuccess(true);
      setTitle("");
      setContent("");
    } catch (err: any) {
      console.error(err);
      setSuccess(false);
    } finally {
      setIsPosting(false);

    }

  };

  // Show loading state
  if (loadingProfile) {
    return (
      <div className="text-white/70 p-6 text-center">
        Loading profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-white bg-white/10 p-6 mt-8 rounded-2xl border border-white/10 shadow-xl backdrop-blur-lg text-center space-y-4">
        <p className="text-lg font-semibold mb-6">You must create a profile before posting.</p>

        <Link to="/profile"
          className="px-6 py-2 mt-8 bg-purple-600 hover:bg-purple-700 transition-all rounded-xl font-semibold shadow-md hover:shadow-purple-500/30"

        >
          Create Profile
        </Link>
      </div>
    );
  }


  return (
    <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-lg border border-white/10 shadow-xl space-y-6">

      <div className="flex gap-4">
        <img
          src={`https://gateway.pinata.cloud/ipfs/${profileImage}` || "/default-avatar.png"}
          alt="avatar"
          className="w-12 h-12 rounded-full object-cover bg-white/10"
        />

        <div className="flex-1 space-y-4">

          <div className="space-y-1">
            <input
              className="w-full bg-transparent text-xl font-semibold text-white placeholder-white/40 border-b border-white/20 focus:border-purple-500 transition-colors p-1"
              placeholder="Post title"
              maxLength={MAX_TITLE}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="text-xs text-white/40 text-right">
              {title.length}/{MAX_TITLE}
            </div>
          </div>

          <div>
            <textarea
              ref={textareaRef}
              className="w-full bg-transparent text-white placeholder-white/40 text-lg resize-none focus:outline-none"
              placeholder="Write something..."
              maxLength={MAX_CONTENT}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="text-xs text-white/40 text-right mt-1">
              {content.length}/{MAX_CONTENT}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">

        {success === true && (
          <div className="p-3 rounded-lg bg-green-600/20 border border-green-500/30 text-green-300 text-sm">
            ✅ Post created successfully!
          </div>
        )}

        {success === false && (
          <div className="p-3 rounded-lg bg-red-600/20 border border-red-500/30 text-red-300 text-sm">
            Failed to create post. Try again.
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={submit}
          disabled={!valid || isPosting}
          className={`px-6 py-2 rounded-xl font-semibold transition-all ${valid && !isPosting
            ? "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30"
            : "bg-gray-600 cursor-not-allowed"
            }`}
        >
          {isPosting ? "Posting..." : "Post"}
        </button>

      </div>
    </div>
  );
}
