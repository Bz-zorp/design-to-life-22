import { MapPinOff, Loader2 } from "lucide-react";
import { useLocation, detectSupportedCity } from "@/context/LocationContext";

interface Props {
  section: string;
  children: (cityKey: string) => React.ReactNode;
}

const LocationGate = ({ section, children }: Props) => {
  const location = useLocation();

  if (location.loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">{section}</h1>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Detecting your location…</p>
          <p className="text-muted-foreground text-xs">Please allow location access when prompted</p>
        </div>
      </div>
    );
  }

  const cityKey = detectSupportedCity(location.city);

  if (!cityKey) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">{section}</h1>
        <div className="flex flex-col items-center justify-center py-16 gap-5 text-center">
          <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center">
            <MapPinOff className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Coming Soon to Your Area!</h2>
          {location.city && (
            <p className="text-muted-foreground text-sm">
              We detected you're in <span className="font-medium text-foreground">{location.city}</span>
            </p>
          )}
          {location.denied && (
            <p className="text-muted-foreground text-sm">
              Location access was denied. Please enable it in your browser settings.
            </p>
          )}
          <p className="text-muted-foreground text-sm max-w-md">
            We currently support <span className="font-medium text-foreground">Pune</span>, <span className="font-medium text-foreground">Mumbai</span>, and <span className="font-medium text-foreground">Loni Kalbhor</span>. We're expanding to more cities soon!
          </p>
        </div>
      </div>
    );
  }

  return <>{children(cityKey)}</>;
};

export default LocationGate;
