import { useEffect, useState } from "react";
import { Building2, Stethoscope, Users, BedDouble, Activity, Calendar, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

type RecentReservation = {
  id: string;
  booking_id: string;
  patient_name: string;
  status: string;
  check_in_date: string;
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({ hospitals: 0, doctors: 0, users: 0, reservations: 0, appointments: 0 });
  const [recent, setRecent] = useState<RecentReservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [beds, docs, profiles, reservations, appointments, recentRes] = await Promise.all([
        supabase.from("hospital_beds").select("hospital_name", { count: "exact" }),
        supabase.from("doctors").select("id", { count: "exact" }),
        supabase.from("profiles").select("id", { count: "exact" }),
        supabase.from("bed_reservations").select("id", { count: "exact" }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any).from("appointments").select("id", { count: "exact" }),
        supabase.from("bed_reservations").select("id, booking_id, patient_name, status, check_in_date").order("created_at", { ascending: false }).limit(5),
      ]);
      const uniqueHospitals = new Set((beds.data || []).map((b) => b.hospital_name));
      setStats({
        hospitals: uniqueHospitals.size,
        doctors: docs.count || 0,
        users: profiles.count || 0,
        reservations: reservations.count || 0,
        appointments: appointments.count || 0,
      });
      setRecent((recentRes.data as RecentReservation[]) || []);
      setLoading(false);
    };
    load();
  }, []);

  const cards = [
    { label: "Hospitals", value: stats.hospitals, icon: Building2, color: "text-primary", bg: "bg-primary/10", path: "/admin/hospitals" },
    { label: "Doctors", value: stats.doctors, icon: Stethoscope, color: "text-success", bg: "bg-success/10", path: "/admin/doctors" },
    { label: "Users", value: stats.users, icon: Users, color: "text-warning", bg: "bg-warning/10", path: "/admin/users" },
    { label: "Reservations", value: stats.reservations, icon: BedDouble, color: "text-destructive", bg: "bg-destructive/10", path: "/admin/reservations" },
    { label: "Appointments", value: stats.appointments, icon: Calendar, color: "text-primary", bg: "bg-primary/10", path: "/admin/appointments" },
  ];

  const STATUS_COLORS: Record<string, string> = {
    confirmed: "bg-success/10 text-success",
    pending: "bg-warning/10 text-warning",
    cancelled: "bg-destructive/10 text-destructive",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Admin Overview</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((c) => (
          <Link key={c.label} to={c.path} className="medical-card flex items-center gap-4 group hover:border-primary/30 transition-colors">
            <div className={`h-12 w-12 rounded-xl ${c.bg} flex items-center justify-center ${c.color} flex-shrink-0`}>
              <c.icon className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-foreground">
                {loading ? <span className="h-7 w-10 bg-muted animate-pulse rounded block" /> : c.value}
              </p>
              <p className="text-sm text-muted-foreground">{c.label}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reservations */}
        <div className="medical-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BedDouble className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Recent Reservations</h2>
            </div>
            <Link to="/admin/reservations" className="text-xs text-primary hover:underline font-medium">View all →</Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No reservations yet</p>
          ) : (
            <div className="space-y-2">
              {recent.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.patient_name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{r.booking_id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{r.check_in_date}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[r.status] || "bg-muted text-muted-foreground"}`}>
                      {r.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="medical-card">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Add Doctor", path: "/admin/doctors", icon: Stethoscope, color: "text-success" },
              { label: "Add Hospital Ward", path: "/admin/hospitals", icon: Building2, color: "text-primary" },
              { label: "Manage Users", path: "/admin/users", icon: Users, color: "text-warning" },
              { label: "View Appointments", path: "/admin/appointments", icon: Calendar, color: "text-primary" },
              { label: "All Reservations", path: "/admin/reservations", icon: BedDouble, color: "text-destructive" },
            ].map((action) => (
              <Link
                key={action.label}
                to={action.path}
                className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-accent/50 transition-colors group"
              >
                <action.icon className={`h-5 w-5 ${action.color}`} />
                <span className="text-sm font-medium text-foreground">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
