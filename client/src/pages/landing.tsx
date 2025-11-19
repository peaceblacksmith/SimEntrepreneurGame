import { Link } from "wouter";

const colors = {
  background: '#1B1B1B',
  textPrimary: '#E3DFD6',
  textSecondary: '#1B1B1B',
  accent: 'rgba(202, 227, 4, 0.90)',
  button: '#AA95C7',
  decorativePurple: '#AA95C7',
  decorativeYellow: '#CBED46'
};

export default function Landing() {
  return (
    <main className="flex flex-row justify-center w-full min-h-screen" style={{ backgroundColor: colors.background }}>
      <div className="w-[1440px] h-[1810px] relative" style={{ backgroundColor: colors.background }}>
        
        {/* Header */}
        <header className="flex w-[1440px] items-end justify-between p-8 absolute top-0 left-0">
          <h1 
            className="relative w-fit h-[47px] text-2xl tracking-[0] leading-normal"
            style={{ color: colors.textPrimary, fontFamily: 'Bowlby One', fontWeight: 'normal' }}
          >
            KALGIRISIMCILIK
          </h1>

          <nav className="flex w-fit items-end gap-10 relative">
            <div 
              className="relative w-fit h-[47px] text-2xl tracking-[0] leading-normal"
              style={{ color: colors.textSecondary, fontFamily: 'Bowlby One', fontWeight: 'normal' }}
            >
              HAKKINDA
            </div>

            <Link href="/team-login">
              <button 
                className="h-[50px] px-6 py-0 rounded-lg transition-colors hover:opacity-90"
                style={{ backgroundColor: colors.button }}
              >
                <span 
                  className="text-2xl text-center tracking-[0] leading-normal"
                  style={{ color: colors.textSecondary, fontFamily: 'Bowlby One', fontWeight: 'normal' }}
                >
                  GIRIS YAP
                </span>
              </button>
            </Link>
          </nav>
        </header>

        {/* Hero Section */}
        <h2 
          className="absolute w-[1111px] top-[148px] left-[165px] text-center tracking-[0] leading-[80px] whitespace-nowrap"
          style={{ 
            color: colors.textPrimary,
            fontFamily: 'Bowlby One',
            fontWeight: 'normal',
            fontSize: '96px',
            lineHeight: '80px'
          }}
        >
          KAZANMAYA<br />CESARETIN VAR MI?
        </h2>

        {/* Main Image/Content Section */}
        <section className="absolute w-[1306px] h-[776px] top-[316px] left-[93px]">
          {/* Decorative vector graphics */}
          <img
            className="absolute w-[265px] h-[229px] top-[199px] left-8"
            alt="Vector graphic"
            src="/figmaAssets/vector-4.svg"
          />
          <img
            className="absolute w-[265px] h-[229px] top-[199px] left-[994px]"
            alt="Vector graphic"
            src="/figmaAssets/vector-5.svg"
          />
          
          {/* Main Cash Crash image */}
          <img
            className="absolute w-[1306px] h-[776px] top-0 left-0 object-cover"
            alt="Cash Crash graphic"
            src="/figmaAssets/image-1.png"
          />
        </section>

        

        {/* Quote Section */}
        <div 
          className="w-[1364px] absolute top-[1109px] left-[38px] rounded-[25px] border-none"
          style={{ backgroundColor: colors.accent }}
        >
          <div className="flex items-start justify-between p-20">
            <blockquote 
              className="relative w-[650px] h-[201px] mt-[-1.00px] tracking-[0] leading-[70px]"
              style={{ 
                color: colors.textSecondary,
                fontFamily: 'Bowlby One',
                fontWeight: 'normal',
                fontSize: '80px',
                lineHeight: '70px'
              }}
            >
              "BIR KARAR, HER SEYI DEGISTIRIR."
            </blockquote>

            <div className="relative w-[423px] h-[111px] mt-8">
              <div 
                className="relative w-[423px] h-[111px] bg-white rounded-lg flex items-center justify-center text-black font-semibold text-xl"
                style={{ backgroundColor: '#b9d007' }}
              >
                <div className="text-right px-8">
                  <div>kalcc.borsa@gmail.com</div>
                  <div>kalcc.doviz@gmail.com</div>
                  <div>kalcc.girisimcilik@gmail.com</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Section */}
        <footer className="absolute bottom-[151px] left-[329px] right-[155px] flex items-center">
          <div className="flex items-center">
            <div className="w-[60px] h-[60px] relative flex items-center justify-center">
              <img
                src="/figmaAssets/vector.svg"
                alt="Social media icon for @kalgirisimcilik_"
                className="relative w-11 h-11 top-2 left-2"
              />
            </div>
            <span 
              className="ml-[10px] font-semibold tracking-[0] leading-10 whitespace-nowrap"
              style={{ 
                color: colors.textPrimary,
                fontFamily: 'Inter',
                fontWeight: 600,
                fontSize: '32px'
              }}
            >
              @kalgirisimcilik_
            </span>
          </div>
          
          <div className="w-[50px]"></div>
          
          <div className="flex items-center">
            <div className="w-[60px] h-[60px] relative flex items-center justify-center">
              <img
                src="/figmaAssets/vector-1.svg"
                alt="Social media icon for @kalgirisimcilik"
                className="relative w-12 h-12 top-1.5 left-1.5"
              />
            </div>
            <span 
              className="ml-[10px] font-semibold tracking-[0] leading-10 whitespace-nowrap"
              style={{ 
                color: colors.textPrimary,
                fontFamily: 'Inter',
                fontWeight: 600,
                fontSize: '32px'
              }}
            >
              @kalgirisimcilik
            </span>
          </div>
        </footer>

        {/* Hidden admin access */}
        <Link href="/admin-login">
          <button className="fixed bottom-4 right-4 opacity-20 hover:opacity-60 bg-gray-800 px-3 py-1 rounded text-xs transition-opacity">
            Admin
          </button>
        </Link>
      </div>
    </main>
  );
}