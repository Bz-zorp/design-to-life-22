import { useState } from "react";
import { Calendar, MapPin, QrCode, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAppointments } from "@/context/AppointmentsContext";

const timeSlots = ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "5:30 PM"];

const Appointments = () => {
  const { appointments, addAppointment, cancelAppointment } = useAppointments();
  const [detailsDialog, setDetailsDialog] = useState<typeof appointments[0] | null>(null);
  const [cancelDialog, setCancelDialog] = useState<typeof appointments[0] | null>(null);
  const [bookDialog, setBookDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState("");

  const handleCancel = (apt: typeof appointments[0]) => {
    cancelAppointment(apt.id);
    setCancelDialog(null);
    toast({ title: "Appointment Cancelled", description: `Appointment ${apt.id} has been cancelled.` });
  };

  const handleBook = () => {
    if (!selectedDate || !selectedTime) {
      toast({ title: "Please select date and time", variant: "destructive" });
      return;
    }
    addAppointment({
      doctor: "General Consultation",
      specialty: "General Medicine",
      hospital: "City Hospital",
      date: selectedDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      time: selectedTime,
      id: `APPT-${Date.now().toString().slice(-6)}`,
      status: "Upcoming",
      img: "",
      fee: "₹500",
    });
    setBookDialog(false);
    setSelectedDate(undefined);
    setSelectedTime("");
    toast({ title: "Appointment Booked!", description: `Your appointment has been scheduled.` });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">My Appointments</h1>
        <Button className="medical-gradient border-0" onClick={() => setBookDialog(true)}>Book New Appointment</Button>
      </div>

      {appointments.length === 0 && (
        <div className="medical-card text-center py-12">
          <p className="text-muted-foreground">No appointments yet. Book one from the Doctors page!</p>
        </div>
      )}

      <div className="space-y-4">
        {appointments.map((apt) => (
          <div key={apt.id} className="medical-card">
            <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
              <div className="relative flex-shrink-0">
                <Avatar className="h-12 w-12 sm:h-14 sm:w-14 border-2 border-accent">
                  <AvatarImage src={apt.img} />
                  <AvatarFallback>{apt.doctor.split(" ")[1]?.[0] || apt.doctor[0]}</AvatarFallback>
                </Avatar>
                <span className={`absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-card ${
                  apt.status === "Cancelled" ? "bg-destructive" : apt.status === "Completed" ? "bg-muted-foreground" : "bg-success"
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-foreground text-sm sm:text-[15px]">{apt.doctor}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    apt.status === "Upcoming" ? "bg-accent text-primary" :
                    apt.status === "Cancelled" ? "bg-destructive/10 text-destructive" :
                    "bg-secondary text-muted-foreground"
                  }`}>{apt.status}</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">{apt.specialty}</p>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground mt-1">
                  <MapPin className="h-3.5 w-3.5 text-primary" /> {apt.hospital}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3 sm:mt-4 pt-3 border-t border-border text-xs sm:text-sm text-foreground">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium">{apt.date} | {apt.time}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-3 sm:mt-4 pt-3 border-t border-border gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <QrCode className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="text-[11px] text-muted-foreground">Appointment ID</p>
                  <p className="text-sm font-semibold text-foreground">{apt.id}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {apt.status === "Upcoming" && (
                  <Button variant="outline" size="sm" onClick={() => setCancelDialog(apt)}>Cancel</Button>
                )}
                <Button size="sm" className="medical-gradient border-0 px-4 sm:px-5" onClick={() => setDetailsDialog(apt)}>
                  View Details
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View Details Dialog */}
      {detailsDialog && (
        <Dialog open={true} onOpenChange={() => setDetailsDialog(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Appointment Details</DialogTitle>
              <DialogDescription>Details for appointment {detailsDialog.id}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-accent">
                  <AvatarImage src={detailsDialog.img} />
                  <AvatarFallback>{detailsDialog.doctor.split(" ")[1]?.[0] || detailsDialog.doctor[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-foreground text-lg">{detailsDialog.doctor}</h3>
                  <p className="text-sm text-muted-foreground">{detailsDialog.specialty}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <span className="text-sm font-medium">4.8</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-accent/30 border border-border">
                  <p className="text-xs text-muted-foreground">Date & Time</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{detailsDialog.date}</p>
                  <p className="text-sm text-foreground">{detailsDialog.time}</p>
                </div>
                <div className="p-3 rounded-xl bg-accent/30 border border-border">
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{detailsDialog.hospital}</p>
                </div>
                <div className="p-3 rounded-xl bg-accent/30 border border-border">
                  <p className="text-xs text-muted-foreground">Appointment ID</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{detailsDialog.id}</p>
                </div>
                <div className="p-3 rounded-xl bg-accent/30 border border-border">
                  <p className="text-xs text-muted-foreground">Consultation Fee</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{detailsDialog.fee}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl border border-border">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                  detailsDialog.status === "Upcoming" ? "bg-accent text-primary" :
                  detailsDialog.status === "Cancelled" ? "bg-destructive/10 text-destructive" :
                  "bg-secondary text-muted-foreground"
                }`}>{detailsDialog.status}</span>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Cancel Confirmation */}
      {cancelDialog && (
        <Dialog open={true} onOpenChange={() => setCancelDialog(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Cancel Appointment</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel your appointment with {cancelDialog.doctor} on {cancelDialog.date}?
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 justify-end pt-4">
              <Button variant="outline" onClick={() => setCancelDialog(null)}>Keep Appointment</Button>
              <Button variant="destructive" onClick={() => handleCancel(cancelDialog)}>Cancel Appointment</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Book New Appointment Dialog */}
      {bookDialog && (
        <Dialog open={true} onOpenChange={() => setBookDialog(false)}>
          <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Book Appointment</DialogTitle>
              <DialogDescription>Select a date and time for your appointment</DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-2">
              <div>
                <h4 className="font-semibold text-foreground text-sm mb-2">Select Date</h4>
                <CalendarPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className={cn("rounded-xl border border-border p-3 pointer-events-auto w-full")}
                  disabled={(date) => date < new Date()}
                />
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-sm mb-2">Select Time Slot</h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        selectedTime === slot
                          ? "medical-gradient text-primary-foreground border-transparent"
                          : "border-border text-foreground hover:bg-accent/50"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-accent/20">
                <span className="text-sm text-muted-foreground">Payment</span>
                <span className="text-xl font-bold text-foreground">₹500</span>
              </div>
              <Button className="w-full h-12 medical-gradient border-0 text-base font-bold" onClick={handleBook}>
                Confirm Booking
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Appointments;
