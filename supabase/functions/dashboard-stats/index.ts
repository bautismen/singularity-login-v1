import { MongoClient } from "npm:mongodb@6.3.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

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
    const mongoUri = Deno.env.get("VITE_MONGODB_URI");
    const mongoDatabase = Deno.env.get("VITE_MONGODB_DATABASE");

    if (!mongoUri || !mongoDatabase) {
      throw new Error("MongoDB configuration missing");
    }

    const client = new MongoClient(mongoUri);

    try {
      await client.connect();
      const db = client.db(mongoDatabase);
      const collection = db.collection("customer_summary_level");

      const customers = await collection.find({}).toArray() as CustomerSummary[];

      const stats = {
        gold: 0,
        silver: 0,
        bronze: 0,
        total: 0,
      };

      customers.forEach((customer: CustomerSummary) => {
        const level = customer.level?.toLowerCase();
        if (level === "gold" || level === "oro") {
          stats.gold++;
        } else if (level === "silver" || level === "plata") {
          stats.silver++;
        } else if (level === "bronze" || level === "bronce") {
          stats.bronze++;
        }
      });

      stats.total = stats.gold + stats.silver + stats.bronze;

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
    } finally {
      await client.close();
    }
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
