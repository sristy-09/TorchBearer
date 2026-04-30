import { useEffect } from "react";
import Sidebar from "../../feature/core/components/Sidebar";
import { Button } from "../../feature/core/components/ui/button";
import { Input } from "../../feature/core/components/ui/input";
import CreateSpaceDialog from "../../feature/Spaces/components/CreateSpaceDialog";
import SpacesGrid from "../../feature/Spaces/components/SpacesGrid";

import { useAppDispatch } from "../../store/hooks";
import { fetchSpaces } from "../../store/Slice/spacesSlice";

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

  useEffect(() => {
    dispatch(fetchSpaces());
  }, [dispatch]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-gray-100 border-b px-6 py-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xl text-gray-700">Welcome back!</p>
            <h1 className="text-lg font-semibold text-gray-800">
              Explore your spaces and discover opportunities
            </h1>
          </div>

          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Explore Features
          </Button>
        </div>

        <div className="p-8">
          {/* MatchMyTalent Engine */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="bg-[#121a2c] text-white rounded-3xl shadow-2xl p-10">
              <h1 className="text-4xl font-bold text-yellow-400 text-center mb-8">
                MatchMyTalent Engine
              </h1>

              <div className="space-y-6">
                <Select defaultValue="skills-based">
                  <SelectTrigger className="bg-white text-black h-12">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="skills-based">
                      Skills-based Recommendations
                    </SelectItem>
                    <SelectItem value="interest-based">
                      Interest-based Recommendations
                    </SelectItem>
                    <SelectItem value="career-path">
                      Career Path Recommendations
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Enter your skills (e.g. Python, React, SQL)"
                  className="bg-white text-black h-12"
                />

                <Button className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-semibold py-6 rounded-2xl">
                  Get Recommendations
                </Button>
              </div>
            </div>
          </div>

          <div>
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Compass size={26} className="text-blue-500" />

                  <h2 className="text-3xl font-bold text-gray-900">
                    Explore Spaces
                  </h2>
                </div>

                <CreateSpaceDialog />
              </div>

              {/* Search + Filters (LIKE YOUR SCREENSHOT) */}
              <div className="flex flex-wrap gap-3 items-center">
                <Input placeholder="🔍Search spaces..." className="w-72" />

                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All spaces</SelectItem>
                    <SelectItem value="my">My spaces</SelectItem>
                    <SelectItem value="joined">Joined spaces</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="latest">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">Latest</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* GRID (NO TABLE ANYMORE 🚀) */}
            <SpacesGrid />

            {/* Footer note */}
            <p className="text-center text-xs text-gray-500 mt-8">
              Explore spaces, build meaningful connections, and discover
              opportunities aligned with your skills.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
