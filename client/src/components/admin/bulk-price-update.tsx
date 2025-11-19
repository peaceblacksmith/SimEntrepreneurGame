import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { patchCompany, patchCurrency } from "@/lib/api";
import { Upload, FileText, CheckCircle, AlertTriangle, Edit3, Save, RefreshCw, Calculator } from "lucide-react";
import type { Company, Currency } from "@shared/schema";

interface EditablePrice {
  id: number;
  name: string;
  symbol?: string;
  buyPrice: string;
  sellPrice: string;
  originalBuyPrice: string;
  originalSellPrice: string;
  hasChanges: boolean;
  buyPriceValid: boolean;
  sellPriceValid: boolean;
  type: 'company' | 'currency';
}

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
  const [editableCompanies, setEditableCompanies] = useState<EditablePrice[]>([]);
  const [editableCurrencies, setEditableCurrencies] = useState<EditablePrice[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'chart' | 'csv-editor' | 'csv-upload'>('chart');

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

  // Initialize editable price data when companies/currencies load
  useEffect(() => {
    if (companies) {
      const editableCompanyPrices = companies.map((company): EditablePrice => ({
        id: company.id,
        name: company.name,
        symbol: company.symbol,
        buyPrice: company.price,
        sellPrice: company.sellPrice,
        originalBuyPrice: company.price,
        originalSellPrice: company.sellPrice,
        hasChanges: false,
        buyPriceValid: true,
        sellPriceValid: true,
        type: 'company'
      }));
      setEditableCompanies(editableCompanyPrices);
    }
  }, [companies]);

  useEffect(() => {
    if (currencies) {
      const editableCurrencyPrices = currencies.map((currency): EditablePrice => ({
        id: currency.id,
        name: currency.name,
        symbol: currency.code,
        buyPrice: currency.rate,
        sellPrice: currency.sellRate,
        originalBuyPrice: currency.rate,
        originalSellPrice: currency.sellRate,
        hasChanges: false,
        buyPriceValid: true,
        sellPriceValid: true,
        type: 'currency'
      }));
      setEditableCurrencies(editableCurrencyPrices);
    }
  }, [currencies]);

  const validatePrice = (priceStr: string): boolean => {
    const price = parseFloat(priceStr);
    return !isNaN(price) && price > 0;
  };

  const updateEditablePrice = (
    items: EditablePrice[], 
    setItems: (items: EditablePrice[]) => void, 
    id: number, 
    field: 'buyPrice' | 'sellPrice', 
    value: string
  ) => {
    const newItems = items.map(item => {
      if (item.id === id) {
        const updatedItem = {
          ...item,
          [field]: value,
          [`${field}Valid`]: validatePrice(value),
          hasChanges: 
            value !== item.originalBuyPrice || 
            (field === 'sellPrice' ? item.buyPrice !== item.originalBuyPrice : item.sellPrice !== item.originalSellPrice)
        };
        
        // Check if there are actual changes
        updatedItem.hasChanges = 
          updatedItem.buyPrice !== updatedItem.originalBuyPrice || 
          updatedItem.sellPrice !== updatedItem.originalSellPrice;
          
        return updatedItem;
      }
      return item;
    });
    setItems(newItems);
  };

  const autoCalculateSellPrice = (buyPrice: string): string => {
    const price = parseFloat(buyPrice);
    if (isNaN(price) || price <= 0) return buyPrice;
    return (price * 0.98).toFixed(buyPrice.includes('.') ? buyPrice.split('.')[1].length : 2);
  };

  const autoCalculateBuyPrice = (sellPrice: string): string => {
    const price = parseFloat(sellPrice);
    if (isNaN(price) || price <= 0) return sellPrice;
    return (price / 0.98).toFixed(sellPrice.includes('.') ? sellPrice.split('.')[1].length : 2);
  };

  const bulkUpdateCompaniesMutation = useMutation({
    mutationFn: async (updates: { id: number; price: string; sellPrice: string }[]) => {
      const results = [];
      for (const update of updates) {
        const data = await patchCompany(update.id, { 
          price: update.price, 
          sellPrice: update.sellPrice 
        });
        results.push(data);
      }
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      toast({ title: "Hisse fiyatları başarıyla güncellendi" });
    },
    onError: () => {
      toast({ title: "Hisse fiyatları güncellenemedi", variant: "destructive" });
    },
  });

  const bulkUpdateCurrenciesMutation = useMutation({
    mutationFn: async (updates: { id: number; rate: string; sellRate: string }[]) => {
      const results = [];
      for (const update of updates) {
        const data = await patchCurrency(update.id, { 
          rate: update.rate, 
          sellRate: update.sellRate 
        });
        results.push(data);
      }
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/currencies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      toast({ title: "Döviz kurları başarıyla güncellendi" });
    },
    onError: () => {
      toast({ title: "Döviz kurları güncellenemedi", variant: "destructive" });
    },
  });

  const updateStockPricesMutation = useMutation({
    mutationFn: async (updates: { companyId: number; newPrice: string }[]) => {
      const results = [];
      for (const update of updates) {
        const data = await patchCompany(update.companyId, { price: update.newPrice });
        results.push(data);
      }
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
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
        const data = await patchCurrency(update.currencyId, { rate: update.newRate });
        results.push(data);
      }
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/currencies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      toast({ title: "Döviz kurları başarıyla güncellendi" });
      resetForm();
    },
    onError: () => {
      toast({ title: "Döviz kurları güncellenemedi", variant: "destructive" });
    },
  });

  const saveAllCompanyChanges = () => {
    const companyUpdates = editableCompanies
      .filter(company => company.hasChanges && company.buyPriceValid && company.sellPriceValid)
      .map(company => ({
        id: company.id,
        price: company.buyPrice,
        sellPrice: company.sellPrice
      }));

    if (companyUpdates.length === 0) {
      toast({ title: "Kaydedilecek değişiklik bulunamadı", variant: "destructive" });
      return;
    }

    bulkUpdateCompaniesMutation.mutate(companyUpdates);
  };

  const saveAllCurrencyChanges = () => {
    const currencyUpdates = editableCurrencies
      .filter(currency => currency.hasChanges && currency.buyPriceValid && currency.sellPriceValid)
      .map(currency => ({
        id: currency.id,
        rate: currency.buyPrice,
        sellRate: currency.sellPrice
      }));

    if (currencyUpdates.length === 0) {
      toast({ title: "Kaydedilecek değişiklik bulunamadı", variant: "destructive" });
      return;
    }

    bulkUpdateCurrenciesMutation.mutate(currencyUpdates);
  };

  const resetForm = () => {
    setFile(null);
    setCsvText("");
    setStockUpdates([]);
    setCurrencyUpdates([]);
  };

  const parseCSV = (text: string): { stocks: PriceUpdate[]; currencies: PriceUpdate[] } => {
    const lines = text.trim().split('\n');
    const stocks: PriceUpdate[] = [];
    const currencies: PriceUpdate[] = [];

    const dataLines = lines.filter(line => 
      line.toLowerCase().includes('stock,') || 
      line.toLowerCase().includes('currency,')
    );

    for (const line of dataLines) {
      const [type, nameStr, priceStr] = line.split(',').map(s => s.trim());
      
      if (!type || !nameStr || !priceStr) continue;

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
        const foundCurrency = currencies?.find(c => c.name.toLowerCase() === nameStr.toLowerCase());
        if (foundCurrency && !isNaN(price) && price > 0) {
          currencies.push({
            id: foundCurrency.id,
            name: foundCurrency.name,
            currentPrice: String(foundCurrency.rate),
            newPrice: price.toFixed(4),
            valid: true
          });
        } else {
          currencies.push({
            id: 0,
            name: nameStr,
            currentPrice: foundCurrency?.rate ? String(foundCurrency.rate) : "0.0000",
            newPrice: priceStr,
            valid: false,
            error: foundCurrency ? "Geçersiz kur" : "Döviz bulunamadı"
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
      .map(update => ({ currencyId: update.id, newRate: update.newPrice }));
    
    if (validUpdates.length === 0) {
      toast({ title: "Güncellenecek geçerli döviz kuru yok", variant: "destructive" });
      return;
    }

    updateCurrencyRatesMutation.mutate(validUpdates);
  };

  const companyChangesCount = editableCompanies.filter(c => c.hasChanges).length;
  const currencyChangesCount = editableCurrencies.filter(c => c.hasChanges).length;
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
          Hisse ve döviz fiyatlarını düzenli tablodan veya CSV ile toplu olarak güncelleyin
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chart" className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              Düzenli Tablo
            </TabsTrigger>
            <TabsTrigger value="csv-editor" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              CSV Editörü
            </TabsTrigger>
            <TabsTrigger value="csv-upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              CSV Yükle
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="space-y-6">
            <div className="space-y-6">
              {/* Companies Chart */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Hisse Fiyatları
                  </h3>
                  <div className="flex items-center gap-2">
                    {companyChangesCount > 0 && (
                      <Badge variant="secondary">{companyChangesCount} değişiklik</Badge>
                    )}
                    <Button
                      onClick={saveAllCompanyChanges}
                      disabled={companyChangesCount === 0 || bulkUpdateCompaniesMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      {bulkUpdateCompaniesMutation.isPending ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Kaydediliyor...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Tüm Değişiklikleri Kaydet
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-4 gap-4 p-3 bg-muted/50 font-medium text-sm">
                    <div>Şirket</div>
                    <div className="text-center">Alış Fiyatı (₺)</div>
                    <div className="text-center">Satış Fiyatı (₺)</div>
                    <div className="text-center">Durum</div>
                  </div>
                  <Separator />
                  
                  {editableCompanies.map((company) => (
                    <div key={company.id} className={`grid grid-cols-4 gap-4 p-3 items-center ${
                      company.hasChanges ? 'bg-yellow-50 dark:bg-yellow-950/20' : ''
                    }`}>
                      <div className="space-y-1">
                        <div className="font-medium">{company.name}</div>
                        <div className="text-sm text-muted-foreground">{company.symbol}</div>
                      </div>
                      
                      <div className="space-y-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={company.buyPrice}
                          onChange={(e) => updateEditablePrice(editableCompanies, setEditableCompanies, company.id, 'buyPrice', e.target.value)}
                          className={`text-center ${!company.buyPriceValid ? 'border-red-500' : ''}`}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newSellPrice = autoCalculateSellPrice(company.buyPrice);
                            updateEditablePrice(editableCompanies, setEditableCompanies, company.id, 'sellPrice', newSellPrice);
                          }}
                          className="w-full text-xs"
                        >
                          Satış Hesapla
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={company.sellPrice}
                          onChange={(e) => updateEditablePrice(editableCompanies, setEditableCompanies, company.id, 'sellPrice', e.target.value)}
                          className={`text-center ${!company.sellPriceValid ? 'border-red-500' : ''}`}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newBuyPrice = autoCalculateBuyPrice(company.sellPrice);
                            updateEditablePrice(editableCompanies, setEditableCompanies, company.id, 'buyPrice', newBuyPrice);
                          }}
                          className="w-full text-xs"
                        >
                          Alış Hesapla
                        </Button>
                      </div>
                      
                      <div className="text-center">
                        {company.hasChanges ? (
                          <Badge variant="secondary">Değiştirildi</Badge>
                        ) : (
                          <Badge variant="outline">Değişiklik Yok</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Currencies Chart */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Döviz Kurları
                  </h3>
                  <div className="flex items-center gap-2">
                    {currencyChangesCount > 0 && (
                      <Badge variant="secondary">{currencyChangesCount} değişiklik</Badge>
                    )}
                    <Button
                      onClick={saveAllCurrencyChanges}
                      disabled={currencyChangesCount === 0 || bulkUpdateCurrenciesMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      {bulkUpdateCurrenciesMutation.isPending ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Kaydediliyor...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Tüm Değişiklikleri Kaydet
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-4 gap-4 p-3 bg-muted/50 font-medium text-sm">
                    <div>Döviz</div>
                    <div className="text-center">Alış Kuru (₺)</div>
                    <div className="text-center">Satış Kuru (₺)</div>
                    <div className="text-center">Durum</div>
                  </div>
                  <Separator />
                  
                  {editableCurrencies.map((currency) => (
                    <div key={currency.id} className={`grid grid-cols-4 gap-4 p-3 items-center ${
                      currency.hasChanges ? 'bg-yellow-50 dark:bg-yellow-950/20' : ''
                    }`}>
                      <div className="space-y-1">
                        <div className="font-medium">{currency.name}</div>
                        <div className="text-sm text-muted-foreground">{currency.symbol}</div>
                      </div>
                      
                      <div className="space-y-2">
                        <Input
                          type="number"
                          step="0.0001"
                          value={currency.buyPrice}
                          onChange={(e) => updateEditablePrice(editableCurrencies, setEditableCurrencies, currency.id, 'buyPrice', e.target.value)}
                          className={`text-center ${!currency.buyPriceValid ? 'border-red-500' : ''}`}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newSellPrice = autoCalculateSellPrice(currency.buyPrice);
                            updateEditablePrice(editableCurrencies, setEditableCurrencies, currency.id, 'sellPrice', newSellPrice);
                          }}
                          className="w-full text-xs"
                        >
                          Satış Hesapla
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <Input
                          type="number"
                          step="0.0001"
                          value={currency.sellPrice}
                          onChange={(e) => updateEditablePrice(editableCurrencies, setEditableCurrencies, currency.id, 'sellPrice', e.target.value)}
                          className={`text-center ${!currency.sellPriceValid ? 'border-red-500' : ''}`}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newBuyPrice = autoCalculateBuyPrice(currency.sellPrice);
                            updateEditablePrice(editableCurrencies, setEditableCurrencies, currency.id, 'buyPrice', newBuyPrice);
                          }}
                          className="w-full text-xs"
                        >
                          Alış Hesapla
                        </Button>
                      </div>
                      
                      <div className="text-center">
                        {currency.hasChanges ? (
                          <Badge variant="secondary">Değiştirildi</Badge>
                        ) : (
                          <Badge variant="outline">Değişiklik Yok</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="csv-editor" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="csv-text">CSV Verisi</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={loadTemplate}
                  disabled={isProcessing}
                >
                  Şablon Yükle
                </Button>
              </div>
              
              <Textarea
                id="csv-text"
                placeholder="CSV verisini buraya yapıştırın veya yazın..."
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                disabled={isProcessing}
                className="min-h-[300px] font-mono text-sm"
              />
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={processCsvText}
                  disabled={isProcessing || !csvText.trim()}
                  className="flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      İşleniyor...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" />
                      Verileri İşle
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={resetForm}
                  disabled={isProcessing}
                >
                  Temizle
                </Button>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">CSV Format Örneği:</p>
              <div className="bg-muted p-3 rounded font-mono text-xs">
                type,name,new_price<br/>
                stock,Apple Inc.,175.50<br/>
                stock,Microsoft Corporation,380.25<br/>
                currency,ABD Doları,34.85<br/>
                currency,Euro,37.92
              </div>
              <p className="mt-2">
                <strong>Format:</strong> tip,isim,yeni_fiyat<br/>
                <strong>Tips:</strong> stock (hisse), currency (döviz)<br/>
                <strong>İsim:</strong> Tam şirket/döviz adı (büyük/küçük harf önemli değil)
              </p>
            </div>
          </TabsContent>

          <TabsContent value="csv-upload" className="space-y-4">
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
                type,name,new_price<br/>
                stock,Apple Inc.,175.50<br/>
                stock,Microsoft Corporation,380.25<br/>
                currency,ABD Doları,34.85<br/>
                currency,Euro,37.92
              </div>
              <p className="mt-2">
                <strong>Format:</strong> tip,isim,yeni_fiyat<br/>
                <strong>Tips:</strong> stock (hisse), currency (döviz)<br/>
                <strong>İsim:</strong> Tam şirket/döviz adı (büyük/küçük harf önemli değil)
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Processing State */}
        {isProcessing && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            Veriler işleniyor...
          </div>
        )}

        {/* CSV Preview */}
        {!isProcessing && (stockUpdates.length > 0 || currencyUpdates.length > 0) && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="font-medium">CSV Önizlemesi</span>
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
                    Veriler işlendikten sonra hisse fiyatı güncellemeleri burada görünecek
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
                    Veriler işlendikten sonra döviz kuru güncellemeleri burada görünecek
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
}