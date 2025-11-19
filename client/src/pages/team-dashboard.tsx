import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { NavigationTabs } from "@/components/dashboard/navigation-tabs";
import StockMarketDesk from "@/components/dashboard/stock-market-desk";
import CurrencyTradingDesk from "@/components/dashboard/currency-trading-desk";
import { CurrencyDesk } from "@/components/dashboard/currency-desk";
import { StartupDesk } from "@/components/dashboard/startup-desk";
import StartupTradingDesk from "@/components/dashboard/startup-trading-desk";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ChartLine, LogOut } from "lucide-react";
import type { TeamPortfolio } from "@shared/schema";

export default function TeamDashboard() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"stock" | "currency" | "startup">("stock");
  
  const teamId = parseInt(params.id || "0");
  const storedTeamId = localStorage.getItem("teamId");
  const storedTeamName = localStorage.getItem("teamName");

  // Check if user is authorized to access this team's dashboard
  useEffect(() => {
    if (!storedTeamId || parseInt(storedTeamId) !== teamId) {
      setLocation("/");
      return;
    }
  }, [teamId, storedTeamId, setLocation]);

  const { data: portfolio, isLoading } = useQuery<TeamPortfolio>({
    queryKey: ["/api/teams", teamId, "portfolio"],
    queryFn: async () => {
      const { getTeamPortfolio } = await import("@/lib/api");
      return getTeamPortfolio(teamId);
    },
    enabled: !!teamId && !!storedTeamId,
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  const handleLogout = () => {
    localStorage.removeItem("teamId");
    localStorage.removeItem("teamName");
    setLocation("/");
  };

  if (!storedTeamId || parseInt(storedTeamId) !== teamId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Portföy bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  // When stocks tab is active, show full-screen custom design
  if (activeTab === "stock") {
    return <StockMarketDesk onTabChange={setActiveTab} />;
  }

  // When currency tab is active, show full-screen currency trading desk
  if (activeTab === "currency") {
    return <CurrencyTradingDesk onTabChange={setActiveTab} />;
  }

  // When startup tab is active, show full-screen startup trading desk
  if (activeTab === "startup") {
    return <StartupTradingDesk onTabChange={setActiveTab} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <ChartLine className="text-primary-foreground h-4 w-4" />
                </div>
                <h1 className="text-xl font-bold">Cash or Crash</h1>
              </div>
              <div className="hidden sm:block">
                <span className="text-lg font-semibold text-foreground">
                  {storedTeamName || portfolio?.team.name}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Nakit Bakiye</div>
                <div className="text-lg font-bold">
                  ₺{portfolio ? parseFloat(portfolio.team.cashBalance).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0,00"}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Toplam Portföy</div>
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  ₺{portfolio ? parseFloat(portfolio.totalPortfolioValue).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0,00"}
                </div>
              </div>
              <ThemeToggle />
              <Button variant="secondary" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Çıkış
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "currency" && <CurrencyDesk teamId={teamId} />}
        {activeTab === "startup" && <StartupDesk teamId={teamId} />}
      </main>
    </div>
  );
}