import { ChartLine, Coins, Rocket } from "lucide-react";

interface NavigationTabsProps {
  activeTab: "stocks" | "currency" | "startup";
  onTabChange: (tab: "stocks" | "currency" | "startup") => void;
}

export function NavigationTabs({ activeTab, onTabChange }: NavigationTabsProps) {
  const tabs = [
    { id: "stocks" as const, label: "Borsa Masası", icon: ChartLine },
    { id: "currency" as const, label: "Döviz Masası", icon: Coins },
    { id: "startup" as const, label: "Girişim Masası", icon: Rocket },
  ];

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon className="h-4 w-4 mr-2 inline" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
