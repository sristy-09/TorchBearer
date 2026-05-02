import { useAppSelector } from "../../../store/hooks";
import PostCard from "./PostCard";

export default function PostsList() {
  const { posts, loading } = useAppSelector((state) => state.posts);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading posts...</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No posts yet in this topic.</p>
        <p className="text-gray-400 text-sm mt-2">Be the first to create one!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  );
}
