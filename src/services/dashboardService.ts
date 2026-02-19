interface DashboardStats {
  stats: {
    gold: number;
    silver: number;
    bronze: number;
    total: number;
  };
  percentages: {
    gold: string;
    silver: string;
    bronze: string;
  };
}

interface ChannelPerformanceItem {
  channelName: string;
  value: number;
}

interface StatusPercentageItem {
  statusName: string;
  percentage: number;
}

export interface QuotationDashboardData {
  channelPerformance: ChannelPerformanceItem[];
  statusPercentageCurrentMonth: StatusPercentageItem[];
  totalQuotations: number;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dashboard-stats`;

  const headers = {
    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  };

  const response = await fetch(apiUrl, {
    method: 'GET',
    headers
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard stats: ${response.statusText}`);
  }

  return await response.json();
}

export async function fetchQuotationDashboard(): Promise<QuotationDashboardData> {
  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/quotation-dashboard`;

  const headers = {
    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  };

  const response = await fetch(apiUrl, {
    method: 'GET',
    headers
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch quotation dashboard: ${response.statusText}`);
  }

  return await response.json();
}
