import { useState, useEffect } from "react";

interface UserLocation {
  lat: number | null;
  lng: number | null;
  city: string | null;
  loading: boolean;
  error: string | null;
  denied: boolean;
}

export function useUserLocation(): UserLocation {
  const [state, setState] = useState<UserLocation>({
    lat: null,
    lng: null,
    city: null,
    loading: true,
    error: null,
    denied: false,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, loading: false, error: "Geolocation not supported" }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const addr = data.address || {};
          // Nominatim may return city, town, village, county, or state_district
          const city =
            addr.city ||
            addr.town ||
            addr.village ||
            addr.county ||
            addr.state_district ||
            null;
          setState({ lat: latitude, lng: longitude, city, loading: false, error: null, denied: false });
        } catch {
          // If geocoding fails, still provide coords but no city
          setState({ lat: latitude, lng: longitude, city: null, loading: false, error: "Could not determine city", denied: false });
        }
      },
      (err) => {
        const denied = err.code === err.PERMISSION_DENIED;
        setState({ lat: null, lng: null, city: null, loading: false, error: err.message, denied });
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  return state;
}
