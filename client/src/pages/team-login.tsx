import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { loginTeam } from "@/lib/api";

const colors = {
  background: '#1B1B1B',
  textPrimary: '#E3DFD6',
  textSecondary: '#1B1B1B',
  accent: '#AA95C7',
  button: '#E3DFD6',
  buttonText: '#8A8A8A',
  linkHighlight: '#CBED46',
  cardBorder: '#AA95C7',
  inputBg: '#AA95C766'
};

export default function TeamLogin() {
  const [accessCode, setAccessCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await loginTeam(accessCode);
      localStorage.setItem("teamId", data.team.id.toString());
      localStorage.setItem("teamName", data.team.name);
      setLocation(`/team/${data.team.id}`);
      toast({ title: `Hoşgeldiniz ${data.team.name}!` });
    } catch (error: any) {
      toast({ 
        title: "Giriş Hatası", 
        description: error.message || "Geçersiz erişim kodu",
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-row justify-center w-full min-h-screen" style={{ backgroundColor: colors.background }}>
      <div className="w-[1440px] h-[1165px] relative overflow-hidden" style={{ backgroundColor: colors.background }}>
        
        {/* Header */}
        <header className="flex w-[1440px] items-end justify-between p-8 absolute top-0 left-0">
          <Link href="/">
            <h1 
              className="relative w-fit h-[47px] text-2xl tracking-[0] leading-normal cursor-pointer hover:opacity-80 transition-opacity"
              style={{ color: colors.textPrimary, fontFamily: 'Bowlby One', fontWeight: 'normal' }}
            >
              KALGIRISIMCILIK
            </h1>
          </Link>

          <nav className="flex w-fit items-end gap-10 relative">
            <div 
              className="relative w-fit h-[47px] text-2xl tracking-[0] leading-normal"
              style={{ color: colors.textSecondary, fontFamily: 'Bowlby One', fontWeight: 'normal' }}
            >
              HAKKINDA
            </div>

            <Button 
              className="h-[50px] px-6 py-0 rounded-lg transition-colors hover:opacity-90"
              style={{ backgroundColor: colors.accent }}
            >
              <span 
                className="text-2xl text-center tracking-[0] leading-normal"
                style={{ color: colors.textSecondary, fontFamily: 'Bowlby One', fontWeight: 'normal' }}
              >
                GIRIS YAP
              </span>
            </Button>
          </nav>
        </header>

        {/* Banner text */}
        <div 
          className="absolute w-[3432px] top-[154px] left-[-996px] text-8xl text-center tracking-[0] leading-[80px] whitespace-nowrap"
          style={{ 
            color: colors.linkHighlight, 
            fontFamily: 'Bowlby One', 
            fontWeight: 'normal' 
          }}
        >
          RASH OR CASH OR CRASH OR CAS
        </div>

        <div className="absolute w-[1186px] h-[710px] top-[289px] left-[127px]">
          {/* Vector graphics */}
          <img
            className="absolute top-[401px] left-0 w-[265px] h-[229px]"
            alt="Vector graphic"
            src="/figmaAssets/vector-2.svg"
          />
          <img
            className="absolute top-[50px] left-[921px] w-[265px] h-[229px]"
            alt="Vector graphic"
            src="/figmaAssets/vector-3.svg"
          />

          {/* Login card - Team version */}
          <Card 
            className="w-[700px] absolute top-[123px] left-[243px] rounded-[25px] border-4 border-solid"
            style={{ 
              backgroundColor: colors.background, 
              borderColor: colors.cardBorder 
            }}
          >
            <CardContent className="flex flex-col items-start gap-[42px] p-10">
              <h1 
                className="relative self-stretch h-[74px] mt-[-4.00px] text-5xl text-center tracking-[0] leading-[80px] whitespace-nowrap w-full"
                style={{ 
                  color: colors.textPrimary, 
                  fontFamily: 'Bowlby One', 
                  fontWeight: 'normal' 
                }}
              >
                TAKIM GIRISI
              </h1>

              <form onSubmit={handleSubmit} className="w-full space-y-[42px]">
                <div className="w-full">
                  <Input
                    className="h-[60px] rounded-lg border-2 border-solid text-[30px] tracking-[0] leading-10 pl-[20px] pr-[20px]"
                    style={{ 
                      backgroundColor: colors.inputBg,
                      borderColor: colors.cardBorder,
                      color: colors.textPrimary,
                      fontFamily: 'Inter',
                      fontWeight: 'normal'
                    }}
                    placeholder="Takım erişim kodunu giriniz"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                    required
                  />
                </div>

                <Button 
                  type="submit"
                  className="inline-flex items-center whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-primary/90 h-[60px] justify-center gap-2.5 px-6 py-0 w-full rounded-lg transition-colors hover:opacity-90 text-[#1b1b1b] bg-[#cbed46]"
                  style={{ backgroundColor: colors.button }}
                  disabled={isLoading || !accessCode.trim()}
                >
                  <span 
                    className="w-fit text-[32px] text-center tracking-[0] leading-normal"
                    style={{ 
                      color: '#1b1b1b', 
                      fontFamily: 'Bowlby One', 
                      fontWeight: 'normal' 
                    }}
                  >
                    {isLoading ? "GIRIS YAPILIYOR..." : "GIRIS YAP"}
                  </span>
                </Button>
              </form>

              <div className="w-full h-10 text-center">
                <span 
                  className="text-3xl tracking-[0] leading-10 whitespace-nowrap"
                  style={{ 
                    color: colors.textPrimary, 
                    fontFamily: 'Inter', 
                    fontWeight: 'normal' 
                  }}
                >
                  Admin girişi için{" "}
                </span>
                <Link href="/admin-login">
                  <button 
                    className="text-3xl tracking-[0] leading-10 whitespace-nowrap hover:underline transition-all"
                    style={{ 
                      color: colors.linkHighlight, 
                      fontFamily: 'Inter', 
                      fontWeight: 500 
                    }}
                  >
                    buraya tıklayınız
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}