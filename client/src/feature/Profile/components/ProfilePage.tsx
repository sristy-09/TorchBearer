import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useAppSelector, useAppDispatch } from "../../../store/hooks";
import { getUserById } from "../api/userApi";
import type { User } from "../../Auth/types/types";
import type { Post } from "../../Post/types/post";
import { Avatar } from "../../core/components/ui/avatar";
import { Button } from "../../core/components/ui/button";
import Sidebar from "../../core/components/Sidebar";
import EditProfileDialog from "./EditProfileDialog";
import PostCard from "../../Post/components/PostCard";
import { apiClient } from "../../../store/Slice/authSlice";
import {
  ArrowLeft,
  Pencil,
  GraduationCap,
  Building2,
  Hash,
  Calendar,
  Lightbulb,
  Wrench,
  FileText,
  Loader2,
} from "lucide-react";

const roleBadgeColors: Record<string, string> = {
  admin: "bg-red-100 text-red-700",
  student: "bg-blue-100 text-blue-700",
  alumni: "bg-green-100 text-green-700",
};

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const currentUser = useAppSelector((state) => state.auth.user);

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  // Posts state
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState<string | null>(null);

  // Determine if we're viewing our own profile
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

  // Keep own profile in sync with Redux state changes (after edit)
  useEffect(() => {
    if (isOwnProfile && currentUser) {
      setProfileUser(currentUser);
    }
  }, [currentUser, isOwnProfile]);

  // Fetch user's posts
  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!profileUser?._id) return;

      setPostsLoading(true);
      setPostsError(null);

      try {
        const response = await apiClient.get(`/api/posts?author=${profileUser._id}`);
        setUserPosts(response.data.data || []);
      } catch (err: any) {
        console.error("Failed to fetch user posts:", err);
        setPostsError("Failed to load posts");
      } finally {
        setPostsLoading(false);
      }
    };

    fetchUserPosts();
  }, [profileUser?._id]);

  return (
    <div className="flex h-screen bg-neutral-50">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b px-8 py-6">
          <div className="max-w-3xl mx-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 mb-4 -ml-2"
            >
              <ArrowLeft size={16} />
              Back
            </Button>
            <h1 className="text-2xl font-semibold text-gray-900">
              {isOwnProfile ? "My Profile" : "User Profile"}
            </h1>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-8 py-8">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <p className="text-gray-500 text-sm">Loading profile...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
              {error}
            </div>
          )}

          {!loading && !error && profileUser && (
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-5">
                    <Avatar
                      name={profileUser.name}
                      avatarUrl={profileUser.avatar}
                      size="xl"
                    />
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {profileUser.name}
                      </h2>
                      <p className="text-gray-500 text-sm mt-0.5">
                        {profileUser.email}
                      </p>
                      <span
                        className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${roleBadgeColors[profileUser.role] ??
                          "bg-gray-100 text-gray-700"
                          }`}
                      >
                        {profileUser.role}
                      </span>
                    </div>
                  </div>

                  {isOwnProfile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditOpen(true)}
                      className="flex items-center gap-2 shrink-0"
                    >
                      <Pencil size={15} />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>

              {/* Details Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-5">
                  Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {profileUser.department && (
                    <DetailItem
                      icon={<Building2 size={16} />}
                      label="Department"
                      value={profileUser.department}
                    />
                  )}
                  {profileUser.batchYear && (
                    <DetailItem
                      icon={<Calendar size={16} />}
                      label="Batch Year"
                      value={String(profileUser.batchYear)}
                    />
                  )}
                  {profileUser.registrationNumber && (
                    <DetailItem
                      icon={<Hash size={16} />}
                      label="Registration No."
                      value={String(profileUser.registrationNumber)}
                    />
                  )}
                  {profileUser.role && (
                    <DetailItem
                      icon={<GraduationCap size={16} />}
                      label="Role"
                      value={
                        profileUser.role.charAt(0).toUpperCase() +
                        profileUser.role.slice(1)
                      }
                    />
                  )}
                </div>

                {!profileUser.department &&
                  !profileUser.batchYear &&
                  !profileUser.registrationNumber && (
                    <p className="text-sm text-gray-400 italic">
                      No additional details available.
                    </p>
                  )}
              </div>

              {/* Skills */}
              {(profileUser.skills?.length ?? 0) > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Wrench size={16} />
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profileUser.skills!.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Interests */}
              {(profileUser.interests?.length ?? 0) > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Lightbulb size={16} />
                    Interests
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profileUser.interests!.map((interest) => (
                      <span
                        key={interest}
                        className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state for own profile with no skills/interests */}
              {isOwnProfile &&
                !profileUser.skills?.length &&
                !profileUser.interests?.length && (
                  <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center">
                    <p className="text-gray-500 text-sm">
                      Add your skills and interests to help others find you.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => setEditOpen(true)}
                    >
                      <Pencil size={14} className="mr-1.5" />
                      Edit Profile
                    </Button>
                  </div>
                )}

              {/* User Posts Section */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
                  <FileText size={16} />
                  Posts ({userPosts.length})
                </h3>

                {postsLoading && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                  </div>
                )}

                {postsError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                    {postsError}
                  </div>
                )}

                {!postsLoading && !postsError && userPosts.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500 text-sm">
                      {isOwnProfile
                        ? "You haven't created any posts yet."
                        : "This user hasn't created any posts yet."}
                    </p>
                  </div>
                )}

                {!postsLoading && !postsError && userPosts.length > 0 && (
                  <div className="space-y-4">
                    {userPosts.map((post) => (
                      <PostCard key={post._id} post={post} />
                    ))}
                  </div>
                )}
              </div>
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

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-gray-400">{icon}</div>
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
          {label}
        </p>
        <p className="text-sm text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}
