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
      className="group border border-gray-200 rounded-lg p-6 bg-white hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
    >
      <h2 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
        {topic.title}
      </h2>

      <p className="text-gray-600 mt-2 text-sm line-clamp-2 leading-relaxed">
        {topic.description}
      </p>

      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
        <span className="text-gray-500">
          by {topic.createdBy?.name}
        </span>

        {topic.posts && topic.posts.length > 0 && (
          <span className="text-gray-700 font-medium">
            {topic.posts.length} {topic.posts.length === 1 ? 'post' : 'posts'}
          </span>
        )}
      </div>
    </div>
  );
}
