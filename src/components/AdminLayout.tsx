import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Building2, Stethoscope, Users, BedDouble,
  LogOut, ChevronLeft, Menu, X, Shield, Calendar, Moon, Sun
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { label: "Hospitals", icon: Building2, path: "/admin/hospitals" },
  { label: "Doctors", icon: Stethoscope, path: "/admin/doctors" },
  { label: "Users", icon: Users, path: "/admin/users" },
  { label: "Reservations", icon: BedDouble, path: "/admin/reservations" },
  { label: "Appointments", icon: Calendar, path: "/admin/appointments" },
];

const pageTitles: Record<string, string> = {
  "/admin": "Admin Dashboard",
  "/admin/hospitals": "Manage Hospitals",
  "/admin/doctors": "Manage Doctors",
  "/admin/users": "Manage Users",
  "/admin/reservations": "All Reservations",
  "/admin/appointments": "All Appointments",
};

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const pageTitle = pageTitles[location.pathname] || "Admin Panel";

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-card border border-border lg:hidden"
      >
        <Menu className="h-5 w-5 text-foreground" />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-[240px] bg-card flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ borderRight: "1px solid hsl(var(--border))" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 h-[65px] border-b border-border">
          <img src="/logo.png" alt="HealthSpherea Logo" className="h-9 w-9 object-contain" />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-foreground leading-tight">HealthSpherea</span>
            <span className="text-[10px] text-destructive font-semibold flex items-center gap-1">
              <Shield className="h-3 w-3" /> Admin Panel
            </span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="ml-auto lg:hidden">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                  isActive ? "bg-accent text-primary font-semibold" : "text-sidebar-foreground hover:bg-accent/50"
                }`}
              >
                <item.icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-3 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-muted-foreground hover:bg-accent/50 w-full"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Patient View
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-destructive hover:bg-destructive/10 w-full transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <div className="lg:ml-[240px] min-h-screen flex flex-col">
        <header className="h-[65px] border-b border-border bg-card flex items-center px-6 justify-between">
          <h2 className="text-lg font-semibold text-foreground ml-10 lg:ml-0">{pageTitle}</h2>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-warning" />
            ) : (
              <Moon className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        </header>
        <main className="flex-1 p-4 lg:p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
