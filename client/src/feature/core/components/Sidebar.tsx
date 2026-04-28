import { Plus, Home, Clock, Star } from "lucide-react";

export default function Sidebar() {
  return (
    <div className="w-64 bg-white border-r flex flex-col shadow-sm h-screen">
      {/* Logo Section */}
      <div className="px-4 py-5 border-b flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-400 rounded-xl flex items-center justify-center text-white font-bold text-xl">
          🔥
        </div>

        <div>
          <p className="font-semibold text-lg">TorchBearer</p>
          <p className="text-xs text-gray-600">
            Alumni-Student Platform
          </p>
        </div>

        <button className="ml-auto text-gray-600 hover:text-gray-800">
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
        <p className="font-medium">TorchBearer</p>
        <p>Connecting Students & Alumni</p>
      </div>
    </div>
  );
}