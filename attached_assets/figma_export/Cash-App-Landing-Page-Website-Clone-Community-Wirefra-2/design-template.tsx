import React from "react";

// Note: These imports assume you have shadcn/ui set up in your new project
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";

// Fallback components if shadcn/ui is not available:
const Button = ({ children, className, style, ...props }: any) => (
  <button className={className} style={style} {...props}>
    {children}
  </button>
);

const Card = ({ children, className, style }: any) => (
  <div className={className} style={style}>
    {children}
  </div>
);

const CardContent = ({ children, className }: any) => (
  <div className={className}>
    {children}
  </div>
);

interface DesignTemplateProps {
  // Customizable content
  brandName: string;
  navLabel: string;
  ctaText: string;
  heroText: string;
  quoteText: string;
  heroImage: string;
  contactInfo: React.ReactNode;
  socialLinks: Array<{
    icon: string;
    handle: string;
    alt: string;
  }>;
  
  // Optional styling overrides
  colorScheme?: {
    background?: string;
    textPrimary?: string;
    textSecondary?: string;
    accent?: string;
    button?: string;
  };
}

export const DesignTemplate = ({
  brandName,
  navLabel,
  ctaText,
  heroText,
  quoteText,
  heroImage,
  contactInfo,
  socialLinks,
  colorScheme = {}
}: DesignTemplateProps): JSX.Element => {
  const colors = {
    background: colorScheme.background || '#1b1b1b',
    textPrimary: colorScheme.textPrimary || '#e3dfd6',
    textSecondary: colorScheme.textSecondary || '#1b1b1b',
    accent: colorScheme.accent || '#cae304e6',
    button: colorScheme.button || '#aa95c7'
  };

  return (
    <main className="flex flex-row justify-center w-full" style={{ backgroundColor: colors.background }}>
      <div className="w-[1440px] h-[1810px] relative" style={{ backgroundColor: colors.background }}>
        
        {/* Header */}
        <header className="flex w-[1440px] items-end justify-between p-8 absolute top-0 left-0">
          <h1 
            className="relative w-fit h-[47px] [font-family:'Bowlby_One',Helvetica] font-normal text-2xl tracking-[0] leading-[normal]"
            style={{ color: colors.textPrimary }}
          >
            {brandName}
          </h1>

          <nav className="flex w-fit items-end gap-10 relative">
            <div 
              className="relative w-fit h-[47px] [font-family:'Bowlby_One',Helvetica] font-normal text-2xl tracking-[0] leading-[normal]"
              style={{ color: colors.textSecondary }}
            >
              {navLabel}
            </div>

            <Button 
              className="h-[50px] px-6 py-0 rounded-lg"
              style={{ backgroundColor: colors.button }}
            >
              <span 
                className="[font-family:'Bowlby_One',Helvetica] font-normal text-2xl text-center tracking-[0] leading-[normal]"
                style={{ color: colors.textSecondary }}
              >
                {ctaText}
              </span>
            </Button>
          </nav>
        </header>

        {/* Hero Section */}
        <h2 
          className="absolute w-[1111px] top-[148px] left-[165px] [font-family:'Bowlby_One',Helvetica] font-normal text-8xl text-center tracking-[0] leading-[80px] whitespace-nowrap"
          style={{ color: colors.textPrimary }}
        >
          {heroText.split('\n').map((line, index) => (
            <React.Fragment key={index}>
              {line}
              {index < heroText.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
        </h2>

        {/* Main Image Section */}
        <section className="absolute w-[1306px] h-[776px] top-[316px] left-[93px]">
          <img
            className="absolute w-[1306px] h-[776px] top-0 left-0 object-cover"
            alt="Hero graphic"
            src={heroImage}
          />
        </section>

        {/* Quote Section */}
        <Card 
          className="w-[1364px] absolute top-[1109px] left-[38px] rounded-[25px] border-none"
          style={{ backgroundColor: colors.accent }}
        >
          <CardContent className="flex items-start justify-between p-20">
            <blockquote 
              className="relative w-[650px] h-[201px] mt-[-1.00px] [font-family:'Bowlby_One',Helvetica] font-normal text-[80px] tracking-[0] leading-[70px]"
              style={{ color: colors.textSecondary }}
            >
              "{quoteText}"
            </blockquote>

            <div className="relative w-[423.07px] h-[111.31px] mt-4">
              {contactInfo}
            </div>
          </CardContent>
        </Card>

        {/* Social Media Section */}
        <footer className="absolute bottom-[151px] left-[329px] right-[155px] flex items-center">
          {socialLinks.map((social, index) => (
            <div key={index} className="flex items-center">
              <div className="w-[60px] h-[60px] relative flex items-center justify-center">
                <img
                  src={social.icon}
                  alt={social.alt}
                  className="w-11 h-11"
                />
              </div>
              <span 
                className="ml-[10px] [font-family:'Inter',Helvetica] font-semibold text-[32px] tracking-[0] leading-10 whitespace-nowrap"
                style={{ color: colors.textPrimary }}
              >
                {social.handle}
              </span>
              {index === 0 && <div className="w-[50px]"></div>}
            </div>
          ))}
        </footer>
      </div>
    </main>
  );
};

// Example usage:
export const ExampleUsage = () => {
  return (
    <DesignTemplate
      brandName="YOUR BRAND NAME"
      navLabel="ABOUT"
      ctaText="GET STARTED"
      heroText="YOUR MAIN\nMESSAGE HERE"
      quoteText="YOUR QUOTE OR TESTIMONIAL HERE"
      heroImage="/path/to/your/hero-image.png"
      contactInfo={
        <div className="text-right">
          <div>contact@yourcompany.com</div>
          <div>support@yourcompany.com</div>
        </div>
      }
      socialLinks={[
        {
          icon: "/path/to/social-icon-1.svg",
          handle: "@yourbrand",
          alt: "Social media 1"
        },
        {
          icon: "/path/to/social-icon-2.svg", 
          handle: "@yourbrand_official",
          alt: "Social media 2"
        }
      ]}
      colorScheme={{
        background: '#1b1b1b',
        textPrimary: '#e3dfd6',
        accent: '#your-accent-color',
        button: '#your-button-color'
      }}
    />
  );
};