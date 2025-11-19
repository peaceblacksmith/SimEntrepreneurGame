import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ArrowLeft } from "lucide-react";
import { CompanyManagement } from "@/components/admin/company-management";
import { CurrencyManagement } from "@/components/admin/currency-management";
import { TeamManagement } from "@/components/admin/team-management";
import { FinancialOverview } from "@/components/admin/financial-overview";
import { PortfolioOverview } from "@/components/admin/portfolio-overview";
import { DividendDistribution } from "@/components/admin/dividend-distribution";
import { BulkPriceUpdate } from "@/components/admin/bulk-price-update";
import { PasswordManagement } from "@/components/admin/password-management";

export default function Admin() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-xl font-bold">Admin Panel</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Cash or Crash - Administration</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="portfolios" className="w-full">
              <TabsList className="grid w-full grid-cols-8">
                <TabsTrigger value="portfolios">Portföyler</TabsTrigger>
                <TabsTrigger value="financial">Mali Durum</TabsTrigger>
                <TabsTrigger value="dividend">Temettü</TabsTrigger>
                <TabsTrigger value="bulk-update">Toplu Güncelleme</TabsTrigger>
                <TabsTrigger value="companies">Şirketler</TabsTrigger>
                <TabsTrigger value="currencies">Dövizler</TabsTrigger>
                <TabsTrigger value="teams">Takımlar</TabsTrigger>
                <TabsTrigger value="passwords">Şifreler</TabsTrigger>
              </TabsList>
              
              <TabsContent value="portfolios" className="mt-6">
                <PortfolioOverview />
              </TabsContent>
              
              <TabsContent value="financial" className="mt-6">
                <FinancialOverview />
              </TabsContent>
              
              <TabsContent value="dividend" className="mt-6">
                <DividendDistribution />
              </TabsContent>

              <TabsContent value="bulk-update" className="mt-6">
                <BulkPriceUpdate />
              </TabsContent>
              
              <TabsContent value="companies" className="mt-6">
                <CompanyManagement />
              </TabsContent>
              
              <TabsContent value="currencies" className="mt-6">
                <CurrencyManagement />
              </TabsContent>
              
              <TabsContent value="teams" className="mt-6">
                <TeamManagement />
              </TabsContent>
              
              <TabsContent value="passwords" className="mt-6">
                <PasswordManagement />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
