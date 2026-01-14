"use client";

import { useStripe } from "@/app/hooks/useStripe";
import Button from "../ui/button";

export default function PortalButton() {
  const { handleCreateStripePortal } = useStripe();

  return <Button onClick={handleCreateStripePortal}>Portal</Button>;
}