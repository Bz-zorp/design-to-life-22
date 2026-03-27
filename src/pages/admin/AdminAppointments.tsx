import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Search, Calendar } from "lucide-react";

type Appointment = {
  id: string;
  patient_id: string;
  doctor_name: string;
  doctor_specialty: string;
  date: string;
  time: string;
  type: string;
  status: string;
  notes: string | null;
  created_at: string;
  patient_name?: string;
};

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  cancelled: "bg-destructive/10 text-destructive",
  completed: "bg-primary/10 text-primary",
};

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any;
    const [apptRes, profileRes] = await Promise.all([
      sb.from("appointments").select("*").order("date", { ascending: false }),
      supabase.from("profiles").select("id, full_name"),
    ]);
    setAppointments((apptRes.data as Appointment[]) || []);
    const map: Record<string, string> = {};
    (profileRes.data || []).forEach((p: { id: string; full_name: string | null }) => {
      map[p.id] = p.full_name || "Unknown";
    });
    setProfiles(map);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("appointments").update({ status }).eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: `Status updated to ${status}` });
    load();
  };

  const filtered = appointments.filter((a) => {
    const patientName = profiles[a.patient_id] || "";
    const matchSearch =
      patientName.toLowerCase().includes(search.toLowerCase()) ||
      a.doctor_name.toLowerCase().includes(search.toLowerCase()) ||
      a.doctor_specialty?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || a.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" /> All Appointments
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          {["all", "pending", "confirmed", "completed", "cancelled"].map((s) => (
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
          placeholder="Search by patient or doctor name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="medical-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Specialty</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((__, j) => (
                    <TableCell key={j}><div className="h-4 bg-muted animate-pulse rounded w-24" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                  No appointments found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{profiles[a.patient_id] || "Unknown"}</TableCell>
                  <TableCell>{a.doctor_name}</TableCell>
                  <TableCell>{a.doctor_specialty || "—"}</TableCell>
                  <TableCell>{a.date}</TableCell>
                  <TableCell>{a.time}</TableCell>
                  <TableCell>
                    <span className="text-xs bg-secondary px-2 py-0.5 rounded-full capitalize">{a.type}</span>
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[a.status] || "bg-muted text-muted-foreground"}`}>
                      {a.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 flex-wrap">
                      {a.status === "pending" && (
                        <Button variant="ghost" size="sm" className="text-success text-xs" onClick={() => updateStatus(a.id, "confirmed")}>
                          Confirm
                        </Button>
                      )}
                      {(a.status === "pending" || a.status === "confirmed") && (
                        <Button variant="ghost" size="sm" className="text-primary text-xs" onClick={() => updateStatus(a.id, "completed")}>
                          Complete
                        </Button>
                      )}
                      {a.status !== "cancelled" && a.status !== "completed" && (
                        <Button variant="ghost" size="sm" className="text-destructive text-xs" onClick={() => updateStatus(a.id, "cancelled")}>
                          Cancel
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {!loading && (
          <p className="text-xs text-muted-foreground pt-3 text-right">
            Showing {filtered.length} of {appointments.length} appointments
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminAppointments;
