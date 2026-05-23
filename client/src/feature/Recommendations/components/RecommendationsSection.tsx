import { useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router";
import {
  Sparkles,
  X,
  Search,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "../../core/components/ui/button";
import { Badge } from "../../core/components/ui/badge";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  fetchRecommendations,
  clearSearchRecommendations,
  type RecommendedSpace,
} from "../../../store/Slice/recommendationsSlice";
import RequestJoinButton from "../../Spaces/components/RequestJoinButton";

/* ─────────────────────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────────────────────── */

function TagChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
      {label}
      <button
        onClick={onRemove}
        className="hover:text-blue-900 transition-colors"
        aria-label={`Remove ${label}`}
      >
        <X size={12} />
      </button>
    </span>
  );
}

function SpaceResultCard({ space }: { space: RecommendedSpace }) {
  const navigate = useNavigate();
  const currentUser = useAppSelector((state) => state.auth.user);
  const spaces = useAppSelector((state) => state.spaces.spaces);
  const matchPercent = Math.round(space.similarity_score * 100);

  // Find the full space object to check membership
  const fullSpace = spaces.find((s) => s._id === space.id);
  const isMember = fullSpace?.members?.includes(currentUser?._id || "");
  const isAdmin = currentUser?.role === "admin";
  const canAccess = isMember || isAdmin;

  const handleClick = () => {
    // Only navigate if user can access the space
    if (canAccess) {
      navigate(`/space/${space.id}/topics`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group bg-white border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-md transition-all ${canAccess ? "cursor-pointer" : ""
        }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug">
          {space.title}
        </h3>
        <span
          className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{
            backgroundColor:
              matchPercent >= 60 ? "#dcfce7" : matchPercent >= 30 ? "#fef9c3" : "#f3f4f6",
            color:
              matchPercent >= 60 ? "#15803d" : matchPercent >= 30 ? "#854d0e" : "#6b7280",
          }}
        >
          {matchPercent}% match
        </span>
      </div>

      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-3">
        {space.description}
      </p>

      {space.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {space.tags.slice(0, 5).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600"
            >
              {tag}
            </Badge>
          ))}
          {space.tags.length > 5 && (
            <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500">
              +{space.tags.length - 5} more
            </Badge>
          )}
        </div>
      )}

      {/* Show RequestJoinButton if user is not a member and not admin */}
      {!canAccess && (
        <div className="mt-3 pt-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
          <RequestJoinButton spaceId={space.id} isMember={!!isMember} />
        </div>
      )}
    </div>
  );
}

