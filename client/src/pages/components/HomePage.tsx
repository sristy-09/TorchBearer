import { useEffect, useState } from "react";
import Sidebar from "../../feature/core/components/Sidebar";
import { Input } from "../../feature/core/components/ui/input";
import CreateSpaceDialog from "../../feature/Spaces/components/CreateSpaceDialog";
import SpacesGrid from "../../feature/Spaces/components/SpacesGrid";
import RecommendationsSection from "../../feature/Recommendations/components/RecommendationsSection";
import { Menu } from "lucide-react";

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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // On mount: fetch all spaces AND auto-recommendations in parallel
  useEffect(() => {
    dispatch(fetchSpaces({}));
    dispatch(fetchMyRecommendations());
  }, [dispatch]);

  return (
    <div className="flex h-screen bg-neutral-50">
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 lg:ml-64 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              {/* Hamburger Menu for Mobile */}
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Menu size={24} className="text-gray-700" />
              </button>

              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                  Welcome back{user?.name ? `, ${user.name}` : ""}
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Connect with alumni and students in your areas of interest
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

          {/* AI Recommendations (auto + manual search) */}
          <RecommendationsSection />

          {/* All Spaces section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Other Spaces
              </h2>
              {user?.role === "admin" && <CreateSpaceDialog />}
            </div>

            {/* Search + Filters */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center mb-6">
              <Input
                placeholder="Search spaces..."
                className="w-full sm:w-80"
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              />

              <Select
                value={filterType}
                onValueChange={(value: "all" | "my" | "joined") =>
                  dispatch(setFilterType(value))
                }
              >
                <SelectTrigger className="w-full sm:w-36">
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
                <SelectTrigger className="w-full sm:w-36">
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
