import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { requestJoinSpace, cancelJoinSpace } from "../../../store/Slice/notificationSlice";
import { Button } from "../../core/components/ui/button";
import { UserPlus, Check, CheckCircle, X } from "lucide-react";

interface RequestJoinButtonProps {
  spaceId: string;
  isMember: boolean;
}

export default function RequestJoinButton({ spaceId, isMember }: RequestJoinButtonProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const pendingSpaceIds = useAppSelector((state) => state.notifications.pendingSpaceIds);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Persistent check — survives page reloads
  const hasPendingRequest = pendingSpaceIds.includes(spaceId);

  const handleRequestJoin = async () => {
    if (!user) { setError("Please login to join spaces"); return; }
    if (user.role === "admin") { setError("Admins don't need to request access"); return; }
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

  const handleCancelRequest = async () => {
    setLoading(true);
    setError("");
    try {
      await dispatch(cancelJoinSpace(spaceId)).unwrap();
    } catch (err: any) {
      setError(err || "Failed to cancel request");
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

  if (hasPendingRequest) {
    return (
      <div className="flex items-center gap-2">
        <Button disabled className="rounded-xl text-xs h-8 px-3 font-medium"
          style={{ background: "rgba(245,158,11,0.12)", color: "#D97706", border: "none" }}>
          <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
          Request Sent
        </Button>
        <Button
          onClick={handleCancelRequest}
          disabled={loading}
          className="rounded-xl text-xs h-8 px-3 font-medium"
          style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "none" }}
        >
          <X className="w-3.5 h-3.5 mr-1.5" />
          {loading ? "Cancelling..." : "Cancel"}
        </Button>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
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
