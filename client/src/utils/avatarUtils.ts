/**
 * Utility functions for handling user avatars
 */

/**
 * Get user initials from name for avatar display
 * @param name - User's full name
 * @returns Initials (max 2 characters)
 */
export const getInitials = (name: string): string => {
  if (!name) return "U";

  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Generate a consistent color based on user name
 * @param name - User's name
 * @returns Hex color code
 */
export const getAvatarColor = (name: string): string => {
  const colors = [
    "#EF4444", // red
    "#F59E0B", // amber
    "#10B981", // emerald
    "#3B82F6", // blue
    "#8B5CF6", // violet
    "#EC4899", // pink
    "#06B6D4", // cyan
    "#F97316", // orange
    "#14B8A6", // teal
    "#6366F1", // indigo
  ];

  // Generate a hash from the name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Use hash to pick a color
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

/**
 * Get avatar URL or return null if not available
 * @param avatarUrl - User's avatar URL from database
 * @returns Avatar URL or null
 */
export const getAvatarUrl = (avatarUrl?: string): string | null => {
  if (!avatarUrl || avatarUrl.trim() === "") {
    return null;
  }
  return avatarUrl;
};
