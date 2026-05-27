import React from "react";

/**
 * Converts plain text URLs into clickable links
 * @param text - The text content that may contain URLs
 * @returns React elements with clickable links
 */
export const linkifyText = (text: string): React.ReactNode => {
  if (!text) return null;

  // Regular expression to match URLs
  // Matches http://, https://, and www. URLs
  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;

  const parts = text.split(urlRegex).filter(Boolean);

  return parts.map((part, index) => {
    // Check if this part is a URL
    const isUrl = /^(https?:\/\/[^\s]+)|(www\.[^\s]+)$/i.test(part);

    if (isUrl) {
      // Ensure the URL has a protocol
      const href = part.startsWith("http") ? part : `https://${part}`;

      return (
        <a
          key={index}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline break-all"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      );
    }

    return <span key={index}>{part}</span>;
  });
};

/**
 * Renders text with both clickable links and mentions
 * @param text - The text content that may contain URLs and mentions
 * @returns React elements with clickable links and styled mentions
 */
export const renderTextWithLinksAndMentions = (text: string): React.ReactNode => {
  if (!text) return null;

  // First, split by mentions
  const mentionRegex = /(@\[[^\]]+\])/g;
  const parts = text.split(mentionRegex);

  return parts.map((part, index) => {
    // Check if this part is a mention
    const isMention = /^@\[[^\]]+\]$/.test(part);

    if (isMention) {
      return (
        <span key={index} className="text-blue-600 font-medium">
          {part.replace(/@|\[|\]/g, "")}
        </span>
      );
    }

    // Otherwise, linkify URLs in this part
    return <React.Fragment key={index}>{linkifyText(part)}</React.Fragment>;
  });
};
