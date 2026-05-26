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
  Bell,
  ShieldCheck,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { logoutUser } from "../../../store/Slice/authSlice";
import { useNavigate, useLocation } from "react-router";
import { useState } from "react";
import { Avatar } from "./ui/avatar";

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
      icon: <LayoutDashboard size={18} />,
      subItems: [
        { label: "Overview", path: "/admin/dashboard", icon: <LayoutDashboard size={16} /> },
      ],
    },
    {
      label: "Features",
      icon: <Layers size={18} />,
      subItems: [
        { label: "Spaces List", path: "/admin/spaces", icon: <Layers size={16} /> },
        { label: "Topics List", path: "/admin/topics", icon: <BookOpen size={16} /> },
        { label: "Posts List", path: "/admin/posts", icon: <MessageSquare size={16} /> },
        { label: "Users List", path: "/admin/users", icon: <Users size={16} /> },
      ],
    },
    {
      label: "Management",
      icon: <Settings size={18} />,
      subItems: [
        { label: "Create Space", path: "/admin/create-space", icon: <FolderPlus size={16} /> },
        { label: "Admit Users", path: "/admin/admit-users", icon: <UserPlus size={16} /> },
        { label: "Pending Requests", path: "/admin/pending-requests", icon: <Bell size={16} /> },
      ],
    },
  ];

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate("/admin/login");
    } catch {
      navigate("/admin/login");
    }
    setIsUserMenuOpen(false);
  };

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-64 flex flex-col h-screen shrink-0"
      style={{ background: "var(--sidebar)", borderRight: "1px solid var(--sidebar-border)" }}>

      {/* Logo */}
      <div className="px-5 py-6" style={{ borderBottom: "1px solid var(--sidebar-border)" }}>
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
            style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)" }}>
            <ShieldCheck size={16} className="text-white" />
          </div>
          <div>
            <span className="font-semibold text-foreground block text-sm tracking-tight">Admin Portal</span>
            <span className="text-[11px] text-muted-foreground">TorchBearer</span>
          </div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
        {menuItems.map((item) => (
          <div key={item.label} className="mb-1">
            <button
              onClick={() => {
                if (item.subItems) toggleMenu(item.label);
                else if (item.path) navigate(item.path);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-foreground/70 hover:text-foreground transition-all"
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--sidebar-accent)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.subItems && (
                expandedMenus.includes(item.label)
                  ? <ChevronDown size={14} className="text-muted-foreground" />
                  : <ChevronRight size={14} className="text-muted-foreground" />
              )}
            </button>

            {item.subItems && expandedMenus.includes(item.label) && (
              <div className="ml-3 mt-1 space-y-0.5 pl-3" style={{ borderLeft: "2px solid var(--border)" }}>
                {item.subItems.map((subItem) => {
                  const active = isActive(subItem.path);
                  return (
                    <button
                      key={subItem.path}
                      onClick={() => navigate(subItem.path)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                        active ? "text-white font-medium shadow-sm" : "text-foreground/60 hover:text-foreground"
                      }`}
                      style={active ? { background: "var(--primary)" } : { background: "transparent" }}
                      onMouseEnter={(e) => {
                        if (!active) (e.currentTarget as HTMLElement).style.background = "var(--sidebar-accent)";
                      }}
                      onMouseLeave={(e) => {
                        if (!active) (e.currentTarget as HTMLElement).style.background = "transparent";
                      }}
                    >
                      {subItem.icon}
                      <span>{subItem.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div style={{ borderTop: "1px solid var(--sidebar-border)" }}>
        {isUserMenuOpen && (
          <div className="px-3 py-3 space-y-1" style={{ borderBottom: "1px solid var(--sidebar-border)" }}>
            <button
              onClick={() => { navigate("/profile"); setIsUserMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground/70 hover:text-foreground transition-all"
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--sidebar-accent)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <User size={17} />
              <span>Profile</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:text-red-600 transition-all"
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <LogOut size={17} />
              <span>Log out</span>
            </button>
          </div>
        )}

        {user && (
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-full px-4 py-3.5 flex items-center gap-3 transition-colors cursor-pointer"
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--sidebar-accent)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            <Avatar name={user.name} avatarUrl={user.avatar} size="md" />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
              <p className="text-xs font-medium capitalize" style={{ color: "var(--primary)" }}>{user.role}</p>
            </div>
            <ChevronRight
              size={15}
              className={`text-muted-foreground transition-transform ${isUserMenuOpen ? "rotate-90" : ""}`}
            />
          </button>
        )}
      </div>
    </div>
  );
}
