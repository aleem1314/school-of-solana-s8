import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { getProgram } from "../solana/anchorClient";
import { postPda, profilePda } from "../solana/pdas";
import * as anchor from "@coral-xyz/anchor";

export default function PostList() {
  const wallet = useAnchorWallet();

  const [tab, setTab] = useState<"my" | "all">("my");

  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});


  const likePost = async (author: any, postId: number) => {
    if (!wallet) return;

    try {
      const program = getProgram(wallet);
      const postKey = postPda(author, postId);

      await program.methods
        .likePost(new anchor.BN(postId))
        .accounts({ post: postKey })
        .rpc();

      const key = `${author.toBase58()}-${postId}`;
      setLikedPosts((prev) => ({ ...prev, [key]: true }));

      if (tab === "my") loadMyPosts();
      if (tab === "all") loadAllPosts();
    } catch (err) {
      console.error("Like failed:", err);
    }
  };


  const loadMyPosts = async () => {
    if (!wallet) return;

    setLoading(true);
    const program = getProgram(wallet);

    try {
      const profKey = profilePda(wallet.publicKey);
      const account = program.account as unknown as any
      const prof = await account.profile.fetchNullable(profKey);

      if (!prof) {
        setMyPosts([]);
        setLoading(false);
        return;
      }

      const count = prof.postCount.toNumber();
      const posts = [];

      for (let i = 0; i < count; i++) {
        const postKey = postPda(wallet.publicKey, i);
        const post = await account.post.fetchNullable(postKey);

        if (post) {
          posts.push({
            postId: i,
            author: wallet.publicKey,
            title: post.title,
            content: post.content,
            likes: post.likes.toNumber(),
          });
        }
      }

      setMyPosts(posts);
    } catch (err) {
      console.error(err);
      setMyPosts([]);
    }

    setLoading(false);
  };

  const loadAllPosts = async () => {
    if (!wallet) return;

    setLoading(true);
    const program = getProgram(wallet);

    try {
      const account = program.account as unknown as any
      const profiles = await account.profile.all();
      const posts = [];

      for (const p of profiles) {
        const user = p.account.user;
        const count = p.account.postCount.toNumber();

        for (let i = 0; i < count; i++) {
          const postKey = postPda(user, i);

          const post = await account.post.fetchNullable(postKey);

          if (post) {
            posts.push({
              postId: i,
              author: user,
              title: post.title,
              content: post.content,
              likes: post.likes.toNumber(),
            });
          }
        }
      }

      // newest first
      posts.sort((a, b) => b.postId - a.postId);

      setAllPosts(posts);
    } catch (err) {
      console.error(err);
      setAllPosts([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (tab === "my") loadMyPosts();
    if (tab === "all") loadAllPosts();
  }, [wallet, tab]);


  const PostCard = ({ p }: { p: any }) => (
    <div className="p-6 bg-white/10 border border-white/10 rounded-2xl backdrop-blur-lg shadow-xl">
      <h3 className="text-xl font-semibold mb-2">{p.title}</h3>

      <p className="text-lg mb-4 leading-relaxed">{p.content}</p>

      <div className="flex items-center justify-between">
        <span className="text-sm text-white/70">
          ❤️ {p.likes} Likes
        </span>

        <button
          onClick={() => likePost(p.author, p.postId)}
          className="text-xl transition-all"
        >
          {likedPosts[`${p.author.toBase58()}-${p.postId}`] ? "❤️" : "🤍"}
        </button>

      </div>

      <div className="mt-2 text-xs text-white/40">
        👤 {p.author.toBase58().slice(0, 4)}...
        {p.author.toBase58().slice(-4)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Tabs */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setTab("my")}
          className={`px-4 py-2 rounded-lg font-semibold ${tab === "my"
            ? "bg-purple-600 text-white"
            : "bg-white/10 text-white/60"
            }`}
        >
          My Posts
        </button>

        <button
          onClick={() => setTab("all")}
          className={`px-4 py-2 rounded-lg font-semibold ${tab === "all"
            ? "bg-purple-600 text-white"
            : "bg-white/10 text-white/60"
            }`}
        >
          All Posts
        </button>
      </div>

      {loading && (
        <div className="text-center text-white/60 py-6">Loading...</div>
      )}

      {!loading && tab === "my" && myPosts.length === 0 && (
        <div className="text-center text-white/60 py-6">
          You haven't posted anything yet.
        </div>
      )}

      {!loading && tab === "all" && allPosts.length === 0 && (
        <div className="text-center text-white/60 py-6">
          No posts found.
        </div>
      )}

      {!loading && (
        <div className="space-y-6">
          {(tab === "my" ? myPosts : allPosts).map((p) => (
            <PostCard key={`${p.author.toBase58()}-${p.postId}`} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}
