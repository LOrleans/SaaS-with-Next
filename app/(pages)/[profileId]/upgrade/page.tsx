import Header from "@/app/components/landing-page/Header";
import Button from "@/app/components/ui/button";
import PlanButtons from "./plan-buttons";

export default function UpgradePage(){
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <Header />
      <h2 className="text-2xl font-bold">Escolha o plano</h2>
      <PlanButtons />
    </div>
  )
}