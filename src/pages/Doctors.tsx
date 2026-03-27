import { useState } from "react";
import { MapPin, Star, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAppointments } from "@/context/AppointmentsContext";
import LocationGate from "@/components/LocationGate";
import doctorPriya from "@/assets/doctor-priya.png";

const timeSlots = ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "2:00 PM", "2:30 PM", "3:00 PM", "5:00 PM", "5:30 PM"];

const puneDoctors = [
  { name: "Dr. Priya Sharma", specialty: "Cardiologist", exp: "10 years", rating: 4.8, reviews: "1.2k", hospital: "Ruby Hall Clinic", address: "40, Sassoon Road, Pune", distance: "2.5 km away", fee: "₹700", img: doctorPriya },
  { name: "Dr. Amit Kulkarni", specialty: "Neurologist", exp: "14 years", rating: 4.7, reviews: "980", hospital: "Ruby Hall Clinic", address: "40, Sassoon Road, Pune", distance: "2.5 km away", fee: "₹900", img: "https://i.pravatar.cc/150?img=60" },
  { name: "Dr. Rajesh Kumar", specialty: "Gastroenterologist", exp: "8 years", rating: 4.5, reviews: "850", hospital: "Sahyadri Hospital (Deccan)", address: "30-C, Erandwane, Karve Road, Pune", distance: "3 km away", fee: "₹600", img: "https://i.pravatar.cc/150?img=12" },
  { name: "Dr. Meena Joshi", specialty: "Neurosurgeon", exp: "18 years", rating: 4.9, reviews: "1.8k", hospital: "Sahyadri Hospital (Deccan)", address: "30-C, Erandwane, Karve Road, Pune", distance: "3 km away", fee: "₹1200", img: "https://i.pravatar.cc/150?img=44" },
  { name: "Dr. Anita Desai", specialty: "Pediatrician", exp: "15 years", rating: 4.9, reviews: "2.1k", hospital: "Jehangir Hospital", address: "32, Sassoon Road, Pune", distance: "2 km away", fee: "₹600", img: "https://i.pravatar.cc/150?img=32" },
  { name: "Dr. Vikram Patil", specialty: "Nephrologist", exp: "11 years", rating: 4.6, reviews: "720", hospital: "Jehangir Hospital", address: "32, Sassoon Road, Pune", distance: "2 km away", fee: "₹800", img: "https://i.pravatar.cc/150?img=53" },
  { name: "Dr. Sneha Deshpande", specialty: "Oncologist", exp: "16 years", rating: 4.8, reviews: "1.5k", hospital: "Deenanath Mangeshkar Hospital", address: "Erandwane, Near Mhatre Bridge, Pune", distance: "4 km away", fee: "₹1000", img: "https://i.pravatar.cc/150?img=45" },
  { name: "Dr. Rahul Khare", specialty: "Transplant Surgeon", exp: "20 years", rating: 4.9, reviews: "2.3k", hospital: "Deenanath Mangeshkar Hospital", address: "Erandwane, Near Mhatre Bridge, Pune", distance: "4 km away", fee: "₹1500", img: "https://i.pravatar.cc/150?img=14" },
  { name: "Dr. Pooja Iyer", specialty: "Ophthalmologist", exp: "9 years", rating: 4.4, reviews: "650", hospital: "KEM Hospital", address: "Sardar Moodliar Road, Rasta Peth, Pune", distance: "3.5 km away", fee: "₹500", img: "https://i.pravatar.cc/150?img=25" },
  { name: "Dr. Sunil Mehta", specialty: "Orthopedic Surgeon", exp: "12 years", rating: 4.7, reviews: "1.5k", hospital: "Sancheti Hospital", address: "11/12, Thube Park, Shivajinagar, Pune", distance: "3 km away", fee: "₹800", img: "https://i.pravatar.cc/150?img=68" },
  { name: "Dr. Ashok Ranawat", specialty: "Joint Replacement", exp: "22 years", rating: 4.9, reviews: "3.1k", hospital: "Sancheti Hospital", address: "11/12, Thube Park, Shivajinagar, Pune", distance: "3 km away", fee: "₹1200", img: "https://i.pravatar.cc/150?img=15" },
  { name: "Dr. Nikhil Bansal", specialty: "Urologist", exp: "10 years", rating: 4.5, reviews: "890", hospital: "Jupiter Hospital", address: "Eastern Express Highway, Baner, Pune", distance: "8 km away", fee: "₹700", img: "https://i.pravatar.cc/150?img=33" },
  { name: "Dr. Kavita Rao", specialty: "Cardiologist", exp: "13 years", rating: 4.6, reviews: "1.1k", hospital: "Aditya Birla Memorial Hospital", address: "Aditya Birla Hospital Road, Thergaon, Pune", distance: "12 km away", fee: "₹800", img: "https://i.pravatar.cc/150?img=26" },
  { name: "Dr. Sanjay Phadke", specialty: "ENT Specialist", exp: "17 years", rating: 4.3, reviews: "750", hospital: "Poona Hospital", address: "27, Sadashiv Peth, Pune", distance: "2 km away", fee: "₹500", img: "https://i.pravatar.cc/150?img=52" },
  { name: "Dr. Deepa Naik", specialty: "General Surgeon", exp: "11 years", rating: 4.2, reviews: "600", hospital: "Sassoon General Hospital", address: "Near Pune Railway Station, Pune", distance: "1.5 km away", fee: "₹400", img: "https://i.pravatar.cc/150?img=36" },
];

