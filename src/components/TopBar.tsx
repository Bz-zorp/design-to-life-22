import { useState, useRef, useEffect } from "react";
import { Search, Bell, MessageSquare, ChevronDown, LogOut, MapPin, Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { useLocation, SUPPORTED_CITIES, detectSupportedCity } from "@/context/LocationContext";

const notifications = [
  { id: 1, title: "Appointment Reminder", message: "Your appointment with Dr. Priya Sharma is tomorrow at 10:00 AM", time: "2 hours ago", read: false },
  { id: 2, title: "Lab Results Ready", message: "Your blood test results are now available", time: "5 hours ago", read: false },
  { id: 3, title: "Health Camp Alert", message: "Free Eye Checkup Camp near you on April 28", time: "1 day ago", read: true },
];

const messages = [
  { id: 1, from: "Dr. Priya Sharma", message: "Please remember to bring your previous reports", time: "1 hour ago", avatar: "https://i.pravatar.cc/150?img=32", unread: true },
  { id: 2, from: "City Hospital", message: "Your prescription has been updated", time: "3 hours ago", avatar: "https://i.pravatar.cc/150?img=12", unread: true },
];

const TopBar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const msgRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  const currentCityKey = location.manualCity || detectSupportedCity(location.city);
  const currentCityLabel = currentCityKey ? SUPPORTED_CITIES[currentCityKey]?.label : location.city || "Select City";

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const initials = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (msgRef.current && !msgRef.current.contains(e.target as Node)) setShowMessages(false);
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) setShowCityPicker(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-card border-b border-border px-4 lg:px-6 h-[65px] flex items-center">
      <div className="flex items-center gap-4 w-full">
        <div className="w-10 lg:hidden" />

        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for doctors or hospitals..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-secondary border-none text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>
        </div>

        {/* City Selector */}
        <div ref={cityRef} className="relative">
          <button
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-secondary hover:bg-accent/50 transition-colors text-sm"
            onClick={() => { setShowCityPicker(!showCityPicker); setShowNotifications(false); setShowMessages(false); }}
          >
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span className="hidden sm:inline font-medium text-foreground truncate max-w-[100px]">{currentCityLabel}</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>
          {showCityPicker && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-card rounded-xl border border-border shadow-lg z-50 overflow-hidden">
              <div className="p-2 border-b border-border">
                <p className="text-xs font-semibold text-muted-foreground px-2">Select City</p>
              </div>
              <div className="p-1">
                {Object.entries(SUPPORTED_CITIES).map(([key, city]) => (
                  <button
                    key={key}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${currentCityKey === key ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-accent/50"}`}
                    onClick={() => { location.setManualCity(key); setShowCityPicker(false); }}
                  >
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                    {city.label}
                  </button>
                ))}
                {location.manualCity && (
                  <>
                    <div className="border-t border-border my-1" />
                    <button
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent/50 transition-colors"
                      onClick={() => { location.setManualCity(null); setShowCityPicker(false); }}
                    >
                      Use auto-detect
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-lg hover:bg-secondary transition-colors"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-warning" />
            ) : (
              <Moon className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              className="relative p-2.5 rounded-lg hover:bg-secondary transition-colors"
              onClick={() => { setShowNotifications(!showNotifications); setShowMessages(false); }}
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
            </button>
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-card rounded-xl border border-border shadow-lg z-50 overflow-hidden">
                <div className="p-3 border-b border-border flex items-center justify-between">
                  <h3 className="font-bold text-foreground text-sm">Notifications</h3>
                  <button className="text-xs text-primary font-medium hover:underline">Mark all read</button>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className={`p-3 border-b border-border hover:bg-accent/30 cursor-pointer transition-colors ${!n.read ? "bg-accent/10" : ""}`}>
                      <div className="flex items-start gap-2">
                        {!n.read && <span className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />}
                        <div className={!n.read ? "" : "ml-4"}>
                          <p className="text-sm font-medium text-foreground">{n.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                          <p className="text-[11px] text-muted-foreground mt-1">{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Messages */}
          <div ref={msgRef} className="relative">
            <button
              className="relative p-2.5 rounded-lg hover:bg-secondary transition-colors"
              onClick={() => { setShowMessages(!showMessages); setShowNotifications(false); }}
            >
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                2
              </span>
            </button>
            {showMessages && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-card rounded-xl border border-border shadow-lg z-50 overflow-hidden">
                <div className="p-3 border-b border-border">
                  <h3 className="font-bold text-foreground text-sm">Messages</h3>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {messages.map((m) => (
                    <div key={m.id} className={`p-3 border-b border-border hover:bg-accent/30 cursor-pointer transition-colors ${m.unread ? "bg-accent/10" : ""}`}>
                      <div className="flex items-start gap-3">
                        <Avatar className="h-9 w-9 flex-shrink-0">
                          <AvatarImage src={m.avatar} />
                          <AvatarFallback>{m.from[0]}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">{m.from}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{m.message}</p>
                          <p className="text-[11px] text-muted-foreground mt-1">{m.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Logout - visible on mobile */}
          <button
            onClick={handleLogout}
            className="p-2.5 rounded-lg hover:bg-destructive/10 transition-colors sm:hidden"
            title="Logout"
          >
            <LogOut className="h-5 w-5 text-destructive" />
          </button>

          <div className="hidden sm:flex items-center gap-2 ml-1 pl-2 border-l border-border">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-foreground">{displayName}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
