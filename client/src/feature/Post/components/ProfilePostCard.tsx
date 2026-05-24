import { useState } from "react";
import { useNavigate } from "react-router";
import { useAppSelector } from "../../../store/hooks";
import type { Post } from "../types/post";
import { Avatar } from "../../core/components/ui/avatar";
import { Calendar, Lock } from "lucide-react";
import { linkifyText } from "../utils/linkify";
import { apiClient } from "../../../store/Slice/authSlice";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../core/components/ui/alert-dialog";

interface Props {
  post: Post;
}

export default function ProfilePostCard({ post }: Props) {
  const navigate = useNavigate();
  const currentUser = useAppSelector((state) => state.auth.user);
  const [spaceAccessDialogOpen, setSpaceAccessDialogOpen] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handlePostClick = () => {
    if (post.topic && post.space) {
      // Check if user is a member of the space
      // Admin can access all spaces
      if (currentUser?.role === 'admin') {
        navigate(`/space/${post.space._id}/topic/${post.topic._id}/posts`);
      } else {
        // For non-admin users, check membership
        checkSpaceAccessAndNavigate();
      }
    }
  };

  const checkSpaceAccessAndNavigate = async () => {
    try {
      // Fetch space details to check membership
      const response = await apiClient.get(`/api/spaces/${post.space?._id}`);
      const spaceData = response.data.data;

      // Check if current user is a member
      const isMember = spaceData.members?.includes(currentUser?._id);

      if (isMember) {
        // User is a member, navigate to the post
        navigate(`/space/${post.space._id}/topic/${post.topic._id}/posts`);
      } else {
        // User is not a member, show dialog
        setSpaceAccessDialogOpen(true);
      }
    } catch (error) {
      console.error('Failed to check space access:', error);
      // On error, show the dialog to be safe
      setSpaceAccessDialogOpen(true);
    }
  };

  const handleRequestJoin = () => {
    // Navigate to the spaces page where user can request to join
    if (post.space) {
      navigate(`/dashboard`);
      setSpaceAccessDialogOpen(false);
    }
  };

  return (
    <>
      <div
        onClick={handlePostClick}
        className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition cursor-pointer hover:shadow-md"
      >
        {/* HEADER */}
        <div className="flex items-start gap-3 mb-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/profile/${post.author._id}`);
            }}
            className="shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label={`View ${post.author.name}'s profile`}
          >
            <Avatar
              name={post.author.name}
              avatarUrl={post.author.avatar}
              size="md"
            />
          </button>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {post.title}
            </h3>

            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">{post.author.name}</span>
              <span>•</span>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                {post.author.role}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {formatDate(post.createdAt)}
              </span>
            </div>

            {/* Space and Topic Info */}
            {post.space && post.topic && (
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                <span>in</span>
                <span className="font-medium text-gray-700">{post.space.title}</span>
                <span>›</span>
                <span className="font-medium text-gray-700">{post.topic.title}</span>
              </div>
            )}
          </div>
        </div>

        {/* CONTENT */}
        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap line-clamp-3">
          {linkifyText(post.content)}
        </div>

        {/* Click to view more indicator */}
        <div className="mt-3 text-sm text-blue-600 font-medium">
          Click to view full post →
        </div>
      </div>

      {/* Space Access Dialog */}
      <AlertDialog open={spaceAccessDialogOpen} onOpenChange={setSpaceAccessDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-50 rounded-full">
                <Lock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <AlertDialogTitle>Space Access Required</AlertDialogTitle>
              </div>
            </div>
            <AlertDialogDescription className="text-base">
              You are not a member of <span className="font-semibold text-gray-900">{post.space?.title}</span>.
              <br /><br />
              To view this post and participate in discussions, you need to request to join this space.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRequestJoin}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Go to Spaces
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
