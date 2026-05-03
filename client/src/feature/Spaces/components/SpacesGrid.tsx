import { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchSpaces } from "../../../store/Slice/spacesSlice";
import SpaceCard from "./SpaceCard";

export default function SpacesGrid() {
  const dispatch = useAppDispatch();
  const { spaces, loading, searchQuery, filterType, sortBy } = useAppSelector(
    (state) => state.spaces
  );
  const currentUser = useAppSelector((state) => state.auth.user);

  // Fetch spaces from server with search query
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(fetchSpaces({ keyword: searchQuery || undefined }));
    }, 500); // Debounce search by 500ms

    return () => clearTimeout(timer);
  }, [dispatch, searchQuery]);

  // Client-side filtering for "my" and "joined" spaces
  // (Backend doesn't support these filters yet)
  const filteredAndSortedSpaces = useMemo(() => {
    let filtered = [...spaces];

    // Apply filter type (client-side only)
    if (filterType === "my" && currentUser) {
      filtered = filtered.filter(
        (space) => space.createdBy._id === currentUser._id
      );
    } else if (filterType === "joined" && currentUser) {
      filtered = filtered.filter((space) =>
        space.members?.some((member) => member === currentUser._id)
      );
    }

    // Apply sorting (client-side)
    if (sortBy === "name") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "latest") {
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return filtered;
  }, [spaces, filterType, sortBy, currentUser]);

  if (loading) return <p>Loading spaces...</p>;

  if (filteredAndSortedSpaces.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          {searchQuery ? "No spaces found matching your search." : "No spaces available."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {filteredAndSortedSpaces.map((space) => (
        <SpaceCard key={space._id} space={space} />
      ))}
    </div>
  );
}