import { Calendar, MapPin, Plus, ArrowRight, QrCode } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";
import { useAppointments, Appointment } from "@/context/AppointmentsContext";
import { useAuth } from "@/context/AuthContext";
import { useLocation, detectSupportedCity } from "@/context/LocationContext";
import dashboardBanner from "@/assets/dashboard-banner.png";
import HealthTipsSlider from "@/components/HealthTipsSlider";

const cityCamps: Record<string, { name: string; location: string; address: string; date: string }[]> = {
  pune: [
    { name: "Free Eye Checkup Camp", location: "Vision Care Clinic (2 km away)", address: "124, MG Road, Pune", date: "28" },
    { name: "Diabetes Checkup Camp", location: "City Health Center (3 km away)", address: "Rajpath Nagar, Pune", date: "01" },
  ],
  mumbai: [
    { name: "Free Blood Donation Camp", location: "Bombay Hospital (3 km away)", address: "Marine Lines, Mumbai", date: "30" },
    { name: "Cardiac Screening Camp", location: "Hinduja Hospital (5 km away)", address: "Mahim, Mumbai", date: "03" },
  ],
  lonikalbhor: [
    { name: "Free General Health Camp", location: "Chaitanya Hospital (1 km away)", address: "Loni Kalbhor, Pune-Solapur Highway", date: "10" },
    { name: "Eye Checkup Camp", location: "Sai Hospital (0.5 km away)", address: "Near Bus Stand, Loni Kalbhor", date: "15" },
  ],
};

