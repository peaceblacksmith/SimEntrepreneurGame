import { useQuery } from "@tanstack/react-query";

interface TeamPortfolioResponse {
  team: {
    id: number;
    name: string;
    cashBalance: string;
    accessCode: string;
    profilePicUrl: string | null;
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
    currency: {
      id: number;
      name: string;
      code: string;
      rate: string;
      sellRate: string;
      logoUrl: string | null;
    };
    amount: string;
  }>;
  startup: {
    id: number;
    name: string;
    description: string;
    value: string;
    industry: string;
    riskLevel: string;
  } | null;
  totalStockValue: string;
  totalCurrencyValue: string;
  totalPortfolioValue: string;
}

interface StartupTradingDeskProps {
  onTabChange?: (tab: "stock" | "currency" | "startup") => void;
}

export default function StartupTradingDesk({ onTabChange }: StartupTradingDeskProps) {
  const teamId = localStorage.getItem("teamId");
  const { data: portfolio, isLoading: portfolioLoading } = useQuery<TeamPortfolioResponse>({
    queryKey: [`/api/teams/${teamId}/portfolio`],
    enabled: !!teamId,
  });

  if (portfolioLoading) {
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
              className="px-6 py-3 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
              style={{ 
                backgroundColor: 'rgba(0,0,0,0.2)',
                color: '#e3dfd6'
              }}
              onClick={() => onTabChange?.("currency")}
            >
              <span className="[font-family:'Bowlby_One',Helvetica] font-normal">DÖVIZ MASASI</span>
            </div>
            <div 
              className="px-6 py-3 rounded-lg border-b-4 cursor-pointer"
              style={{ 
                backgroundColor: '#cae304',
                borderColor: '#cae304',
                color: '#1b1b1b'
              }}
            >
              <span className="[font-family:'Bowlby_One',Helvetica] font-normal">GIRISIM MASASI</span>
            </div>
          </div>

          {/* Main Content - Full Width Startup Display */}
          <div 
            className="p-6 rounded-lg border-4"
            style={{ 
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderColor: '#cae304'
            }}
          >
            {!portfolio?.startup ? (
              <div className="text-center py-16">
                <div 
                  className="w-24 h-24 rounded-full mx-auto mb-8 flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(202, 227, 4, 0.2)', border: '3px solid #cae304' }}
                >
                  <svg 
                    className="w-12 h-12" 
                    style={{ color: '#cae304' }}
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2L13.09 8.26L19 7L17.74 13.09L24 12L17.74 10.91L19 17L13.09 15.74L12 22L10.91 15.74L5 17L6.26 10.91L0 12L6.26 13.09L5 7L10.91 8.26L12 2Z"/>
                  </svg>
                </div>
                <h2 
                  className="[font-family:'Bowlby_One',Helvetica] font-normal text-3xl mb-4 text-[#aa95c7]"
                  style={{ color: '#cae304' }}
                >GIRISIM ATAMASI BEKLENIYOR</h2>
                <p 
                  className="[font-family:'Inter',Helvetica] text-lg max-w-md mx-auto"
                  style={{ color: '#e3dfd6' }}
                >
                  Bu takıma henüz bir startup projesi atanmamış. Admin panel üzerinden girişim ataması yapılmasını bekleyin.
                </p>
              </div>
            ) : (
              <div>
                {/* Startup Header */}
                <div className="text-center mb-8">
                  <h2 
                    className="[font-family:'Bowlby_One',Helvetica] font-normal text-3xl mb-4"
                    style={{ color: '#cae304' }}
                  >
                    {portfolio.startup.name}
                  </h2>
                  <p 
                    className="[font-family:'Inter',Helvetica] text-lg max-w-3xl mx-auto leading-relaxed"
                    style={{ color: '#e3dfd6' }}
                  >
                    {portfolio.startup.description}
                  </p>
                </div>

                {/* Startup Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                  <div 
                    className="text-center p-6 rounded-lg border-2"
                    style={{ 
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      borderColor: '#cae304'
                    }}
                  >
                    <div 
                      className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                      style={{ backgroundColor: '#cae304' }}
                    >
                      <svg 
                        className="w-8 h-8" 
                        style={{ color: '#1b1b1b' }}
                        fill="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                      </svg>
                    </div>
                    <h3 
                      className="[font-family:'Bowlby_One',Helvetica] font-normal text-sm mb-2"
                      style={{ color: '#cae304' }}
                    >
                      YATIRIM DEĞERİ
                    </h3>
                    <p 
                      className="[font-family:'Bowlby_One',Helvetica] font-normal text-2xl"
                      style={{ color: '#e3dfd6' }}
                    >
                      ₺{parseFloat(portfolio.startup.value).toLocaleString()}
                    </p>
                  </div>

                  <div 
                    className="text-center p-6 rounded-lg border-2"
                    style={{ 
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      borderColor: '#e3dfd6'
                    }}
                  >
                    <div 
                      className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                      style={{ backgroundColor: '#e3dfd6' }}
                    >
                      <svg 
                        className="w-8 h-8" 
                        style={{ color: '#1b1b1b' }}
                        fill="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path d="M3 7V5C3 3.89 3.89 3 5 3H19C20.11 3 21 3.89 21 5V19C21 20.11 20.11 21 19 21H5C3.89 21 3 20.11 3 19V17H21V9H3V7Z"/>
                      </svg>
                    </div>
                    <h3 
                      className="[font-family:'Bowlby_One',Helvetica] font-normal text-sm mb-2"
                      style={{ color: '#e3dfd6' }}
                    >
                      SEKTÖR
                    </h3>
                    <p 
                      className="[font-family:'Bowlby_One',Helvetica] font-normal text-2xl"
                      style={{ color: '#e3dfd6' }}
                    >
                      {portfolio.startup.industry}
                    </p>
                  </div>

                  <div 
                    className="text-center p-6 rounded-lg border-2"
                    style={{ 
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      borderColor: portfolio.startup.riskLevel === 'Yüksek' ? '#ff6b6b' : 
                                   portfolio.startup.riskLevel === 'Orta' ? '#feca57' : '#48dbfb'
                    }}
                  >
                    <div 
                      className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                      style={{ 
                        backgroundColor: portfolio.startup.riskLevel === 'Yüksek' ? '#ff6b6b' : 
                                         portfolio.startup.riskLevel === 'Orta' ? '#feca57' : '#48dbfb'
                      }}
                    >
                      <svg 
                        className="w-8 h-8" 
                        style={{ color: '#1b1b1b' }}
                        fill="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2L2 7V10C2 16 6 20.5 12 22C18 20.5 22 16 22 10V7L12 2M11 14L17.25 7.76L18.66 9.17L11 16.83L6.91 12.75L8.33 11.34L11 14Z"/>
                      </svg>
                    </div>
                    <h3 
                      className="[font-family:'Bowlby_One',Helvetica] font-normal text-sm mb-2"
                      style={{ 
                        color: portfolio.startup.riskLevel === 'Yüksek' ? '#ff6b6b' : 
                               portfolio.startup.riskLevel === 'Orta' ? '#feca57' : '#48dbfb'
                      }}
                    >
                      RİSK SEVİYESİ
                    </h3>
                    <p 
                      className="[font-family:'Bowlby_One',Helvetica] font-normal text-2xl"
                      style={{ color: '#e3dfd6' }}
                    >
                      {portfolio.startup.riskLevel}
                    </p>
                  </div>
                </div>


              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}