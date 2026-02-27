import { MongoClient } from "npm:mongodb@7.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const MONGODB_URI = 'mongodb+srv://fox1:modelotx30@arcobitscluster0.w6meunj.mongodb.net/?retryWrites=true&w=majority&appName=ArcobitsCluster0';
const MONGODB_DATABASE = 'singulatiry_sandbox';

let cachedClient: MongoClient | null = null;

async function getMongoClient(): Promise<MongoClient> {
  if (!MONGODB_URI || !MONGODB_DATABASE) {
    throw new Error("MongoDB configuration is missing.");
  }

  if (cachedClient) {
    try {
      await cachedClient.db(MONGODB_DATABASE).command({ ping: 1 });
      return cachedClient;
    } catch {
      cachedClient = null;
    }
  }

  try {
    console.log("Connecting to MongoDB...");
    cachedClient = new MongoClient(MONGODB_URI, {
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
    });
    await cachedClient.connect();
    console.log("MongoDB connected successfully");
    return cachedClient;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    cachedClient = null;
    throw new Error(`Failed to connect to MongoDB: ${error.message}`);
  }
}

interface CustomerSummary {
  _id: string;
  customer_name: string;
  level: string;
  total_quotations?: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const client = await getMongoClient();
    const db = client.db(MONGODB_DATABASE!);
    const customerView = db.collection("custumer_sumary_level");
    const quotationView = db.collection("VT018QuotationRequests_Dashboard");

    const levelData = await customerView.find({}).toArray();

    console.log("Total documents found:", levelData.length);
    console.log("Raw data:", JSON.stringify(levelData, null, 2));

    const stats = {
      gold: 0,
      silver: 0,
      bronze: 0,
      total: 0,
    };

    levelData.forEach((item: any) => {
      const nivel = item.nivel?.toLowerCase()?.trim();
      const total = item.total || 0;

      console.log("Processing level:", nivel, "Total customers:", total);

      if (nivel === "oro") {
        stats.gold += total;
      } else if (nivel === "plata") {
        stats.silver += total;
      } else if (nivel === "bronce") {
        stats.bronze += total;
      } else {
        console.log("⚠️ Level not matched:", nivel);
      }
    });

    stats.total = stats.gold + stats.silver + stats.bronze;

    console.log("Final stats:", stats);

    const goldPercentage = stats.total > 0 ? ((stats.gold / stats.total) * 100).toFixed(1) : "0.0";
    const silverPercentage = stats.total > 0 ? ((stats.silver / stats.total) * 100).toFixed(1) : "0.0";
    const bronzePercentage = stats.total > 0 ? ((stats.bronze / stats.total) * 100).toFixed(1) : "0.0";

    const quotationData = await quotationView.find({}).limit(1).toArray();
    console.log("Quotation data found:", quotationData.length);

    let quotationStats = {
      statusPercentageCurrentMonth: [],
      acceptedByChannel: [],
      upcomingDeadlines: [],
      newRequestsCurrentMonth: [],
      totalQuotationsCurrentMonth: 0,
    };

    if (quotationData.length > 0) {
      const data = quotationData[0];
      const newRequestsCount = data.newRequestsCurrentMonth?.length || 0;
      quotationStats = {
        statusPercentageCurrentMonth: data.statusPercentageCurrentMonth || [],
        acceptedByChannel: data.acceptedByChannel || [],
        upcomingDeadlines: data.upcomingDeadlines || [],
        newRequestsCurrentMonth: data.newRequestsCurrentMonth || [],
        totalQuotationsCurrentMonth: newRequestsCount,
      };
      console.log("Quotation stats extracted:", quotationStats);
    }

    return new Response(
      JSON.stringify({
        stats,
        percentages: {
          gold: goldPercentage,
          silver: silverPercentage,
          bronze: bronzePercentage,
        },
        quotations: quotationStats,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
