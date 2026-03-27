import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home, Calendar, Stethoscope, Building2, FileText,
  MapPin, Tag, User, Headphones, LogOut, Menu, X, ChevronDown, BedDouble, Shield
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { useRole } from "@/hooks/useRole";

const navItems = [
  { label: "Dashboard", icon: Home, path: "/" },
  { label: "My Appointments", icon: Calendar, path: "/appointments" },
  { label: "Doctors", icon: Stethoscope, path: "/doctors" },
  { label: "Hospitals", icon: Building2, path: "/hospitals" },
  { label: "Reservations", icon: BedDouble, path: "/reservations" },
  { label: "Medical Records", icon: FileText, path: "/records" },
  { label: "Health Camps", icon: MapPin, path: "/health-camps" },
  { label: "Offers", icon: Tag, path: "/offers" },
  { label: "My Profile", icon: User, path: "/profile" },
  { label: "Support", icon: Headphones, path: "/support" },
];

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin } = useRole();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    setMobileOpen(false);
    navigate("/login");
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const initials = displayName.charAt(0).toUpperCase();
  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-card border border-border lg:hidden"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <Menu className="h-5 w-5 text-foreground" />
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-[220px] bg-card flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ borderRight: "1px solid hsl(var(--border))" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 h-[65px] border-b border-border">
          <img
            src="/logo.png"
            alt="HealthSpherea Logo"
            className="h-10 w-10 object-contain"
          />
          <span className="text-lg font-bold text-foreground">HealthSpherea</span>
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto lg:hidden"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                  isActive
                    ? "bg-accent text-primary font-semibold"
                    : "text-sidebar-foreground hover:bg-accent/50"
                }`}
              >
                <item.icon className={`h-[16px] w-[16px] ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Admin + Logout */}
        <div className="px-3 pb-2 space-y-0.5">
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-warning hover:bg-warning/10 w-full transition-colors"
            >
              <Shield className="h-4 w-4" />
              Admin Panel
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-destructive hover:bg-destructive/10 w-full transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>

        {/* User */}
        <div className="px-4 py-3 border-t border-border">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-9 w-9 border-2 border-primary/20">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
              {isAdmin ? (
                <span className="text-[10px] font-bold text-destructive flex items-center gap-0.5">
                  <Shield className="h-2.5 w-2.5" /> Admin
                </span>
              ) : (
                <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
              )}
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
