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
    <div className="w-64 bg-white border-r flex flex-col h-screen">
      {/* Logo Section */}
      <div className="px-5 py-6 border-b">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">T</span>
          </div>
          <span className="font-semibold text-gray-900">TorchBearer</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4">
        <div className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer transition-colors">
          <Home size={20} />
          <span className="text-sm font-medium">Home</span>
        </div>

        <div className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer transition-colors">
          <Clock size={20} />
          <span className="text-sm font-medium">Recent</span>
        </div>

        <div className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer transition-colors">
          <Star size={20} />
          <span className="text-sm font-medium">Starred</span>
        </div>

        <div className="px-3 mt-6 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Spaces
        </div>
      </nav>

      {/* User Profile Section */}
      <div className="border-t">
        {/* Collapsible Menu */}
        {isMenuOpen && (
          <div className="px-3 py-3 space-y-1 border-b bg-gray-50">
            <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-white rounded-md cursor-pointer transition-colors">
              <User size={18} />
              <span className="text-sm font-medium">Profile</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-white rounded-md cursor-pointer transition-colors"
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">Log out</span>
            </button>
          </div>
        )}

        {/* User Info - Clickable */}
        {user && (
          <button
            onClick={toggleMenu}
            className="w-full px-4 py-3.5 flex items-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <Avatar name={user.name} avatarUrl={user.avatar} size="md" />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
            <ChevronRight
              size={16}
              className={`text-gray-400 transition-transform ${isMenuOpen ? "rotate-90" : ""
                }`}
            />
          </button>
        )}
      </div>
    </div>
  );
}