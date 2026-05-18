import {
  LayoutDashboard,
  ChevronDown,
  ChevronRight,
  User,
  LogOut,
  Users,
  MessageSquare,
  Layers,
  BookOpen,
  Settings,
  UserPlus,
  FolderPlus,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { logoutUser } from "../../../store/Slice/authSlice";
import { useNavigate, useLocation } from "react-router";
import { useState } from "react";
import { Avatar } from "./ui/avatar";
import { FaShieldAlt } from "react-icons/fa";

interface SubMenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface MenuItem {
  label: string;
  path?: string;
  icon: React.ReactNode;
  subItems?: SubMenuItem[];
}

export default function AdminSidebar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["Dashboard", "Features", "Management"]);

  const menuItems: MenuItem[] = [
    {
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      subItems: [
        {
          label: "Overview",
          path: "/admin/dashboard",
          icon: <LayoutDashboard size={18} />,
        },
      ],
    },
    {
      label: "Features",
      icon: <Layers size={20} />,
      subItems: [
        {
          label: "Spaces List",
          path: "/admin/spaces",
          icon: <Layers size={18} />,
        },
        {
          label: "Topics List",
          path: "/admin/topics",
          icon: <BookOpen size={18} />,
        },
        {
          label: "Posts List",
          path: "/admin/posts",
          icon: <MessageSquare size={18} />,
        },
        {
          label: "Users List",
          path: "/admin/users",
          icon: <Users size={18} />,
        },
      ],
    },
    {
      label: "Management",
      icon: <Settings size={20} />,
      subItems: [
        {
          label: "Create Space",
          path: "/admin/create-space",
          icon: <FolderPlus size={18} />,
        },
        {
          label: "Admit Users",
          path: "/admin/admit-users",
          icon: <UserPlus size={18} />,
        },
      ],
    },
  ];

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate("/admin/login");
    } catch (error) {
      navigate("/admin/login");
    }
    setIsUserMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Logo Section */}
      <div className="px-5 py-6 border-b border-gray-200">
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
            <FaShieldAlt className="text-white text-sm" />
          </div>
          <div>
            <span className="font-semibold text-gray-900 block">Admin Portal</span>
            <span className="text-xs text-gray-500">TorchBearer</span>
          </div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {menuItems.map((item) => (
          <div key={item.label} className="mb-2">
            {/* Main Menu Item */}
            <button
              onClick={() => {
                if (item.subItems) {
                  toggleMenu(item.label);
                } else if (item.path) {
                  navigate(item.path);
                }
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              {item.subItems && (
                expandedMenus.includes(item.label) ? (
                  <ChevronDown size={16} className="text-gray-500" />
                ) : (
                  <ChevronRight size={16} className="text-gray-500" />
                )
              )}
            </button>

            {/* Sub Menu Items */}
            {item.subItems && expandedMenus.includes(item.label) && (
              <div className="ml-4 mt-1 space-y-1">
                {item.subItems.map((subItem) => (
                  <button
                    key={subItem.path}
                    onClick={() => navigate(subItem.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${isActive(subItem.path)
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                  >
                    {subItem.icon}
                    <span className="text-sm">{subItem.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User Profile Section */}
      <div className="border-t border-gray-200">
        {/* Collapsible Menu */}
        {isUserMenuOpen && (
          <div className="px-3 py-3 space-y-1 border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => {
                navigate("/profile");
                setIsUserMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-white rounded-md cursor-pointer transition-colors"
            >
              <User size={18} />
              <span className="text-sm font-medium">Profile</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-white rounded-md cursor-pointer transition-colors"
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">Log out</span>
            </button>
          </div>
        )}

        {/* User Info - Clickable */}
        {user && (
          <button
            onClick={toggleUserMenu}
            className="w-full px-4 py-3.5 flex items-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <Avatar name={user.name} avatarUrl={user.avatar} size="md" />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-blue-600 capitalize font-medium">
                {user.role}
              </p>
            </div>
            <ChevronRight
              size={16}
              className={`text-gray-400 transition-transform ${isUserMenuOpen ? "rotate-90" : ""
                }`}
            />
          </button>
        )}
      </div>
    </div>
  );
}
