import { useQuery } from "@tanstack/react-query";
import { Currency, TeamCurrency } from "@shared/schema";

interface CurrencyTradingDeskProps {
  onTabChange?: (tab: "stock" | "currency" | "startup") => void;
}

interface CurrencyPortfolioResponse {
  team: {
    id: number;
    name: string;
    cashBalance: string;
  };
  currencies: Array<{
    currency: Currency;
    amount: string;
  }>;
  totalCurrencyValue: string;
  totalPortfolioValue: string;
}

interface TeamPortfolioAPI {
  team: {
    id: number;
    name: string;
    cashBalance: string;
  };
  stocks: Array<{
    company: {
      id: number;
      name: string;
      price: string;
      logoUrl: string | null;
    };
    shares: number;
  }>;
  currencies: Array<{
    currency: Currency;
    amount: string;
  }>;
  totalStockValue: string;
  totalCurrencyValue: string;
  totalPortfolioValue: string;
}

export default function CurrencyTradingDesk({ onTabChange }: CurrencyTradingDeskProps) {
  const teamId = localStorage.getItem("teamId");
  
  const { data: portfolioData, isLoading: portfolioLoading } = useQuery<TeamPortfolioAPI>({
    queryKey: [`/api/teams/${teamId}/portfolio`],
    enabled: !!teamId,
  });



  // Transform the portfolio data to match currency-specific structure
  const portfolio: CurrencyPortfolioResponse | null = portfolioData ? {
    team: portfolioData.team,
    currencies: portfolioData.currencies || [],
    totalCurrencyValue: portfolioData.totalCurrencyValue,
    totalPortfolioValue: portfolioData.totalPortfolioValue,
  } : null;

  const { data: currencies, isLoading: currenciesLoading } = useQuery<Currency[]>({
    queryKey: ['/api/currencies'],
  });

  if (portfolioLoading || currenciesLoading) {
    return (
      <div 
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{ 
          backgroundColor: '#1b1b1b',
          color: '#e3dfd6'
        }}
      >
        <div className="[font-family:'Inter',Helvetica] text-xl">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 overflow-y-auto z-50"
      style={{ backgroundColor: '#1b1b1b' }}
    >
      <div className="p-6 min-h-full">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#cae304' }}
              >
                <span 
                  className="[font-family:'Bowlby_One',Helvetica] font-normal text-lg"
                  style={{ color: '#1b1b1b' }}
                >
                  T
                </span>
              </div>
              <span 
                className="[font-family:'Bowlby_One',Helvetica] font-normal text-xl"
                style={{ color: '#e3dfd6' }}
              >
                {portfolio?.team?.name || "TAKIM 1"}
              </span>
            </div>
            <button 
              className="px-6 py-2 rounded-lg [font-family:'Bowlby_One',Helvetica] font-normal bg-[#aa95c7]"
              style={{ backgroundColor: '#aa95c7', color: '#1b1b1b' }}
              onClick={() => window.location.href = '/'}
            >ÇIKIS</button>
          </div>

          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div 
              className="p-6 rounded-lg border-2 border-dashed"
              style={{ 
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderColor: '#e3dfd6'
              }}
            >
              <h3 
                className="[font-family:'Bowlby_One',Helvetica] font-normal text-lg mb-2 text-[#e3dfd6]"
                style={{ color: '#e3dfd6' }}
              >NAKIT BAKIYE</h3>
              <p 
                className="[font-family:'Inter',Helvetica] text-3xl font-bold"
                style={{ color: '#cae304' }}
              >
                ₺{portfolio?.team?.cashBalance ? Math.round(parseFloat(portfolio.team.cashBalance)).toLocaleString() : "0"}
              </p>
            </div>
            
            <div 
              className="p-6 rounded-lg border-2 border-dashed"
              style={{ 
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderColor: '#e3dfd6'
              }}
            >
              <h3 
                className="[font-family:'Bowlby_One',Helvetica] font-normal text-lg mb-2"
                style={{ color: '#e3dfd6' }}
              >
                TOPLAM PORTFÖY
              </h3>
              <p 
                className="[font-family:'Inter',Helvetica] text-3xl font-bold"
                style={{ color: '#cae304' }}
              >
                ₺{portfolio?.totalPortfolioValue ? Math.round(parseFloat(portfolio.totalPortfolioValue)).toLocaleString() : "0"}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-6 mb-8">
            <div 
              className="px-6 py-3 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
              style={{ 
                backgroundColor: 'rgba(0,0,0,0.2)',
                color: '#e3dfd6'
              }}
              onClick={() => onTabChange?.("stock")}
            >
              <span className="[font-family:'Bowlby_One',Helvetica] font-normal">BORSA MASASI</span>
            </div>
            <div 
              className="px-6 py-3 rounded-lg border-b-4 cursor-pointer"
              style={{ 
                backgroundColor: '#cae304',
                borderColor: '#cae304',
                color: '#1b1b1b'
              }}
            >
              <span className="[font-family:'Bowlby_One',Helvetica] font-normal">DÖVIZ MASASI</span>
            </div>
            <div 
              className="px-6 py-3 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
              style={{ 
                backgroundColor: 'rgba(0,0,0,0.2)',
                color: '#e3dfd6'
              }}
              onClick={() => onTabChange?.("startup")}
            >
              <span className="[font-family:'Bowlby_One',Helvetica] font-normal">GIRISIM MASASI</span>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Currency Portfolio Section */}
            <div 
              className="p-4 rounded-lg border-4 h-fit"
              style={{ 
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderColor: '#cae304'
              }}
            >
              <h2 
                className="[font-family:'Bowlby_One',Helvetica] font-normal text-2xl mb-2"
                style={{ color: '#e3dfd6' }}
              >
                Döviz Portföyü
              </h2>
              <p 
                className="[font-family:'Inter',Helvetica] text-sm mb-6"
                style={{ color: '#e3dfd6' }}
              >
                Sahip Olduğunuz Dövizler
              </p>

              <div className="space-y-4 mb-6">
                {portfolio?.currencies && portfolio.currencies.length > 0 ? (
                  portfolio.currencies.map((currency, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-8 h-8 rounded flex items-center justify-center overflow-hidden"
                          style={{ backgroundColor: '#e3dfd6' }}
                        >
                          {currency.currency.logoUrl ? (
                            <img 
                              src={currency.currency.logoUrl} 
                              alt={`${currency.currency.name} logo`}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <div className="w-full h-full" />
                          )}
                        </div>
                        <div>
                          <div 
                            className="[font-family:'Bowlby_One',Helvetica] font-normal"
                            style={{ color: '#e3dfd6' }}
                          >
                            {currency.currency.name}
                          </div>
                          <div 
                            className="[font-family:'Inter',Helvetica] text-sm"
                            style={{ color: '#e3dfd6' }}
                          >
                            {parseFloat(currency.amount).toFixed(2)} {currency.currency.code}
                          </div>
                        </div>
                      </div>
                      <div 
                        className="px-3 py-1 rounded [font-family:'Bowlby_One',Helvetica] font-normal"
                        style={{ backgroundColor: '#aa95c7', color: '#1b1b1b' }}
                      >
                        ₺{Math.round(parseFloat(currency.currency.rate))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div 
                    className="text-center py-8 [font-family:'Inter',Helvetica]"
                    style={{ color: '#e3dfd6' }}
                  >
                    Henüz döviz satın almadınız
                  </div>
                )}
              </div>

              <div 
                className="flex justify-between items-center pt-4 border-t"
                style={{ borderColor: '#e3dfd6' }}
              >
                <span 
                  className="[font-family:'Bowlby_One',Helvetica] font-normal text-lg"
                  style={{ color: '#e3dfd6' }}
                >
                  Toplam Döviz Degeri:
                </span>
                <span 
                  className="[font-family:'Bowlby_One',Helvetica] font-normal text-xl"
                  style={{ color: '#cae304' }}
                >
                  ₺{portfolio?.totalCurrencyValue ? Math.round(parseFloat(portfolio.totalCurrencyValue)) : "0"}
                </span>
              </div>
            </div>

            {/* Market Currencies Section */}
            <div 
              className="p-4 rounded-lg border-4 h-fit"
              style={{ 
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderColor: '#aa95c7'
              }}
            >
              <h2 
                className="[font-family:'Bowlby_One',Helvetica] font-normal text-2xl mb-2 text-[#e3dfd6]"
                style={{ color: '#e3dfd6' }}
              >Piyasa Dövizleri</h2>
              <p 
                className="[font-family:'Inter',Helvetica] text-sm mb-6"
                style={{ color: '#e3dfd6' }}
              >
                Alım Satım İçin Mevcut Dövizler
              </p>

              <div className="space-y-4">
                {currencies?.map((currency) => (
                  <div key={currency.id} className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div 
                        className="w-12 h-12 rounded flex-shrink-0 flex items-center justify-center overflow-hidden"
                        style={{ backgroundColor: '#e3dfd6' }}
                      >
                        {currency.logoUrl ? (
                          <img 
                            src={currency.logoUrl} 
                            alt={`${currency.name} logo`}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-[#1b1b1b]">
                            {currency.code}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div 
                          className="[font-family:'Bowlby_One',Helvetica] font-normal"
                          style={{ color: '#e3dfd6' }}
                        >
                          {currency.name}
                        </div>
                        <p 
                          className="[font-family:'Inter',Helvetica] text-sm mt-1 max-w-xs pr-4"
                          style={{ color: '#e3dfd6' }}
                        >
                          {currency.code} - Döviz Kuru
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex items-center space-x-2">
                        <span 
                          className="[font-family:'Inter',Helvetica] text-sm text-[#e3dfd6] ml-[45px] mr-[45px]"
                          style={{ color: '#e3dfd6' }}
                        >
                          Alış
                        </span>
                        <span 
                          className="[font-family:'Inter',Helvetica] text-sm"
                          style={{ color: '#e3dfd6' }}
                        >
                          Satış
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          className="w-20 py-2 rounded [font-family:'Bowlby_One',Helvetica] font-normal hover:opacity-80 transition-opacity text-center"
                          style={{ backgroundColor: '#aa95c7', color: '#1b1b1b' }}
                          onClick={() => console.log('Buy', currency.name)}
                        >
                          ₺{parseFloat(currency.rate).toFixed(2)}
                        </button>
                        <button 
                          className="w-20 py-2 rounded [font-family:'Bowlby_One',Helvetica] font-normal hover:opacity-80 transition-opacity text-center"
                          style={{ backgroundColor: '#cae304', color: '#1b1b1b' }}
                          onClick={() => console.log('Sell', currency.name)}
                        >
                          ₺{parseFloat(currency.sellRate).toFixed(2)}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}