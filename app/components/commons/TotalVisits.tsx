import { manageAuth } from "@/app/actions/manage-auth";
import { auth } from "@/app/lib/auth";
import { TrendingUp } from "lucide-react";
import PortalButton from "./portal-button";
import Button from "../ui/button";

export default async function TotalVisits({
  totalVisits = 0,
  showBar = false,
}: {
  totalVisits?: number;
  showBar?: boolean;
}) {
  const session = await auth();

  return (
    <div className="w-min whitespace-nowrap flex items-center gap-5 bg-background-secondary border border-border-primary  px-8 py-3 rounded-xl shadow-lg">
      <span className="font-bold text-white">Total de Visitas:</span>
      <div className="flex items-center gap-2 text-accent-green">
        <span className="text-3xl font-bold">{totalVisits}</span>
        <TrendingUp />
      </div>
      {showBar && (
        <div className="flex items-center gap-2">
          {session?.user.isSubscribed && <PortalButton />}
          <form action={manageAuth}>
            <Button>Sair</Button>
          </form>
        </div>
      )}
    </div>
  );
}