const mumbaiDoctors = [
  { name: "Dr. Anil Kapoor", specialty: "Cardiologist", exp: "18 years", rating: 4.9, reviews: "3.2k", hospital: "Kokilaben Hospital", address: "Andheri West, Mumbai", distance: "5 km away", fee: "₹1500", img: "https://i.pravatar.cc/150?img=11" },
  { name: "Dr. Sunita Menon", specialty: "Oncologist", exp: "20 years", rating: 4.8, reviews: "2.8k", hospital: "Tata Memorial Hospital", address: "Parel, Mumbai", distance: "8 km away", fee: "₹1200", img: "https://i.pravatar.cc/150?img=47" },
  { name: "Dr. Raj Malhotra", specialty: "Neurosurgeon", exp: "15 years", rating: 4.7, reviews: "1.9k", hospital: "Lilavati Hospital", address: "Bandra West, Mumbai", distance: "6 km away", fee: "₹1800", img: "https://i.pravatar.cc/150?img=59" },
  { name: "Dr. Fatima Sheikh", specialty: "Gynecologist", exp: "12 years", rating: 4.6, reviews: "1.4k", hospital: "Hinduja Hospital", address: "Mahim, Mumbai", distance: "4 km away", fee: "₹900", img: "https://i.pravatar.cc/150?img=38" },
  { name: "Dr. Vikrant Joshi", specialty: "Orthopedic Surgeon", exp: "14 years", rating: 4.5, reviews: "1.1k", hospital: "Breach Candy Hospital", address: "Bhulabhai Desai Road, Mumbai", distance: "7 km away", fee: "₹1000", img: "https://i.pravatar.cc/150?img=16" },
];

