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

/* ─── Tag chip ─────────────────────────────────────────────── */
function TagChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ background: "#8B5CF6", color: "#fff" }}>
      {label}
      <button onClick={onRemove} className="hover:opacity-70 transition-opacity" aria-label={`Remove ${label}`}>
        <X size={11} />
      </button>
    </span>
  );
}

/* ─── Space result card ────────────────────────────────────── */
function SpaceResultCard({ space }: { space: RecommendedSpace }) {
  const navigate = useNavigate();
  const currentUser = useAppSelector((state) => state.auth.user);
  const spaces = useAppSelector((state) => state.spaces.spaces);
  const matchPercent = Math.round(space.similarity_score * 100);

  const fullSpace = spaces.find((s) => s._id === space.id);
  const isMember = fullSpace?.members?.includes(currentUser?._id || "");
  const isAdmin = currentUser?.role === "admin";
  const canAccess = isMember || isAdmin;

  return (
    <div
      onClick={() => canAccess && navigate(`/space/${space.id}/topics`)}
      className={`group rounded-2xl p-5 border card-hover transition-all ${canAccess ? "cursor-pointer" : ""}`}
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors leading-snug text-sm">
          {space.title}
        </h3>
        <span
          className="shrink-0 text-xs font-bold px-2.5 py-0.5 rounded-full"
          style={{
            background: matchPercent >= 60 ? "var(--primary)" : matchPercent >= 30 ? "#F59E0B" : "var(--muted)",
            color: matchPercent >= 60 ? "#fff" : matchPercent >= 30 ? "#fff" : "var(--muted-foreground)",
          }}
        >
          {matchPercent}% match
        </span>
      </div>

      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
        {space.description}
      </p>

      {space.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {space.tags.slice(0, 5).map((tag) => (
            <Badge key={tag} variant="secondary"
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: "var(--secondary)", color: "var(--secondary-foreground)" }}>
              {tag}
            </Badge>
          ))}
          {space.tags.length > 5 && (
            <Badge variant="secondary" className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>
              +{space.tags.length - 5} more
            </Badge>
          )}
        </div>
      )}

      {!canAccess && (
        <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}
          onClick={(e) => e.stopPropagation()}>
          <RequestJoinButton spaceId={space.id} isMember={!!isMember} />
        </div>
      )}
    </div>
  );
}

