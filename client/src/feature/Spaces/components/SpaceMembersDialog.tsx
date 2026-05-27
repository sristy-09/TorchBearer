import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../core/components/ui/dialog";
import { Avatar } from "../../core/components/ui/avatar";
import { Badge } from "../../core/components/ui/badge";
import { Users, Loader2 } from "lucide-react";
import { apiClient } from "../../../store/Slice/authSlice";

interface Member {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  department?: string;
  batchYear?: number;
}

interface SpaceMembersDialogProps {
  spaceId: string;
  spaceName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SpaceMembersDialog({
  spaceId,
  spaceName,
  open,
  onOpenChange,
}: SpaceMembersDialogProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && spaceId) {
      fetchMembers();
    }
  }, [open, spaceId]);

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/api/spaces/${spaceId}/members`);
      setMembers(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch members");
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "alumni":
        return "bg-blue-100 text-blue-800";
      case "student":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Members of {spaceName}
          </DialogTitle>
          <DialogDescription>
            {members.length > 0
              ? `${members.length} member${members.length !== 1 ? "s" : ""} in this space`
              : "No members yet"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No members in this space yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-white hover:bg-gray-50 transition-colors"
                >
                  <Avatar
                    name={member.name}
                    avatarUrl={member.avatar}
                    size="lg"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {member.name}
                      </h3>
                      <Badge className={getRoleBadgeColor(member.role)}>
                        {member.role}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {member.email}
                    </p>
                    {(member.department || member.batchYear) && (
                      <p className="text-xs text-gray-500 mt-1">
                        {member.department}
                        {member.department && member.batchYear && " • "}
                        {member.batchYear && `Batch ${member.batchYear}`}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
