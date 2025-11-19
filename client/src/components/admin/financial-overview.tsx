import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Minus, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { patchTeam } from "@/lib/api";
import { type Team } from "@shared/schema";

export function FinancialOverview() {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<"add" | "subtract">("add");
  const { toast } = useToast();

  const { data: teams, isLoading } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
    refetchInterval: 1500,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  const adjustCashMutation = useMutation({
    mutationFn: async ({ teamId, amount, type }: { teamId: number; amount: number; type: "add" | "subtract" }) => {
      const team = teams?.find(t => t.id === teamId);
      if (!team) throw new Error("Team not found");

      const currentBalance = parseFloat(team.cashBalance);
      const newBalance = type === "add" ? currentBalance + amount : currentBalance - amount;

      if (newBalance < 0) {
        throw new Error("Insufficient funds");
      }

      return patchTeam(teamId, { cashBalance: newBalance.toFixed(2) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      toast({ title: "Nakit bakiye güncellendi" });
      setIsDialogOpen(false);
      setAdjustmentAmount("");
      setSelectedTeam(null);
    },
    onError: (error: Error) => {
      toast({ 
        title: error.message === "Insufficient funds" ? "Yetersiz bakiye" : "Güncelleme başarısız", 
        variant: "destructive" 
      });
    },
  });

  const handleAdjustment = (team: Team, type: "add" | "subtract") => {
    setSelectedTeam(team);
    setAdjustmentType(type);
    setIsDialogOpen(true);
  };

  const onSubmit = () => {
    if (!selectedTeam || !adjustmentAmount) return;
    
    const amount = parseFloat(adjustmentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Geçerli bir miktar girin", variant: "destructive" });
      return;
    }

    adjustCashMutation.mutate({
      teamId: selectedTeam.id,
      amount,
      type: adjustmentType,
    });
  };

  const calculateNetProfit = (team: Team) => {
    const currentBalance = parseFloat(team.cashBalance);
    const initialBalance = 100000; // Initial starting balance
    return currentBalance - initialBalance;
  };

  if (isLoading) {
    return <div>Takımlar yükleniyor...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Mali Durum Özeti</h3>
      </div>

      <div className="grid gap-4">
        {teams?.map((team) => {
          const netProfit = calculateNetProfit(team);
          const isProfit = netProfit >= 0;
          
          return (
            <Card key={team.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span>{team.name}</span>
                    <div className={`flex items-center gap-1 text-sm ${
                      isProfit ? "text-green-600" : "text-red-600"
                    }`}>
                      {isProfit ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      {isProfit ? "Kar" : "Zarar"}: ₺{Math.abs(netProfit).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAdjustment(team, "add")}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Para Ekle
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAdjustment(team, "subtract")}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Minus className="h-4 w-4 mr-1" />
                      Para Çıkar
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Mevcut Bakiye</p>
                    <p className="font-medium text-lg">
                      ₺{parseFloat(team.cashBalance).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Başlangıç Bakiyesi</p>
                    <p className="font-medium">₺100.000,00</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Erişim Kodu</p>
                    <p className="font-medium font-mono">{team.accessCode}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedTeam?.name} - {adjustmentType === "add" ? "Para Ekle" : "Para Çıkar"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Miktar (₺)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={adjustmentAmount}
                onChange={(e) => setAdjustmentAmount(e.target.value)}
              />
            </div>
            
            <div className="text-sm text-muted-foreground">
              Mevcut bakiye: ₺{selectedTeam ? parseFloat(selectedTeam.cashBalance).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) : "0,00"}
            </div>
            
            <div className="flex space-x-2">
              <Button 
                onClick={onSubmit} 
                disabled={adjustCashMutation.isPending}
                className="flex-1"
                variant={adjustmentType === "add" ? "default" : "destructive"}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                {adjustmentType === "add" ? "Para Ekle" : "Para Çıkar"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
              >
                İptal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}