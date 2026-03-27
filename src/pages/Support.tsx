import { useState } from "react";
import { MessageCircle, Mail, HelpCircle, ChevronRight, ChevronDown, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import supportImg from "@/assets/support-illustration.png";

const faqs = [
  { q: "How do I book an appointment?", a: "Go to the Doctors page, select a doctor, choose a time slot, and confirm your booking." },
  { q: "How can I cancel an appointment?", a: "Navigate to My Appointments, find the appointment, and click the Cancel button." },
  { q: "How do I download my medical records?", a: "Go to Medical Records, find the record you need, and click the Download button." },
  { q: "Is my data secure?", a: "Yes, all your health data is encrypted and stored securely following healthcare data protection standards." },
  { q: "How do I update my profile?", a: "Go to My Profile from the sidebar and update your personal information." },
];

const Support = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ from: "user" | "bot"; text: string }[]>([
    { from: "bot", text: "Hello! 👋 How can I help you today?" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [faqOpen, setFaqOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({ topic: "", subject: "", message: "" });

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatMessages((prev) => [...prev, { from: "user", text: msg }]);
    setChatInput("");
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { from: "bot", text: "Thank you for your message. A support agent will connect with you shortly. In the meantime, you can check our FAQs for quick answers." },
      ]);
    }, 1000);
  };

  const handleEmail = () => {
    window.location.href = "mailto:saipro9549@gmail.com?subject=Support Request";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.topic || !formData.subject.trim() || !formData.message.trim()) {
      toast({ title: "Missing Fields", description: "Please fill in all fields before submitting.", variant: "destructive" });
      return;
    }
    toast({ title: "Request Submitted ✅", description: "Our support team will get back to you within 24 hours." });
    setFormData({ topic: "", subject: "", message: "" });
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-foreground">Support & Help</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="medical-card">
          <h2 className="text-base sm:text-lg font-bold text-foreground mb-5 sm:mb-6">How can we help you?</h2>
          <div className="space-y-3 sm:space-y-4">
            <button
              onClick={() => setChatOpen(true)}
              className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl hover:bg-accent/50 active:scale-[0.98] transition-all text-left border border-transparent hover:border-primary/20"
            >
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-foreground text-sm sm:text-[15px]">Start Chat</h3>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Chat live with support team</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </button>

            <button
              onClick={handleEmail}
              className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl hover:bg-accent/50 active:scale-[0.98] transition-all text-left border border-transparent hover:border-primary/20"
            >
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-foreground text-sm sm:text-[15px]">Send an Email</h3>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">saipro9549@gmail.com</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </button>

            <button
              onClick={() => setFaqOpen(true)}
              className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl hover:bg-accent/50 active:scale-[0.98] transition-all text-left border border-transparent hover:border-primary/20"
            >
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-foreground text-sm sm:text-[15px]">FAQs</h3>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Browse common questions</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </button>
          </div>
        </div>

        <div className="medical-card">
          <h2 className="text-base sm:text-lg font-bold text-foreground mb-4 sm:mb-5">Submit a Request</h2>
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <select
              value={formData.topic}
              onChange={(e) => setFormData((p) => ({ ...p, topic: e.target.value }))}
              className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-input bg-card text-sm text-foreground appearance-none"
            >
              <option value="">Choose a Topic</option>
              <option value="Appointments">Appointments</option>
              <option value="Billing">Billing</option>
              <option value="Technical Issue">Technical Issue</option>
              <option value="Other">Other</option>
            </select>
            <Input
              placeholder="Subject"
              className="h-10 sm:h-12 rounded-xl"
              value={formData.subject}
              onChange={(e) => setFormData((p) => ({ ...p, subject: e.target.value }))}
            />
            <Textarea
              placeholder="Describe your issue..."
              rows={3}
              className="rounded-xl resize-none"
              value={formData.message}
              onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
            />
            <div className="text-right">
              <Button type="submit" className="medical-gradient border-0 px-6 sm:px-8">Submit</Button>
            </div>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="medical-card flex items-center justify-center py-6 sm:py-8">
          <img src={supportImg} alt="Support" className="max-h-40 sm:max-h-56 object-contain" />
        </div>

        <div className="medical-card">
          <h2 className="text-base sm:text-lg font-bold text-foreground mb-4">Insurance Details</h2>
          <button className="w-full flex items-center justify-between p-3 sm:p-4 rounded-xl border border-border hover:bg-accent/30 transition-colors">
            <div>
              <h3 className="font-bold text-foreground text-sm sm:text-base">SecureHealth Insurance</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Policy Member: 3107914.024</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          </button>
        </div>
      </div>

      {/* Live Chat Panel */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/20 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full sm:w-[400px] h-[85vh] sm:h-[500px] bg-card rounded-t-2xl sm:rounded-2xl border border-border flex flex-col overflow-hidden shadow-lg">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary/5">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Live Support</h3>
                  <p className="text-[11px] text-muted-foreground">Online • Typically replies in minutes</p>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} className="p-1.5 rounded-lg hover:bg-accent/50 transition-colors">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm ${
                    msg.from === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-secondary text-foreground rounded-bl-md"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-border">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Type a message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                  className="flex-1 rounded-full h-10"
                />
                <Button onClick={handleSendChat} size="icon" className="medical-gradient border-0 rounded-full h-10 w-10 flex-shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAQs Panel */}
      {faqOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/20 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full sm:w-[500px] max-h-[85vh] sm:max-h-[500px] bg-card rounded-t-2xl sm:rounded-2xl border border-border flex flex-col overflow-hidden shadow-lg">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">Frequently Asked Questions</h3>
              <button onClick={() => setFaqOpen(false)} className="p-1.5 rounded-lg hover:bg-accent/50 transition-colors">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-3 sm:p-4 text-left hover:bg-accent/30 transition-colors"
                  >
                    <span className="text-sm font-medium text-foreground pr-2">{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform ${expandedFaq === i ? "rotate-180" : ""}`} />
                  </button>
                  {expandedFaq === i && (
                    <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;
