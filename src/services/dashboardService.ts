export interface StatusPercentage {
  statusId: number;
  statusName: string;
  percentage: number;
}

export interface AcceptedByChannel {
  year: number;
  requestTypeId: number;
  requestTypeName: string;
  totalAccepted: number;
}

export interface UpcomingDeadline {
  customer: {
    _id_customer: {
      $oid: string;
    };
    customer_name: string;
    customer_category: number;
  };
  daysRemaining: {
    $numberLong: string;
  };
  _id: {
    $oid: string;
  };
  deadlineDate: {
    $date: string;
  };
  reference_request: string;
}

export interface NewRequestCurrentMonth {
  customer: {
    _id_customer: {
      $oid: string;
    };
    customer_name: string;
    customer_category: number;
  };
  _id: {
    $oid: string;
  };
  statusId: number;
  statusName: string;
  createdAt: {
    $date: string;
  };
  reference_request: string;
}

export interface QuotationStats {
  statusPercentageCurrentMonth: StatusPercentage[];
  acceptedByChannel: AcceptedByChannel[];
  upcomingDeadlines: UpcomingDeadline[];
  newRequestsCurrentMonth: NewRequestCurrentMonth[];
  totalQuotationsCurrentMonth: number;
}

export interface DashboardStats {
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
  quotations: QuotationStats;
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

const DASHBOARD_API_URL = import.meta.env.VITE_API_DASHBOARD;
const API_TOKENSL = import.meta.env.VITE_TOKENSL;
const API_KEYSL = import.meta.env.VITE_APIKEYSL;

export async function fetchDashboardStatsNew(): Promise<DashboardStats> {
  const apiUrl1 = `${DASHBOARD_API_URL}/v1/kl/dashboard/panelinicial/1`;
  const apiUrl2 = `${DASHBOARD_API_URL}/v1/kl/dashboard/panelinicial/2`;

  const headers = {
      'Authorization': `Bearer ${API_TOKENSL}`,
      'Content-Type': 'application/json',
      'x-api-key': API_KEYSL,
  };

  const response1 = await fetch(apiUrl1, {
    method: 'GET',
    headers
  });

  if (!response1.ok) {
    throw new Error(`Failed to fetch dashboard stats: ${response1.statusText}`);
  }

   const response2 = await fetch(apiUrl2, {
    method: 'GET',
    headers
  });

   if (!response2.ok) {
    throw new Error(`Failed to fetch dashboard stats: ${response2.statusText}`);
  }

  const data1 = await response1.json();
  const data2 = await response2.json();

  const result: DashboardStats = {} as DashboardStats;

   result.stats = {
    gold: 0,
    silver: 0,
    bronze: 0,
    total: 0,
  };
  result.percentages = {
    gold: "0.0",
    silver: "0.0",
    bronze: "0.0"
  };

  result.quotations ={
    statusPercentageCurrentMonth: data1.data[0].statusPercentageCurrentMonth || [],
    acceptedByChannel: data1.data[0].acceptedByChannel || [],
    upcomingDeadlines: data1.data[0].upcomingDeadlines || [],
    newRequestsCurrentMonth: data1.data[0].newRequestsCurrentMonth || [],
    totalQuotationsCurrentMonth: data1.data[0].newRequestsCurrentMonth?.length || 0,
  }


    data2.data.forEach((item: any) => {
      if (item.nivel === 'oro') {
        result.stats.gold = item.total || 0;
        result.percentages.gold = item.porcentaje.toFixed(1) || "0.0";
      } else if (item.nivel === 'plata') {
        result.stats.silver = item.total || 0;
        result.percentages.silver = item.porcentaje.toFixed(1) || "0.0";
      } else if (item.nivel === 'bronce') { 
        result.stats.bronze = item.total || 0;
        result.percentages.bronze = item.porcentaje.toFixed(1) || "0.0";
      }
      result.stats.total += item.total || 0;
  }); 

  return  result;

}
