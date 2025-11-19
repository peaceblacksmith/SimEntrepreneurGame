import {
  companies,
  currencies,
  teams,
  teamStocks,
  teamCurrencies,
  teamStartups,
  type Company,
  type Currency,
  type Team,
  type TeamStock,
  type TeamCurrency,
  type TeamStartup,
  type InsertCompany,
  type InsertCurrency,
  type InsertTeam,
  type InsertTeamStock,
  type InsertTeamCurrency,
  type InsertTeamStartup,
  type TeamPortfolio,
} from "../shared/schema";
import { getSetting, setSetting } from "./db";

export interface IStorage {
  // Companies
  getCompanies(): Promise<Company[]>;
  getCompany(id: number): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company>;
  deleteCompany(id: number): Promise<void>;

  // Currencies
  getCurrencies(): Promise<Currency[]>;
  getCurrency(id: number): Promise<Currency | undefined>;
  createCurrency(currency: InsertCurrency): Promise<Currency>;
  updateCurrency(
    id: number,
    currency: Partial<InsertCurrency>,
  ): Promise<Currency>;
  deleteCurrency(id: number): Promise<void>;

  // Teams
  getTeams(): Promise<Team[]>;
  getTeam(id: number): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: number, team: Partial<InsertTeam>): Promise<Team>;
  deleteTeam(id: number): Promise<void>;

  // Team Portfolio
  getTeamPortfolio(teamId: number): Promise<TeamPortfolio | undefined>;

  // Team Stocks
  getTeamStocks(teamId: number): Promise<(TeamStock & { company: Company })[]>;
  createTeamStock(teamStock: InsertTeamStock): Promise<TeamStock>;
  updateTeamStock(
    id: number,
    teamStock: Partial<InsertTeamStock>,
  ): Promise<TeamStock>;
  deleteTeamStock(id: number): Promise<void>;

  // Team Currencies
  getTeamCurrencies(
    teamId: number,
  ): Promise<(TeamCurrency & { currency: Currency })[]>;
  createTeamCurrency(teamCurrency: InsertTeamCurrency): Promise<TeamCurrency>;
  updateTeamCurrency(
    id: number,
    teamCurrency: Partial<InsertTeamCurrency>,
  ): Promise<TeamCurrency>;
  deleteTeamCurrency(id: number): Promise<void>;

  // Team Startups
  getTeamStartup(teamId: number): Promise<TeamStartup | null>;
  getStartupById(id: number): Promise<TeamStartup | null>;
  createTeamStartup(teamStartup: InsertTeamStartup): Promise<TeamStartup>;
  updateTeamStartup(
    id: number,
    teamStartup: Partial<InsertTeamStartup>,
  ): Promise<TeamStartup>;
  deleteTeamStartup(id: number): Promise<void>;

  // Authentication
  authenticateTeam(accessCode: string): Promise<Team | null>;
  authenticateAdmin(password: string): Promise<boolean>;

  // Password Management
  updateTeamAccessCode(teamId: number, newAccessCode: string): Promise<Team>;
  updateAdminPassword(newPassword: string): Promise<boolean>;

  // Team Management
  updateTeamName(teamId: number, newName: string): Promise<Team>;
}

export class MemStorage implements IStorage {
  private companies: Map<number, Company> = new Map();
  private currencies: Map<number, Currency> = new Map();
  private teams: Map<number, Team> = new Map();
  private teamStocks: Map<number, TeamStock> = new Map();
  private teamCurrencies: Map<number, TeamCurrency> = new Map();
  private teamStartups: Map<number, TeamStartup> = new Map();
  private adminPassword: string = process.env.ADMIN_PASSWORD || "admin123";