function SkeletonCards({ count = 3 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-lg p-5 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
          <div className="h-3 bg-gray-100 rounded w-full mb-2" />
          <div className="h-3 bg-gray-100 rounded w-5/6 mb-4" />
          <div className="flex gap-2">
            <div className="h-5 bg-gray-100 rounded-full w-16" />
            <div className="h-5 bg-gray-100 rounded-full w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────────────────── */

export default function RecommendationsSection() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const {
    autoRecommendations,
    autoLoading,
    autoError,
    searchRecommendations,
    searchLoading,
    searchError,
    hasSearched,
    totalSpacesAnalyzed,
    queryTerms,
  } = useAppSelector((state) => state.recommendations);

  const [inputValue, setInputValue] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const profileTerms = user
    ? user.role === "alumni"
      ? (user.skills ?? [])
      : (user.interests ?? [])
    : [];

  const hasProfileTerms = profileTerms.length > 0;

  const addTag = (value: string) => {
    const trimmed = value.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setInputValue("");
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const handleSearch = () => {
    if (tags.length === 0) return;
    const payload =
      user?.role === "alumni"
        ? { skills: tags, top_n: 5 }
        : { interests: tags, top_n: 5 };
    dispatch(fetchRecommendations(payload));
  };

  const handleClearSearch = () => {
    setTags([]);
    setInputValue("");
    dispatch(clearSearchRecommendations());
  };

  const placeholder =
    user?.role === "alumni"
      ? "Type a skill and press Enter (e.g. Python, React)…"
      : "Type an interest and press Enter (e.g. AI, Security)…";

  /* ── Render ── */
  return (
    <div className="mb-10 space-y-8">

      {/* ══════════════════════════════════════════════════════
          SECTION 1 — Auto recommendations from profile
      ══════════════════════════════════════════════════════ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={20} className="text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Recommended for You
          </h2>
          {hasProfileTerms && (
            <span className="text-xs text-gray-400 ml-1">
              · based on your {user?.role === "alumni" ? "skills" : "interests"}
            </span>
          )}
        </div>

        {/* Loading */}
        {autoLoading && <SkeletonCards count={3} />}

        {/* Error */}
        {!autoLoading && autoError && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
            <AlertCircle size={18} className="shrink-0" />
            <div>
              <p className="font-medium">Could not load recommendations</p>
              <p className="text-xs mt-0.5 text-red-500">{autoError}</p>
            </div>
          </div>
        )}

        {/* No profile terms */}
        {!autoLoading && !autoError && !hasProfileTerms && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-5 py-4 text-sm text-amber-800 flex items-center gap-3">
            <Sparkles size={18} className="shrink-0 text-amber-500" />
            <span>
              Complete your profile with{" "}
              <strong>{user?.role === "alumni" ? "skills" : "interests"}</strong> to get
              personalised recommendations automatically.
            </span>
          </div>
        )}

        {/* Results */}
        {!autoLoading && !autoError && autoRecommendations.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {autoRecommendations.map((space) => (
              <SpaceResultCard key={space.id} space={space} />
            ))}
          </div>
        )}

        {/* Has profile terms but no matches */}
        {!autoLoading && !autoError && hasProfileTerms && autoRecommendations.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Sparkles size={28} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No matching spaces found for your profile yet.</p>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════
          SECTION 2 — Manual search
      ══════════════════════════════════════════════════════ */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-7 text-white">
        <h3 className="text-lg font-semibold mb-1">Search by Skills or Interests</h3>
        <p className="text-blue-100 text-sm mb-5">
          Discover spaces by entering any skills or topics manually.
        </p>

        {/* Tag input */}
        <div className="bg-white rounded-lg p-3 flex flex-wrap gap-2 items-center min-h-[48px]">
          {tags.map((tag) => (
            <TagChip key={tag} label={tag} onRemove={() => removeTag(tag)} />
          ))}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => inputValue.trim() && addTag(inputValue)}
            placeholder={tags.length === 0 ? placeholder : "Add more…"}
            className="flex-1 min-w-[160px] text-sm text-gray-800 outline-none placeholder:text-gray-400 bg-transparent"
          />
        </div>

        <div className="flex gap-3 mt-3">
          <Button
            onClick={handleSearch}
            disabled={tags.length === 0 || searchLoading}
            className="bg-white text-blue-600 hover:bg-blue-50 font-medium px-6 disabled:opacity-60"
          >
            {searchLoading ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Searching…
              </>
            ) : (
              <>
                <Search size={16} className="mr-2" />
                Search
              </>
            )}
          </Button>

          {hasSearched && (
            <Button
              onClick={handleClearSearch}
              variant="ghost"
              className="text-white hover:bg-white/20 font-medium"
            >
              Clear
            </Button>
          )}
        </div>

        <p className="text-blue-200 text-xs mt-3">
          Press Enter or comma to add · Backspace to remove the last tag
        </p>
      </div>

      {/* Manual search results */}
      {hasSearched && (
        <div>
          {searchError && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
              <AlertCircle size={18} className="shrink-0" />
              <span>{searchError}</span>
            </div>
          )}

          {searchLoading && <SkeletonCards count={5} />}

          {!searchLoading && !searchError && searchRecommendations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Search size={28} className="mx-auto mb-2 text-gray-300" />
              <p className="font-medium text-sm">No spaces matched your search.</p>
              <p className="text-xs mt-1">Try different terms.</p>
            </div>
          )}

          {!searchLoading && !searchError && searchRecommendations.length > 0 && (
            <>
              <p className="text-sm text-gray-500 mb-4">
                Found{" "}
                <span className="font-semibold text-gray-800">
                  {searchRecommendations.length}
                </span>{" "}
                spaces for{" "}
                <span className="font-semibold text-gray-800">
                  {queryTerms.join(", ")}
                </span>{" "}
                · {totalSpacesAnalyzed} spaces analyzed
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchRecommendations.map((space) => (
                  <SpaceResultCard key={space.id} space={space} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
