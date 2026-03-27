import React, { createContext, useContext, useState, useEffect } from "react";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useAuth } from "@/context/AuthContext";

const SAMPLE_USER_EMAIL = "ashishsample@lovable";

const SUPPORTED_CITIES_MAP: Record<string, { lat: number; lng: number; label: string }> = {
  pune: { lat: 18.525, lng: 73.855, label: "Pune" },
  mumbai: { lat: 19.076, lng: 72.877, label: "Mumbai" },
  lonikalbhor: { lat: 18.441, lng: 73.985, label: "Loni Kalbhor" },
};

interface LocationState {
  lat: number | null;
  lng: number | null;
  city: string | null;
  loading: boolean;
  error: string | null;
  denied: boolean;
}

interface LocationContextType extends LocationState {
  manualCity: string | null;
  setManualCity: (cityKey: string | null) => void;
}

const LocationContext = createContext<LocationContextType>({
  lat: null, lng: null, city: null, loading: true, error: null, denied: false,
  manualCity: null, setManualCity: () => {},
});

export const LocationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const geoLocation = useUserLocation();
  const [manualCity, setManualCity] = useState<string | null>(null);

  // Load saved manual city from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("manual_city");
    if (saved && SUPPORTED_CITIES_MAP[saved]) {
      setManualCity(saved);
    }
  }, []);

  const handleSetManualCity = (cityKey: string | null) => {
    setManualCity(cityKey);
    if (cityKey) {
      localStorage.setItem("manual_city", cityKey);
    } else {
      localStorage.removeItem("manual_city");
    }
  };

  let value: LocationState;

  if (manualCity && SUPPORTED_CITIES_MAP[manualCity]) {
    const c = SUPPORTED_CITIES_MAP[manualCity];
    value = { lat: c.lat, lng: c.lng, city: c.label, loading: false, error: null, denied: false };
  } else if (user?.email === SAMPLE_USER_EMAIL) {
    // Sample account defaults to Loni Kalbhor
    value = { lat: 18.441, lng: 73.985, city: "Loni Kalbhor", loading: false, error: null, denied: false };
  } else {
    value = geoLocation;
  }

  return (
    <LocationContext.Provider value={{ ...value, manualCity, setManualCity: handleSetManualCity }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);

export const SUPPORTED_CITIES = SUPPORTED_CITIES_MAP;

export function detectSupportedCity(city: string | null): string | null {
  if (!city) return null;
  const lower = city.toLowerCase();
  if (lower.includes("loni") || lower.includes("kalbhor")) return "lonikalbhor";
  if (lower.includes("pune")) return "pune";
  if (lower.includes("mumbai")) return "mumbai";
  return null;
}
