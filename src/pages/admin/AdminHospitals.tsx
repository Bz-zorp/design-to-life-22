import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

type Bed = {
  id: string;
  hospital_name: string;
  ward_type: string;
  total_beds: number;
  occupied_beds: number;
  price_per_day: number;
  city: string;
};

const empty: Omit<Bed, "id"> = { hospital_name: "", ward_type: "General", total_beds: 10, occupied_beds: 0, price_per_day: 500, city: "" };

const getAvailabilityColor = (total: number, occupied: number) => {
  const available = total - occupied;
  if (available === 0) return "bg-destructive/10 text-destructive";
  if (available <= total * 0.3) return "bg-warning/10 text-warning";
  return "bg-success/10 text-success";
};

const AdminHospitals = () => {
  const [beds, setBeds] = useState<Bed[]>([]);
  const [editing, setEditing] = useState<Partial<Bed> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("hospital_beds").select("*").order("hospital_name");
    setBeds(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    const { id, ...rest } = editing as Bed;
    if (!rest.hospital_name || !rest.city) {
      toast({ title: "Fill required fields", variant: "destructive" });
      return;
    }
    if (id) {
      const { error } = await supabase.from("hospital_beds").update(rest).eq("id", id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    } else {
      const { error } = await supabase.from("hospital_beds").insert(rest);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    }
    toast({ title: "Saved!" });
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this record?")) return;
    await supabase.from("hospital_beds").delete().eq("id", id);
    toast({ title: "Deleted" });
    load();
  };

  const filtered = beds.filter((b) =>
    b.hospital_name.toLowerCase().includes(search.toLowerCase()) ||
    b.city.toLowerCase().includes(search.toLowerCase()) ||
    b.ward_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-foreground">Manage Hospitals & Beds</h1>
        <Button onClick={() => setEditing({ ...empty })} className="medical-gradient border-0">
          <Plus className="h-4 w-4 mr-1" /> Add Ward
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Search by hospital, city or ward type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="medical-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hospital</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Ward</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Occupied</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>₹/Day</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((__, j) => (
                    <TableCell key={j}><div className="h-4 bg-muted animate-pulse rounded w-20" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No records found</TableCell></TableRow>
            ) : (
              filtered.map((b) => {
                const available = b.total_beds - b.occupied_beds;
                return (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.hospital_name}</TableCell>
                    <TableCell>{b.city}</TableCell>
                    <TableCell>{b.ward_type}</TableCell>
                    <TableCell>{b.total_beds}</TableCell>
                    <TableCell>{b.occupied_beds}</TableCell>
                    <TableCell>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getAvailabilityColor(b.total_beds, b.occupied_beds)}`}>
                        {available} free
                      </span>
                    </TableCell>
                    <TableCell>₹{b.price_per_day}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => setEditing(b)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(b.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        {!loading && (
          <p className="text-xs text-muted-foreground pt-3 text-right">
            Showing {filtered.length} of {beds.length} wards
          </p>
        )}
      </div>

      {editing && (
        <Dialog open onOpenChange={() => setEditing(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing.id ? "Edit" : "Add"} Hospital Ward</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Hospital Name *" value={editing.hospital_name || ""} onChange={(e) => setEditing({ ...editing, hospital_name: e.target.value })} />
              <Input placeholder="City *" value={editing.city || ""} onChange={(e) => setEditing({ ...editing, city: e.target.value })} />
              <Input placeholder="Ward Type (e.g. General, ICU, Private)" value={editing.ward_type || ""} onChange={(e) => setEditing({ ...editing, ward_type: e.target.value })} />
              <div className="grid grid-cols-3 gap-2">
                <Input type="number" placeholder="Total Beds" value={editing.total_beds || 0} onChange={(e) => setEditing({ ...editing, total_beds: +e.target.value })} />
                <Input type="number" placeholder="Occupied" value={editing.occupied_beds || 0} onChange={(e) => setEditing({ ...editing, occupied_beds: +e.target.value })} />
                <Input type="number" placeholder="₹/Day" value={editing.price_per_day || 0} onChange={(e) => setEditing({ ...editing, price_per_day: +e.target.value })} />
              </div>
              <Button onClick={save} className="w-full medical-gradient border-0">Save Ward</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminHospitals;
