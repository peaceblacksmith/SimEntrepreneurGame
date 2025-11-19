import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { createCurrency, updateCurrency, deleteCurrency } from "@/lib/api";
import { type Currency } from "@shared/schema";
import { z } from "zod";

// Form schema for creating/updating currencies in the admin UI.
// Backend will derive sellRate from rate; we only collect name, code, rate and optional logo.
const currencyFormSchema = z.object({
  name: z.string().min(1, "Currency name is required"),
  code: z.string().min(1, "Currency code is required"),
  rate: z
    .string()
    .min(1, "Rate is required")
    .refine((val: string) => {
      const n = parseFloat(val);
      return !isNaN(n) && n > 0;
    }, "Rate must be a positive number"),
  logo: z.instanceof(FileList).optional(),
});

type CurrencyFormData = z.infer<typeof currencyFormSchema>;

export function CurrencyManagement() {
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: currencies, isLoading } = useQuery<Currency[]>({
    queryKey: ["/api/currencies"],
    refetchInterval: 1500,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  const form = useForm<CurrencyFormData>({
    resolver: zodResolver(currencyFormSchema),
    defaultValues: {
      name: "",
      code: "",
      rate: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CurrencyFormData) => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("code", data.code);
      formData.append("rate", data.rate);
       // insertCurrencySchema on the backend requires sellRate as well,
       // so we derive it from the buy rate with a 2% spread.
       const rateValue = parseFloat(data.rate);
       const sellRate = (rateValue * 0.98).toFixed(6);
       formData.append("sellRate", sellRate);
      if (data.logo && data.logo.length > 0) {
        formData.append("logo", data.logo[0]);
      }

      return createCurrency(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/currencies"] });
      toast({ title: "Currency created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to create currency", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CurrencyFormData }) => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("code", data.code);
      formData.append("rate", data.rate);
      if (data.logo && data.logo.length > 0) {
        formData.append("logo", data.logo[0]);
      }

      return updateCurrency(id, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/currencies"] });
      toast({ title: "Currency updated successfully" });
      setIsDialogOpen(false);
      setEditingCurrency(null);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to update currency", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return deleteCurrency(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/currencies"] });
      toast({ title: "Currency deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete currency", variant: "destructive" });
    },
  });

  const onSubmit = (data: CurrencyFormData) => {
    if (editingCurrency) {
      updateMutation.mutate({ id: editingCurrency.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (currency: Currency) => {
    setEditingCurrency(currency);
    form.reset({
      name: currency.name,
      code: currency.code,
      rate: currency.rate,
    });
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingCurrency(null);
    form.reset({
      name: "",
      code: "",
      rate: "",
    });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <div>Loading currencies...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Currency Management</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add Currency
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCurrency ? "Edit Currency" : "Add Currency"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency Code</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exchange Rate (to USD)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.000001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="logo"
                  render={({ field: { onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Logo</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => onChange(e.target.files)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingCurrency ? "Update Currency" : "Create Currency"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {currencies?.map((currency) => (
          <Card key={currency.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <img 
                    src={currency.logoUrl || "/api/placeholder/40/40"} 
                    alt={currency.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div>
                    <h4 className="font-medium">{currency.name} ({currency.code})</h4>
                    <p className="text-sm text-muted-foreground">
                      {parseFloat(currency.rate).toFixed(6)} USD
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(currency)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteMutation.mutate(currency.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
