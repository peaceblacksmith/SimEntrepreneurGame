import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Wireframe = (): JSX.Element => {
  // Social media data for mapping
  const socialMedia = [
    {
      icon: "/figmaAssets/vector.svg",
      handle: "@kalgirisimcilik_",
      iconClasses: "relative w-11 h-11 top-2 left-2 bg-[100%_100%]",
      containerLeft: "left-[329px]",
    },
    {
      icon: "/figmaAssets/vector-1.svg",
      handle: "@kalgirisimcilik",
      iconClasses: "relative w-12 h-12 top-1.5 left-1.5 bg-[100%_100%]",
      containerLeft: "left-[812px]",
    },
  ];

  return (
    <main className="bg-[#1b1b1b] flex flex-row justify-center w-full">
      <div className="bg-[#1b1b1b] w-[1440px] h-[1810px] relative">
        {/* Header */}
        <header className="flex w-[1440px] items-end justify-between p-8 absolute top-0 left-0">
          <h1 className="relative w-[348px] h-[47px] [font-family:'Bowlby_One',Helvetica] font-normal text-[#e3dfd6] text-2xl tracking-[0] leading-[normal]">
            KALGIRISIMCILIK
          </h1>

          <nav className="flex w-[397px] items-end gap-10 relative">
            <div className="relative w-[148px] h-[47px] [font-family:'Bowlby_One',Helvetica] font-normal text-[#1b1b1b] text-2xl tracking-[0] leading-[normal]">
              HAKKINDA
            </div>

            <Button className="h-[50px] px-6 py-0 bg-[#aa95c7] rounded-lg">
              <span className="[font-family:'Bowlby_One',Helvetica] font-normal text-[#1b1b1b] text-2xl text-center tracking-[0] leading-[normal]">
                GIRIS YAP
              </span>
            </Button>
          </nav>
        </header>

        {/* Hero Section */}
        <h2 className="absolute w-[1111px] top-[148px] left-[165px] [font-family:'Bowlby_One',Helvetica] font-normal text-[#e3dfd6] text-8xl text-center tracking-[0] leading-[80px] whitespace-nowrap">
          KAZANMAYA
          <br />
          CESARETIN VAR MI?
        </h2>

        {/* Main Image Section */}
        <section className="absolute w-[1306px] h-[776px] top-[316px] left-[93px]">
          <img
            className="left-8 absolute w-[265px] h-[229px] top-[199px]"
            alt="Vector graphic"
            src="/figmaAssets/vector-4.svg"
          />

          <img
            className="left-[994px] absolute w-[265px] h-[229px] top-[199px]"
            alt="Vector graphic"
            src="/figmaAssets/vector-5.svg"
          />

          <img
            className="absolute w-[1306px] h-[776px] top-0 left-0 object-cover"
            alt="Cash Crash graphic"
            src="/figmaAssets/image-1.png"
          />
        </section>

        {/* Quote Section */}
        <Card className="w-[1364px] absolute top-[1109px] left-[38px] bg-[#cae304e6] rounded-[25px] border-none">
          <CardContent className="flex items-start justify-between p-20">
            <blockquote className="relative w-[650px] h-[201px] mt-[-1.00px] [font-family:'Bowlby_One',Helvetica] font-normal text-[#1b1b1b] text-[80px] tracking-[0] leading-[70px]">
              &#34;BIR KARAR, HER SEYI DEGISTIRIR.&#34;
            </blockquote>

            <img
              className="relative w-[423.07px] h-[111.31px] mt-4"
              alt="Contact emails"
              src="/figmaAssets/defnecebiroglu-gmail-com-iremcebiroglu-gmail-com-eylllllltasirta.png"
            />
          </CardContent>
        </Card>

        {/* Social Media Section */}
        <footer className="absolute bottom-[151px] left-[329px] right-[155px] flex items-center">
          {socialMedia.map((social, index) => (
            <div key={index} className="flex items-center">
              <div className="w-[60px] h-[60px] relative flex items-center justify-center">
                <img
                  src={social.icon}
                  alt={`Social media icon for ${social.handle}`}
                  className={social.iconClasses}
                />
              </div>
              <span className="ml-[10px] [font-family:'Inter',Helvetica] font-semibold text-[#e3dfd6] text-[32px] tracking-[0] leading-10 whitespace-nowrap">
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
