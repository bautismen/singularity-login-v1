import { MongoClient, ObjectId } from "npm:mongodb@7.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const MONGODB_URI = Deno.env.get("MONGODB_URI_Dig");
const MONGODB_DATABASE = Deno.env.get("MONGODB_DATABASE_DIG");

let cachedClient: MongoClient | null = null;

async function getMongoClient(): Promise<MongoClient> {
  if (!MONGODB_URI || !MONGODB_DATABASE) {
    throw new Error("MongoDB configuration is missing");
  }

  if (cachedClient) {
    return cachedClient;
  }

  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();

    await client.db("admin").command({ ping: 1 });

    cachedClient = client;
    return cachedClient;
  } catch (error) {
    console.error(" MongoDB connection error:", error);
    cachedClient = null;
    throw error;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    const client = await getMongoClient();
    const db = client.db(MONGODB_DATABASE);
    const collection = db.collection("Reg012Files");

    if (method === "GET" && path.endsWith("/digitization")) {
      const includeArchived =
        url.searchParams.get("includeArchived") === "true";

      const filter = includeArchived ? {} : { data_state: 1 };

      const customers = await collection
        .find(filter)
        .sort({ created_at: -1 })
        .toArray();

      return new Response(JSON.stringify(customers), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Si no coincide ninguna ruta
    return new Response(
      JSON.stringify({ error: "Not Found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Server error:", error);

    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});