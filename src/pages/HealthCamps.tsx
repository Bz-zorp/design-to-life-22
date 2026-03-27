import { useState } from "react";
import { MapPin, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import LeafletMap from "@/components/LeafletMap";
import LocationGate from "@/components/LocationGate";

const puneCamps = [
  { name: "Free Eye Checkup Camp", date: "April 28, 2024", day: "28", location: "Vision Care Clinic", distance: "2 km away", address: "124, MG Road, Pune", free: true, lat: 18.525, lng: 73.870 },
  { name: "Diabetes Checkup Camp", date: "May 1, 2024", day: "01", location: "City Health Center", distance: "5 km away", address: "Rajpath Nagar, Pune", free: false, price: "₹50", lat: 18.515, lng: 73.855 },
  { name: "General Health Camp", date: "May 5, 2024", day: "05", location: "Greenfield Hospital", distance: "3.5 km away", address: "456, FC Road, Pune", free: true, lat: 18.535, lng: 73.840 },
];

const mumbaiCamps = [
  { name: "Free Blood Donation Camp", date: "April 30, 2024", day: "30", location: "Bombay Hospital", distance: "3 km away", address: "Marine Lines, Mumbai", free: true, lat: 18.943, lng: 72.828 },
  { name: "Cardiac Screening Camp", date: "May 3, 2024", day: "03", location: "Hinduja Hospital", distance: "5 km away", address: "Mahim, Mumbai", free: false, price: "₹100", lat: 19.034, lng: 72.840 },
];

const loniKalbhorCamps = [
  { name: "Free General Health Camp", date: "May 10, 2024", day: "10", location: "Chaitanya Hospital", distance: "1 km away", address: "Loni Kalbhor, Pune-Solapur Highway", free: true, lat: 18.440, lng: 73.985 },
  { name: "Eye Checkup Camp", date: "May 15, 2024", day: "15", location: "Sai Hospital", distance: "0.5 km away", address: "Near Bus Stand, Loni Kalbhor", free: true, lat: 18.442, lng: 73.987 },
];

type Camp = typeof puneCamps[0];

const CITY_CAMPS: Record<string, { camps: Camp[]; center: [number, number]; label: string }> = {
  pune: { camps: puneCamps, center: [18.525, 73.855], label: "Pune" },
  mumbai: { camps: mumbaiCamps, center: [19.076, 72.877], label: "Mumbai" },
  lonikalbhor: { camps: loniKalbhorCamps, center: [18.441, 73.985], label: "Loni Kalbhor" },
};

const HealthCampsContent = ({ cityKey }: { cityKey: string }) => {
  const config = CITY_CAMPS[cityKey];
  const camps = config.camps;
  const [filter, setFilter] = useState("All");
  const [registerDialog, setRegisterDialog] = useState<Camp | null>(null);
  const [showMap, setShowMap] = useState(false);

  const filtered = filter === "All" ? camps : camps.filter(c => filter === "Free" ? c.free : !c.free);

  const handleRegister = (camp: Camp) => {
    setRegisterDialog(null);
    toast({ title: "Registration Successful!", description: `You've registered for ${camp.name}.` });
  };

  const markers = filtered.map(c => ({ lat: c.lat, lng: c.lng, label: c.name }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Health Camps in {config.label}</h1>
        <div className="flex items-center gap-2">
          <div className="flex bg-card rounded-lg border border-border overflow-hidden">
            {["All", "Free", "Paid"].map((f, i) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 sm:px-4 py-2 text-sm font-medium transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent/50"} ${i > 0 ? "border-l border-border" : ""}`}>{f}</button>
            ))}
          </div>
          <Button size="sm" variant={showMap ? "default" : "outline"} className={`lg:hidden ${showMap ? "medical-gradient border-0" : ""}`} onClick={() => setShowMap(!showMap)}>
            <Map className="h-4 w-4 mr-1" /> {showMap ? "Hide Map" : "Map"}
          </Button>
        </div>
      </div>

      {showMap && (
        <div className="lg:hidden rounded-xl border border-border overflow-hidden h-[300px]" style={{ boxShadow: "var(--shadow-card)" }}>
          <LeafletMap markers={markers} center={config.center} zoom={14} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-4 order-1 lg:order-2">
          {filtered.map((camp) => (
            <div key={camp.name} className="medical-card">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="text-center flex-shrink-0">
                  <span className={camp.free ? "badge-free" : "badge-paid"}>{camp.free ? "Free" : "Paid"}</span>
                  <div className="mt-2 h-10 w-10 sm:h-12 sm:w-12 rounded-lg border border-border flex items-center justify-center bg-card">
                    <span className="text-lg sm:text-xl font-bold text-foreground">{camp.day}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground text-sm sm:text-[15px]">{camp.name}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{camp.date}</p>
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs sm:text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    <span className="truncate">{camp.location} · {camp.distance}</span>
                  </div>
                  <p className="text-xs text-muted-foreground ml-5 mt-0.5 hidden sm:block">{camp.address}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                <button className="text-sm text-primary font-medium hover:underline flex items-center gap-1" onClick={() => setRegisterDialog(camp)}>📋 Register</button>
                <div className="flex items-center gap-3">
                  {camp.price && <span className="text-sm font-semibold text-foreground">{camp.price}</span>}
                  <Button size="sm" className="medical-gradient border-0 px-4 sm:px-5" onClick={() => setRegisterDialog(camp)}>Register</Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden lg:block rounded-xl border border-border overflow-hidden min-h-[520px] order-2 lg:order-1 lg:sticky lg:top-[80px]" style={{ boxShadow: "var(--shadow-card)" }}>
          <LeafletMap markers={markers} center={config.center} zoom={14} />
        </div>
      </div>

      {registerDialog && (
        <Dialog open={true} onOpenChange={() => setRegisterDialog(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Register for Camp</DialogTitle>
              <DialogDescription>{registerDialog.name} on {registerDialog.date}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                {registerDialog.location}, {registerDialog.address}
              </div>
              {registerDialog.price && (
                <div className="p-3 rounded-lg bg-accent/30 border border-border">
                  <span className="text-sm text-muted-foreground">Registration Fee: </span>
                  <span className="text-lg font-bold text-foreground">{registerDialog.price}</span>
                </div>
              )}
              {registerDialog.free && (
                <p className="text-sm text-success font-medium">✓ This is a free camp — no registration fee!</p>
              )}
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setRegisterDialog(null)}>Cancel</Button>
              <Button className="medical-gradient border-0" onClick={() => handleRegister(registerDialog)}>Confirm Registration</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

const HealthCamps = () => (
  <LocationGate section="Health Camps">
    {(cityKey) => <HealthCampsContent cityKey={cityKey} />}
  </LocationGate>
);

export default HealthCamps;