  private currentCompanyId = 1;
  private currentCurrencyId = 1;
  private currentTeamId = 1;
  private currentTeamStockId = 1;
  private currentTeamCurrencyId = 1;
  private currentTeamStartupId = 1;

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize companies
    const initialCompanies: InsertCompany[] = [
      {
        name: "Apple Inc.",
        symbol: "AAPL",
        price: "170.00",
        sellPrice: "162.00",
        dividend: "2.1",
        description:
          "Technology company specializing in consumer electronics and software",
        logoUrl:
          "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64",
      },
      {
        name: "Microsoft Corp.",
        symbol: "MSFT",
        price: "340.00",
        sellPrice: "325.00",
        dividend: "1.8",
        description:
          "Technology corporation developing software and cloud services",
        logoUrl:
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64",
      },
      {
        name: "Tesla Inc.",
        symbol: "TSLA",
        price: "240.00",
        sellPrice: "230.00",
        dividend: "0",
        description: "Electric vehicle and clean energy company",
        logoUrl:
          "https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64",
      },
      {
        name: "Amazon Inc.",
        symbol: "AMZN",
        price: "3420.50",
        sellPrice: "3280.00",
        dividend: "1.2",
        description: "E-commerce and cloud computing leader with global reach",
        logoUrl:
          "https://images.unsplash.com/photo-1586880244386-8b3e34c8382c?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64",
      },
      {
        name: "Alphabet Inc.",
        symbol: "GOOGL",
        price: "2750.25",
        sellPrice: "2640.00",
        dividend: "0",
        description: "Search engine and advertising technology company",
        logoUrl:
          "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64",
      },
      {
        name: "Netflix Inc.",
        symbol: "NFLX",
        price: "485.75",
        sellPrice: "465.00",
        dividend: "0",
        description:
          "Global streaming entertainment platform and content creator",
        logoUrl:
          "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64",
      },
      {
        name: "Nike Inc.",
        symbol: "NKE",
        price: "128.40",
        sellPrice: "123.00",
        dividend: "1.1",
        description: "Global athletic footwear and apparel brand",
        logoUrl:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64",
      },
      {
        name: "Coca-Cola Co.",
        symbol: "KO",
        price: "58.90",
        sellPrice: "56.50",
        dividend: "3.2",
        description: "Global beverage corporation and brand",
        logoUrl:
          "https://images.unsplash.com/photo-1561758033-d89a9ad46330?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64",
      },
    ];

    initialCompanies.forEach((company) => {
      const id = this.currentCompanyId++;
      this.companies.set(id, {
        ...company,
        id,
        dividend: company.dividend || "0",
        logoUrl: company.logoUrl || null,
      });
    });

    // Initialize currencies (rates relative to Turkish Lira)
    const initialCurrencies: InsertCurrency[] = [
      {
        name: "ABD Doları",
        code: "USD",
        rate: "34.20",
        sellRate: "32.80",
        logoUrl:
          "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64",
      },
      {
        name: "Euro",
        code: "EUR",
        rate: "37.40",
        sellRate: "35.60",
        logoUrl:
          "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64",
      },
      {
        name: "İngiliz Sterlini",
        code: "GBP",
        rate: "42.80",
        sellRate: "40.20",
        logoUrl:
          "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64",
      },
      {
        name: "Japon Yeni",
        code: "JPY",
        rate: "0.24",
        sellRate: "0.22",
        logoUrl:
          "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64",
      },
      {
        name: "Kanada Doları",
        code: "CAD",
        rate: "25.40",
        sellRate: "23.80",
        logoUrl:
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64",
      },
    ];

    initialCurrencies.forEach((currency) => {
      const id = this.currentCurrencyId++;
      this.currencies.set(id, {
        ...currency,
        id,
        logoUrl: currency.logoUrl || null,
      });
    });

