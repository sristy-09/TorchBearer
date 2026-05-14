import { useMemo } from "react";
import { useAppSelector } from "../../../store/hooks";
import PostCard from "./PostCard";
import ErrorBoundary from "../../core/components/ErrorBoundary";

export default function PostsList() {
  const { posts, loading, searchQuery, sortBy } = useAppSelector((state) => state.posts);

  // Client-side sorting only (search is handled by server)
  const sortedPosts = useMemo(() => {
    let sorted = [...posts];

    // Apply sorting (client-side)
    if (sortBy === "popular") {
      sorted.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
    } else if (sortBy === "latest") {
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return sorted;
  }, [posts, sortBy]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading posts...</p>
      </div>
    );
  }

  if (sortedPosts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          {searchQuery ? "No posts found matching your search." : "No posts yet in this topic."}
        </p>
        <p className="text-gray-400 text-sm mt-2">
          {!searchQuery && "Be the first to create one!"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedPosts.map((post) => (
        <ErrorBoundary key={post._id} level="component">
          <PostCard post={post} />
        </ErrorBoundary>
      ))}
    </div>
  );
}
