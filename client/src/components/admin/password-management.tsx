import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Key, Users, Shield, Edit, Plus, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { updateTeamPassword, createTeam, updateTeamName, updateAdminPassword } from "@/lib/api";
import { type Team } from "@shared/schema";
import { z } from "zod";

const teamPasswordFormSchema = z.object({
  teamId: z.number().min(1, "Lütfen bir takım seçin"),
  newAccessCode: z.string().min(4, "Erişim kodu en az 4 karakter olmalıdır"),
});

const adminPasswordFormSchema = z.object({
  newPassword: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
});

const createTeamFormSchema = z.object({
  name: z.string().min(2, "Takım adı en az 2 karakter olmalıdır"),
  cashBalance: z.string().min(1, "Başlangıç bakiyesi gereklidir"),
  accessCode: z.string().min(4, "Erişim kodu en az 4 karakter olmalıdır"),
});

const editTeamNameFormSchema = z.object({
  teamId: z.number().min(1, "Lütfen bir takım seçin"),
  newName: z.string().min(2, "Takım adı en az 2 karakter olmalıdır"),
});

export function PasswordManagement() {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const { toast } = useToast();

  const { data: teams, isLoading: teamsLoading } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  const teamPasswordForm = useForm({
    resolver: zodResolver(teamPasswordFormSchema),
    defaultValues: {
      teamId: 0,
      newAccessCode: "",
    },
  });

  const adminPasswordForm = useForm({
    resolver: zodResolver(adminPasswordFormSchema),
    defaultValues: {
      newPassword: "",
    },
  });

  const createTeamForm = useForm({
    resolver: zodResolver(createTeamFormSchema),
    defaultValues: {
      name: "",
      cashBalance: "100000.00",
      accessCode: "",
    },
  });

  const editTeamNameForm = useForm({
    resolver: zodResolver(editTeamNameFormSchema),
    defaultValues: {
      teamId: 0,
      newName: "",
    },
  });

  const updateTeamPasswordMutation = useMutation({
    mutationFn: async (data: z.infer<typeof teamPasswordFormSchema>) => {
      return updateTeamPassword(data.teamId, data.newAccessCode);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      toast({ 
        title: "Başarılı", 
        description: "Takım erişim kodu güncellendi" 
      });
      teamPasswordForm.reset();
      setSelectedTeam(null);
    },
    onError: (error: Error) => {
      toast({ 
        title: "Hata", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const createTeamMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createTeamFormSchema>) => {
      return createTeam(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      toast({ 
        title: "Başarılı", 
        description: "Yeni takım oluşturuldu" 
      });
      createTeamForm.reset();
    },
    onError: (error: Error) => {
      toast({ 
        title: "Hata", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const updateTeamNameMutation = useMutation({
    mutationFn: async (data: z.infer<typeof editTeamNameFormSchema>) => {
      return updateTeamName(data.teamId, data.newName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      toast({ 
        title: "Başarılı", 
        description: "Takım adı güncellendi" 
      });
      editTeamNameForm.reset();
      setEditingTeam(null);
    },
    onError: (error: Error) => {
      toast({ 
        title: "Hata", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const updateAdminPasswordMutation = useMutation({
    mutationFn: async (data: z.infer<typeof adminPasswordFormSchema>) => {
      return updateAdminPassword(data.newPassword);
    },
    onSuccess: () => {
      toast({ 
        title: "Başarılı", 
        description: "Admin şifresi güncellendi" 
      });
      adminPasswordForm.reset();
    },
    onError: (error: Error) => {
      toast({ 
        title: "Hata", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const handleTeamPasswordSubmit = (data: z.infer<typeof teamPasswordFormSchema>) => {
    updateTeamPasswordMutation.mutate(data);
  };

  const handleAdminPasswordSubmit = (data: z.infer<typeof adminPasswordFormSchema>) => {
    updateAdminPasswordMutation.mutate(data);
  };

  const handleCreateTeamSubmit = (data: z.infer<typeof createTeamFormSchema>) => {
    createTeamMutation.mutate(data);
  };

  const handleEditTeamNameSubmit = (data: z.infer<typeof editTeamNameFormSchema>) => {
    updateTeamNameMutation.mutate(data);
  };

  const handleTeamSelection = (teamId: string) => {
    const team = teams?.find(t => t.id === parseInt(teamId));
    setSelectedTeam(team || null);
    teamPasswordForm.setValue("teamId", parseInt(teamId));
  };

  const handleEditTeamSelection = (teamId: string) => {
    const team = teams?.find(t => t.id === parseInt(teamId));
    setEditingTeam(team || null);
    editTeamNameForm.setValue("teamId", parseInt(teamId));
    editTeamNameForm.setValue("newName", team?.name || "");
  };

  if (teamsLoading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Key className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Şifre Yönetimi</h2>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Team Password Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Takım Erişim Kodları
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...teamPasswordForm}>
              <form onSubmit={teamPasswordForm.handleSubmit(handleTeamPasswordSubmit)} className="space-y-4">
                <FormField
                  control={teamPasswordForm.control}
                  name="teamId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Takım Seçin</FormLabel>
                      <Select onValueChange={handleTeamSelection}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Bir takım seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {teams?.map((team) => (
                            <SelectItem key={team.id} value={team.id.toString()}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedTeam && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm font-medium">Mevcut Erişim Kodu:</div>
                    <div className="text-lg font-mono">{selectedTeam.accessCode}</div>
                  </div>
                )}

                <FormField
                  control={teamPasswordForm.control}
                  name="newAccessCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Yeni Erişim Kodu</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Yeni erişim kodunu girin" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={updateTeamPasswordMutation.isPending || !selectedTeam}
                  className="w-full"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {updateTeamPasswordMutation.isPending ? "Güncelleniyor..." : "Erişim Kodunu Güncelle"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Admin Password Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Admin Şifresi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...adminPasswordForm}>
              <form onSubmit={adminPasswordForm.handleSubmit(handleAdminPasswordSubmit)} className="space-y-4">
                <FormField
                  control={adminPasswordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Yeni Admin Şifresi</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="password" 
                          placeholder="Yeni admin şifresini girin" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="text-sm text-muted-foreground">
                  <p>• Şifre en az 6 karakter olmalıdır</p>
                  <p>• Güvenli bir şifre kullanın</p>
                  <p>• Bu şifreyi güvenli bir yerde saklayın</p>
                </div>

                <Button 
                  type="submit" 
                  disabled={updateAdminPasswordMutation.isPending}
                  className="w-full"
                  variant="destructive"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  {updateAdminPasswordMutation.isPending ? "Güncelleniyor..." : "Admin Şifresini Güncelle"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Team Creation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Yeni Takım Oluştur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...createTeamForm}>
              <form onSubmit={createTeamForm.handleSubmit(handleCreateTeamSubmit)} className="space-y-4">
                <FormField
                  control={createTeamForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Takım Adı</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Takım adını girin" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createTeamForm.control}
                  name="accessCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Erişim Kodu</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Erişim kodunu girin" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createTeamForm.control}
                  name="cashBalance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Başlangıç Bakiyesi (₺)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" placeholder="100000.00" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={createTeamMutation.isPending}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {createTeamMutation.isPending ? "Oluşturuluyor..." : "Takım Oluştur"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Team Name Editing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Takım Adı Düzenle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...editTeamNameForm}>
            <form onSubmit={editTeamNameForm.handleSubmit(handleEditTeamNameSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={editTeamNameForm.control}
                  name="teamId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Takım Seçin</FormLabel>
                      <Select onValueChange={handleEditTeamSelection}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Düzenlenecek takımı seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {teams?.map((team) => (
                            <SelectItem key={team.id} value={team.id.toString()}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editTeamNameForm.control}
                  name="newName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Yeni Takım Adı</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Yeni takım adını girin" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button 
                type="submit" 
                disabled={updateTeamNameMutation.isPending || !editingTeam}
                className="w-full"
              >
                <Edit className="h-4 w-4 mr-2" />
                {updateTeamNameMutation.isPending ? "Güncelleniyor..." : "Takım Adını Güncelle"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Teams List with Current Access Codes */}
      <Card>
        <CardHeader>
          <CardTitle>Tüm Takımlar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {teams?.map((team) => (
              <div key={team.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="font-medium text-lg">{team.name}</div>
                <div className="text-sm text-muted-foreground">
                  ID: <span className="font-mono">{team.id}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Erişim Kodu: <span className="font-mono font-bold">{team.accessCode}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Bakiye: <span className="font-semibold">₺{parseFloat(team.cashBalance).toLocaleString('tr-TR')}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}