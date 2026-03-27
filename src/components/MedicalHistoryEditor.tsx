import { useState, useEffect } from "react";
import { Plus, X, Edit, Save, Pill, AlertTriangle, Stethoscope, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Surgery {
  name: string;
  date: string;
}

interface Medication {
  name: string;
  dosage: string;
}

interface MedicalHistoryData {
  allergies: string[];
  chronic_conditions: string[];
  past_surgeries: Surgery[];
  current_medications: Medication[];
}

const emptyHistory: MedicalHistoryData = {
  allergies: [],
  chronic_conditions: [],
  past_surgeries: [],
  current_medications: [],
};

interface Props {
  compact?: boolean;
}

const MedicalHistoryEditor = ({ compact = false }: Props) => {
  const { user } = useAuth();
  const [data, setData] = useState<MedicalHistoryData>(emptyHistory);
  const [loading, setLoading] = useState(true);
  const [editDialog, setEditDialog] = useState(false);
  const [editSection, setEditSection] = useState<keyof MedicalHistoryData | null>(null);
  const [saving, setSaving] = useState(false);

  // Temp inputs
  const [newAllergy, setNewAllergy] = useState("");
  const [newCondition, setNewCondition] = useState("");
  const [newSurgery, setNewSurgery] = useState<Surgery>({ name: "", date: "" });
  const [newMedication, setNewMedication] = useState<Medication>({ name: "", dosage: "" });

  useEffect(() => {
    if (user) loadHistory();
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;
    setLoading(true);
    const { data: row } = await supabase
      .from("medical_history")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (row) {
      setData({
        allergies: (row as any).allergies || [],
        chronic_conditions: (row as any).chronic_conditions || [],
        past_surgeries: (row as any).past_surgeries || [],
        current_medications: (row as any).current_medications || [],
      });
    }
    setLoading(false);
  };

  const saveHistory = async (updated: MedicalHistoryData) => {
    if (!user) return;
    setSaving(true);

    const payload = {
      user_id: user.id,
      allergies: updated.allergies,
      chronic_conditions: updated.chronic_conditions,
      past_surgeries: updated.past_surgeries as any,
      current_medications: updated.current_medications as any,
      updated_at: new Date().toISOString(),
    };

    const { data: existing } = await supabase
      .from("medical_history")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    let error;
    if (existing) {
      ({ error } = await supabase
        .from("medical_history")
        .update(payload)
        .eq("user_id", user.id));
    } else {
      ({ error } = await supabase.from("medical_history").insert(payload));
    }

    setSaving(false);
    if (error) {
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
    } else {
      setData(updated);
      toast({ title: "Medical history saved" });
    }
  };

  const openEdit = (section: keyof MedicalHistoryData) => {
    setEditSection(section);
    setEditDialog(true);
    setNewAllergy("");
    setNewCondition("");
    setNewSurgery({ name: "", date: "" });
    setNewMedication({ name: "", dosage: "" });
  };

  const addAllergy = () => {
    if (!newAllergy.trim()) return;
    const updated = { ...data, allergies: [...data.allergies, newAllergy.trim()] };
    setData(updated);
    setNewAllergy("");
  };

  const removeAllergy = (i: number) => {
    setData({ ...data, allergies: data.allergies.filter((_, idx) => idx !== i) });
  };

  const addCondition = () => {
    if (!newCondition.trim()) return;
    const updated = { ...data, chronic_conditions: [...data.chronic_conditions, newCondition.trim()] };
    setData(updated);
    setNewCondition("");
  };

  const removeCondition = (i: number) => {
    setData({ ...data, chronic_conditions: data.chronic_conditions.filter((_, idx) => idx !== i) });
  };

  const addSurgery = () => {
    if (!newSurgery.name.trim()) return;
    setData({ ...data, past_surgeries: [...data.past_surgeries, { ...newSurgery }] });
    setNewSurgery({ name: "", date: "" });
  };

  const removeSurgery = (i: number) => {
    setData({ ...data, past_surgeries: data.past_surgeries.filter((_, idx) => idx !== i) });
  };

  const addMedication = () => {
    if (!newMedication.name.trim()) return;
    setData({ ...data, current_medications: [...data.current_medications, { ...newMedication }] });
    setNewMedication({ name: "", dosage: "" });
  };

  const removeMedication = (i: number) => {
    setData({ ...data, current_medications: data.current_medications.filter((_, idx) => idx !== i) });
  };

  const handleSave = () => {
    saveHistory(data);
    setEditDialog(false);
  };

  if (loading) {
    return (
      <div className="medical-card animate-pulse">
        <div className="h-5 bg-muted rounded w-1/3 mb-4" />
        <div className="h-4 bg-muted rounded w-2/3" />
      </div>
    );
  }

  const sections = [
    { key: "allergies" as const, label: "Allergies", icon: AlertTriangle, color: "text-destructive", items: data.allergies },
    { key: "chronic_conditions" as const, label: "Chronic Conditions", icon: Stethoscope, color: "text-warning", items: data.chronic_conditions },
    { key: "past_surgeries" as const, label: "Past Surgeries", icon: Scissors, color: "text-primary", items: data.past_surgeries },
    { key: "current_medications" as const, label: "Current Medications", icon: Pill, color: "text-success", items: data.current_medications },
  ];

  const isEmpty = data.allergies.length === 0 && data.chronic_conditions.length === 0 && data.past_surgeries.length === 0 && data.current_medications.length === 0;

  if (compact) {
    return (
      <div className="medical-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground">Medical History</h3>
          <button className="text-sm text-primary font-semibold hover:underline" onClick={() => openEdit("allergies")}>
            <Edit className="h-3.5 w-3.5 inline mr-1" />Edit
          </button>
        </div>
        {isEmpty ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">No medical history added yet.</p>
            <Button size="sm" variant="outline" className="mt-2" onClick={() => openEdit("allergies")}>Add Medical History</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {sections.map(s => {
              const count = s.items.length;
              if (count === 0) return null;
              return (
                <button key={s.key} onClick={() => openEdit(s.key)} className="w-full flex items-center justify-between py-2 hover:bg-accent/30 rounded-lg px-2 transition-colors">
                  <div className="flex items-center gap-2">
                    <s.icon className={`h-4 w-4 ${s.color}`} />
                    <span className="text-sm text-foreground">{s.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{count}</span>
                </button>
              );
            })}
          </div>
        )}
        <EditDialog />
      </div>
    );
  }

  function EditDialog() {
    return (
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Medical History</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-2">
            {/* Allergies */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" /> Allergies
              </h4>
              <div className="flex flex-wrap gap-2 mb-2">
                {data.allergies.map((a, i) => (
                  <span key={i} className="text-xs px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive flex items-center gap-1.5">
                    {a}
                    <button onClick={() => removeAllergy(i)}><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="e.g. Penicillin" value={newAllergy} onChange={e => setNewAllergy(e.target.value)} onKeyDown={e => e.key === "Enter" && addAllergy()} className="h-9 text-sm" />
                <Button size="sm" variant="outline" onClick={addAllergy}><Plus className="h-4 w-4" /></Button>
              </div>
            </div>

            {/* Chronic Conditions */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-warning" /> Chronic Conditions
              </h4>
              <div className="flex flex-wrap gap-2 mb-2">
                {data.chronic_conditions.map((c, i) => (
                  <span key={i} className="text-xs px-3 py-1.5 rounded-lg bg-warning/10 text-warning flex items-center gap-1.5">
                    {c}
                    <button onClick={() => removeCondition(i)}><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="e.g. Hypertension" value={newCondition} onChange={e => setNewCondition(e.target.value)} onKeyDown={e => e.key === "Enter" && addCondition()} className="h-9 text-sm" />
                <Button size="sm" variant="outline" onClick={addCondition}><Plus className="h-4 w-4" /></Button>
              </div>
            </div>

            {/* Past Surgeries */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Scissors className="h-4 w-4 text-primary" /> Past Surgeries
              </h4>
              <div className="space-y-2 mb-2">
                {data.past_surgeries.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-primary/5 border border-border">
                    <div>
                      <p className="text-sm font-medium text-foreground">{s.name}</p>
                      {s.date && <p className="text-xs text-muted-foreground">{s.date}</p>}
                    </div>
                    <button onClick={() => removeSurgery(i)}><X className="h-4 w-4 text-muted-foreground" /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="Surgery name" value={newSurgery.name} onChange={e => setNewSurgery({ ...newSurgery, name: e.target.value })} className="h-9 text-sm" />
                <Input type="date" value={newSurgery.date} onChange={e => setNewSurgery({ ...newSurgery, date: e.target.value })} className="h-9 text-sm w-36" />
                <Button size="sm" variant="outline" onClick={addSurgery}><Plus className="h-4 w-4" /></Button>
              </div>
            </div>

            {/* Current Medications */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Pill className="h-4 w-4 text-success" /> Current Medications
              </h4>
              <div className="space-y-2 mb-2">
                {data.current_medications.map((m, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-success/5 border border-border">
                    <div>
                      <p className="text-sm font-medium text-foreground">{m.name}</p>
                      {m.dosage && <p className="text-xs text-muted-foreground">{m.dosage}</p>}
                    </div>
                    <button onClick={() => removeMedication(i)}><X className="h-4 w-4 text-muted-foreground" /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="Medicine name" value={newMedication.name} onChange={e => setNewMedication({ ...newMedication, name: e.target.value })} className="h-9 text-sm" />
                <Input placeholder="Dosage" value={newMedication.dosage} onChange={e => setNewMedication({ ...newMedication, dosage: e.target.value })} className="h-9 text-sm w-28" />
                <Button size="sm" variant="outline" onClick={addMedication}><Plus className="h-4 w-4" /></Button>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={() => setEditDialog(false)}>Cancel</Button>
              <Button className="medical-gradient border-0" onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" /> {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Full view
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Medical History</h2>
        <Button size="sm" className="medical-gradient border-0" onClick={() => openEdit("allergies")}>
          <Edit className="h-4 w-4 mr-2" /> Edit
        </Button>
      </div>

      {isEmpty ? (
        <div className="medical-card text-center py-8">
          <p className="text-muted-foreground">No medical history added yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Add your allergies, conditions, surgeries, and medications.</p>
          <Button size="sm" className="mt-3 medical-gradient border-0" onClick={() => openEdit("allergies")}>
            <Plus className="h-4 w-4 mr-2" /> Add Medical History
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sections.map(s => (
            <div key={s.key} className="medical-card">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <s.icon className={`h-4 w-4 ${s.color}`} /> {s.label}
                </h4>
                <button className="text-xs text-primary hover:underline" onClick={() => openEdit(s.key)}>Edit</button>
              </div>
              {s.items.length === 0 ? (
                <p className="text-xs text-muted-foreground">None added</p>
              ) : s.key === "allergies" || s.key === "chronic_conditions" ? (
                <div className="flex flex-wrap gap-1.5">
                  {(s.items as string[]).map((item, i) => (
                    <span key={i} className={`text-xs px-2.5 py-1 rounded-md ${s.key === "allergies" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"}`}>
                      {item}
                    </span>
                  ))}
                </div>
              ) : s.key === "past_surgeries" ? (
                <div className="space-y-2">
                  {(s.items as Surgery[]).map((item, i) => (
                    <div key={i} className="text-sm">
                      <span className="font-medium text-foreground">{item.name}</span>
                      {item.date && <span className="text-xs text-muted-foreground ml-2">{item.date}</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {(s.items as Medication[]).map((item, i) => (
                    <div key={i} className="text-sm">
                      <span className="font-medium text-foreground">{item.name}</span>
                      {item.dosage && <span className="text-xs text-muted-foreground ml-2">({item.dosage})</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <EditDialog />
    </div>
  );
};

export default MedicalHistoryEditor;
