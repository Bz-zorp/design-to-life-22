import { useState } from "react";
import { MapPin, Star, Phone, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import LeafletMap from "@/components/LeafletMap";
import LocationGate from "@/components/LocationGate";
import { useLocation } from "@/context/LocationContext";

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface Hospital {
  name: string; address: string; rating: number; specialties: string[]; phone: string; beds: number; emergency: boolean; lat: number; lng: number;
}

const puneHospitals: Hospital[] = [
  { name: "Ruby Hall Clinic", address: "40, Sassoon Road, Pune", rating: 4.7, specialties: ["Cardiology", "Neurology", "Oncology", "Orthopedics"], phone: "+91 20 2616 3391", beds: 750, emergency: true, lat: 18.5308, lng: 73.8774 },
  { name: "Sahyadri Hospital (Deccan)", address: "30-C, Erandwane, Karve Road, Pune", rating: 4.6, specialties: ["Cardiology", "Neurosurgery", "Gastroenterology"], phone: "+91 20 6721 4444", beds: 300, emergency: true, lat: 18.5074, lng: 73.8390 },
  { name: "Jehangir Hospital", address: "32, Sassoon Road, Pune", rating: 4.5, specialties: ["General Surgery", "Cardiology", "Nephrology", "Pediatrics"], phone: "+91 20 6681 4444", beds: 350, emergency: true, lat: 18.5318, lng: 73.8786 },
  { name: "Deenanath Mangeshkar Hospital", address: "Erandwane, Near Mhatre Bridge, Pune", rating: 4.8, specialties: ["Oncology", "Organ Transplant", "Cardiology", "Neurology"], phone: "+91 20 4015 1000", beds: 800, emergency: true, lat: 18.5024, lng: 73.8300 },
  { name: "KEM Hospital", address: "Sardar Moodliar Road, Rasta Peth, Pune", rating: 4.4, specialties: ["General Medicine", "Ophthalmology", "Dermatology"], phone: "+91 20 2612 6000", beds: 500, emergency: true, lat: 18.5185, lng: 73.8654 },
  { name: "Aditya Birla Memorial Hospital", address: "Aditya Birla Hospital Road, Thergaon, Pune", rating: 4.6, specialties: ["Cardiology", "Orthopedics", "Urology", "Oncology"], phone: "+91 20 3071 7777", beds: 500, emergency: true, lat: 18.6120, lng: 73.7700 },
  { name: "Symbiosis University Hospital", address: "Lavale, Mulshi, Pune", rating: 4.3, specialties: ["General Medicine", "Pediatrics", "Gynecology"], phone: "+91 20 3911 6000", beds: 200, emergency: false, lat: 18.5530, lng: 73.7510 },
  { name: "Sassoon General Hospital", address: "Near Pune Railway Station, Pune", rating: 4.0, specialties: ["Trauma", "General Surgery", "Orthopedics", "Pediatrics"], phone: "+91 20 2612 0235", beds: 1300, emergency: true, lat: 18.5280, lng: 73.8750 },
  { name: "Poona Hospital", address: "27, Sadashiv Peth, Pune", rating: 4.2, specialties: ["General Medicine", "ENT", "Ophthalmology", "Dental"], phone: "+91 20 2445 2600", beds: 300, emergency: true, lat: 18.5150, lng: 73.8550 },
  { name: "Sancheti Hospital", address: "11/12, Thube Park, Shivajinagar, Pune", rating: 4.5, specialties: ["Orthopedics", "Joint Replacement", "Sports Medicine", "Spine Surgery"], phone: "+91 20 6600 6600", beds: 250, emergency: true, lat: 18.5370, lng: 73.8420 },
  { name: "Jupiter Hospital", address: "Eastern Express Highway, Baner, Pune", rating: 4.4, specialties: ["Cardiology", "Neurology", "Gastroenterology", "Urology"], phone: "+91 20 7148 8800", beds: 350, emergency: true, lat: 18.5600, lng: 73.7890 },
  { name: "Bharati Vidyapeeth Medical College Hospital", address: "Pune-Satara Road, Pune", rating: 4.1, specialties: ["General Medicine", "Surgery", "Pediatrics", "Gynecology"], phone: "+91 20 2437 2549", beds: 900, emergency: true, lat: 18.4800, lng: 73.8510 },
];

const mumbaiHospitals: Hospital[] = [
  { name: "Kokilaben Dhirubhai Ambani Hospital", address: "Rao Saheb Achutrao Patwardhan Marg, Andheri West, Mumbai", rating: 4.8, specialties: ["Cardiology", "Neurosurgery", "Oncology", "Organ Transplant"], phone: "+91 22 3066 6666", beds: 750, emergency: true, lat: 19.1310, lng: 72.8266 },
  { name: "Lilavati Hospital", address: "A-791, Bandra Reclamation, Bandra West, Mumbai", rating: 4.6, specialties: ["Cardiology", "Orthopedics", "Nephrology", "Gastroenterology"], phone: "+91 22 2675 1000", beds: 314, emergency: true, lat: 19.0510, lng: 72.8280 },
  { name: "Breach Candy Hospital", address: "60-A, Bhulabhai Desai Road, Mumbai", rating: 4.7, specialties: ["General Surgery", "Cardiology", "Neurology", "Oncology"], phone: "+91 22 2366 7788", beds: 200, emergency: true, lat: 18.9710, lng: 72.8050 },
  { name: "Hinduja Hospital", address: "Veer Savarkar Marg, Mahim, Mumbai", rating: 4.6, specialties: ["Cardiology", "Urology", "Pulmonology", "Endocrinology"], phone: "+91 22 2444 9199", beds: 400, emergency: true, lat: 19.0340, lng: 72.8400 },
  { name: "Nanavati Max Super Speciality Hospital", address: "S.V. Road, Vile Parle West, Mumbai", rating: 4.5, specialties: ["Cardiology", "Neurology", "Orthopedics", "Oncology"], phone: "+91 22 2626 7500", beds: 350, emergency: true, lat: 19.0990, lng: 72.8430 },
  { name: "Jaslok Hospital", address: "15, Dr. G Deshmukh Marg, Pedder Road, Mumbai", rating: 4.5, specialties: ["Cardiology", "Gastroenterology", "Nephrology", "Neurosurgery"], phone: "+91 22 6657 3333", beds: 364, emergency: true, lat: 18.9710, lng: 72.8110 },
  { name: "Bombay Hospital", address: "12, Marine Lines, Mumbai", rating: 4.4, specialties: ["General Medicine", "Cardiology", "Orthopedics", "Pediatrics"], phone: "+91 22 2206 7676", beds: 750, emergency: true, lat: 18.9430, lng: 72.8280 },
  { name: "Tata Memorial Hospital", address: "Dr. E Borges Road, Parel, Mumbai", rating: 4.8, specialties: ["Oncology", "Radiation Oncology", "Surgical Oncology"], phone: "+91 22 2417 7000", beds: 629, emergency: false, lat: 19.0040, lng: 72.8430 },
  { name: "KEM Hospital Mumbai", address: "Acharya Donde Marg, Parel, Mumbai", rating: 4.3, specialties: ["General Medicine", "Surgery", "Pediatrics", "Gynecology"], phone: "+91 22 2410 7000", beds: 1800, emergency: true, lat: 19.0030, lng: 72.8410 },
  { name: "Wockhardt Hospital", address: "1877, Dr. Anandrao Nair Marg, Mumbai Central, Mumbai", rating: 4.4, specialties: ["Cardiology", "Orthopedics", "Neurology", "Minimal Invasive Surgery"], phone: "+91 22 6178 4444", beds: 300, emergency: true, lat: 18.9690, lng: 72.8220 },
];

const loniKalbhorHospitals: Hospital[] = [
  { name: "Chaitanya Hospital", address: "Loni Kalbhor, Pune-Solapur Highway", rating: 4.3, specialties: ["General Medicine", "Pediatrics", "Gynecology", "Orthopedics"], phone: "+91 20 2691 5500", beds: 50, emergency: true, lat: 18.4400, lng: 73.9850 },
  { name: "Sai Hospital Loni Kalbhor", address: "Near Bus Stand, Loni Kalbhor", rating: 4.1, specialties: ["General Medicine", "Surgery", "ENT"], phone: "+91 20 2691 4411", beds: 30, emergency: true, lat: 18.4420, lng: 73.9870 },
  { name: "Shree Hospital", address: "Main Road, Loni Kalbhor", rating: 4.0, specialties: ["General Medicine", "Orthopedics", "Dental"], phone: "+91 20 2691 3322", beds: 25, emergency: false, lat: 18.4380, lng: 73.9830 },
  { name: "Lifeline Multispeciality Hospital", address: "Pune-Solapur Road, Loni Kalbhor", rating: 4.2, specialties: ["General Surgery", "Gynecology", "Pediatrics", "Dermatology"], phone: "+91 20 2691 6677", beds: 40, emergency: true, lat: 18.4450, lng: 73.9900 },
  { name: "Samarth Hospital", address: "Near Railway Station, Loni Kalbhor", rating: 4.0, specialties: ["General Medicine", "Ophthalmology", "Physiotherapy"], phone: "+91 20 2691 2200", beds: 20, emergency: false, lat: 18.4360, lng: 73.9810 },
  { name: "Noble Hospital (Hadapsar)", address: "Magarpatta City Road, Hadapsar (Nearest Multispeciality)", rating: 4.5, specialties: ["Cardiology", "Neurology", "Oncology", "Nephrology"], phone: "+91 20 6766 3000", beds: 350, emergency: true, lat: 18.5010, lng: 73.9370 },
  { name: "VishwaRaj Hospital", address: "Solapur Road, Near Loni Railway Station, Loni Kalbhor", rating: 4.4, specialties: ["Orthopedics", "General Surgery", "Cardiology", "Neurology", "Urology"], phone: "+91 20 4860 4860", beds: 300, emergency: true, lat: 18.4897, lng: 74.0224 },
];

const CITY_CONFIG: Record<string, { hospitals: Hospital[]; center: [number, number]; label: string }> = {
  pune: { hospitals: puneHospitals, center: [18.525, 73.855], label: "Pune" },
  mumbai: { hospitals: mumbaiHospitals, center: [19.076, 72.877], label: "Mumbai" },
  lonikalbhor: { hospitals: loniKalbhorHospitals, center: [18.441, 73.985], label: "Loni Kalbhor" },
};

const HospitalsContent = ({ cityKey }: { cityKey: string }) => {
  const location = useLocation();
  const [detailsHospital, setDetailsHospital] = useState<Hospital | null>(null);
  const [search, setSearch] = useState("");

  const config = CITY_CONFIG[cityKey];
  const userLat = location.lat!;
  const userLng = location.lng!;

  const hospitalsWithDistance = config.hospitals.map(h => ({
    ...h,
    distanceKm: haversineKm(userLat, userLng, h.lat, h.lng),
  })).sort((a, b) => a.distanceKm - b.distanceKm);

  const filtered = hospitalsWithDistance.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.specialties.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  const markers = filtered.map(h => ({ lat: h.lat, lng: h.lng, label: h.name }));

  return (
    <div className="space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-foreground">Hospitals in {config.label}</h1>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search hospitals or specialties..."
          className="w-full pl-10 pr-4 py-2.5 rounded-full bg-secondary border-none text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-xl border border-border overflow-hidden min-h-[350px] lg:min-h-[600px] lg:sticky lg:top-[80px]" style={{ boxShadow: "var(--shadow-card)" }}>
          <LeafletMap markers={markers} center={config.center} zoom={cityKey === "lonikalbhor" ? 14 : 12} />
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{filtered.length} hospitals found</p>
          {filtered.map((h) => (
            <div key={h.name} className="medical-card">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-bold text-base sm:text-lg text-foreground">{h.name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                    <span className="text-sm font-medium text-foreground">{h.rating}</span>
                    {h.emergency && (
                      <span className="ml-2 text-[11px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium">24/7 Emergency</span>
                    )}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md flex-shrink-0">
                  {h.distanceKm < 1 ? `${Math.round(h.distanceKm * 1000)} m` : `${h.distanceKm.toFixed(1)} km`}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs sm:text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" /> <span className="truncate">{h.address}</span>
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs sm:text-sm text-muted-foreground">
                <Phone className="h-3.5 w-3.5 flex-shrink-0" /> {h.phone}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {h.specialties.slice(0, 3).map((s) => (
                  <span key={s} className="text-xs px-2 py-1 rounded-md bg-accent text-accent-foreground">{s}</span>
                ))}
                {h.specialties.length > 3 && (
                  <span className="text-xs px-2 py-1 rounded-md bg-secondary text-muted-foreground">+{h.specialties.length - 3} more</span>
                )}
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground">{h.beds} beds</span>
                <Button size="sm" className="medical-gradient border-0" onClick={() => setDetailsHospital(h)}>View Details</Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {detailsHospital && (
        <Dialog open={true} onOpenChange={() => setDetailsHospital(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{detailsHospital.name}</DialogTitle>
              <DialogDescription>{detailsHospital.address}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="rounded-xl border border-border overflow-hidden h-[200px]">
                <LeafletMap markers={[{ lat: detailsHospital.lat, lng: detailsHospital.lng, label: detailsHospital.name }]} center={[detailsHospital.lat, detailsHospital.lng]} zoom={16} />
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-warning text-warning" />
                <span className="font-semibold">{detailsHospital.rating}</span>
                <span className="text-sm text-muted-foreground">rating</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-accent/30 border border-border">
                  <p className="text-xs text-muted-foreground">Distance</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">
                    {haversineKm(userLat, userLng, detailsHospital.lat, detailsHospital.lng).toFixed(1)} km away
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-accent/30 border border-border">
                  <p className="text-xs text-muted-foreground">Total Beds</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{detailsHospital.beds}</p>
                </div>
                <div className="p-3 rounded-xl bg-accent/30 border border-border">
                  <p className="text-xs text-muted-foreground">Emergency</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{detailsHospital.emergency ? "✓ Available 24/7" : "Not available"}</p>
                </div>
                <div className="p-3 rounded-xl bg-accent/30 border border-border">
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{detailsHospital.phone}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">Specialties</p>
                <div className="flex flex-wrap gap-2">
                  {detailsHospital.specialties.map((s) => (
                    <span key={s} className="text-xs px-3 py-1.5 rounded-lg bg-accent text-accent-foreground">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

const Hospitals = () => (
  <LocationGate section="Nearby Hospitals">
    {(cityKey) => <HospitalsContent cityKey={cityKey} />}
  </LocationGate>
);

export default Hospitals;
