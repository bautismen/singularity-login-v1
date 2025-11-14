import { MongoClient, ObjectId } from "npm:mongodb@7.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

//const MONGODB_URI = Deno.env.get("MONGODB_URI");
//const MONGODB_DATABASE = Deno.env.get("MONGODB_DATABASE");
const MONGODB_URI = 'mongodb+srv://fox1:modelotx30@arcobitscluster0.w6meunj.mongodb.net/?retryWrites=true&w=majority&appName=ArcobitsCluster0';
const MONGODB_DATABASE = 'singulatiry_sandbox';

let cachedClient: MongoClient | null = null;

async function getMongoClient(): Promise<MongoClient> {
  if (!MONGODB_URI || !MONGODB_DATABASE) {
    throw new Error("MongoDB configuration is missing");
  }
  if (cachedClient) return cachedClient;
  
  try {
    cachedClient = new MongoClient(MONGODB_URI);
    await cachedClient.connect();
    return cachedClient;
  } catch (error) {
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
    const db = client.db(MONGODB_DATABASE!);
    const collection = db.collection("companies");

    if (method === "GET" && path.endsWith("/companies")) {
      const status = url.searchParams.get("status") || "activo";
      const filter = status === "all" ? {} : { status, datastate: 1 };

      const companies = await collection
        .find(filter)
        .sort({ created_at: -1 })
        .toArray();

      return new Response(JSON.stringify(companies), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (method === "GET" && path.match(/\/companies\/[^/]+$/)) {
      const id = path.split("/").pop();
      const company = await collection.findOne({ _id: new ObjectId(id!) });

      if (!company) {
        return new Response(
          JSON.stringify({ error: "Company not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(JSON.stringify(company), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (method === "POST" && path.endsWith("/companies")) {
      const body = await req.json();

      console.log("Received company data:", body);

      if (!body.business_name || !body.rfc_taxid) {
        return new Response(
          JSON.stringify({ error: "Faltan datos requeridos: Razón Social y RFC" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const newCompany = {
        ...body,
        status: body.status || "activo",
        archivado: body.archivado !== undefined ? body.archivado : false,
        datastate: body.datastate !== undefined ? body.datastate : 1,
        created_at: new Date(),
        created_by: {
          user_id: "system",
          name: "System User"
        },
      };

      const result = await collection.insertOne(newCompany);

      if (!result.acknowledged) {
        return new Response(
          JSON.stringify({ error: "Error al insertar la empresa en la base de datos" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("Company created with ID:", result.insertedId);

      return new Response(JSON.stringify({
        ...newCompany,
        _id: result.insertedId.toString(),
      }), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (method === "PUT" && path.match(/\/companies\/[^/]+$/)) {
      const id = path.split("/").pop();
      const body = await req.json();

      delete body._id;

      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id!) },
        { $set: body },
        { returnDocument: "after" }
      );

      if (!result) {
        return new Response(
          JSON.stringify({ error: "Company not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});