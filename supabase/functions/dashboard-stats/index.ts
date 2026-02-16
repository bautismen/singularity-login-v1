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

    const customers = await collection.find({}).toArray();

    console.log("Total documents found:", customers.length);
    console.log("Sample document:", customers.length > 0 ? JSON.stringify(customers[0], null, 2) : "No documents");
    console.log("All levels found:", customers.map(c => c.level));

    const stats = {
      gold: 0,
      silver: 0,
      bronze: 0,
      total: 0,
    };

    customers.forEach((customer: any) => {
      const level = customer.level?.toLowerCase()?.trim();
      console.log("Processing customer:", customer.customer_name || customer._id, "Level:", `'${level}'`);

      // Buscar variaciones de "Oro/Gold"
      if (level && (level.includes("gold") || level.includes("oro"))) {
        stats.gold++;
      }
      // Buscar variaciones de "Plata/Silver"
      else if (level && (level.includes("silver") || level.includes("plata"))) {
        stats.silver++;
      }
      // Buscar variaciones de "Bronce/Bronze"
      else if (level && (level.includes("bronze") || level.includes("bronce"))) {
        stats.bronze++;
      } else {
        console.log("⚠️ Level not matched:", level);
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
