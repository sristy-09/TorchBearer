import { useState } from "react";
import { useAppDispatch } from "../../../store/hooks";
import { likePost } from "../../../store/Slice/postsSlice";
import type { Post } from "../types/post";
import { Heart, MessageCircle, Calendar } from "lucide-react";
import { Button } from "../../core/components/ui/button";

interface Props {
  post: Post;
}

export default function PostCard({ post }: Props) {
  const dispatch = useAppDispatch();
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    setIsLiking(true);
    try {
      await dispatch(likePost(post._id)).unwrap();
    } catch (error) {
      console.error("Failed to like post:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm p-6 hover:shadow-md transition">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {post.title}
          </h3>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="font-medium text-gray-700">
              {post.author.name}
            </span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
              {post.author.role}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {formatDate(post.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      {post.description && (
        <p className="text-gray-600 mb-3 text-sm italic">
          {post.description}
        </p>
      )}

      {/* Content */}
      <div className="text-gray-700 mb-4 leading-relaxed">
        {post.content}
      </div>

      {/* Image */}
      {post.image && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-auto max-h-96 object-cover"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-4 border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={isLiking}
          className="flex items-center gap-2 text-gray-600 hover:text-red-500"
        >
          <Heart size={18} className={post.likes.length > 0 ? "fill-red-500 text-red-500" : ""} />
          <span>{post.likes.length}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-gray-600 hover:text-blue-500"
        >
          <MessageCircle size={18} />
          <span>Comment</span>
        </Button>
      </div>
    </div>
  );
}
