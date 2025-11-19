import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTeamPortfolio } from "@/lib/api";
import type { TeamPortfolio } from "@shared/schema";

interface StartupDeskProps {
  teamId: number;
}

export function StartupDesk({ teamId }: StartupDeskProps) {
  const { data: portfolio, isLoading } = useQuery<TeamPortfolio>({
    queryKey: ["/api/teams", teamId, "portfolio"],
    queryFn: () => getTeamPortfolio(teamId),
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!portfolio?.startup) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Girişim Yatırımınız</CardTitle>
            <p className="text-sm text-muted-foreground">Mevcut girişim projesi ataması</p>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-slate-500">
              Bu takıma henüz girişim atanmamış
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const startup = portfolio.startup;

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Your Startup Investment</CardTitle>
          <p className="text-sm text-muted-foreground">Current startup venture assignment</p>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-6">
            <img 
              src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200" 
              alt={`${startup.name} startup workspace`}
              className="w-full max-w-md mx-auto h-48 object-cover rounded-xl shadow-lg"
            />
            
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-slate-900">{startup.name}</h3>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                {startup.description}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="text-sm text-slate-600 mb-1">Investment Value</div>
                  <div className="text-2xl font-bold text-slate-900">
                    ${parseFloat(startup.value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="text-sm text-slate-600 mb-1">Industry</div>
                  <div className="text-lg font-semibold text-slate-900">{startup.industry}</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="text-sm text-slate-600 mb-1">Risk Level</div>
                  <div className="text-lg font-semibold text-orange-600">{startup.riskLevel}</div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-slate-900 mb-2">Key Highlights</h4>
                <ul className="text-sm text-slate-700 space-y-1 text-left">
                  <li>• Patent-pending battery technology with 40% longer lifespan</li>
                  <li>• Partnerships with 3 major residential developers</li>
                  <li>• Expected market entry in Q2 2024</li>
                  <li>• Projected 5-year ROI of 300-500%</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
