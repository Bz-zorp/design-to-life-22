import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Search } from "lucide-react";

type Reservation = {
  id: string;
  booking_id: string;
  patient_name: string;
  check_in_date: string;
  check_out_date: string | null;
  status: string;
  hospital_bed_id: string;
  created_at: string;
  hospital_name?: string;
};

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  cancelled: "bg-destructive/10 text-destructive",
};

const AdminReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    // Fetch reservations with joined hospital_beds to get hospital_name
    const { data: resData } = await supabase
      .from("bed_reservations")
      .select("*, hospital_beds(hospital_name)")
      .order("created_at", { ascending: false });

    const formatted = (resData || []).map((r: Record<string, unknown>) => ({
      ...r,
      hospital_name: (r.hospital_beds as { hospital_name?: string } | null)?.hospital_name || "—",
    })) as Reservation[];

    setReservations(formatted);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("bed_reservations").update({ status }).eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: `Status updated to ${status}` });
    load();
  };

  const filtered = reservations.filter((r) => {
    const matchSearch =
      r.patient_name.toLowerCase().includes(search.toLowerCase()) ||
      r.booking_id.toLowerCase().includes(search.toLowerCase()) ||
      (r.hospital_name || "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || r.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-foreground">All Reservations</h1>
        <div className="flex gap-2 flex-wrap">
          {["all", "pending", "confirmed", "cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors border ${
                filter === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:bg-accent/50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Search by patient, booking ID or hospital..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="medical-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Hospital</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead>Check-out</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <TableCell key={j}><div className="h-4 bg-muted animate-pulse rounded w-24" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No reservations found</TableCell></TableRow>
            ) : (
              filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.booking_id}</TableCell>
                  <TableCell className="font-medium">{r.patient_name}</TableCell>
                  <TableCell>{r.hospital_name}</TableCell>
                  <TableCell>{r.check_in_date}</TableCell>
                  <TableCell>{r.check_out_date || "—"}</TableCell>
                  <TableCell>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[r.status] || "bg-muted text-muted-foreground"}`}>
                      {r.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    {r.status === "pending" && (
                      <Button variant="ghost" size="sm" className="text-success text-xs" onClick={() => updateStatus(r.id, "confirmed")}>
                        Confirm
                      </Button>
                    )}
                    {r.status === "confirmed" && (
                      <Button variant="ghost" size="sm" className="text-destructive text-xs" onClick={() => updateStatus(r.id, "cancelled")}>
                        Cancel
                      </Button>
                    )}
                    {r.status === "cancelled" && (
                      <Button variant="ghost" size="sm" className="text-success text-xs" onClick={() => updateStatus(r.id, "confirmed")}>
                        Reactivate
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {!loading && (
          <p className="text-xs text-muted-foreground pt-3 text-right">
            Showing {filtered.length} of {reservations.length} reservations
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminReservations;
