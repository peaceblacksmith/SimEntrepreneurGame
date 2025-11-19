/**
 * Central API helper for Cash or Crash backend
 * All API requests go through this module to ensure consistent base URL and configuration
 */

const API_BASE = "https://cashorcras-backend.onrender.com";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * Base API request function
 */
async function apiRequest(
  method: string,
  url: string,
  data?: unknown,
  options?: { isFormData?: boolean }
): Promise<Response> {
  // If url starts with "http", use it as-is, otherwise prepend API_BASE
  const fullUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;

  const headers: HeadersInit = {};
  if (!options?.isFormData && data) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data 
      ? (options?.isFormData ? data as FormData : JSON.stringify(data))
      : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

// Auth endpoints
export async function loginTeam(accessCode: string) {
  const res = await apiRequest("POST", "/api/auth/team", { accessCode });
  return res.json();
}

export async function loginAdmin(code: string) {
  const res = await apiRequest("POST", "/api/auth/admin", { code });
  return res.json();
}

// Admin endpoints
export async function assignStock(teamId: string | number, companyId: string | number, shares: number) {
  const res = await apiRequest("POST", "/api/admin/assign-stock", {
    teamId: typeof teamId === "string" ? parseInt(teamId) : teamId,
    companyId: typeof companyId === "string" ? parseInt(companyId) : companyId,
    shares,
  });
  return res.json();
}

export async function assignCurrency(teamId: string | number, currencyId: string | number, amount: string) {
  const res = await apiRequest("POST", "/api/admin/assign-currency", {
    teamId: typeof teamId === "string" ? parseInt(teamId) : teamId,
    currencyId: typeof currencyId === "string" ? parseInt(currencyId) : currencyId,
    amount,
  });
  return res.json();
}

export async function unassignStock(teamId: number, companyId: number, shares: number) {
  const res = await apiRequest("POST", "/api/admin/unassign-stock", {
    teamId,
    companyId,
    shares,
  });
  return res.json();
}

export async function unassignCurrency(teamId: number, currencyId: number, amount: string) {
  const res = await apiRequest("POST", "/api/admin/unassign-currency", {
    teamId,
    currencyId,
    amount,
  });
  return res.json();
}

export async function updateTeamPassword(teamId: number, newAccessCode: string) {
  const res = await apiRequest("PUT", "/api/admin/update-team-password", {
    teamId,
    newAccessCode,
  });
  return res.json();
}

export async function updateAdminPassword(newPassword: string) {
  const res = await apiRequest("PUT", "/api/admin/update-admin-password", {
    newPassword,
  });
  return res.json();
}

export async function updateTeamName(teamId: number, newName: string) {
  const res = await apiRequest("PUT", "/api/admin/update-team-name", {
    teamId,
    newName,
  });
  return res.json();
}

export async function distributeDividend(companyId: number) {
  const res = await apiRequest("POST", `/api/admin/distribute-dividend/${companyId}`, {});
  return res.json();
}

// Team endpoints
export async function createTeam(data: { name: string; cashBalance: string; accessCode: string }) {
  const res = await apiRequest("POST", "/api/teams", data);
  return res.json();
}

export async function updateTeam(teamId: number, data: FormData) {
  const res = await apiRequest("PUT", `/api/teams/${teamId}`, data, { isFormData: true });
  return res.json();
}

export async function patchTeam(teamId: number, data: unknown) {
  const res = await apiRequest("PATCH", `/api/teams/${teamId}`, data);
  return res.json();
}

export async function getTeamPortfolio(teamId: string | number) {
  const res = await apiRequest("GET", `/api/teams/${teamId}/portfolio`, undefined);
  return res.json();
}

export async function tradeStock(teamId: string | number, data: unknown) {
  const res = await apiRequest("POST", `/api/teams/${teamId}/stocks/trade`, data);
  return res.json();
}

export async function tradeCurrency(teamId: string | number, data: unknown) {
  const res = await apiRequest("POST", `/api/teams/${teamId}/currencies/trade`, data);
  return res.json();
}

// Company endpoints
export async function createCompany(data: FormData) {
  const res = await apiRequest("POST", "/api/companies", data, { isFormData: true });
  return res.json();
}

export async function updateCompany(id: number, data: FormData) {
  const res = await apiRequest("PUT", `/api/companies/${id}`, data, { isFormData: true });
  return res.json();
}

export async function patchCompany(id: number, data: unknown) {
  const res = await apiRequest("PATCH", `/api/companies/${id}`, data);
  return res.json();
}

export async function deleteCompany(id: number) {
  const res = await apiRequest("DELETE", `/api/companies/${id}`, undefined);
  return res.json();
}

// Currency endpoints
export async function createCurrency(data: FormData) {
  const res = await apiRequest("POST", "/api/currencies", data, { isFormData: true });
  return res.json();
}

export async function updateCurrency(id: number, data: FormData) {
  const res = await apiRequest("PUT", `/api/currencies/${id}`, data, { isFormData: true });
  return res.json();
}

export async function patchCurrency(id: number, data: unknown) {
  const res = await apiRequest("PATCH", `/api/currencies/${id}`, data);
  return res.json();
}

export async function deleteCurrency(id: number) {
  const res = await apiRequest("DELETE", `/api/currencies/${id}`, undefined);
  return res.json();
}

// Team startup endpoints
export async function createTeamStartup(data: unknown) {
  const res = await apiRequest("POST", "/api/team-startups", data);
  return res.json();
}

export async function updateTeamStartup(id: number, data: unknown) {
  const res = await apiRequest("PUT", `/api/team-startups/${id}`, data);
  return res.json();
}

export async function deleteTeamStartup(id: number) {
  const res = await apiRequest("DELETE", `/api/team-startups/${id}`, undefined);
  return res.json();
}

// Export API_BASE for use in queryClient
export { API_BASE };

