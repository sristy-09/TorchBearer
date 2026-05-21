import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { requestJoinSpace } from "../../../store/Slice/notificationSlice";
import { Button } from "../../core/components/ui/button";
import { UserPlus, Check, Clock } from "lucide-react";

interface RequestJoinButtonProps {
  spaceId: string;
  isMember: boolean;
}

export default function RequestJoinButton({
  spaceId,
  isMember,
}: RequestJoinButtonProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { notifications } = useAppSelector((state) => state.notifications);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if user already has a pending request for this space
  const hasPendingRequest = notifications.some(
    (n) =>
      n.type === "space_join_request" &&
      n.space._id === spaceId &&
      n.status === "pending" &&
      n.from._id === user?._id
  );

  const handleRequestJoin = async () => {
    if (!user) {
      setError("Please login to join spaces");
      return;
    }

    if (user.role === "admin") {
      setError("Admins don't need to request access");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await dispatch(requestJoinSpace(spaceId)).unwrap();
    } catch (err: any) {
      setError(err || "Failed to send request");
    } finally {
      setLoading(false);
    }
  };

  // If user is already a member
  if (isMember) {
    return (
      <Button disabled className="bg-green-600">
        <Check className="w-4 h-4 mr-2" />
        Member
      </Button>
    );
  }

  // If user has a pending request
  if (hasPendingRequest) {
    return (
      <Button disabled className="bg-yellow-600">
        <Clock className="w-4 h-4 mr-2" />
        Request Pending
      </Button>
    );
  }

  // Request to join button
  return (
    <div>
      <Button
        onClick={handleRequestJoin}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700"
      >
        <UserPlus className="w-4 h-4 mr-2" />
        {loading ? "Sending..." : "Request to Join"}
      </Button>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}
