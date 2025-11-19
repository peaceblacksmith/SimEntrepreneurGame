import { pgTable, text, serial, integer, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  symbol: text("symbol").notNull().unique(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(), // Buy price
  sellPrice: decimal("sell_price", { precision: 10, scale: 2 }).notNull(), // Sell price
  dividend: decimal("dividend", { precision: 5, scale: 2 }).notNull().default("0"),
  description: text("description").notNull(),
  logoUrl: text("logo_url"),
});

export const currencies = pgTable("currencies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  rate: decimal("rate", { precision: 10, scale: 6 }).notNull(), // Buy rate (TL per unit)
  sellRate: decimal("sell_rate", { precision: 10, scale: 6 }).notNull(), // Sell rate (TL per unit)
  logoUrl: text("logo_url"),
});

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  cashBalance: decimal("cash_balance", { precision: 12, scale: 2 }).notNull().default("50000"),
  accessCode: text("access_code").notNull().unique(),
  profilePicUrl: text("profile_pic_url"),
});

export const teamStocks = pgTable("team_stocks", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull().references(() => teams.id),
  companyId: integer("company_id").notNull().references(() => companies.id),
  shares: integer("shares").notNull(),
});

export const teamCurrencies = pgTable("team_currencies", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull().references(() => teams.id),
  currencyId: integer("currency_id").notNull().references(() => currencies.id),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
});

export const teamStartups = pgTable("team_startups", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull().references(() => teams.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  value: decimal("value", { precision: 12, scale: 2 }).notNull(),
  industry: text("industry").notNull(),
  riskLevel: text("risk_level").notNull(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
});

export const insertCompanySchema = createInsertSchema(companies).omit({ id: true });
export const insertCurrencySchema = createInsertSchema(currencies).omit({ id: true });
export const insertTeamSchema = createInsertSchema(teams).omit({ id: true });
export const insertTeamStockSchema = createInsertSchema(teamStocks).omit({ id: true });
export const insertTeamCurrencySchema = createInsertSchema(teamCurrencies).omit({ id: true });
export const insertTeamStartupSchema = createInsertSchema(teamStartups).omit({ id: true });
export const insertSettingSchema = createInsertSchema(settings).omit({ id: true });

export type Company = typeof companies.$inferSelect;
export type Currency = typeof currencies.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type TeamStock = typeof teamStocks.$inferSelect;
export type TeamCurrency = typeof teamCurrencies.$inferSelect;
export type TeamStartup = typeof teamStartups.$inferSelect;
export type Setting = typeof settings.$inferSelect;

export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type InsertCurrency = z.infer<typeof insertCurrencySchema>;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type InsertTeamStock = z.infer<typeof insertTeamStockSchema>;
export type InsertTeamCurrency = z.infer<typeof insertTeamCurrencySchema>;
export type InsertTeamStartup = z.infer<typeof insertTeamStartupSchema>;
export type InsertSetting = z.infer<typeof insertSettingSchema>;

// Extended types for frontend
export type TeamPortfolio = {
  team: Team;
  stocks: (TeamStock & { company: Company })[];
  currencies: (TeamCurrency & { currency: Currency })[];
  startup: TeamStartup | null;
  totalStockValue: string;
  totalCurrencyValue: string;
  totalPortfolioValue: string;
};
