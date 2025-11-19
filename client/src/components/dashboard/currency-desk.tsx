import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getTeamPortfolio } from "@/lib/api";
import type { Currency, TeamPortfolio } from "@shared/schema";

interface CurrencyDeskProps {
  teamId: number;
}

export function CurrencyDesk({ teamId }: CurrencyDeskProps) {
  const { data: portfolio, isLoading: portfolioLoading } = useQuery<TeamPortfolio>({
    queryKey: ["/api/teams", teamId, "portfolio"],
    queryFn: () => getTeamPortfolio(teamId),
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  const { data: currencies, isLoading: currenciesLoading } = useQuery<Currency[]>({
    queryKey: ["/api/currencies"],
    refetchInterval: 1500,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  if (portfolioLoading || currenciesLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Team's Currency Holdings */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Döviz Portföyünüz</CardTitle>
            <p className="text-sm text-muted-foreground">Yabancı para birimleriniz</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {portfolio?.currencies.map((currency) => (
                <div key={currency.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={currency.currency.logoUrl || "/api/placeholder/40/40"} 
                      alt={currency.currency.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div>
                      <div className="font-medium text-slate-900">{currency.currency.name} ({currency.currency.code})</div>
                      <div className="text-sm text-slate-600">
                        {currency.currency.code === "JPY" ? "¥" : currency.currency.code === "EUR" ? "€" : currency.currency.code === "GBP" ? "£" : "$"}
                        {parseFloat(currency.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-slate-900">
                      ₺{(parseFloat(currency.amount) * parseFloat(currency.currency.rate)).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm text-green-600">
                      {parseFloat(currency.currency.rate).toFixed(currency.currency.code === "JPY" ? 4 : 3)} TL
                    </div>
                  </div>
                </div>
              ))}
              
              {portfolio?.currencies.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  Döviz yok
                </div>
              )}
              
              <Separator />
              <div className="flex justify-between items-center pt-4">
                <span className="font-medium text-slate-900">Toplam Döviz Değeri:</span>
                <span className="font-bold text-lg text-slate-900">
                  ₺{portfolio ? parseFloat(portfolio.totalCurrencyValue).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0,00"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Currencies */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Döviz Kurları</CardTitle>
            <p className="text-sm text-muted-foreground">Güncel döviz kurları</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currencies?.map((currency) => (
                <div key={currency.id} className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={currency.logoUrl || "/api/placeholder/48/48"} 
                        alt={currency.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className="font-medium text-slate-900">{currency.name}</h3>
                        <p className="text-sm text-slate-600">{currency.code}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="text-red-600">Alış: ₺{parseFloat(currency.rate).toFixed(2)}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-green-600">Satış: ₺{parseFloat(currency.sellRate).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
