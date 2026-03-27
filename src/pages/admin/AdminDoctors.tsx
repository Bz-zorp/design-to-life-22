import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  reviews: string;
  hospital: string;
  address: string;
  city: string;
  fee: string;
  img: string;
  is_active: boolean;
};

const emptyDoc: Omit<Doctor, "id"> = {
  name: "", specialty: "", experience: "", rating: 4.0, reviews: "0",
  hospital: "", address: "", city: "", fee: "", img: "", is_active: true,
};

const AdminDoctors = () => {
  const [docs, setDocs] = useState<Doctor[]>([]);
  const [editing, setEditing] = useState<Partial<Doctor> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("doctors").select("*").order("name");
    if (error) {
      toast({ title: "Failed to load doctors", description: error.message, variant: "destructive" });
    }
    setDocs((data as Doctor[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    const { id, ...rest } = editing as Doctor;
    if (!rest.name || !rest.hospital || !rest.city) {
      toast({ title: "Fill required fields", variant: "destructive" });
      return;
    }
    if (id) {
      const { error } = await supabase.from("doctors").update(rest).eq("id", id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    } else {
      const { error } = await supabase.from("doctors").insert(rest);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    }
    toast({ title: "Saved!" });
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this doctor?")) return;
    await supabase.from("doctors").delete().eq("id", id);
    toast({ title: "Deleted" });
    load();
  };

  const toggleActive = async (doc: Doctor) => {
    await supabase.from("doctors").update({ is_active: !doc.is_active }).eq("id", doc.id);
    toast({ title: doc.is_active ? "Doctor deactivated" : "Doctor activated" });
    load();
  };

  const filtered = docs.filter((d) => {
    const matchSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty?.toLowerCase().includes(search.toLowerCase()) ||
      d.city?.toLowerCase().includes(search.toLowerCase()) ||
      d.hospital?.toLowerCase().includes(search.toLowerCase());
    const matchActive =
      filterActive === "all" ||
      (filterActive === "active" && d.is_active) ||
      (filterActive === "inactive" && !d.is_active);
    return matchSearch && matchActive;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-foreground">Manage Doctors</h1>
        <Button onClick={() => setEditing({ ...emptyDoc })} className="medical-gradient border-0">
          <Plus className="h-4 w-4 mr-1" /> Add Doctor
        </Button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search by name, specialty, city or hospital..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {(["all", "active", "inactive"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterActive(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors border ${
                filterActive === f
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:bg-accent/50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="medical-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Specialty</TableHead>
              <TableHead>Hospital</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Fee</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((__, j) => (
                    <TableCell key={j}><div className="h-4 bg-muted animate-pulse rounded w-20" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                  {search ? "No doctors match your search" : "No doctors added yet"}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((d) => (
                <TableRow key={d.id} className={!d.is_active ? "opacity-60" : ""}>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell>{d.specialty}</TableCell>
                  <TableCell>{d.hospital}</TableCell>
                  <TableCell>{d.city}</TableCell>
                  <TableCell>{d.fee}</TableCell>
                  <TableCell>⭐ {d.rating}</TableCell>
                  <TableCell>
                    <Switch
                      checked={d.is_active}
                      onCheckedChange={() => toggleActive(d)}
                    />
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => setEditing(d)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(d.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {!loading && (
          <p className="text-xs text-muted-foreground pt-3 text-right">
            Showing {filtered.length} of {docs.length} doctors
          </p>
        )}
      </div>

      {editing && (
        <Dialog open onOpenChange={() => setEditing(null)}>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing.id ? "Edit" : "Add"} Doctor</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Full Name *" value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              <Input placeholder="Specialty *" value={editing.specialty || ""} onChange={(e) => setEditing({ ...editing, specialty: e.target.value })} />
              <Input placeholder="Experience (e.g. 10 years)" value={editing.experience || ""} onChange={(e) => setEditing({ ...editing, experience: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <Input type="number" step="0.1" placeholder="Rating" value={editing.rating || 4.0} onChange={(e) => setEditing({ ...editing, rating: +e.target.value })} />
                <Input placeholder="Reviews count" value={editing.reviews || ""} onChange={(e) => setEditing({ ...editing, reviews: e.target.value })} />
              </div>
              <Input placeholder="Hospital *" value={editing.hospital || ""} onChange={(e) => setEditing({ ...editing, hospital: e.target.value })} />
              <Input placeholder="Address" value={editing.address || ""} onChange={(e) => setEditing({ ...editing, address: e.target.value })} />
              <Input placeholder="City *" value={editing.city || ""} onChange={(e) => setEditing({ ...editing, city: e.target.value })} />
              <Input placeholder="Fee (e.g. ₹500)" value={editing.fee || ""} onChange={(e) => setEditing({ ...editing, fee: e.target.value })} />
              <Input placeholder="Image URL" value={editing.img || ""} onChange={(e) => setEditing({ ...editing, img: e.target.value })} />
              <div className="flex items-center gap-2">
                <Switch checked={editing.is_active ?? true} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} />
                <Label>Active (visible to patients)</Label>
              </div>
              <Button onClick={save} className="w-full medical-gradient border-0">Save Doctor</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminDoctors;
