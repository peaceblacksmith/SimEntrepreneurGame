import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const Wireframe = (): JSX.Element => {
  // Navigation items data
  const navItems = [
    { text: "HAKKINDA", isButton: false, className: "text-[#1b1b1b]" },
    {
      text: "GIRIS YAP",
      isButton: true,
      className: "text-[#1b1b1b] bg-[#aa95c7]",
    },
  ];

  return (
    <div className="bg-[#1b1b1b] flex flex-row justify-center w-full">
      <div className="bg-[#1b1b1b] overflow-hidden w-[1440px] h-[1165px] relative">
        {/* Banner text */}
        <div className="absolute w-[3432px] top-[154px] left-[-996px] [font-family:'Bowlby_One',Helvetica] font-normal text-[#cbed46] text-8xl text-center tracking-[0] leading-[80px] whitespace-nowrap">
          RASH OR CASH OR CRASH OR CAS
        </div>

        <div className="absolute w-[1186px] h-[710px] top-[289px] left-[127px]">
          {/* Vector graphics */}
          <img
            className="top-[481px] left-0 absolute w-[265px] h-[229px]"
            alt="Vector"
            src="/figmaAssets/vector-2.svg"
          />

          <img
            className="top-[50px] left-[921px] absolute w-[265px] h-[229px]"
            alt="Vector"
            src="/figmaAssets/vector-3.svg"
          />

          {/* Login card */}
          <Card className="w-[700px] absolute top-[123px] left-[243px] bg-[#1b1b1b] rounded-[25px] border-4 border-solid border-[#aa95c7]">
            <CardContent className="flex flex-col items-start gap-[42px] p-10">
              <h1 className="relative self-stretch h-[74px] mt-[-4.00px] [font-family:'Bowlby_One',Helvetica] font-normal text-[#e3dfd6] text-5xl text-center tracking-[0] leading-[80px] whitespace-nowrap w-full">
                TAKIM GIRISI
              </h1>

              <label className="relative self-stretch h-5 [font-family:'Inter',Helvetica] font-extrabold text-[#e3dfd6] text-[32px] tracking-[0] leading-10 whitespace-nowrap">
                Erişim Kodu
              </label>

              <div className="relative self-stretch w-full">
                <Input
                  className="h-[60px] bg-[#aa95c766] rounded-lg border-2 border-solid border-[#aa95c7] [font-family:'Inter',Helvetica] font-normal text-[#e3dfd6] text-[30px] tracking-[0] leading-10 pl-[20px] pr-[20px]"
                  placeholder="Takım erişim kodunu giriniz"
                />
              </div>

              <Button className="h-[60px] justify-center gap-2.5 px-6 py-0 relative self-stretch w-full bg-[#e3dfd6] rounded-lg hover:bg-[#d3cfc6]">
                <span className="relative w-fit [font-family:'Bowlby_One',Helvetica] font-normal text-[#8a8a8a] text-[32px] text-center tracking-[0] leading-[normal]">
                  GIRIS YAP
                </span>
              </Button>

              <div className="relative self-stretch w-full h-10 text-center">
                <span className="[font-family:'Inter',Helvetica] font-normal text-[#e3dfd6] text-3xl tracking-[0] leading-10 whitespace-nowrap">
                  Admin girişi için{" "}
                </span>
                <button className="[font-family:'Inter',Helvetica] font-medium text-[#cbed46] text-3xl tracking-[0] leading-10 whitespace-nowrap">
                  buraya tıklayınız
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Header navigation */}
        <header className="flex w-[1440px] items-end justify-between p-8 absolute top-0 left-px">
          <div className="relative w-[348px] h-[47px] [font-family:'Bowlby_One',Helvetica] font-normal text-[#e3dfd6] text-2xl tracking-[0] leading-[normal]">
            KALGIRISIMCILIK
          </div>

          <nav className="flex w-[397px] items-end gap-10 relative">
            <div className="relative w-[148px] h-[47px] [font-family:'Bowlby_One',Helvetica] font-normal text-[#1b1b1b] text-2xl tracking-[0] leading-[normal]">
              HAKKINDA
            </div>

            <Button className="h-[50px] px-6 py-0 bg-[#aa95c7] rounded-lg hover:bg-[#9a85b7]">
              <span className="relative w-fit [font-family:'Bowlby_One',Helvetica] font-normal text-[#1b1b1b] text-2xl text-center tracking-[0] leading-[normal]">
                GIRIS YAP
              </span>
            </Button>
          </nav>
        </header>
      </div>
    </div>
  );
};
