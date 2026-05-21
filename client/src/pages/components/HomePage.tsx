import { useEffect } from "react";
import Sidebar from "../../feature/core/components/Sidebar";
import { Button } from "../../feature/core/components/ui/button";
import { Input } from "../../feature/core/components/ui/input";
import CreateSpaceDialog from "../../feature/Spaces/components/CreateSpaceDialog";
import SpacesGrid from "../../feature/Spaces/components/SpacesGrid";

import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchSpaces, setSearchQuery, setFilterType, setSortBy } from "../../store/Slice/spacesSlice";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../feature/core/components/ui/select";
import { Compass } from "lucide-react";

export default function HomePage() {
  const dispatch = useAppDispatch();
  const { searchQuery, filterType, sortBy } = useAppSelector((state) => state.spaces);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchSpaces({}));
  }, [dispatch]);

  return (
    <div className="flex h-screen bg-neutral-50">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-semibold text-gray-900">
              Your Spaces
            </h1>
            <p className="text-gray-600 mt-1">
              Connect with alumni and students in your areas of interest
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Recommendation Section */}
          <div className="mb-10">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg p-8 text-white">
              <div className="max-w-3xl">
                <h2 className="text-2xl font-semibold mb-2">
                  Find Relevant Opportunities
                </h2>
                <p className="text-blue-100 mb-6">
                  Get personalized space recommendations based on your skills and interests
                </p>

                <div className="flex gap-3">
                  <Input
                    placeholder="Enter skills (e.g. Python, React, Machine Learning)"
                    className="bg-white/95 text-gray-900 border-0 h-11 flex-1"
                  />
                  <Button className="bg-white text-blue-600 hover:bg-blue-50 font-medium px-6">
                    Search
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                All Spaces
              </h2>
              {user?.role === "admin" && <CreateSpaceDialog />}
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
