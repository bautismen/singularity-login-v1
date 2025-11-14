import { MongoClient, ObjectId } from "npm:mongodb@7.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const MONGODB_URI = Deno.env.get("MONGODB_URI");
const MONGODB_DATABASE = Deno.env.get("MONGODB_DATABASE");

let cachedClient: MongoClient | null = null;

async function getMongoClient(): Promise<MongoClient> {
  if (!MONGODB_URI || !MONGODB_DATABASE) {
    throw new Error("MongoDB configuration is missing");
  }

  if (cachedClient) {
    return cachedClient;
  }

  try {
    cachedClient = new MongoClient(MONGODB_URI);
    await cachedClient.connect();
    return cachedClient;
  } catch (error) {
    console.error("MongoDB connection error:", error);
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
    const collection = db.collection("customers");

    if (method === "GET" && path.endsWith("/customers")) {
      const includeArchived = url.searchParams.get("includeArchived") === "true";
      const filter = includeArchived ? {} : { datastate: 1 };

      const customers = await collection
        .find(filter)
        .sort({ created_at: -1 })
        .toArray();

      return new Response(JSON.stringify(customers), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (method === "GET" && path.match(/\/customers\/[^/]+$/)) {
      const id = path.split("/").pop();
      const customer = await collection.findOne({ _idcustomer: new ObjectId(id!) });

      if (!customer) {
        return new Response(
          JSON.stringify({ error: "Customer not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(JSON.stringify(customer), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (method === "POST" && path.endsWith("/customers")) {
      const body = await req.json();

      const maxIdDoc = await collection
        .find()
        .sort({ idcustomer: -1 })
        .limit(1)
        .toArray();
      
      const nextId = maxIdDoc.length > 0 ? (maxIdDoc[0].idcustomer || 0) + 1 : 1;

      const newCustomer = {
        _idcustomer: new ObjectId(),
        idcustomer: nextId,
        ...body,
        datastate: 1,
        archivado: false,
        status: "activo",
        history: [],
        created_at: new Date(),
        created_by: {
          user_id: "system",
          name: "System User"
        },
      };

      await collection.insertOne(newCustomer);

      return new Response(JSON.stringify({
        ...newCustomer,
        _idcustomer: newCustomer._idcustomer.toString(),
      }), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (method === "PUT" && path.match(/\/customers\/[^/]+$/)) {
      const id = path.split("/").pop();
      const body = await req.json();

      const updateData = {
        ...body,
        updated_at: new Date(),
      };

      delete updateData._idcustomer;
      delete updateData.idcustomer;

      const result = await collection.findOneAndUpdate(
        { _idcustomer: new ObjectId(id!) },
        { $set: updateData },
        { returnDocument: "after" }
      );

      if (!result) {
        return new Response(
          JSON.stringify({ error: "Customer not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (method === "DELETE" && path.match(/\/customers\/[^/]+$/)) {
      const id = path.split("/").pop();

      const result = await collection.updateOne(
        { _idcustomer: new ObjectId(id!) },
        {
          $set: {
            datastate: 0,
            archivado: true,
            status: "inactivo",
            updated_at: new Date(),
          },
        }
      );

      return new Response(JSON.stringify({ success: result.modifiedCount > 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Internal server error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});