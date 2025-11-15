import { MongoClient, ObjectId } from "npm:mongodb@7.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

//const MONGODB_URI = Deno.env.get("MONGODB_URI");
//const MONGODB_DATABASE = Deno.env.get("MONGODB_DATABASE");
//const MONGODB_URI = 'mongodb+srv://fox1:modelotx30@arcobitscluster0.w6meunj.mongodb.net/?retryWrites=true&w=majority&appName=ArcobitsCluster0';
const MONGODB_URI = 'mongodb+srv://singularityatlas:yHAuUQlpYrD16JkL@cluster0.m2t3c.mongodb.net/';
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
    const collection = db.collection("people");

    if (method === "GET" && path.endsWith("/people")) {
      const status = url.searchParams.get("status") || "activo";
      const filter = status === "all" ? {} : { status, archivado: false };

      const people = await collection
        .find(filter)
        .sort({ created_at: -1 })
        .toArray();

      return new Response(JSON.stringify(people), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (method === "GET" && path.match(/\/people\/[^/]+$/)) {
      const id = path.split("/").pop();
      const person = await collection.findOne({ _id: new ObjectId(id!) });

      if (!person) {
        return new Response(
          JSON.stringify({ error: "Person not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(JSON.stringify(person), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (method === "POST" && path.endsWith("/people")) {
      const body = await req.json();

      console.log("Received person data:", body);

      if (!body.name || !body.rfc) {
        return new Response(
          JSON.stringify({ error: "Faltan datos requeridos: Nombre y RFC" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const newPerson = {
        ...body,
        status: body.status || "activo",
        archivado: body.archivado !== undefined ? body.archivado : false,
        created_at: new Date(),
        created_by: {
          user_id: "system",
          name: "System User"
        },
      };

      const result = await collection.insertOne(newPerson);

      if (!result.acknowledged) {
        return new Response(
          JSON.stringify({ error: "Error al insertar la persona en la base de datos" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("Person created with ID:", result.insertedId);

      return new Response(JSON.stringify({
        ...newPerson,
        _id: result.insertedId.toString(),
      }), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (method === "PUT" && path.match(/\/people\/[^/]+$/)) {
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
          JSON.stringify({ error: "Person not found" }),
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