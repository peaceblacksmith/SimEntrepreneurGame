import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Upload, FileText, CheckCircle, AlertTriangle, Edit3 } from "lucide-react";
import type { Company, Currency } from "@shared/schema";

interface PriceUpdate {
  id: number;
  name: string;
  currentPrice: string;
  newPrice: string;
  valid: boolean;
  error?: string;
}

export function BulkPriceUpdate() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [csvText, setCsvText] = useState<string>("");
  const [stockUpdates, setStockUpdates] = useState<PriceUpdate[]>([]);
  const [currencyUpdates, setCurrencyUpdates] = useState<PriceUpdate[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Default CSV template
  const defaultCsvTemplate = `type,name,new_price
stock,Apple Inc.,175.50
stock,Microsoft Corporation,380.25
stock,Amazon.com Inc.,145.75
stock,Google (Alphabet),142.80
stock,Tesla Inc.,248.90
currency,ABD Doları,34.85
currency,Euro,37.92
currency,İngiliz Sterlini,43.28
currency,Japon Yeni,0.23
currency,İsviçre Frangı,38.54`;

  const { data: companies } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const { data: currencies } = useQuery<Currency[]>({
    queryKey: ["/api/currencies"],
  });

  const updateStockPricesMutation = useMutation({
    mutationFn: async (updates: { companyId: number; newPrice: string }[]) => {
      const results = [];
      for (const update of updates) {
        const response = await apiRequest(`/api/companies/${update.companyId}`, {
          method: "PATCH",
          body: JSON.stringify({ price: update.newPrice }),
        });
        results.push(response);
      }
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({ title: "Hisse fiyatları başarıyla güncellendi" });
      resetForm();
    },
    onError: () => {
      toast({ title: "Hisse fiyatları güncellenemedi", variant: "destructive" });
    },
  });

  const updateCurrencyRatesMutation = useMutation({
    mutationFn: async (updates: { currencyId: number; newRate: string }[]) => {
      const results = [];
      for (const update of updates) {
        const response = await apiRequest(`/api/currencies/${update.currencyId}`, {
          method: "PATCH",
          body: JSON.stringify({ rate: update.newRate }),
        });
        results.push(response);
      }
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/currencies"] });
      toast({ title: "Döviz kurları başarıyla güncellendi" });
      resetForm();
    },
    onError: () => {
      toast({ title: "Döviz kurları güncellenemedi", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFile(null);
    setCsvText("");
    setStockUpdates([]);
    setCurrencyUpdates([]);
  };

  const processCsvText = () => {
    if (!csvText.trim()) {
      toast({ title: "CSV metni boş olamaz", variant: "destructive" });
      return;
    }
    setIsProcessing(true);
    
    try {
      const { stocks, currencies } = parseCSV(csvText);
      setStockUpdates(stocks);
      setCurrencyUpdates(currencies);
    } catch (error) {
      toast({ title: "CSV verisi işlenemedi", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const loadTemplate = () => {
    setCsvText(defaultCsvTemplate);
  };

  const parseCSV = (text: string): { stocks: PriceUpdate[]; currencies: PriceUpdate[] } => {
    const lines = text.trim().split('\n');
    const stocks: PriceUpdate[] = [];
    const currencies: PriceUpdate[] = [];

    // Skip header line if it exists
    const dataLines = lines.filter(line => 
      line.toLowerCase().includes('type,') || 
      line.toLowerCase().includes('stock,') || 
      line.toLowerCase().includes('currency,')
    );

    for (const line of dataLines) {
      const [type, nameStr, priceStr] = line.split(',').map(s => s.trim());
      
      if (!type || !nameStr || !priceStr) continue;
      if (type.toLowerCase() === 'type') continue; // Skip header

      const price = parseFloat(priceStr);

      if (type.toLowerCase() === 'stock' || type.toLowerCase() === 'company') {
        const company = companies?.find(c => c.name.toLowerCase() === nameStr.toLowerCase());
        if (company && !isNaN(price) && price > 0) {
          stocks.push({
            id: company.id,
            name: company.name,
            currentPrice: company.price,
            newPrice: price.toFixed(2),
            valid: true
          });
        } else {
          stocks.push({
            id: 0,
            name: nameStr,
            currentPrice: company?.price || "0.00",
            newPrice: priceStr,
            valid: false,
            error: company ? "Geçersiz fiyat" : "Şirket bulunamadı"
          });
        }
      } else if (type.toLowerCase() === 'currency') {
        const currency = currencies?.find(c => c.name.toLowerCase() === nameStr.toLowerCase());
        if (currency && !isNaN(price) && price > 0) {
          currencies.push({
            id: currency.id,
            name: currency.name,
            currentPrice: currency.rate,
            newPrice: price.toFixed(4),
            valid: true
          });
        } else {
          currencies.push({
            id: 0,
            name: nameStr,
            currentPrice: currency?.rate || "0.0000",
            newPrice: priceStr,
            valid: false,
            error: currency ? "Geçersiz kur" : "Döviz bulunamadı"
          });
        }
      }
    }

    return { stocks, currencies };
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    if (!uploadedFile.name.endsWith('.csv')) {
      toast({ title: "Sadece CSV dosyaları desteklenir", variant: "destructive" });
      return;
    }

    setFile(uploadedFile);
    setIsProcessing(true);

    try {
      const text = await uploadedFile.text();
      const { stocks, currencies } = parseCSV(text);
      setStockUpdates(stocks);
      setCurrencyUpdates(currencies);
    } catch (error) {
      toast({ title: "Dosya okunamadı", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmStockUpdates = () => {
    const validUpdates = stockUpdates
      .filter(update => update.valid)
      .map(update => ({ companyId: update.id, newPrice: update.newPrice }));
    
    if (validUpdates.length === 0) {
      toast({ title: "Güncellenecek geçerli hisse fiyatı yok", variant: "destructive" });
      return;
    }

    updateStockPricesMutation.mutate(validUpdates);
  };

  const confirmCurrencyUpdates = () => {
    const validUpdates = currencyUpdates
      .filter(update => update.valid)
      .map(update => ({ currencyId: update.id, newRate: update.newRate }));
    
    if (validUpdates.length === 0) {
      toast({ title: "Güncellenecek geçerli döviz kuru yok", variant: "destructive" });
      return;
    }

    updateCurrencyRatesMutation.mutate(validUpdates);
  };

  const validStocks = stockUpdates.filter(u => u.valid).length;
  const validCurrencies = currencyUpdates.filter(u => u.valid).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Toplu Fiyat Güncelleme
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          CSV dosyası ile hisse ve döviz fiyatlarını toplu olarak güncelleyin
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload */}
        <div className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="csv-file">CSV Dosyası</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isProcessing}
            />
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-2">CSV Format Örneği:</p>
            <div className="bg-muted p-3 rounded font-mono text-xs">
              stock,1,150.75<br/>
              stock,2,89.50<br/>
              currency,1,34.2500<br/>
              currency,2,0.8750
            </div>
            <p className="mt-2">
              <strong>Format:</strong> tip,id,yeni_fiyat
            </p>
          </div>
        </div>

        {/* Processing State */}
        {isProcessing && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            Dosya işleniyor...
          </div>
        )}

        {/* Preview */}
        {file && !isProcessing && (stockUpdates.length > 0 || currencyUpdates.length > 0) && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="font-medium">Önizleme: {file.name}</span>
            </div>

            <Tabs defaultValue="stocks" className="w-full">
              <TabsList>
                <TabsTrigger value="stocks">
                  Hisseler ({validStocks}/{stockUpdates.length})
                </TabsTrigger>
                <TabsTrigger value="currencies">
                  Dövizler ({validCurrencies}/{currencyUpdates.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="stocks" className="space-y-4">
                {stockUpdates.length > 0 ? (
                  <div className="space-y-2">
                    {stockUpdates.map((update, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded border ${
                          update.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {update.valid ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          )}
                          <div>
                            <p className="font-medium">{update.name}</p>
                            {update.error && (
                              <p className="text-sm text-red-600">{update.error}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            ₺{update.currentPrice} → ₺{update.newPrice}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {validStocks > 0 && (
                      <Button
                        onClick={confirmStockUpdates}
                        disabled={updateStockPricesMutation.isPending}
                        className="w-full"
                      >
                        {updateStockPricesMutation.isPending 
                          ? "Güncelleniyor..." 
                          : `${validStocks} Hisse Fiyatını Güncelle`
                        }
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Dosyada hisse fiyatı güncellemesi bulunamadı
                  </p>
                )}
              </TabsContent>

              <TabsContent value="currencies" className="space-y-4">
                {currencyUpdates.length > 0 ? (
                  <div className="space-y-2">
                    {currencyUpdates.map((update, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded border ${
                          update.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {update.valid ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          )}
                          <div>
                            <p className="font-medium">{update.name}</p>
                            {update.error && (
                              <p className="text-sm text-red-600">{update.error}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            ₺{update.currentPrice} → ₺{update.newPrice}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {validCurrencies > 0 && (
                      <Button
                        onClick={confirmCurrencyUpdates}
                        disabled={updateCurrencyRatesMutation.isPending}
                        className="w-full"
                      >
                        {updateCurrencyRatesMutation.isPending 
                          ? "Güncelleniyor..." 
                          : `${validCurrencies} Döviz Kurunu Güncelle`
                        }
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Dosyada döviz kuru güncellemesi bulunamadı
                  </p>
                )}
              </TabsContent>
            </Tabs>

            <Button
              variant="outline"
              onClick={resetForm}
              className="w-full"
            >
              Temizle
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}