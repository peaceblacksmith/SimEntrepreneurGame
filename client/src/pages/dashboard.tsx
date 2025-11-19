import { useState } from "react";
import { Header } from "@/components/dashboard/header";
import { NavigationTabs } from "@/components/dashboard/navigation-tabs";
import { StockMarketDesk } from "@/components/dashboard/stock-market-desk";
import { CurrencyDesk } from "@/components/dashboard/currency-desk";
import { StartupDesk } from "@/components/dashboard/startup-desk";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"stocks" | "currency" | "startup">("stocks");
  const [selectedTeamId, setSelectedTeamId] = useState(1);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header selectedTeamId={selectedTeamId} onTeamChange={setSelectedTeamId} />
      <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "stocks" && <StockMarketDesk teamId={selectedTeamId} />}
        {activeTab === "currency" && <CurrencyDesk teamId={selectedTeamId} />}
        {activeTab === "startup" && <StartupDesk teamId={selectedTeamId} />}
      </main>
    </div>
  );
}
