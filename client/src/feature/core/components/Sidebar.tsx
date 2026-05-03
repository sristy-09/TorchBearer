import { Plus, Home, Clock, Star, User, LogOut, ChevronRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { logoutUser } from "../../../store/Slice/authSlice";
import { useNavigate } from "react-router";
import { useState } from "react";
import { Avatar } from "./ui/avatar";

export default function Sidebar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate("/login");
    } catch (error) {
      // Even if server logout fails, we still navigate to login
      // because the local state is cleared
      navigate("/login");
    }
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

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

      {/* User Profile Section */}
      <div className="border-t">
        {/* Collapsible Menu */}
        {isMenuOpen && (
          <div className="px-2 py-3 space-y-1 border-b">
            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
              <User size={18} />
              <span className="font-medium text-sm">Profile</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
            >
              <LogOut size={18} />
              <span className="font-medium text-sm">Log out</span>
            </button>
          </div>
        )}

        {/* User Info - Clickable */}
        {user && (
          <button
            onClick={toggleMenu}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
          >
            <Avatar name={user.name} avatarUrl={user.avatar} size="md" />
            <div className="flex-1 min-w-0 text-left">
              <p className="font-medium text-sm text-gray-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-600 capitalize">{user.role}</p>
            </div>
            <ChevronRight
              size={18}
              className={`text-gray-400 transition-transform ${isMenuOpen ? "rotate-90" : ""
                }`}
            />
          </button>
        )}
      </div>
    </div>
  );
}