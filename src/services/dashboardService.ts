interface StatusPercentage {
  statusName: string;
  percentage: number;
}

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
  quotations?: {
    totalCurrentMonth: number;
    statusPercentageCurrentMonth: StatusPercentage[];
  };
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