const cityOffers: Record<string, { discount: string; off: string; desc: string; hospital: string; valid: string }[]> = {
  pune: [
    { discount: "Get 20%", off: "OFF", desc: "on Full Body Checkup", hospital: "HealthPlus Hospital", valid: "Valid April 2024" },
    { discount: "50%", off: "OFF", desc: "Dental Checkup Packages", hospital: "Smile Dental", valid: "Valid May 3, 2024" },
  ],
  mumbai: [
    { discount: "25%", off: "OFF", desc: "Full Body Health Checkup", hospital: "Kokilaben Hospital", valid: "Valid May 15, 2024" },
    { discount: "40%", off: "OFF", desc: "Eye Care Package", hospital: "Lilavati Hospital", valid: "Valid May 10, 2024" },
  ],
  lonikalbhor: [
    { discount: "Free", off: "", desc: "Basic Health Screening", hospital: "Chaitanya Hospital", valid: "Valid May 20, 2024" },
    { discount: "20%", off: "OFF", desc: "Family Health Package", hospital: "Lifeline Hospital", valid: "Valid May 25, 2024" },
  ],
};
const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { appointments } = useAppointments();
  const locationCtx = useLocation();
  const cityKey = locationCtx.manualCity || detectSupportedCity(locationCtx.city) || "pune";
  const [detailsDialog, setDetailsDialog] = useState<Appointment | null>(null);
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  const upcomingApt = appointments.find(a => a.status === "Upcoming") || null;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Welcome + Banner */}
      <div className="relative overflow-hidden rounded-xl bg-accent/40 dark:bg-accent/20 border border-border">
        <div className="relative z-10 p-5 sm:p-6 lg:p-8">
          <h1 className="text-xl sm:text-2xl lg:text-[28px] font-bold text-foreground">Welcome, {displayName}!</h1>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">Book and manage your appointments easily.</p>
        </div>
        <img src={dashboardBanner} alt="" className="absolute right-0 top-0 h-full object-contain opacity-60 hidden md:block" style={{ maxWidth: "45%" }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Upcoming Appointment */}
          <section className="medical-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm sm:text-base font-bold text-foreground">Your Upcoming Appointment</h2>
              <Link to="/appointments" className="text-xs sm:text-sm font-medium text-primary hover:underline">View All</Link>
            </div>
            {upcomingApt ? (
              <div className="p-3 sm:p-4 rounded-xl border border-border bg-card">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-12 w-12 sm:h-14 sm:w-14 border-2 border-accent">
                      <AvatarImage src={upcomingApt.img} />
                      <AvatarFallback>{upcomingApt.doctor.split(" ")[1]?.[0] || upcomingApt.doctor[0]}</AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-success border-2 border-card" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground text-sm sm:text-[15px]">{upcomingApt.doctor}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{upcomingApt.specialty}</p>
                    <div className="flex items-center gap-1.5 mt-1.5 text-xs sm:text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 text-primary" />{upcomingApt.hospital}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 sm:mt-4 pt-3 border-t border-border text-xs sm:text-sm text-foreground">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{upcomingApt.date} | {upcomingApt.time}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-3 sm:mt-4 pt-3 border-t border-border gap-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <QrCode className="h-5 w-5" />
                    <div>
                      <p className="text-[11px]">Appointment ID</p>
                      <p className="text-xs sm:text-sm font-semibold text-foreground">{upcomingApt.id}</p>
                    </div>
                  </div>
                  <Button size="sm" className="medical-gradient border-0 px-4 sm:px-5" onClick={() => setDetailsDialog(upcomingApt)}>
                    View Details
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-xl border border-border bg-card text-center">
                <p className="text-sm text-muted-foreground">No upcoming appointments.</p>
                <Button size="sm" className="medical-gradient border-0 mt-3" onClick={() => navigate("/doctors")}>Book Now</Button>
              </div>
            )}
          </section>

          {/* Quick Actions */}
          <section className="medical-card">
            <h2 className="text-sm sm:text-base font-bold text-foreground mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Book Appointment", icon: "🩺", path: "/doctors" },
                { label: "My Records", icon: "📋", path: "/records" },
                { label: "Find Hospital", icon: "🏥", path: "/hospitals" },
                { label: "Health Camps", icon: "⛺", path: "/health-camps" },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="p-3 sm:p-4 rounded-xl border border-border bg-accent/20 text-center hover:bg-accent/40 transition-colors"
                >
                  <span className="text-2xl">{action.icon}</span>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5 font-medium">{action.label}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Health Tips - Sliding */}
          <HealthTipsSlider />
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Nearby Health Camps */}
          <section className="medical-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm sm:text-base font-bold text-foreground">Nearby Health Camps</h2>
              <Link to="/health-camps" className="text-xs sm:text-sm font-medium text-primary hover:underline flex items-center gap-1">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="space-y-4">
              {[
                { name: "Free Eye Checkup Camp", location: "Vision Care Clinic (2 km away)", address: "124, MG Road, Pune", date: "28" },
                { name: "Diabetes Checkup Camp", location: "City Health Center (3 km away)", address: "City Health Center", date: "01" },
              ].map((camp) => (
                <div key={camp.name} className="p-3 rounded-xl border border-border bg-card">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 text-center">
                      <span className="badge-free text-[10px]">Free</span>
                      <div className="mt-1.5 h-9 w-9 sm:h-10 sm:w-10 rounded-lg border border-border flex items-center justify-center">
                        <span className="text-base sm:text-lg font-bold text-foreground">{camp.date}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm text-foreground leading-tight">{camp.name}</h4>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{camp.location}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-primary" /> {camp.address}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:mt-3 text-right">
                    <Button size="sm" className="medical-gradient border-0 text-xs h-7 sm:h-8 px-3 sm:px-4" onClick={() => navigate("/health-camps")}>
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Current Offers */}
          <section className="medical-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm sm:text-base font-bold text-foreground">Current Offers</h2>
              <Link to="/offers" className="text-xs sm:text-sm font-medium text-primary hover:underline flex items-center gap-1">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { discount: "Get 20%", off: "OFF", desc: "on Full Body Checkup", hospital: "HealthPlus Hospital", valid: "Valid April 2024" },
                { discount: "50%", off: "OFF", desc: "Dental Checkup Packages", hospital: "Smile Dental", valid: "Valid May 3, 2024" },
              ].map((offer) => (
                <button key={offer.desc} className="p-2.5 sm:p-3 rounded-xl border border-border bg-card text-left hover:bg-accent/20 transition-colors" onClick={() => navigate("/offers")}>
                  <div className="flex items-center gap-1">
                    <span className="badge-discount text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5">{offer.discount}</span>
                    <span className="text-xs sm:text-sm font-bold text-foreground">{offer.off}</span>
                  </div>
                  <p className="font-semibold text-[10px] sm:text-xs text-foreground mt-1.5 leading-tight">{offer.desc}</p>
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                    <MapPin className="h-2.5 w-2.5" />{offer.hospital}
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">{offer.valid}</p>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Appointment Details Dialog */}
      {detailsDialog && (
        <Dialog open={true} onOpenChange={() => setDetailsDialog(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Appointment Details</DialogTitle>
              <DialogDescription>Details for {detailsDialog.id}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-accent">
                  <AvatarImage src={detailsDialog.img} />
                  <AvatarFallback>{detailsDialog.doctor.split(" ")[1]?.[0] || detailsDialog.doctor[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-foreground text-lg">{detailsDialog.doctor}</h3>
                  <p className="text-sm text-muted-foreground">{detailsDialog.specialty}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-accent/30 border border-border">
                  <p className="text-xs text-muted-foreground">Date & Time</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{detailsDialog.date}</p>
                  <p className="text-sm text-foreground">{detailsDialog.time}</p>
                </div>
                <div className="p-3 rounded-xl bg-accent/30 border border-border">
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{detailsDialog.hospital}</p>
                </div>
                <div className="p-3 rounded-xl bg-accent/30 border border-border">
                  <p className="text-xs text-muted-foreground">Appointment ID</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{detailsDialog.id}</p>
                </div>
                <div className="p-3 rounded-xl bg-accent/30 border border-border">
                  <p className="text-xs text-muted-foreground">Fee</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{detailsDialog.fee}</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Dashboard;
