import { Button } from "../../feature/core/components/ui/button";
import { Input } from "../../feature/core/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../feature/core/components/ui/select";
import { Home, Clock, Star, FolderPlus, Plus } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 bg-white border-r flex flex-col shadow-sm">
        <div className="px-4 py-5 border-b flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-400 rounded-xl flex items-center justify-center text-white font-bold text-xl">
            🔥
          </div>
          <div>
            <p className="font-semibold text-lg">TorchBearer</p>
            <p className="text-xs text-gray-600">Alumni-Student Platform</p>
          </div>
          <button className="ml-auto text-gray-600 hover:text-gray-600">
            <Plus size={20} />
          </button>
        </div>

        <div className="px-4 py-3">
          <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm flex items-center gap-2 text-gray-500">
            <span className="text-lg">🔎</span>
            Search by title or topic
          </div>
        </div>

        <nav className="flex-1 px-2">
          <div className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl cursor-pointer">
            <Home size={20} />
            <span className="font-medium">Home</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl cursor-pointer">
            <Clock size={20} />
            <span className="font-medium">Recent</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl cursor-pointer">
            <Star size={20} />
            <span className="font-medium">Starred</span>
          </div>

          <div className="px-4 mt-6 mb-2 text-xs font-semibold text-gray-600 tracking-widest flex items-center justify-between">
            SPACES
            <button className="hover:text-gray-700">
              <Plus size={18} />
            </button>
          </div>
        </nav>

        <div className="p-4 border-t text-xs text-gray-900">
          <p className="font-medium text-gray-900">TorchBearer</p>
          <p>Connecting Students & Alumni</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
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
          <div className="max-w-2xl mx-auto mb-12">
            <div className="bg-[#121a2c] text-white rounded-3xl shadow-2xl p-10 relative overflow-hidden">
              <div className="absolute top-6 right-8 w-3 h-3 bg-white/10 rounded-full"></div>
              <div className="absolute top-12 left-12 w-2 h-2 bg-white/10 rounded-full"></div>
              <div className="absolute bottom-10 right-20 w-4 h-4 bg-white/10 rounded-full"></div>

              <h1 className="text-4xl font-bold text-yellow-400 text-center mb-8 tracking-tight">
                MatchMyTalent Engine
              </h1>

              <div className="space-y-8">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Select an option:
                  </label>
                  <Select defaultValue="skills-based">
                    <SelectTrigger className="bg-white text-black border-0 h-12 text-base font-medium">
                      <SelectValue placeholder="Skills-based Recommendations" />
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
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Enter Your Skills (comma-seperated):
                  </label>
                  <Input
                    defaultValue="e.g., Python, JavaScript, SQL"
                    placeholder="e.g., Python, JavaScript, SQL"
                    className="bg-[#f1f5f9] text-black border-0 h-12 text-base placeholder:text-gray-400"
                  />
                </div>

                <Button
                  size="lg"
                  className="w-full bg-yellow-400 hover:bg-yellow-300 text-black text-xl font-semibold py-8 rounded-2xl shadow-md"
                >
                  Get Recommendations
                </Button>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Spaces in this team</h2>
              <div className="flex items-center gap-4">
                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All spaces</SelectItem>
                    <SelectItem value="my">My spaces</SelectItem>
                    <SelectItem value="joined">Joined spaces</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="anyone">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Owned by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anyone">Owned by anyone</SelectItem>
                    <SelectItem value="me">Owned by me</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="last-opened">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last-opened">Last opened</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>

                <Button className="bg-blue-600 hover:bg-blue-700">
                  + Create a new space
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border">
              <div className="grid grid-cols-11 gap-4 px-6 py-4 border-b text-sm font-medium text-gray-500">
                <div className="col-span-5">Name</div>
                <div className="col-span-2">Online users</div>
                <div className="col-span-3">Last opened</div>
                <div className="col-span-1">Owner</div>
              </div>

              <div className="grid grid-cols-11 gap-4 px-6 py-5 items-center border-b hover:bg-gray-50">
                <div className="col-span-5 flex items-center gap-3">
                  <FolderPlus size={22} className="text-blue-600" />
                  <div>
                    <p className="font-medium">General Mentorship Space</p>
                    <p className="text-xs text-gray-400">
                      For all students and alumni
                    </p>
                  </div>
                </div>
                <div className="col-span-2 text-green-600 font-medium">
                  12 online
                </div>
                <div className="col-span-3 text-gray-600 text-sm">Just now</div>
                <div className="col-span-1 flex items-center gap-2">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    Admin
                  </span>
                </div>
              </div>
            </div>
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