/* ─── Skeleton ─────────────────────────────────────────────── */
function SkeletonCards({ count = 3 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl p-5 border animate-pulse"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="h-4 rounded-lg w-3/4 mb-3" style={{ background: "var(--muted)" }} />
          <div className="h-3 rounded-lg w-full mb-2" style={{ background: "var(--muted)" }} />
          <div className="h-3 rounded-lg w-5/6 mb-4" style={{ background: "var(--muted)" }} />
          <div className="flex gap-2">
            <div className="h-5 rounded-full w-16" style={{ background: "var(--muted)" }} />
            <div className="h-5 rounded-full w-20" style={{ background: "var(--muted)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Main ─────────────────────────────────────────────────── */
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
    ? user.role === "alumni" ? (user.skills ?? []) : (user.interests ?? [])
    : [];
  const hasProfileTerms = profileTerms.length > 0;

  const addTag = (value: string) => {
    const trimmed = value.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) setTags((prev) => [...prev, trimmed]);
    setInputValue("");
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

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
    const payload = user?.role === "alumni"
      ? { skills: tags, top_n: 5 }
      : { interests: tags, top_n: 5 };
    dispatch(fetchRecommendations(payload));
  };

  const handleClearSearch = () => {
    setTags([]);
    setInputValue("");
    dispatch(clearSearchRecommendations());
  };

  const placeholder = user?.role === "alumni"
    ? "Type a skill and press Enter (e.g. Python, React)…"
    : "Type an interest and press Enter (e.g. AI, Security)…";

  return (
    <div className="mb-10 space-y-8">

      {/* ── Auto Recommendations ── */}
      <div>
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "var(--secondary)" }}>
            <Sparkles size={16} style={{ color: "var(--primary)" }} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground leading-none">Recommended for You</h2>
            {hasProfileTerms && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Based on your {user?.role === "alumni" ? "skills" : "interests"}
              </p>
            )}
          </div>
        </div>

        {autoLoading && <SkeletonCards count={3} />}

        {!autoLoading && autoError && (
          <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444" }}>
            <AlertCircle size={16} className="shrink-0" />
            <div>
              <p className="font-medium">Could not load recommendations</p>
              <p className="text-xs mt-0.5 opacity-80">{autoError}</p>
            </div>
          </div>
        )}

        {!autoLoading && !autoError && !hasProfileTerms && (
          <div className="rounded-xl px-5 py-4 text-sm flex items-center gap-3"
            style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", color: "#B45309" }}>
            <Sparkles size={16} className="shrink-0" style={{ color: "#F59E0B" }} />
            <span>
              Complete your profile with{" "}
              <strong>{user?.role === "alumni" ? "skills" : "interests"}</strong> to get
              personalised recommendations automatically.
            </span>
          </div>
        )}

        {!autoLoading && !autoError && autoRecommendations.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {autoRecommendations.map((space) => (
              <SpaceResultCard key={space.id} space={space} />
            ))}
          </div>
        )}

        {!autoLoading && !autoError && hasProfileTerms && autoRecommendations.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            <Sparkles size={28} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No matching spaces found for your profile yet.</p>
          </div>
        )}
      </div>

      {/* ── Manual Search ── */}
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-2xl lavender-glow pointer-events-none" />

        <div className="relative rounded-2xl p-7 text-white overflow-hidden"
          style={{ background: "linear-gradient(135deg, #9F7AEA 0%, #B794F4 45%, #C4B5FD 100%)" }}>
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-20"
            style={{ background: "rgba(255,255,255,0.3)" }} />
          <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full opacity-15"
            style={{ background: "rgba(255,255,255,0.3)" }} />

          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <Search size={18} className="opacity-90" />
              <h3 className="text-lg font-semibold">Search by Skills or Interests</h3>
            </div>
            <p className="text-white/75 text-sm mb-5">
              Discover spaces by entering any skills or topics manually.
            </p>

            {/* Tag input */}
            <div className="rounded-xl p-3 flex flex-wrap gap-2 items-center min-h-[52px]"
              style={{ background: "rgba(255,255,255,0.95)" }}>
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
                className="flex-1 min-w-[160px] text-sm outline-none bg-transparent"
                style={{ color: "#1E293B" }}
              />
            </div>

            <div className="flex gap-3 mt-4">
              <Button
                onClick={handleSearch}
                disabled={ searchLoading}
                className="rounded-lg font-semibold px-6 shadow-sm transition-all disabled:opacity-60"
                style={{ background: "#fff", color: "var(--primary)" }}
              >
                {searchLoading ? (
                  <><Loader2 size={15} className="animate-spin mr-2" />Searching…</>
                ) : (
                  <><Search size={15} className="mr-2" />Search</>
                )}
              </Button>

              {hasSearched && (
                <Button
                  onClick={handleClearSearch}
                  variant="ghost"
                  className="font-medium rounded-lg"
                  style={{ color: "rgba(255,255,255,0.85)" }}
                >
                  Clear
                </Button>
              )}
            </div>

            <p className="text-white/60 text-xs mt-3">
              Press Enter or comma to add · Backspace to remove the last tag
            </p>
          </div>
        </div>
      </div>

      {/* Manual search results */}
      {hasSearched && (
        <div>
          {searchError && (
            <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444" }}>
              <AlertCircle size={16} className="shrink-0" />
              <span>{searchError}</span>
            </div>
          )}

          {searchLoading && <SkeletonCards count={5} />}

          {!searchLoading && !searchError && searchRecommendations.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              <Search size={28} className="mx-auto mb-2 opacity-30" />
              <p className="font-medium text-sm">No spaces matched your search.</p>
              <p className="text-xs mt-1">Try different terms.</p>
            </div>
          )}

          {!searchLoading && !searchError && searchRecommendations.length > 0 && (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Found{" "}
                <span className="font-semibold text-foreground">{searchRecommendations.length}</span>{" "}
                spaces for{" "}
                <span className="font-semibold text-foreground">{queryTerms.join(", ")}</span>{" "}
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
