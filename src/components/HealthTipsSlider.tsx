import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const tips = [
  { emoji: "💧", title: "Stay Hydrated", desc: "Drink at least 8 glasses of water daily to keep your body functioning optimally." },
  { emoji: "🏃", title: "Exercise Regularly", desc: "30 minutes of moderate exercise daily reduces heart disease risk by up to 35%." },
  { emoji: "😴", title: "Prioritize Sleep", desc: "Adults need 7-9 hours of quality sleep for proper immune function and recovery." },
  { emoji: "🥗", title: "Eat Balanced Meals", desc: "Include fruits, vegetables, whole grains, and lean proteins in every meal." },
  { emoji: "🧘", title: "Manage Stress", desc: "Practice deep breathing or meditation for 10 minutes daily to lower cortisol levels." },
];

const HealthTipsSlider = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % tips.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + tips.length) % tips.length);
  const next = () => setCurrent((c) => (c + 1) % tips.length);
  const tip = tips[current];

  return (
    <section className="medical-card">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm sm:text-base font-bold text-foreground">Health Tips for You</h2>
        <div className="flex items-center gap-1">
          <button onClick={prev} className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-accent/50 transition-colors">
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <button onClick={next} className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-accent/50 transition-colors">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
      <div className="overflow-hidden">
        <div key={current} className="flex items-start gap-3 p-3 sm:p-4 rounded-xl border border-border bg-card animate-fade-in">
          <span className="text-3xl sm:text-4xl flex-shrink-0">{tip.emoji}</span>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-foreground">{tip.title}</h4>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">{tip.desc}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {tips.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/30"}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HealthTipsSlider;
