import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";

export interface Appointment {
  doctor: string;
  specialty: string;
  hospital: string;
  date: string;
  time: string;
  id: string;
  status: string;
  img: string;
  fee: string;
}

interface AppointmentsContextType {
  appointments: Appointment[];
  addAppointment: (apt: Appointment) => void;
  cancelAppointment: (id: string) => void;
}

const SAMPLE_USER_EMAIL = "ashishsample@lovable";

const sampleAppointments: Appointment[] = [
  {
    doctor: "Dr. Priya Sharma",
    specialty: "Cardiologist - 10 years experience",
    hospital: "Ruby Hall Clinic",
    date: "April 30, 2024",
    time: "10:00 AM",
    id: "APPT-220394",
    status: "Upcoming",
    img: "",
    fee: "₹700",
  },
  {
    doctor: "Dr. Rajesh Kumar",
    specialty: "Gastroenterologist - 8 years experience",
    hospital: "Sahyadri Hospital (Deccan)",
    date: "May 5, 2024",
    time: "2:00 PM",
    id: "APPT-220401",
    status: "Upcoming",
    img: "https://i.pravatar.cc/150?img=12",
    fee: "₹600",
  },
  {
    doctor: "Dr. Anita Desai",
    specialty: "Pediatrician - 15 years experience",
    hospital: "Jehangir Hospital",
    date: "March 15, 2024",
    time: "11:30 AM",
    id: "APPT-220312",
    status: "Completed",
    img: "https://i.pravatar.cc/150?img=32",
    fee: "₹600",
  },
];

const AppointmentsContext = createContext<AppointmentsContextType | undefined>(undefined);

export function AppointmentsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (user?.email === SAMPLE_USER_EMAIL) {
      setAppointments(sampleAppointments);
      return;
    }
    setAppointments([]);
  }, [user?.id, user?.email]);

  const addAppointment = (apt: Appointment) => {
    setAppointments(prev => [apt, ...prev]);
  };

  const cancelAppointment = (id: string) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "Cancelled" } : a));
  };

  return (
    <AppointmentsContext.Provider value={{ appointments, addAppointment, cancelAppointment }}>
      {children}
    </AppointmentsContext.Provider>
  );
}

export function useAppointments() {
  const ctx = useContext(AppointmentsContext);
  if (!ctx) throw new Error("useAppointments must be used within AppointmentsProvider");
  return ctx;
}
