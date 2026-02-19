import { MongoClient } from "npm:mongodb@7.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
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
    throw new Error(`Failed to connect to MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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
    const view = db.collection("VT018QuotationRequests_Dashboard");

    const dashboardData = await view.findOne({});

    if (!dashboardData) {
      return new Response(
        JSON.stringify({
          channelPerformance: [],
          statusPercentageCurrentMonth: [],
          totalQuotations: 0,
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const acceptedByChannel = dashboardData.acceptedByChannel || [];

    const channelPerformance = acceptedByChannel.map((item: any) => ({
      channelName: item.channelName || item._id || 'Unknown',
      value: item.count || item.value || 0
    }));

    const result = {
      channelPerformance: channelPerformance,
      statusPercentageCurrentMonth: dashboardData.statusPercentageCurrentMonth || [],
      totalQuotations: dashboardData.totalQuotations || 0,
    };

    console.log("Quotation dashboard data:", JSON.stringify(result, null, 2));

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching quotation dashboard data:", error);
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
