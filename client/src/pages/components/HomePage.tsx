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

  // On mount: fetch all spaces AND auto-recommendations in parallel
  useEffect(() => {
    dispatch(fetchSpaces({}));
    dispatch(fetchMyRecommendations());
  }, [dispatch]);

  return (
    <div className="flex h-screen bg-neutral-50">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-semibold text-gray-900">
              Welcome back{user?.name ? `, ${user.name}` : ""}
            </h1>
            <p className="text-gray-600 mt-1">
              Connect with alumni and students in your areas of interest
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-8 py-8">

          {/* AI Recommendations (auto + manual search) */}
          <RecommendationsSection />

          {/* All Spaces section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Other Spaces
              </h2>
              <CreateSpaceDialog />
            </div>

            {/* Search + Filters */}
            <div className="flex flex-wrap gap-3 items-center mb-6">
              <Input
                placeholder="Search spaces..."
                className="w-80"
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              />

              <Select
                value={filterType}
                onValueChange={(value: "all" | "my" | "joined") =>
                  dispatch(setFilterType(value))
                }
              >
                <SelectTrigger className="w-36">
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
                onValueChange={(value: "latest" | "name") =>
                  dispatch(setSortBy(value))
                }
              >
                <SelectTrigger className="w-36">
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