    // Initialize teams
    const initialTeams: InsertTeam[] = [
      {
        name: "1. Takım",
        cashBalance: "100000.00",
        accessCode: "123456",
        profilePicUrl: null,
      },
      {
        name: "2. Takım",
        cashBalance: "100000.00",
        accessCode: "2345678",
        profilePicUrl: null,
      },
      {
        name: "3. Takım",
        cashBalance: "100000.00",
        accessCode: "8982972",
        profilePicUrl: null,
      },
      {
        name: "4. Takım",
        cashBalance: "100000.00",
        accessCode: "00998988",
        profilePicUrl: null,
      },
      {
        name: "5. Takım",
        cashBalance: "100000.00",
        accessCode: "18298139",
        profilePicUrl: null,
      },
      {
        name: "6. Takım",
        cashBalance: "100000.00",
        accessCode: "kursoyvseyupb",
        profilePicUrl: null,
      },
      {
        name: "7. Takım",
        cashBalance: "100000.00",
        accessCode: "biznizzyineasik",
        profilePicUrl: null,
      },
      {
        name: "8. Takım",
        cashBalance: "100000.00",
        accessCode: "borsacoktu11",
        profilePicUrl: null,
      },
      {
        name: "9. Takım",
        cashBalance: "100000.00",
        accessCode: "krizegirdik777",
        profilePicUrl: null,
      },
      {
        name: "10. Takım",
        cashBalance: "100000.00",
        accessCode: "borsissarabeni",
        profilePicUrl: null,
      },
      {
        name: "11. Takım",
        cashBalance: "100000.00",
        accessCode: "krizpygergin",
        profilePicUrl: null,
      },
      {
        name: "12. Takım",
        cashBalance: "100000.00",
        accessCode: "kriziscoming",
        profilePicUrl: null,
      },
      {
        name: "13. Takım",
        cashBalance: "100000.00",
        accessCode: "girisimciolucaz",
        profilePicUrl: null,
      },
      {
        name: "14. Takım",
        cashBalance: "100000.00",
        accessCode: "paraparanoya",
        profilePicUrl: null,
      },
      {
        name: "15. Takım",
        cashBalance: "100000.00",
        accessCode: "sansdonermi0",
        profilePicUrl: null,
      },
      {
        name: "16. Takım",
        cashBalance: "100000.00",
        accessCode: "altinavcisi5",
        profilePicUrl: null,
      },
      {
        name: "17. Takım",
        cashBalance: "100000.00",
        accessCode: "borsabebesi9",
        profilePicUrl: null,
      },
      {
        name: "18. Takım",
        cashBalance: "100000.00",
        accessCode: "bitcoinlover4",
        profilePicUrl: null,
      },
      {
        name: "19. Takım",
        cashBalance: "100000.00",
        accessCode: "krizyonetimi0",
        profilePicUrl: null,
      },
      {
        name: "20. Takım",
        cashBalance: "100000.00",
        accessCode: "enflasyon%200",
        profilePicUrl: null,
      },
      {
        name: "21. Takım",
        cashBalance: "100000.00",
        accessCode: "riskbudur111",
        profilePicUrl: null,
      },
      {
        name: "22. Takım",
        cashBalance: "100000.00",
        accessCode: "cashmicrashmi",
        profilePicUrl: null,
      },

      {
        name: "23. Takım",
        cashBalance: "100000.00",
        accessCode: "kursoylapiyasa",
        profilePicUrl: null,
      },
      {
        name: "24. Takım",
        cashBalance: "100000.00",
        accessCode: "biznizzisbuldu",
        profilePicUrl: null,
      },
      {
        name: "25. Takım",
        cashBalance: "100000.00",
        accessCode: "elonmuskolcaz",
        profilePicUrl: null,
      },
      {
        name: "26. Takım",
        cashBalance: "100000.00",
        accessCode: "parababası55",
        profilePicUrl: null,
      },
      {
        name: "27. Takım",
        cashBalance: "100000.00",
        accessCode: "kursoyyksde1",
        profilePicUrl: null,
      },
      {
        name: "28. Takım",
        cashBalance: "100000.00",
        accessCode: "burjuvapanelle",
        profilePicUrl: null,
      },
      {
        name: "29. Takım",
        cashBalance: "100000.00",
        accessCode: "biznizzpozitif6",
        profilePicUrl: null,
      },
      {
        name: "30. Takım",
        cashBalance: "100000.00",
        accessCode: "borsisssayısalcı",
        profilePicUrl: null,
      },
      {
        name: "Yedek Takım 1",
        cashBalance: "100000.00",
        accessCode: "yedek1",
        profilePicUrl: null,
      },
      {
        name: "Yedek Takım 2",
        cashBalance: "100000.00",
        accessCode: "yedek2",
        profilePicUrl: null,
      },
    ];

