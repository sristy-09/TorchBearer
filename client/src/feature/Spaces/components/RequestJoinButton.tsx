import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { requestJoinSpace } from "../../../store/Slice/notificationSlice";
import { Button } from "../../core/components/ui/button";
import { UserPlus, Check, Clock, CheckCircle } from "lucide-react";

interface RequestJoinButtonProps {
  spaceId: string;
  isMember: boolean;
}

export default function RequestJoinButton({ spaceId, isMember }: RequestJoinButtonProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { notifications } = useAppSelector((state) => state.notifications);

  const [loading, setLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [error, setError] = useState("");

  const hasPendingRequest = notifications.some(
    (n) =>
      n.type === "space_join_request" &&
      n.space._id === spaceId &&
      n.status === "pending" &&
      n.from._id === user?._id
  );

  const handleRequestJoin = async () => {
    if (!user) { setError("Please login to join spaces"); return; }
    if (user.role === "admin") { setError("Admins don't need to request access"); return; }
    setLoading(true);
    setError("");
    try {
      await dispatch(requestJoinSpace(spaceId)).unwrap();
      setRequestSent(true);
    } catch (err: any) {
      setError(err || "Failed to send request");
    } finally {
      setLoading(false);
    }
  };

  if (isMember) {
    return (
      <Button disabled className="rounded-xl text-xs h-8 px-3 font-medium"
        style={{ background: "rgba(16,185,129,0.12)", color: "#10B981", border: "none" }}>
        <Check className="w-3.5 h-3.5 mr-1.5" />
        Member
      </Button>
    );
  }

  if (requestSent) {
    return (
      <Button disabled className="rounded-xl text-xs h-8 px-3 font-medium"
        style={{ background: "rgba(16,185,129,0.12)", color: "#10B981", border: "none" }}>
        <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
        Request Sent
      </Button>
    );
  }

  if (hasPendingRequest) {
    return (
      <Button disabled className="rounded-xl text-xs h-8 px-3 font-medium"
        style={{ background: "rgba(245,158,11,0.12)", color: "#D97706", border: "none" }}>
        <Clock className="w-3.5 h-3.5 mr-1.5" />
        Request Pending
      </Button>
    );
  }

  return (
    <div>
      <Button
        onClick={handleRequestJoin}
        disabled={loading}
        className="rounded-xl text-xs h-8 px-3 font-semibold text-white transition-all"
        style={{ background: "var(--primary)" }}
      >
        <UserPlus className="w-3.5 h-3.5 mr-1.5" />
        {loading ? "Sending..." : "Request to Join"}
      </Button>
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  );
}