const loniKalbhorDoctors = [
  { name: "Dr. Sachin Jadhav", specialty: "General Physician", exp: "10 years", rating: 4.3, reviews: "420", hospital: "Chaitanya Hospital", address: "Loni Kalbhor, Pune-Solapur Highway", distance: "1 km away", fee: "₹300", img: "https://i.pravatar.cc/150?img=17" },
  { name: "Dr. Rekha Patil", specialty: "Gynecologist", exp: "8 years", rating: 4.2, reviews: "350", hospital: "Lifeline Multispeciality Hospital", address: "Pune-Solapur Road, Loni Kalbhor", distance: "1.5 km away", fee: "₹400", img: "https://i.pravatar.cc/150?img=41" },
  { name: "Dr. Mahesh Gaikwad", specialty: "Orthopedic Surgeon", exp: "12 years", rating: 4.4, reviews: "500", hospital: "Sai Hospital", address: "Near Bus Stand, Loni Kalbhor", distance: "0.5 km away", fee: "₹350", img: "https://i.pravatar.cc/150?img=22" },
  { name: "Dr. Anjali Kulkarni", specialty: "Pediatrician", exp: "6 years", rating: 4.1, reviews: "280", hospital: "Shree Hospital", address: "Main Road, Loni Kalbhor", distance: "1 km away", fee: "₹300", img: "https://i.pravatar.cc/150?img=29" },
];

type Doctor = typeof puneDoctors[0];

const CITY_DOCTORS: Record<string, { doctors: Doctor[]; label: string }> = {
  pune: { doctors: puneDoctors, label: "Pune" },
  mumbai: { doctors: mumbaiDoctors, label: "Mumbai" },
  lonikalbhor: { doctors: loniKalbhorDoctors, label: "Loni Kalbhor" },
};

