import { useEffect } from "react";
import Sidebar from "../../feature/core/components/Sidebar";
import { Input } from "../../feature/core/components/ui/input";
import CreateSpaceDialog from "../../feature/Spaces/components/CreateSpaceDialog";
import SpacesGrid from "../../feature/Spaces/components/SpacesGrid";
import RecommendationsSection from "../../feature/Recommendations/components/RecommendationsSection";

import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchSpaces, setSearchQuery, setFilterType, setSortBy } from "../../store/Slice/spacesSlice";
import { fetchMyRecommendations } from "../../store/Slice/recommendationsSlice";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../feature/core/components/ui/select";

export default function HomePage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { searchQuery, filterType, sortBy } = useAppSelector((state) => state.spaces);

  useEffect(() => {
    dispatch(fetchSpaces({}));
    dispatch(fetchMyRecommendations());
  }, [dispatch]);

  return (
    <div className="flex h-screen" style={{ background: "var(--background)" }}>
      <Sidebar />

      <div className="flex-1 overflow-auto">
        {/* Welcome Hero */}
        <div className="px-8 pt-8 pb-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-6 rounded-full" style={{ background: "var(--primary)" }} />
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Dashboard
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">
                  Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""} 👋
                </h1>
                <p className="text-muted-foreground mt-1.5 text-sm">
                  Discover spaces, connect with alumni and students in your areas of interest.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-8 py-6">
          {/* AI Recommendations (auto + manual search) */}
          <RecommendationsSection />

          {/* Other Spaces */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Community Spaces</h2>
                <p className="text-xs text-muted-foreground mt-0.5">All available spaces on the platform</p>
              </div>
              {user?.role === "admin" && <CreateSpaceDialog />}
            </div>

            {/* Search + Filters */}
            <div className="flex flex-wrap gap-3 items-center mb-6">
              <Input
                placeholder="Search spaces..."
                className="w-72 rounded-xl"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              />

              <Select
                value={filterType}
                onValueChange={(value: "all" | "my" | "joined") => dispatch(setFilterType(value))}
              >
                <SelectTrigger className="w-36 rounded-xl" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All spaces</SelectItem>
                  <SelectItem value="my">My spaces</SelectItem>
                  <SelectItem value="joined">Joined</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={sortBy}
                onValueChange={(value: "latest" | "name") => dispatch(setSortBy(value))}
              >
                <SelectTrigger className="w-36 rounded-xl" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <SpacesGrid />
          </div>
        </div>
      </div>
    </div>
  );
}
