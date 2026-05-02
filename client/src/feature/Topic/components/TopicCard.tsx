import { useNavigate } from "react-router";
import type { Topic } from "../types/topic";

interface Props {
  topic: Topic;
}

export default function TopicCard({ topic }: Props) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/space/${topic.space._id}/topic/${topic._id}/posts`);
  };

  return (
    <div
      onClick={handleClick}
      className="rounded-2xl border p-5 bg-white shadow-sm hover:shadow-md transition cursor-pointer"
    >
      <h2 className="font-bold text-xl">
        {topic.title}
      </h2>

      <p className="text-gray-500 mt-2 line-clamp-3">
        {topic.description}
      </p>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-gray-400">
          by {topic.createdBy?.name}
        </span>

        {topic.posts && topic.posts.length > 0 && (
          <span className="text-blue-500 font-medium">
            {topic.posts.length} {topic.posts.length === 1 ? 'post' : 'posts'}
          </span>
        )}
      </div>
    </div>
  );
}
