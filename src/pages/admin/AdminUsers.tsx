import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, ShieldOff, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  gender: string | null;
  created_at: string;
};

type Role = { user_id: string; role: string };

const AdminUsers = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    const [p, r] = await Promise.all([
      supabase.from("profiles").select("id, full_name, phone, city, gender, created_at").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    setProfiles(p.data || []);
    setRoles(r.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const isUserAdmin = (uid: string) => roles.some((r) => r.user_id === uid && r.role === "admin");

  const toggleAdmin = async (uid: string) => {
    if (isUserAdmin(uid)) {
      await supabase.from("user_roles").delete().eq("user_id", uid).eq("role", "admin");
      toast({ title: "Admin role removed" });
    } else {
      await supabase.from("user_roles").insert({ user_id: uid, role: "admin" } as never);
      toast({ title: "Admin role granted" });
    }
    load();
  };

  const filtered = profiles.filter((p) => {
    const name = (p.full_name || "").toLowerCase();
    const city = (p.city || "").toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || city.includes(q);
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Manage Users</h1>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Search by name or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="medical-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <TableCell key={j}><div className="h-4 bg-muted animate-pulse rounded w-20" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No users found</TableCell></TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.full_name || "—"}</TableCell>
                  <TableCell>{p.phone || "—"}</TableCell>
                  <TableCell>{p.city || "—"}</TableCell>
                  <TableCell className="capitalize">{p.gender || "—"}</TableCell>
                  <TableCell>{new Date(p.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {isUserAdmin(p.id) ? (
                      <span className="text-xs font-semibold bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">Admin</span>
                    ) : (
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">User</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => toggleAdmin(p.id)}>
                      {isUserAdmin(p.id) ? (
                        <><ShieldOff className="h-4 w-4 mr-1 text-destructive" /> Revoke</>
                      ) : (
                        <><Shield className="h-4 w-4 mr-1 text-primary" /> Make Admin</>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {!loading && (
          <p className="text-xs text-muted-foreground pt-3 text-right">
            Showing {filtered.length} of {profiles.length} users
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
