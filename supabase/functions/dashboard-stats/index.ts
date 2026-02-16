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
    return cachedClient;
  }

  try {
    cachedClient = new MongoClient(MONGODB_URI);
    await cachedClient.connect();
    console.log("MongoDB connected successfully");
    return cachedClient;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    cachedClient = null;
    throw error;
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
    const collection = db.collection("customer_summary_level");

    const levelData = await collection.find({}).toArray();

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

      // Buscar variaciones de "Oro/Gold"
      if (nivel && (nivel.includes("gold") || nivel.includes("oro"))) {
        stats.gold += total;
      }
      // Buscar variaciones de "Plata/Silver"
      else if (nivel && (nivel.includes("silver") || nivel.includes("plata"))) {
        stats.silver += total;
      }
      // Buscar variaciones de "Bronce/Bronze"
      else if (nivel && (nivel.includes("bronze") || nivel.includes("bronce"))) {
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

    return new Response(
      JSON.stringify({
        stats,
        percentages: {
          gold: goldPercentage,
          silver: silverPercentage,
          bronze: bronzePercentage,
        },
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
