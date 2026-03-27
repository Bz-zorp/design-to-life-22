import { useState } from "react";
import { Plus, Download, Share2, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import MedicalHistoryEditor from "@/components/MedicalHistoryEditor";

const SAMPLE_USER_EMAIL = "ashishsample@lovable";
const tabs = ["Lab Reports", "Prescriptions", "Scan Reports", "Discharge Summaries"] as const;
type RecordType = typeof tabs[number];

const tabColors: Record<RecordType, { bg: string; text: string }> = {
  "Lab Reports": { bg: "bg-primary", text: "text-primary-foreground" },
  "Prescriptions": { bg: "bg-warning", text: "text-warning-foreground" },
  "Scan Reports": { bg: "bg-destructive/80", text: "text-destructive-foreground" },
  "Discharge Summaries": { bg: "bg-success", text: "text-success-foreground" },
};

type MedicalRecord = {
  type: RecordType;
  date: string;
  title: string;
  location: string;
  code: string;
  doctor: string;
  details: string;
};

const sampleRecords: MedicalRecord[] = [
  {
    type: "Lab Reports", date: "Apr 10, 2024", title: "Complete Blood Count (CBC)", location: "Ruby Hall Clinic, Pune", code: "LR-20240410",
    doctor: "Dr. Priya Sharma", details: "Hemoglobin: 14.2 g/dL | WBC: 7,500/μL | Platelets: 2.5 Lakh | RBC: 4.8 M/μL\nAll values within normal range.",
  },
  {
    type: "Prescriptions", date: "Apr 05, 2024", title: "Dr. Priya Sharma - Cardiology", location: "Ruby Hall Clinic, Pune", code: "RX-20240405",
    doctor: "Dr. Priya Sharma", details: "Amlodipine 5mg once daily, Ecosprin 75mg once daily, Rosuvastatin 10mg at bedtime.",
  },
  {
    type: "Scan Reports", date: "Mar 22, 2024", title: "Chest X-Ray (PA View)", location: "Ruby Hall Clinic, Pune", code: "SR-20240322",
    doctor: "Dr. Vikram Joshi", details: "Both lung fields are clear. No active pulmonary disease.",
  },
  {
    type: "Discharge Summaries", date: "Mar 06, 2024", title: "Appendectomy - 3 Day Stay", location: "Sahyadri Hospital, Deccan", code: "DS-20240306",
    doctor: "Dr. Hemant Deshmukh", details: "Diagnosis: Acute Appendicitis. Procedure: Laparoscopic Appendectomy. Uneventful recovery.",
  },
];

type SortOrder = "newest" | "oldest";

const MedicalRecords = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<RecordType>("Lab Reports");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  const records = user?.email === SAMPLE_USER_EMAIL ? sampleRecords : [];
  const parseDate = (d: string) => new Date(d).getTime();

  const filtered = records
    .filter((r) => r.type === activeTab)
    .sort((a, b) => sortOrder === "newest" ? parseDate(b.date) - parseDate(a.date) : parseDate(a.date) - parseDate(b.date));

  const handleDownload = (record: MedicalRecord) => {
    const content = `
═══════════════════════════════════════
  ${record.type.toUpperCase()}
═══════════════════════════════════════
Title:    ${record.title}
Date:     ${record.date}
Doctor:   ${record.doctor}
Location: ${record.location}
Ref Code: ${record.code}
───────────────────────────────────────
DETAILS:
${record.details}
───────────────────────────────────────
Generated from MedCare Health App
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${record.code}_${record.title.replace(/[^a-zA-Z0-9]/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded", description: `${record.title} has been downloaded.` });
  };

  const handleShare = async (record: MedicalRecord) => {
    const text = `Medical Record: ${record.title}\nDate: ${record.date}\nDoctor: ${record.doctor}\nLocation: ${record.location}\nRef: ${record.code}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: record.title, text });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied to clipboard", description: "Record details copied. You can now paste and share." });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Medical Records</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(s => s === "newest" ? "oldest" : "newest")}
            className="gap-1.5"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            {sortOrder === "newest" ? "Newest First" : "Oldest First"}
          </Button>
          <Button className="medical-gradient border-0">
            <Plus className="h-4 w-4 mr-2" /> Upload Record
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-1 flex gap-0 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 min-w-fit px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors rounded-lg ${
              activeTab === tab
                ? "text-primary border-b-2 border-primary bg-accent/50"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="medical-card text-center py-12">
          <p className="text-muted-foreground">No records yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Upload your first medical record to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((record, i) => {
            const color = tabColors[record.type];
            return (
              <div key={i} className="bg-card rounded-xl border border-border overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
                <div className={`${color.bg} px-4 py-3 flex items-center justify-between`}>
                  <span className={`text-sm font-bold ${color.text}`}>{record.type}</span>
                  <button
                    onClick={() => handleDownload(record)}
                    className="h-8 w-8 rounded-lg bg-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/40 transition-colors"
                  >
                    <Download className={`h-4 w-4 ${color.text}`} />
                  </button>
                </div>
                <div className="p-4">
                  <p className="text-sm text-muted-foreground">{record.date}</p>
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span className="text-sm font-medium text-foreground">{record.title}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>👨‍⚕️</span> {record.doctor}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>📍</span> {record.location}
                    </div>
                    <p className="text-[11px] text-muted-foreground font-mono">{record.code}</p>
                  </div>
                  <div className="flex items-center gap-6 mt-4 pt-3 border-t border-border">
                    <button
                      onClick={() => handleDownload(record)}
                      className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
                    >
                      <Download className="h-3.5 w-3.5" /> Download
                    </button>
                    <button
                      onClick={() => handleShare(record)}
                      className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
                    >
                      <Share2 className="h-3.5 w-3.5" /> Share
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Medical History Section */}
      <MedicalHistoryEditor />
    </div>
  );
};

export default MedicalRecords;