const DoctorsContent = ({ cityKey }: { cityKey: string }) => {
  const { addAppointment } = useAppointments();
  const config = CITY_DOCTORS[cityKey];
  const doctors = config.doctors;
  const specialties = ["All", ...Array.from(new Set(doctors.map(d => d.specialty)))];

  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("UPI");
  const [search, setSearch] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("All");

  const filtered = doctors.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.hospital.toLowerCase().includes(search.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(search.toLowerCase());
    const matchesSpecialty = filterSpecialty === "All" || doc.specialty === filterSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const handleBook = () => {
    if (!selectedDate || !selectedTime || !bookingDoctor) {
      toast({ title: "Please select date and time", variant: "destructive" });
      return;
    }
    addAppointment({
      doctor: bookingDoctor.name,
      specialty: `${bookingDoctor.specialty} - ${bookingDoctor.exp} experience`,
      hospital: bookingDoctor.hospital,
      date: selectedDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      time: selectedTime,
      id: `APPT-${Date.now().toString().slice(-6)}`,
      status: "Upcoming",
      img: bookingDoctor.img,
      fee: bookingDoctor.fee,
    });
    setBookingDoctor(null);
    setSelectedDate(undefined);
    setSelectedTime("");
    toast({ title: "Appointment Booked!", description: `Your appointment with ${bookingDoctor.name} has been confirmed.` });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-foreground">Doctors in {config.label}</h1>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search doctors, hospitals, specialties..." className="w-full pl-10 pr-4 py-2.5 rounded-full bg-secondary border-none text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
        </div>
        <select value={filterSpecialty} onChange={(e) => setFilterSpecialty(e.target.value)} className="px-4 py-2.5 rounded-lg border border-input bg-card text-sm text-foreground">
          {specialties.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <p className="text-sm text-muted-foreground">{filtered.length} doctors found</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filtered.map((doc, i) => (
          <div key={`${doc.name}-${doc.hospital}-${i}`} className="medical-card">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="relative flex-shrink-0">
                <Avatar className="h-14 w-14 sm:h-16 sm:w-16 border-2 border-accent">
                  <AvatarImage src={doc.img} />
                  <AvatarFallback>{doc.name.split(" ")[1]?.[0]}</AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-success border-2 border-card" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground text-sm sm:text-[15px]">{doc.name}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{doc.specialty} · {doc.exp} exp</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  <span className="text-sm font-semibold text-foreground">{doc.rating}</span>
                  <span className="text-xs text-muted-foreground">({doc.reviews})</span>
                </div>
              </div>
            </div>
            <div className="mt-3 sm:mt-4 p-3 rounded-xl border border-border bg-accent/20">
              <div className="flex items-center gap-1.5 text-sm text-foreground font-medium">
                <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                <span className="truncate">{doc.hospital}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 ml-5">{doc.address}</p>
              <p className="text-xs text-muted-foreground ml-5 mt-0.5">{doc.distance}</p>
            </div>
            <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 border-t border-border">
              <div>
                <span className="text-xs text-muted-foreground">Consultation Fee</span>
                <p className="text-lg sm:text-xl font-bold text-foreground">{doc.fee}</p>
              </div>
              <Button className="medical-gradient border-0 px-4 sm:px-6 text-sm" onClick={() => setBookingDoctor(doc)}>Book Appointment</Button>
            </div>
          </div>
        ))}
      </div>

      {bookingDoctor && (
        <Dialog open={true} onOpenChange={() => setBookingDoctor(null)}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0">
            <div className="grid grid-cols-1 sm:grid-cols-2">
              <div className="p-5 sm:p-6 border-b sm:border-b-0 sm:border-r border-border">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-16 w-16 border-2 border-accent">
                    <AvatarImage src={bookingDoctor.img} />
                    <AvatarFallback>{bookingDoctor.name.split(" ")[1]?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-foreground">{bookingDoctor.name}</h3>
                    <p className="text-sm text-muted-foreground">{bookingDoctor.specialty} · {bookingDoctor.exp} exp</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span className="text-sm font-medium">{bookingDoctor.rating}</span>
                      <span className="text-xs text-muted-foreground">({bookingDoctor.reviews})</span>
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-border bg-accent/20">
                  <div className="flex items-center gap-1.5 text-sm text-foreground font-medium">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    {bookingDoctor.hospital}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 ml-5">{bookingDoctor.address}</p>
                  <p className="text-xs text-muted-foreground ml-5 mt-0.5">{bookingDoctor.distance}</p>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                  <span className="text-sm text-muted-foreground">Consultation Fee</span>
                  <span className="text-xl font-bold text-foreground">{bookingDoctor.fee}</span>
                </div>
              </div>
              <div className="p-5 sm:p-6 space-y-5">
                <DialogHeader>
                  <DialogTitle>Book Appointment</DialogTitle>
                  <DialogDescription>Select date and time slot</DialogDescription>
                </DialogHeader>
                <div>
                  <h4 className="font-semibold text-foreground text-sm mb-2">Select Date</h4>
                  <CalendarPicker mode="single" selected={selectedDate} onSelect={setSelectedDate} className={cn("rounded-xl border border-border p-3 pointer-events-auto w-full")} disabled={(date) => date < new Date()} />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm mb-2">Select Time Slot</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((slot) => (
                      <button key={slot} onClick={() => setSelectedTime(slot)} className={`px-2 py-2 rounded-lg border text-xs sm:text-sm font-medium transition-colors ${selectedTime === slot ? "medical-gradient text-primary-foreground border-transparent" : "border-border text-foreground hover:bg-accent/50"}`}>{slot}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-foreground">Payment</span>
                    <span className="text-xl font-bold text-foreground">{bookingDoctor.fee}</span>
                  </div>
                  <div className="flex gap-2">
                    {["UPI", "Credit / Debit Card"].map((m) => (
                      <button key={m} onClick={() => setSelectedPayment(m)} className={`flex-1 py-2 px-3 rounded-lg border text-xs sm:text-sm font-medium transition-colors ${selectedPayment === m ? "bg-accent text-primary border-primary/30" : "border-border text-muted-foreground"}`}>
                        {selectedPayment === m && "✓ "}{m}
                      </button>
                    ))}
                  </div>
                </div>
                <Button className="w-full h-12 medical-gradient border-0 text-base font-bold" onClick={handleBook}>Confirm Booking</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

const Doctors = () => (
  <LocationGate section="Doctors">
    {(cityKey) => <DoctorsContent cityKey={cityKey} />}
  </LocationGate>
);

export default Doctors;
