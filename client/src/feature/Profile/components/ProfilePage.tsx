import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useAppSelector } from "../../../store/hooks";
import { getUserById } from "../api/userApi";
import type { User } from "../../Auth/types/types";
import { Avatar } from "../../core/components/ui/avatar";
import { Button } from "../../core/components/ui/button";
import Sidebar from "../../core/components/Sidebar";
import EditProfileDialog from "./EditProfileDialog";
import {
  ArrowLeft,
  Pencil,
  GraduationCap,
  Building2,
  Hash,
  Calendar,
  Lightbulb,
  Wrench,
} from "lucide-react";

const roleBadgeStyle: Record<string, { bg: string; color: string }> = {
  admin: { bg: "rgba(239,68,68,0.1)", color: "#EF4444" },
  student: { bg: "var(--secondary)", color: "var(--primary)" },
  alumni: { bg: "rgba(16,185,129,0.1)", color: "#10B981" },
};

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const currentUser = useAppSelector((state) => state.auth.user);

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const isOwnProfile = !userId || userId === currentUser?._id;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        if (isOwnProfile && currentUser) {
          setProfileUser(currentUser);
        } else if (userId) {
          const user = await getUserById(userId);
          setProfileUser(user);
        }
      } catch {
        setError("Could not load this profile.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId, currentUser, isOwnProfile]);

  useEffect(() => {
    if (isOwnProfile && currentUser) setProfileUser(currentUser);
  }, [currentUser, isOwnProfile]);

  return (
    <div className="flex h-screen" style={{ background: "var(--background)" }}>
      <Sidebar />

      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="px-8 pt-7 pb-5" style={{ borderBottom: "1px solid var(--border)", background: "var(--card)" }}>
          <div className="max-w-3xl mx-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 mb-4 -ml-2 text-muted-foreground hover:text-foreground rounded-lg"
            >
              <ArrowLeft size={15} />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              {isOwnProfile ? "My Profile" : "User Profile"}
            </h1>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-8 py-8">
          {loading && (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              <p className="text-sm">Loading profile...</p>
            </div>
          )}

          {error && (
            <div className="rounded-xl px-4 py-3 text-sm text-red-500"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              {error}
            </div>
          )}

          {!loading && !error && profileUser && (
            <div className="space-y-5">
              {/* Profile Card */}
              <div className="rounded-2xl p-7 border"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-5">
                    <Avatar name={profileUser.name} avatarUrl={profileUser.avatar} size="xl" />
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{profileUser.name}</h2>
                      <p className="text-muted-foreground text-sm mt-0.5">{profileUser.email}</p>
                      {(() => {
                        const badge = roleBadgeStyle[profileUser.role] || { bg: "var(--muted)", color: "var(--muted-foreground)" };
                        return (
                          <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                            style={{ background: badge.bg, color: badge.color }}>
                            {profileUser.role}
                          </span>
                        );
                      })()}
                    </div>
                  </div>

                  {isOwnProfile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditOpen(true)}
                      className="flex items-center gap-2 shrink-0 rounded-xl"
                      style={{ borderColor: "var(--border)", background: "var(--background)" }}
                    >
                      <Pencil size={14} />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>

              {/* Details Card */}
              <div className="rounded-2xl p-6 border"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                <h3 className="text-sm font-semibold text-foreground mb-5 uppercase tracking-wider opacity-60">
                  Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {profileUser.department && (
                    <DetailItem icon={<Building2 size={15} />} label="Department" value={profileUser.department} />
                  )}
                  {profileUser.batchYear && (
                    <DetailItem icon={<Calendar size={15} />} label="Batch Year" value={String(profileUser.batchYear)} />
                  )}
                  {profileUser.registrationNumber && (
                    <DetailItem icon={<Hash size={15} />} label="Registration No." value={String(profileUser.registrationNumber)} />
                  )}
                  {profileUser.role && (
                    <DetailItem icon={<GraduationCap size={15} />} label="Role"
                      value={profileUser.role.charAt(0).toUpperCase() + profileUser.role.slice(1)} />
                  )}
                </div>
                {!profileUser.department && !profileUser.batchYear && !profileUser.registrationNumber && (
                  <p className="text-sm text-muted-foreground italic">No additional details available.</p>
                )}
              </div>

              {/* Skills */}
              {(profileUser.skills?.length ?? 0) > 0 && (
                <div className="rounded-2xl p-6 border"
                  style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                  <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2 uppercase tracking-wider opacity-60">
                    <Wrench size={14} />
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profileUser.skills!.map((skill) => (
                      <span key={skill}
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={{ background: "var(--secondary)", color: "var(--primary)" }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Interests */}
              {(profileUser.interests?.length ?? 0) > 0 && (
                <div className="rounded-2xl p-6 border"
                  style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                  <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2 uppercase tracking-wider opacity-60">
                    <Lightbulb size={14} />
                    Interests
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profileUser.interests!.map((interest) => (
                      <span key={interest}
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={{ background: "rgba(168,85,247,0.1)", color: "#A855F7" }}>
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {isOwnProfile && !profileUser.skills?.length && !profileUser.interests?.length && (
                <div className="rounded-2xl p-8 text-center border border-dashed"
                  style={{ borderColor: "var(--border)" }}>
                  <p className="text-sm text-muted-foreground">
                    Add your skills and interests to help others find you.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 rounded-xl"
                    style={{ borderColor: "var(--border)" }}
                    onClick={() => setEditOpen(true)}
                  >
                    <Pencil size={13} className="mr-1.5" />
                    Edit Profile
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isOwnProfile && (
        <EditProfileDialog open={editOpen} onOpenChange={setEditOpen} />
      )}
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div>
        <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm text-foreground mt-0.5 font-medium">{value}</p>
      </div>
    </div>
  );
}
