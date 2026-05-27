import { useState } from "react";
import { getInitials, getAvatarColor, getAvatarUrl } from "../../../../utils/avatarUtils";

interface AvatarProps {
  name: string;
  avatarUrl?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
};

export function Avatar({ name, avatarUrl, size = "md", className = "" }: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const url = getAvatarUrl(avatarUrl);
  const shouldShowImage = url && !imageError;

  const handleImageError = () => {
    setImageError(true);
  };

  if (shouldShowImage) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0 ${className}`}
      >
        <img
          src={url}
          alt={name}
          className="w-full h-full object-cover"
          onError={handleImageError}
          referrerPolicy="no-referrer" // Important for Google profile images
        />
      </div>
    );
  }

  // Fallback to initials with colored background
  const backgroundColor = getAvatarColor(name);
  const initials = getInitials(name);

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${className}`}
      style={{ backgroundColor }}
    >
      {initials}
    </div>
  );
}
