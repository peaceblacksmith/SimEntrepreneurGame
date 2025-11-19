import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Settings, DollarSign, TrendingUp, Briefcase, Edit, Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { assignStock, assignCurrency, createTeamStartup, updateTeamStartup, deleteTeamStartup } from "@/lib/api";
import { insertTeamStockSchema, insertTeamCurrencySchema, insertTeamStartupSchema, type Team, type Company, type Currency, type TeamStartup, type TeamPortfolio } from "@shared/schema";
import { z } from "zod";

const teamStockFormSchema = insertTeamStockSchema;
const teamCurrencyFormSchema = insertTeamCurrencySchema;
const teamStartupFormSchema = insertTeamStartupSchema;

export function TeamManagement() {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [managementType, setManagementType] = useState<"stocks" | "currencies" | "startup">("stocks");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStartup, setEditingStartup] = useState<TeamStartup | null>(null);
  const [isStartupListDialogOpen, setIsStartupListDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: teams, isLoading: teamsLoading } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
    refetchInterval: 1500,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  const { data: companies } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
    refetchInterval: 1500,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  const { data: currencies } = useQuery<Currency[]>({
    queryKey: ["/api/currencies"],
    refetchInterval: 1500,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  // Query for team portfolio to get startup details
  const { data: teamPortfolio } = useQuery<TeamPortfolio>({
    queryKey: [`/api/teams/${selectedTeam?.id}/portfolio`],
    enabled: !!selectedTeam && isStartupListDialogOpen,
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  const stockForm = useForm({
    resolver: zodResolver(teamStockFormSchema),
    defaultValues: {
      teamId: 0,
      companyId: 0,
      shares: 0,
    },
  });

  const currencyForm = useForm({
    resolver: zodResolver(teamCurrencyFormSchema),
    defaultValues: {
      teamId: 0,
      currencyId: 0,
      amount: "",
    },
  });

  const startupForm = useForm({
    resolver: zodResolver(teamStartupFormSchema),
    defaultValues: {
      teamId: 0,
      name: "",
      description: "",
      value: "",
      industry: "",
      riskLevel: "",
    },
  });

  const createStockMutation = useMutation({
    mutationFn: async (data: z.infer<typeof teamStockFormSchema>) => {
      return assignStock(data.teamId, data.companyId, data.shares);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      toast({ title: "Hisse başarıyla atandı" });
      setIsDialogOpen(false);
      stockForm.reset();
    },
    onError: () => {
      toast({ title: "Hisse atanamadı", variant: "destructive" });
    },
  });

  const createCurrencyMutation = useMutation({
    mutationFn: async (data: z.infer<typeof teamCurrencyFormSchema>) => {
      return assignCurrency(data.teamId, data.currencyId, data.amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      toast({ title: "Döviz başarıyla atandı" });
      setIsDialogOpen(false);
      currencyForm.reset();
    },
    onError: () => {
      toast({ title: "Döviz atanamadı", variant: "destructive" });
    },
  });

  const createStartupMutation = useMutation({
    mutationFn: async (data: z.infer<typeof teamStartupFormSchema>) => {
      return createTeamStartup(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      queryClient.invalidateQueries({ queryKey: [`/api/teams/${selectedTeam?.id}/portfolio`] });
      toast({ title: "Girişim başarıyla atandı" });
      setIsDialogOpen(false);
      startupForm.reset();
    },
    onError: () => {
      toast({ title: "Girişim atanamadı", variant: "destructive" });
    },
  });

  const updateStartupMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<z.infer<typeof teamStartupFormSchema>> }) => {
      return updateTeamStartup(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      queryClient.invalidateQueries({ queryKey: [`/api/teams/${selectedTeam?.id}/portfolio`] });
      toast({ title: "Girişim başarıyla güncellendi" });
      setIsDialogOpen(false);
      setEditingStartup(null);
      startupForm.reset();
    },
    onError: () => {
      toast({ title: "Girişim güncellenemedi", variant: "destructive" });
    },
  });

  const deleteStartupMutation = useMutation({
    mutationFn: async (id: number) => {
      return deleteTeamStartup(id);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      queryClient.invalidateQueries({ queryKey: [`/api/teams/${selectedTeam?.id}/portfolio`] });
      toast({ 
        title: "Girişim başarıyla satıldı", 
        description: `₺${parseFloat(data.soldValue).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} nakit bakiyeye eklendi`
      });
      setIsStartupListDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Girişim satılamadı", variant: "destructive" });
    },
  });

  const handleManageTeam = (team: Team, type: "stocks" | "currencies" | "startup") => {
    setSelectedTeam(team);
    setManagementType(type);
    
    if (type === "stocks") {
      stockForm.reset({ teamId: team.id, companyId: 0, shares: 0 });
      setIsDialogOpen(true);
    } else if (type === "currencies") {
      currencyForm.reset({ teamId: team.id, currencyId: 0, amount: "" });
      setIsDialogOpen(true);
    } else if (type === "startup") {
      // For startup management, first show the startup list/management dialog
      setIsStartupListDialogOpen(true);
    }
  };

  const handleAddNewStartup = (team: Team) => {
    setSelectedTeam(team);
    setManagementType("startup");
    setEditingStartup(null);
    startupForm.reset({ 
      teamId: team.id, 
      name: "", 
      description: "", 
      value: "", 
      industry: "", 
      riskLevel: "" 
    });
    setIsStartupListDialogOpen(false);
    setIsDialogOpen(true);
  };

    const handleEditStartup = (startup: TeamStartup) => {
    setEditingStartup(startup);
    setManagementType("startup");
    startupForm.reset({
      teamId: startup.teamId,
      name: startup.name || "",
      description: startup.description || "",
      value: startup.value || "",
      industry: startup.industry || "",
      riskLevel: startup.riskLevel || "",
    });
    setIsStartupListDialogOpen(false);
    setIsDialogOpen(true);
  };

  const handleSellStartup = async (startup: TeamStartup) => {
    const startupValue = parseFloat(startup.value).toLocaleString("tr-TR", {
      minimumFractionDigits: 2,
    });

    const startupName = startup?.name || "Girişim";

    const message =
      `${startupName} girişimini satmak istediğinizden emin misiniz?\n\n` +
      `₺${startupValue} takımın nakit bakiyesine eklenecek.`;

    if (window.confirm(message)) {
      deleteStartupMutation.mutate(startup.id);
    }
  };

  const onSubmitStock = (data: z.infer<typeof teamStockFormSchema>) => {
    createStockMutation.mutate(data);
  };

  const onSubmitCurrency = (data: z.infer<typeof teamCurrencyFormSchema>) => {
    createCurrencyMutation.mutate(data);
  };

  const onSubmitStartup = (data: z.infer<typeof teamStartupFormSchema>) => {
    if (editingStartup) {
      // Update existing startup
      updateStartupMutation.mutate({ id: editingStartup.id, data });
    } else {
      // Create new startup
      createStartupMutation.mutate(data);
    }
  };


  if (teamsLoading) {
    return <div>Takımlar yükleniyor...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Takım Yönetimi</h3>
      </div>

      <div className="grid gap-4">
        {teams?.map((team) => (
          <Card key={team.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {team?.name ?? "İsimsiz takım"}
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleManageTeam(team, "stocks")}
                  >
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Hisseler
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleManageTeam(team, "currencies")}
                  >
                    <DollarSign className="h-4 w-4 mr-1" />
                    Dövizler
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleManageTeam(team, "startup")}
                  >
                    <Briefcase className="h-4 w-4 mr-1" />
                    Girişim
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
          <CardContent>
              <p className="text-sm text-muted-foreground">
                Nakit Bakiye: ₺{parseFloat(team.cashBalance).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </CardContent>

          </Card>
        ))}
      </div>

      {/* Startup Management Dialog */}
      <Dialog open={isStartupListDialogOpen} onOpenChange={setIsStartupListDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
 
              {selectedTeam?.name ?? "Takım"} Yönetimi - {managementType === "stocks"
                ? "Hisseler"
                : managementType === "currencies"
                ? "Dövizler"
                : editingStartup
                ? "Girişim Düzenle"
              : "Yeni Girişim"}

            </DialogTitle>

          </DialogHeader>
          
          <div className="space-y-4">
            {teamPortfolio?.startup ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      {teamPortfolio?.startup?.name ?? "İsimsiz girişim"}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditStartup(teamPortfolio.startup!)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Düzenle
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleSellStartup(teamPortfolio.startup!)}
                        disabled={deleteStartupMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Sat
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Açıklama</p>
                      <p className="font-medium">{teamPortfolio.startup.description}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Sektör</p>
                      <p className="font-medium">{teamPortfolio.startup.industry}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Risk Seviyesi</p>
                      <Badge variant={
                        teamPortfolio.startup.riskLevel === 'Düşük' ? 'default' :
                        teamPortfolio.startup.riskLevel === 'Orta' ? 'secondary' :
                        teamPortfolio.startup.riskLevel === 'Orta-Yüksek' ? 'destructive' : 'destructive'
                      }>
                        {teamPortfolio.startup.riskLevel}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Yatırım Değeri</p>
                      <p className="font-medium">
                        ₺{parseFloat(teamPortfolio.startup.value).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Bu takımın henüz girişimi yok.</p>
                <Button onClick={() => selectedTeam && handleAddNewStartup(selectedTeam)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Girişim Ekle
                </Button>
              </div>
            )}
            
            {teamPortfolio?.startup && (
              <div className="pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => selectedTeam && handleAddNewStartup(selectedTeam)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Girişim Ekle
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedTeam?} Yönetimi - {managementType === "stocks" ? "Hisseler" : managementType === "currencies" ? "Dövizler" : editingStartup ? "Girişim Düzenle" : "Yeni Girişim"}
            </DialogTitle>
          </DialogHeader>
          
          {managementType === "stocks" && (
            <Form {...stockForm}>
              <form onSubmit={stockForm.handleSubmit(onSubmitStock)} className="space-y-4">
                <FormField
                  control={stockForm.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Şirket</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Şirket seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companies?.map((company) => (
                            <SelectItem key={company.id} value={company.id.toString()}>
                              {company?.name ?? "İsimsiz şirket"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={stockForm.control}
                  name="shares"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hisse Sayısı</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={createStockMutation.isPending}>
                  Hisse Ata
                </Button>
              </form>
            </Form>
          )}

          {managementType === "currencies" && (
            <Form {...currencyForm}>
              <form onSubmit={currencyForm.handleSubmit(onSubmitCurrency)} className="space-y-4">
                <FormField
                  control={currencyForm.control}
                  name="currencyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Döviz</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Döviz seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currencies?.map((currency) => (
                            <SelectItem key={currency.id} value={currency.id.toString()}>
                              {currency?.name ?? "Döviz"} ({currency?.code ?? ""})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={currencyForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Miktar</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={createCurrencyMutation.isPending}>
                  Döviz Ata
                </Button>
              </form>
            </Form>
          )}

          {managementType === "startup" && (
            <Form {...startupForm}>
              <form onSubmit={startupForm.handleSubmit(onSubmitStartup)} className="space-y-4">
                <FormField
                  control={startupForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Girişim Adı</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={startupForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Açıklama</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={startupForm.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Yatırım Değeri (₺)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={startupForm.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sektör</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={startupForm.control}
                  name="riskLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Risk Seviyesi</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Risk seviyesi seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Düşük">Düşük</SelectItem>
                          <SelectItem value="Orta">Orta</SelectItem>
                          <SelectItem value="Orta-Yüksek">Orta-Yüksek</SelectItem>
                          <SelectItem value="Yüksek">Yüksek</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={createStartupMutation.isPending || updateStartupMutation.isPending}>
                  {editingStartup ? "Girişimi Güncelle" : "Girişim Ata"}
                </Button>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
