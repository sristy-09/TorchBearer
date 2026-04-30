import { useAppSelector } from "../../../store/hooks";
import TopicCard from "./TopicCard";

export default function TopicsGrid() {
  const { topics, loading } = useAppSelector((state) => state.topics);

  if (loading) return <p>Loading topics...</p>;

  if (topics.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No topics yet in this space.</p>
        <p className="text-gray-400 text-sm mt-2">Be the first to create one!</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {topics.map((topic) => (
        <TopicCard key={topic._id} topic={topic} />
      ))}
    </div>
  );
}
