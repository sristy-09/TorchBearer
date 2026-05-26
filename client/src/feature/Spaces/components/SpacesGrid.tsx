import { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchSpaces } from "../../../store/Slice/spacesSlice";
import SpaceCard from "./SpaceCard";
import ErrorBoundary from "../../core/components/ErrorBoundary";

export default function SpacesGrid() {
  const dispatch = useAppDispatch();

  const { spaces, loading, searchQuery, filterType, sortBy } = useAppSelector(
    (state) => state.spaces
  );
  const currentUser = useAppSelector((state) => state.auth.user);

  // IDs of spaces already shown in the auto-recommendation section
  const autoRecommendedIds = useAppSelector((state) =>
    state.recommendations.autoRecommendations.map((r) => r.id)
  );

  // Debounced re-fetch when search query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(fetchSpaces({ keyword: searchQuery || undefined }));
    }, 500);
    return () => clearTimeout(timer);
  }, [dispatch, searchQuery]);

  // Filter + sort, and split into recommended vs other
  const { otherSpaces } = useMemo(() => {
    let filtered = [...spaces];

    // Client-side filter by ownership / membership
    if (filterType === "my" && currentUser) {
      filtered = filtered.filter((s) => s.createdBy?._id === currentUser._id);
    } else if (filterType === "joined" && currentUser) {
      filtered = filtered.filter((s) =>
        s.members?.some((m) => m === currentUser._id)
      );
    }

    // Sort
    if (sortBy === "name") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      filtered.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    // Exclude spaces already shown in the AI recommendation section
    const other = filtered.filter((s) => !autoRecommendedIds.includes(s._id));

    return { otherSpaces: other };
  }, [spaces, filterType, sortBy, currentUser, autoRecommendedIds]);

  if (loading) {
    return (
      <div className="grid md:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl p-5 border animate-pulse"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="w-10 h-10 rounded-xl mb-3" style={{ background: "var(--muted)" }} />
            <div className="h-4 rounded-lg w-2/3 mb-2" style={{ background: "var(--muted)" }} />
            <div className="h-3 rounded-lg w-full mb-1.5" style={{ background: "var(--muted)" }} />
            <div className="h-3 rounded-lg w-4/5" style={{ background: "var(--muted)" }} />
          </div>
        ))}
      </div>
    );
  }

  if (otherSpaces.length === 0) {
    let message = "No spaces available.";
    if (searchQuery) message = "No spaces found matching your search.";
    else if (filterType === "my") message = "You haven't created any spaces yet.";
    else if (filterType === "joined") message = "You haven't joined any spaces yet.";

    return (
      <div className="text-center py-14 text-muted-foreground">
        <p className="text-base">{message}</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-5">
      {otherSpaces.map((space) => (
        <ErrorBoundary key={space._id} level="component">
          <SpaceCard space={space} />
        </ErrorBoundary>
      ))}
    </div>
  );
}
