import { useState, useEffect } from "react";
import { BedDouble, Search, Calendar, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface HospitalBed {
  id: string;
  hospital_name: string;
  city: string;
  ward_type: string;
  total_beds: number;
  occupied_beds: number;
  price_per_day: number;
}

interface Reservation {
  id: string;
  patient_name: string;
  check_in_date: string;
  check_out_date: string | null;
  status: string;
  booking_id: string;
  hospital_bed_id: string;
  hospital_beds?: { hospital_name: string; ward_type: string; city: string } | null;
}

const Reservations = () => {
  const { user } = useAuth();
  const [beds, setBeds] = useState<HospitalBed[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCity, setFilterCity] = useState("All");
  const [filterWard, setFilterWard] = useState("All");
  const [bookDialog, setBookDialog] = useState<HospitalBed | null>(null);
  const [patientName, setPatientName] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [booking, setBooking] = useState(false);
  const [activeTab, setActiveTab] = useState<"browse" | "my">("browse");

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    const [bedsRes, resRes] = await Promise.all([
      supabase.from("hospital_beds").select("*").order("hospital_name"),
      user
        ? supabase
            .from("bed_reservations")
            .select("*, hospital_beds(hospital_name, ward_type, city)")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [] }),
    ]);
    setBeds((bedsRes.data as any[]) || []);
    setReservations((resRes.data as any[]) || []);
    setLoading(false);
  };

  const cities = ["All", ...Array.from(new Set(beds.map(b => b.city)))];
  const wardTypes = ["All", ...Array.from(new Set(beds.map(b => b.ward_type)))];

  // Group beds by hospital
  const filtered = beds.filter(b => {
    const matchSearch = b.hospital_name.toLowerCase().includes(search.toLowerCase());
    const matchCity = filterCity === "All" || b.city === filterCity;
    const matchWard = filterWard === "All" || b.ward_type === filterWard;
    return matchSearch && matchCity && matchWard;
  });

  const grouped = filtered.reduce<Record<string, { city: string; wards: HospitalBed[] }>>((acc, bed) => {
    const key = `${bed.hospital_name}-${bed.city}`;
    if (!acc[key]) acc[key] = { city: bed.city, wards: [] };
    acc[key].wards.push(bed);
    return acc;
  }, {});

  const handleBook = async () => {
    if (!user || !bookDialog || !patientName.trim() || !checkInDate) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    setBooking(true);

    const bookingId = `BED-${Date.now().toString().slice(-8)}`;
    const { error } = await supabase.from("bed_reservations").insert({
      user_id: user.id,
      hospital_bed_id: bookDialog.id,
      patient_name: patientName.trim(),
      check_in_date: checkInDate,
      check_out_date: checkOutDate || null,
      booking_id: bookingId,
      status: "confirmed",
    } as any);

    if (error) {
      toast({ title: "Booking failed", description: error.message, variant: "destructive" });
    } else {
      // Update occupied beds count
      await supabase
        .from("hospital_beds")
        .update({ occupied_beds: bookDialog.occupied_beds + 1 } as any)
        .eq("id", bookDialog.id);

      toast({ title: "Bed Reserved!", description: `Booking ID: ${bookingId}` });
      setBookDialog(null);
      setPatientName("");
      setCheckInDate("");
      setCheckOutDate("");
      loadData();
    }
    setBooking(false);
  };

  const handleCancel = async (reservation: Reservation) => {
    const { error } = await supabase
      .from("bed_reservations")
      .update({ status: "cancelled" } as any)
      .eq("id", reservation.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      // Decrease occupied count
      const bed = beds.find(b => b.id === reservation.hospital_bed_id);
      if (bed && bed.occupied_beds > 0) {
        await supabase
          .from("hospital_beds")
          .update({ occupied_beds: bed.occupied_beds - 1 } as any)
          .eq("id", bed.id);
      }
      toast({ title: "Reservation Cancelled" });
      loadData();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-foreground">Bed Reservations</h1>

      {/* Tabs */}
      <div className="flex bg-card rounded-lg border border-border overflow-hidden w-fit">
        {(["browse", "my"] as const).map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 sm:px-6 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent/50"
            } ${i > 0 ? "border-l border-border" : ""}`}
          >
            {tab === "browse" ? "Browse Beds" : "My Reservations"}
          </button>
        ))}
      </div>

      {activeTab === "browse" ? (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search hospitals..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-secondary border-none text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
            <select value={filterCity} onChange={e => setFilterCity(e.target.value)} className="px-4 py-2.5 rounded-lg border border-input bg-card text-sm text-foreground">
              {cities.map(c => <option key={c} value={c}>{c === "All" ? "All Cities" : c}</option>)}
            </select>
            <select value={filterWard} onChange={e => setFilterWard(e.target.value)} className="px-4 py-2.5 rounded-lg border border-input bg-card text-sm text-foreground">
              {wardTypes.map(w => <option key={w} value={w}>{w === "All" ? "All Wards" : w}</option>)}
            </select>
          </div>

          {/* Hospital bed cards */}
          <div className="space-y-5">
            {Object.entries(grouped).map(([key, { city, wards }]) => (
              <div key={key} className="medical-card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-foreground">{wards[0].hospital_name}</h3>
                    <p className="text-xs text-muted-foreground">{city}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {wards.map(ward => {
                    const available = ward.total_beds - ward.occupied_beds;
                    const pct = Math.round((ward.occupied_beds / ward.total_beds) * 100);
                    const isLow = available <= 3;
                    return (
                      <div key={ward.id} className="p-3 rounded-xl border border-border bg-accent/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-foreground">{ward.ward_type}</span>
                          <BedDouble className={`h-4 w-4 ${isLow ? "text-destructive" : "text-primary"}`} />
                        </div>
                        {/* Progress bar */}
                        <div className="w-full h-2 rounded-full bg-secondary mb-2">
                          <div
                            className={`h-full rounded-full transition-all ${pct > 90 ? "bg-destructive" : pct > 70 ? "bg-warning" : "bg-success"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className={`font-semibold ${isLow ? "text-destructive" : "text-success"}`}>
                            {available} available
                          </span>
                          <span className="text-muted-foreground">{ward.total_beds} total</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">₹{ward.price_per_day.toLocaleString()}/day</p>
                        <Button
                          size="sm"
                          className="w-full mt-3 medical-gradient border-0"
                          disabled={available <= 0}
                          onClick={() => {
                            setBookDialog(ward);
                            setPatientName("");
                            setCheckInDate("");
                            setCheckOutDate("");
                          }}
                        >
                          {available <= 0 ? "No Beds" : "Reserve"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* My Reservations */
        <div className="space-y-4">
          {reservations.length === 0 ? (
            <div className="medical-card text-center py-12">
              <p className="text-muted-foreground">No reservations yet.</p>
              <Button size="sm" variant="outline" className="mt-3" onClick={() => setActiveTab("browse")}>Browse Beds</Button>
            </div>
          ) : (
            reservations.map(r => {
              const bedInfo = r.hospital_beds as any;
              return (
                <div key={r.id} className="medical-card">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-foreground">{bedInfo?.hospital_name || "Hospital"}</h3>
                      <p className="text-xs text-muted-foreground">{bedInfo?.ward_type} Ward · {bedInfo?.city}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      r.status === "confirmed" ? "bg-success/10 text-success" :
                      r.status === "cancelled" ? "bg-destructive/10 text-destructive" :
                      "bg-secondary text-muted-foreground"
                    }`}>
                      {r.status === "confirmed" ? <><CheckCircle className="h-3 w-3 inline mr-1" />Confirmed</> :
                       r.status === "cancelled" ? <><XCircle className="h-3 w-3 inline mr-1" />Cancelled</> :
                       r.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                    <div className="p-2 rounded-lg bg-accent/20 border border-border">
                      <p className="text-[11px] text-muted-foreground">Patient</p>
                      <p className="text-sm font-medium text-foreground">{r.patient_name}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-accent/20 border border-border">
                      <p className="text-[11px] text-muted-foreground">Check-in</p>
                      <p className="text-sm font-medium text-foreground">{r.check_in_date}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-accent/20 border border-border">
                      <p className="text-[11px] text-muted-foreground">Check-out</p>
                      <p className="text-sm font-medium text-foreground">{r.check_out_date || "—"}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-accent/20 border border-border">
                      <p className="text-[11px] text-muted-foreground">Booking ID</p>
                      <p className="text-sm font-medium text-foreground font-mono">{r.booking_id}</p>
                    </div>
                  </div>
                  {r.status === "confirmed" && (
                    <div className="mt-3 pt-3 border-t border-border flex justify-end">
                      <Button size="sm" variant="destructive" onClick={() => handleCancel(r)}>Cancel Reservation</Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Booking Dialog */}
      {bookDialog && (
        <Dialog open={true} onOpenChange={() => setBookDialog(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Reserve a Bed</DialogTitle>
              <DialogDescription>
                {bookDialog.hospital_name} · {bookDialog.ward_type} Ward
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="p-3 rounded-xl bg-accent/20 border border-border flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Available Beds</p>
                  <p className="text-lg font-bold text-success">{bookDialog.total_beds - bookDialog.occupied_beds}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Price/Day</p>
                  <p className="text-lg font-bold text-foreground">₹{bookDialog.price_per_day.toLocaleString()}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Patient Name *</label>
                <Input value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="Full name" className="h-11" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Check-in Date *</label>
                <Input type="date" value={checkInDate} onChange={e => setCheckInDate(e.target.value)} className="h-11" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Check-out Date (optional)</label>
                <Input type="date" value={checkOutDate} onChange={e => setCheckOutDate(e.target.value)} className="h-11" />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button variant="outline" onClick={() => setBookDialog(null)}>Cancel</Button>
                <Button className="medical-gradient border-0" onClick={handleBook} disabled={booking}>
                  {booking ? "Reserving..." : "Confirm Reservation"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Reservations;
