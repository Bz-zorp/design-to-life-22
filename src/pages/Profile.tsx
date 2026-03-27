import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ChevronRight, Edit, Calendar as CalendarIcon } from "lucide-react";
import MedicalHistoryEditor from "@/components/MedicalHistoryEditor";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const { user } = useAuth();
  const [editDialog, setEditDialog] = useState(false);
  const [addMemberDialog, setAddMemberDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "", dob: "", gender: "", email: "", city: "", phone: ""
  });
  const [memberForm, setMemberForm] = useState({ name: "", relation: "", dob: "" });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const profile = data as any;
    setFormData({
      name: profile?.full_name || user.user_metadata?.full_name || "",
      dob: profile?.dob || "",
      gender: profile?.gender || "",
      email: user.email || "",
      city: profile?.city || "",
      phone: profile?.phone || "",
    });
    setLoading(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    const updates: any = {
      full_name: formData.name,
      phone: formData.phone,
      dob: formData.dob || null,
      gender: formData.gender || null,
      city: formData.city || null,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    if (error) {
      toast({ title: "Error saving profile", description: error.message, variant: "destructive" });
    } else {
      setEditDialog(false);
      toast({ title: "Profile Updated", description: "Your profile has been updated successfully." });
    }
  };

  const handleAddMember = () => {
    if (!memberForm.name || !memberForm.relation) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    setAddMemberDialog(false);
    setMemberForm({ name: "", relation: "", dob: "" });
    toast({ title: "Family Member Added", description: `${memberForm.name} has been added.` });
  };

  const handleRemoveMember = (name: string) => {
    toast({ title: "Member Removed", description: `${name} has been removed from family members.` });
  };

  const initials = formData.name ? formData.name.charAt(0).toUpperCase() : (user?.email?.charAt(0).toUpperCase() || "U");
  const isProfileIncomplete = !formData.name || !formData.phone;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Prompt to complete profile */}
      {isProfileIncomplete && (
        <div className="p-4 rounded-xl border border-warning bg-warning/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-foreground text-sm">Complete Your Profile</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Add your name and phone number to get started.</p>
          </div>
          <Button size="sm" className="medical-gradient border-0" onClick={() => setEditDialog(true)}>
            Complete Profile
          </Button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">My Profile</h1>
        <Button className="medical-gradient border-0" onClick={() => setEditDialog(true)}>
          <Edit className="h-4 w-4 mr-2" /> Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">
          <div className="medical-card text-center">
            <div className="relative inline-block">
              <Avatar className="h-24 w-24 sm:h-28 sm:w-28 mx-auto border-4 border-accent">
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-success border-2 border-card" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground mt-4">{formData.name || "New User"}</h2>
            <p className="text-xs text-muted-foreground">{formData.email}</p>
            <Button size="sm" className="mt-3 medical-gradient border-0" onClick={() => setEditDialog(true)}>Edit Profile</Button>

            <div className="mt-6 border-t border-border pt-4 space-y-1">
              {["Medical History", "Insurance"].map((item) => (
                <button key={item} className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-accent/50 transition-colors text-sm text-foreground">
                  <span>{item}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>

          <MedicalHistoryEditor compact />
        </div>

        {/* Right column */}
        <div className="lg:col-span-3 space-y-5">
          <div className="medical-card">
            <h3 className="font-bold text-foreground mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(formData).map(([key, value]) => (
                <div key={key} className="px-4 py-3 rounded-xl border border-border bg-accent/20">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                    {key === "dob" ? "Date of Birth" : key.charAt(0).toUpperCase() + key.slice(1)}
                  </p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{value || "—"}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="medical-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground">Family Members</h3>
              <button className="text-sm text-primary font-semibold hover:underline" onClick={() => setAddMemberDialog(true)}>
                Add Member
              </button>
            </div>
            <div className="p-6 rounded-xl border border-dashed border-border text-center">
              <p className="text-sm text-muted-foreground">No family members added yet.</p>
              <Button size="sm" variant="outline" className="mt-3" onClick={() => setAddMemberDialog(true)}>
                Add Family Member
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{isProfileIncomplete ? "Complete Your Profile" : "Edit Profile"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {[
              { key: "name", label: "Full Name", type: "text" },
              { key: "dob", label: "Date of Birth", type: "date" },
              { key: "phone", label: "Phone", type: "tel" },
              { key: "city", label: "City", type: "text" },
            ].map((field) => (
              <div key={field.key}>
                <label className="text-sm font-medium text-foreground mb-1 block">{field.label}</label>
                <Input
                  type={field.type}
                  value={formData[field.key as keyof typeof formData]}
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  className="h-11"
                />
              </div>
            ))}
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-sm text-foreground"
              >
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={() => setEditDialog(false)}>Cancel</Button>
              <Button className="medical-gradient border-0" onClick={handleSaveProfile}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Family Member Dialog */}
      <Dialog open={addMemberDialog} onOpenChange={setAddMemberDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Family Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Name</label>
              <Input value={memberForm.name} onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Relation</label>
              <select
                value={memberForm.relation}
                onChange={(e) => setMemberForm({ ...memberForm, relation: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-sm text-foreground"
              >
                <option value="">Select relation</option>
                <option>Mother</option>
                <option>Father</option>
                <option>Spouse</option>
                <option>Child</option>
                <option>Sibling</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Date of Birth</label>
              <Input type="date" value={memberForm.dob} onChange={(e) => setMemberForm({ ...memberForm, dob: e.target.value })} />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={() => setAddMemberDialog(false)}>Cancel</Button>
              <Button className="medical-gradient border-0" onClick={handleAddMember}>Add Member</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
