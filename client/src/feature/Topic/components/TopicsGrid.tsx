import { useMemo } from "react";
import { useAppSelector } from "../../../store/hooks";
import TopicCard from "./TopicCard";
import ErrorBoundary from "../../core/components/ErrorBoundary";

export default function TopicsGrid() {
  const { topics, loading, searchQuery, sortBy } = useAppSelector((state) => state.topics);

  // Client-side sorting only (search is handled by server)
  const sortedTopics = useMemo(() => {
    let sorted = [...topics];

    // Apply sorting (client-side)
    if (sortBy === "name") {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "latest") {
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return sorted;
  }, [topics, sortBy]);

  if (loading) return <p>Loading topics...</p>;

  if (sortedTopics.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          {searchQuery ? "No topics found matching your search." : "No topics yet in this space."}
        </p>
        <p className="text-gray-400 text-sm mt-2">
          {!searchQuery && "Be the first to create one!"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {sortedTopics.map((topic) => (
        <ErrorBoundary key={topic._id} level="component">
          <TopicCard topic={topic} />
        </ErrorBoundary>
      ))}
    </div>
  );
}
