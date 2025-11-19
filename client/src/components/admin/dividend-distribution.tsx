import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { distributeDividend } from "@/lib/api";
import { type Company, type Team } from "@shared/schema";

export function DividendDistribution() {
  const [selectedCompany, setSelectedCompany] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: companies, isLoading: companiesLoading } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
    refetchInterval: 1500,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  const { data: teams, isLoading: teamsLoading } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
    refetchInterval: 1500,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  const distributeDividendMutation = useMutation({
    mutationFn: async (companyId: number) => {
      return distributeDividend(companyId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      toast({ 
        title: "Temettü Dağıtıldı", 
        description: `${data.totalDistributed} adet hisse temettüsü ${data.affectedTeams} takıma dağıtıldı.`
      });
      setIsDialogOpen(false);
      setSelectedCompany(null);
    },
    onError: () => {
      toast({ title: "Temettü dağıtımı başarısız", variant: "destructive" });
    },
  });

  const handleDistribute = () => {
    if (selectedCompany) {
      distributeDividendMutation.mutate(selectedCompany);
    }
  };

  const getCompanyWithDividends = () => {
    return companies?.filter(company => parseFloat(company.dividend) > 0) || [];
  };

  if (companiesLoading || teamsLoading) {
    return <div>Loading...</div>;
  }

  const companiesWithDividends = getCompanyWithDividends();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Temettü Dağıtımı
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Hisse sahiplerinetemettü ödemesi yapın
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-4">
            {companiesWithDividends.map((company) => (
              <div key={company.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <img 
                    src={company.logoUrl || "/api/placeholder/40/40"} 
                    alt={company.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div>
                    <h4 className="font-medium">{company.name} ({company.symbol})</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        %{company.dividend} temettü
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        ₺{parseFloat(company.price).toFixed(2)} hisse fiyatı
                      </span>
                    </div>
                  </div>
                </div>
                <Dialog open={isDialogOpen && selectedCompany === company.id} onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) setSelectedCompany(null);
                }}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => setSelectedCompany(company.id)}
                      className="gap-2"
                    >
                      <TrendingUp className="h-4 w-4" />
                      Temettü Dağıt
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Temettü Dağıtımı Onayı</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <h4 className="font-medium">{company.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          %{company.dividend} temettü oranında ödeme yapılacak
                        </p>
                      </div>
                      <p className="text-sm">
                        Bu şirkette hissesi olan tüm takımlara temettü hissesi verilecek. 
                        Verilecek hisse: (Mevcut hisse adedi × Temettü oranı)
                      </p>
                      <div className="flex gap-2 justify-end">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setIsDialogOpen(false);
                            setSelectedCompany(null);
                          }}
                        >
                          İptal
                        </Button>
                        <Button 
                          onClick={handleDistribute}
                          disabled={distributeDividendMutation.isPending}
                        >
                          {distributeDividendMutation.isPending ? "Dağıtılıyor..." : "Temettü Dağıt"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            ))}
          </div>
          
          {companiesWithDividends.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Temettü ödeyen şirket bulunmuyor</p>
              <p className="text-sm">Şirket yönetiminden temettü oranı belirleyin</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}