"use client";

import Button from "@/app/components/ui/button";
import { useStripe } from "@/app/hooks/useStripe";
import { useParams } from "next/navigation";

export default function PlanButtons() {
  const { createStripeCheckout } = useStripe();
  const { profileId } = useParams();

  return (
    <div className="flex gap-4">
      <Button
        onClick={() =>
          createStripeCheckout({
            billingPeriod: "monthly",
            metadata: { profileId },
          })
        }
      >
        R$ 9,90 / mês
      </Button>
      <Button
        onClick={() =>
          createStripeCheckout({
            billingPeriod: "yearly",
            metadata: { profileId },
          })
        }
      >
        R$ 49,90 / ano
      </Button>
      <Button
        onClick={() =>
          createStripeCheckout({
            billingPeriod: "lifetime",
            metadata: { profileId },
          })
        }
      >
        R$ 99,90 Vitalício
      </Button>
    </div>
  );
}