    initialTeams.forEach((team) => {
      const id = this.currentTeamId++;
      this.teams.set(id, {
        ...team,
        id,
        cashBalance: team.cashBalance || "100000.00",
        accessCode: team.accessCode,
        profilePicUrl: team.profilePicUrl || null,
      });
    });
  }

  // Companies
  async getCompanies(): Promise<Company[]> {
    return Array.from(this.companies.values());
  }

  async getCompany(id: number): Promise<Company | undefined> {
    return this.companies.get(id);
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const id = this.currentCompanyId++;
    const newCompany: Company = {
      ...company,
      id,
      dividend: company.dividend || "0",
      logoUrl: company.logoUrl || null,
    };
    this.companies.set(id, newCompany);
    return newCompany;
  }

  async updateCompany(
    id: number,
    company: Partial<InsertCompany>,
  ): Promise<Company> {
    const existing = this.companies.get(id);
    if (!existing) throw new Error("Company not found");
    const updated = { ...existing, ...company };
    this.companies.set(id, updated);
    return updated;
  }

  async deleteCompany(id: number): Promise<void> {
    this.companies.delete(id);
  }

  // Currencies
  async getCurrencies(): Promise<Currency[]> {
    return Array.from(this.currencies.values());
  }

  async getCurrency(id: number): Promise<Currency | undefined> {
    return this.currencies.get(id);
  }

  async createCurrency(currency: InsertCurrency): Promise<Currency> {
    const id = this.currentCurrencyId++;
    const newCurrency: Currency = {
      ...currency,
      id,
      logoUrl: currency.logoUrl || null,
    };
    this.currencies.set(id, newCurrency);
    return newCurrency;
  }

  async updateCurrency(
    id: number,
    currency: Partial<InsertCurrency>,
  ): Promise<Currency> {
    const existing = this.currencies.get(id);
    if (!existing) throw new Error("Currency not found");
    const updated = { ...existing, ...currency };
    this.currencies.set(id, updated);
    return updated;
  }

  async deleteCurrency(id: number): Promise<void> {
    this.currencies.delete(id);
  }

  // Teams
  async getTeams(): Promise<Team[]> {
    return Array.from(this.teams.values());
  }

  async getTeam(id: number): Promise<Team | undefined> {
    return this.teams.get(id);
  }

  async createTeam(team: InsertTeam): Promise<Team> {
    const id = this.currentTeamId++;
    const newTeam: Team = {
      ...team,
      id,
      cashBalance: team.cashBalance || "50000.00",
      accessCode: team.accessCode,
      profilePicUrl: team.profilePicUrl || null,
    };
    this.teams.set(id, newTeam);
    return newTeam;
  }

  async updateTeam(id: number, team: Partial<InsertTeam>): Promise<Team> {
    const existing = this.teams.get(id);
    if (!existing) throw new Error("Team not found");
    const updated = { ...existing, ...team };
    this.teams.set(id, updated);
    return updated;
  }

  async deleteTeam(id: number): Promise<void> {
    this.teams.delete(id);
  }

  // Team Portfolio
  async getTeamPortfolio(teamId: number): Promise<TeamPortfolio | undefined> {
    const team = this.teams.get(teamId);
    if (!team) return undefined;

    const stocks = await this.getTeamStocks(teamId);
    const currencies = await this.getTeamCurrencies(teamId);
    const startup = await this.getTeamStartup(teamId);

    const totalStockValue = stocks.reduce((sum, stock) => {
      return sum + parseFloat(stock.company.sellPrice) * stock.shares;
    }, 0);

    const totalCurrencyValue = currencies.reduce((sum, currency) => {
      return (
        sum +
        parseFloat(currency.amount) * parseFloat(currency.currency.sellRate)
      );
    }, 0);

    const startupValue = startup ? parseFloat(startup.value) : 0;
    const totalPortfolioValue =
      parseFloat(team.cashBalance) +
      totalStockValue +
      totalCurrencyValue +
      startupValue;

    return {
      team,
      stocks,
      currencies,
      startup,
      totalStockValue: totalStockValue.toFixed(2),
      totalCurrencyValue: totalCurrencyValue.toFixed(2),
      totalPortfolioValue: totalPortfolioValue.toFixed(2),
    };
  }

  // Team Stocks
  async getTeamStocks(
    teamId: number,
  ): Promise<(TeamStock & { company: Company })[]> {
    const teamStocks = Array.from(this.teamStocks.values()).filter(
      (s) => s.teamId === teamId,
    );

    // Group by companyId and sum shares
    const holdingsMap = new Map<
      number,
      { totalShares: number; companyId: number; teamId: number; id: number }
    >();

    teamStocks.forEach((stock) => {
      const existing = holdingsMap.get(stock.companyId);
      if (existing) {
        existing.totalShares += stock.shares;
      } else {
        holdingsMap.set(stock.companyId, {
          totalShares: stock.shares,
          companyId: stock.companyId,
          teamId: stock.teamId,
          id: stock.id,
        });
      }
    });

    // Filter out zero or negative holdings and return with company data
    return Array.from(holdingsMap.values())
      .filter((holding) => holding.totalShares > 0)
      .map((holding) => {
        const company = this.companies.get(holding.companyId);
        if (!company) throw new Error("Company not found");
        return {
          id: holding.id,
          teamId: holding.teamId,
          companyId: holding.companyId,
          shares: holding.totalShares,
          company,
        };
      });
  }

  async createTeamStock(teamStock: InsertTeamStock): Promise<TeamStock> {
    const id = this.currentTeamStockId++;
    const newTeamStock: TeamStock = { ...teamStock, id };
    this.teamStocks.set(id, newTeamStock);
    return newTeamStock;
  }

  async updateTeamStock(
    id: number,
    teamStock: Partial<InsertTeamStock>,
  ): Promise<TeamStock> {
    const existing = this.teamStocks.get(id);
    if (!existing) throw new Error("Team stock not found");
    const updated = { ...existing, ...teamStock };
    this.teamStocks.set(id, updated);
    return updated;
  }

  async deleteTeamStock(id: number): Promise<void> {
    this.teamStocks.delete(id);
  }

  // Team Currencies
  async getTeamCurrencies(
    teamId: number,
  ): Promise<(TeamCurrency & { currency: Currency })[]> {
    const teamCurrencies = Array.from(this.teamCurrencies.values()).filter(
      (c) => c.teamId === teamId,
    );

    // Group by currencyId and sum amounts
    const holdingsMap = new Map<
      number,
      { totalAmount: number; currencyId: number; teamId: number; id: number }
    >();

    teamCurrencies.forEach((currency) => {
      const existing = holdingsMap.get(currency.currencyId);
      const amount = parseFloat(currency.amount);
      if (existing) {
        existing.totalAmount += amount;
      } else {
        holdingsMap.set(currency.currencyId, {
          totalAmount: amount,
          currencyId: currency.currencyId,
          teamId: currency.teamId,
          id: currency.id,
        });
      }
    });

    // Filter out zero or negative holdings and return with currency data
    return Array.from(holdingsMap.values())
      .filter((holding) => holding.totalAmount > 0)
      .map((holding) => {
        const currencyData = this.currencies.get(holding.currencyId);
        if (!currencyData) throw new Error("Currency not found");
        return {
          id: holding.id,
          teamId: holding.teamId,
          currencyId: holding.currencyId,
          amount: holding.totalAmount.toFixed(2),
          currency: currencyData,
        };
      });
  }

  async createTeamCurrency(
    teamCurrency: InsertTeamCurrency,
  ): Promise<TeamCurrency> {
    const id = this.currentTeamCurrencyId++;
    const newTeamCurrency: TeamCurrency = { ...teamCurrency, id };
    this.teamCurrencies.set(id, newTeamCurrency);
    return newTeamCurrency;
  }

  async updateTeamCurrency(
    id: number,
    teamCurrency: Partial<InsertTeamCurrency>,
  ): Promise<TeamCurrency> {
    const existing = this.teamCurrencies.get(id);
    if (!existing) throw new Error("Team currency not found");
    const updated = { ...existing, ...teamCurrency };
    this.teamCurrencies.set(id, updated);
    return updated;
  }

  async deleteTeamCurrency(id: number): Promise<void> {
    this.teamCurrencies.delete(id);
  }

  // Team Startups
  async getTeamStartup(teamId: number): Promise<TeamStartup | null> {
    return (
      Array.from(this.teamStartups.values()).find((s) => s.teamId === teamId) ||
      null
    );
  }

  async getStartupById(id: number): Promise<TeamStartup | null> {
    return this.teamStartups.get(id) || null;
  }

  async createTeamStartup(
    teamStartup: InsertTeamStartup,
  ): Promise<TeamStartup> {
    const id = this.currentTeamStartupId++;
    const newTeamStartup: TeamStartup = { ...teamStartup, id };
    this.teamStartups.set(id, newTeamStartup);
    return newTeamStartup;
  }

  async updateTeamStartup(
    id: number,
    teamStartup: Partial<InsertTeamStartup>,
  ): Promise<TeamStartup> {
    const existing = this.teamStartups.get(id);
    if (!existing) throw new Error("Team startup not found");
    const updated = { ...existing, ...teamStartup };
    this.teamStartups.set(id, updated);
    return updated;
  }

  async deleteTeamStartup(id: number): Promise<void> {
    this.teamStartups.delete(id);
  }

  // Authentication methods
  async authenticateTeam(accessCode: string): Promise<Team | null> {
    const teams = Array.from(this.teams.values());
    return teams.find((team) => team.accessCode === accessCode) || null;
  }

  async authenticateAdmin(password: string): Promise<boolean> {
    // Try to get admin password from database first (for persistence across restarts)
    const dbPassword = await getSetting("admin_password");
    const actualPassword = dbPassword || this.adminPassword;
    return password === actualPassword;
  }

  // Password Management
  async updateTeamAccessCode(
    teamId: number,
    newAccessCode: string,
  ): Promise<Team> {
    const team = this.teams.get(teamId);
    if (!team) throw new Error("Team not found");

    // Check if access code is already used by another team
    const existingTeam = Array.from(this.teams.values()).find(
      (t) => t.accessCode === newAccessCode && t.id !== teamId,
    );
    if (existingTeam) {
      throw new Error("Bu erişim kodu zaten kullanılıyor");
    }

    const updated = { ...team, accessCode: newAccessCode };
    this.teams.set(teamId, updated);
    return updated;
  }

  async updateAdminPassword(newPassword: string): Promise<boolean> {
    // Update in-memory password
    this.adminPassword = newPassword;

    // Try to persist to database for universal deployment
    const saved = await setSetting("admin_password", newPassword);

    // Return true even if database save fails (degraded mode with in-memory only)
    if (!saved) {
      console.warn(
        "Warning: Admin password saved to memory only. Changes will be lost on server restart. Set DATABASE_URL for persistence.",
      );
    }

    return true;
  }

  async updateTeamName(teamId: number, newName: string): Promise<Team> {
    const team = this.teams.get(teamId);
    if (!team) throw new Error("Team not found");

    const updated = { ...team, name: newName };
    this.teams.set(teamId, updated);
    return updated;
  }
}

export const storage = new MemStorage();
