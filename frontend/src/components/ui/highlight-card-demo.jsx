import HighlightCard from "./highlight-card";
import { Rocket } from "lucide-react";

/**
 * Demo component showing how to use HighlightCard
 */
export default function HighlightCardDemo() {
  return (
    <HighlightCard
      title="Space Explorer"
      description={[
        "Embark on interstellar adventures,",
        "discover new planets and galaxies,",
        "share your discoveries with friends,",
        "and reach for the stars together."
      ]}
      icon={<Rocket className="w-8 h-8 text-white" />}
    />
  );
}

