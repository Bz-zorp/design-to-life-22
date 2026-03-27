import { useState } from "react";
import { MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import LocationGate from "@/components/LocationGate";
import offerCheckup from "@/assets/offer-checkup.png";
import offerDental from "@/assets/offer-dental.png";
import offerHeart from "@/assets/offer-heart.png";

const puneOffers = [
  { discount: "Get 20% OFF", title: "on Full Body Checkup", hospital: "HealthPlus Hospital, Pune", valid: "Valid till April 30, 2024", img: offerCheckup, details: "Comprehensive full body health checkup including blood tests, X-rays, ECG, and doctor consultation. Available at all HealthPlus Hospital branches in Pune." },
  { discount: "50% OFF", title: "Dental Checkup Packages", hospital: "Smile Dental Clinic, Pune", valid: "Valid till May 3, 2024", img: offerDental, details: "Complete dental checkup with cleaning, X-ray, and consultation. Includes whitening treatment for first-time patients." },
  { discount: "30% OFF", title: "Special Heart Care Package", hospital: "City Hospital, Pune", valid: "Valid till May 2, 2024", img: offerHeart, details: "Cardiac health package including ECG, Echo, stress test, and cardiologist consultation." },
];

const mumbaiOffers = [
  { discount: "25% OFF", title: "Full Body Health Checkup", hospital: "Kokilaben Hospital, Mumbai", valid: "Valid till May 15, 2024", img: offerCheckup, details: "Premium health checkup package including blood work, imaging, and specialist consultation at Kokilaben Hospital." },
  { discount: "40% OFF", title: "Eye Care Package", hospital: "Lilavati Hospital, Mumbai", valid: "Valid till May 10, 2024", img: offerHeart, details: "Complete eye examination with retina screening, glaucoma test, and ophthalmologist consultation." },
];

const loniKalbhorOffers = [
  { discount: "Free", title: "Basic Health Screening", hospital: "Chaitanya Hospital, Loni Kalbhor", valid: "Valid till May 20, 2024", img: offerCheckup, details: "Free basic health screening including BP check, blood sugar test, and general consultation at Chaitanya Hospital." },
  { discount: "20% OFF", title: "Family Health Package", hospital: "Lifeline Hospital, Loni Kalbhor", valid: "Valid till May 25, 2024", img: offerHeart, details: "Affordable family health package for up to 4 members. Includes blood tests and doctor consultation." },
];

type Offer = typeof puneOffers[0];

const CITY_OFFERS: Record<string, { offers: Offer[]; label: string }> = {
  pune: { offers: puneOffers, label: "Pune" },
  mumbai: { offers: mumbaiOffers, label: "Mumbai" },
  lonikalbhor: { offers: loniKalbhorOffers, label: "Loni Kalbhor" },
};

const OffersContent = ({ cityKey }: { cityKey: string }) => {
  const config = CITY_OFFERS[cityKey];
  const offers = config.offers;
  const [detailsOffer, setDetailsOffer] = useState<Offer | null>(null);

  return (
    <div className="space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-foreground">Offers in {config.label}</h1>
      <h2 className="text-base sm:text-lg font-bold text-foreground">Current Offers</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {offers.map((offer) => (
          <div key={offer.title} className="bg-card rounded-xl border border-border overflow-hidden flex flex-col" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="p-4 sm:p-5 flex-1">
              <span className="badge-discount">{offer.discount}</span>
              <h3 className="text-base sm:text-lg font-bold text-foreground mt-3">{offer.title}</h3>
              <div className="mt-3 text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" /> {offer.hospital}
              </div>
              <div className="mt-1.5 text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 flex-shrink-0" /> {offer.valid}
              </div>
            </div>
            <div className="px-4 sm:px-5 pb-2">
              <div className="h-32 sm:h-36 rounded-lg bg-accent/30 overflow-hidden flex items-center justify-center">
                <img src={offer.img} alt={offer.title} className="h-28 sm:h-32 object-contain" />
              </div>
            </div>
            <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-3">
              <Button size="sm" className="medical-gradient border-0 w-full" onClick={() => setDetailsOffer(offer)}>View Details</Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!detailsOffer} onOpenChange={() => setDetailsOffer(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{detailsOffer?.title}</DialogTitle>
            <DialogDescription>{detailsOffer?.discount}</DialogDescription>
          </DialogHeader>
          {detailsOffer && (
            <div className="space-y-4 py-2">
              <div className="h-40 rounded-xl bg-accent/30 overflow-hidden flex items-center justify-center">
                <img src={detailsOffer.img} alt={detailsOffer.title} className="h-36 object-contain" />
              </div>
              <p className="text-sm text-foreground leading-relaxed">{detailsOffer.details}</p>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" /> {detailsOffer.hospital}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" /> {detailsOffer.valid}
              </div>
              <Button className="w-full medical-gradient border-0 h-11" onClick={() => {
                setDetailsOffer(null);
                toast({ title: "Offer Claimed!", description: `You've claimed the ${detailsOffer.discount} offer.` });
              }}>Claim Offer</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Offers = () => (
  <LocationGate section="Offers">
    {(cityKey) => <OffersContent cityKey={cityKey} />}
  </LocationGate>
);

export default Offers;
