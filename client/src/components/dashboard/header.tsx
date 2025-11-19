import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChartLine, Settings } from "lucide-react";
import { getTeamPortfolio } from "@/lib/api";
import type { Team, TeamPortfolio } from "@shared/schema";

interface HeaderProps {
  selectedTeamId: number;
  onTeamChange: (teamId: number) => void;
}

export function Header({ selectedTeamId, onTeamChange }: HeaderProps) {
  const { data: teams } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
    refetchInterval: 1500,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  const { data: portfolio } = useQuery<TeamPortfolio>({
    queryKey: ["/api/teams", selectedTeamId, "portfolio"],
    queryFn: () => getTeamPortfolio(selectedTeamId),
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ChartLine className="text-primary-foreground h-4 w-4" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">Cash or Crash</h1>
            </div>
            <div className="hidden sm:block">
              <Select value={selectedTeamId.toString()} onValueChange={(value) => onTeamChange(parseInt(value))}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {teams?.map((team) => (
                    <SelectItem key={team.id} value={team.id.toString()}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <div className="text-sm text-slate-600">Cash Balance</div>
              <div className="text-lg font-bold text-slate-900">
                ${portfolio ? parseFloat(portfolio.team.cashBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-600">Total Portfolio</div>
              <div className="text-lg font-bold text-green-600">
                ${portfolio ? parseFloat(portfolio.totalPortfolioValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
              </div>
            </div>
            <Link href="/admin">
              <Button variant="secondary" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Admin Panel
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
