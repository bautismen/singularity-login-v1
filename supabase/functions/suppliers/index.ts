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

//MongoClient
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
    const collection = db.collection("Cat001Suppliers");

    if (method === "GET" && path.endsWith("/suppliers")) {
      const includeArchived = url.searchParams.get("includeArchived") === "true";
      const filter = includeArchived ? {} : { datastate: 1 };

      const suppliers = await collection
        .find(filter)
        .sort({ created_at: -1 })
        .toArray();

      return new Response(JSON.stringify(suppliers), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (method === "GET" && path.match(/\/suppliers\/[^/]+$/)) {
      const id = path.split("/").pop();
      const supplier = await collection.findOne({ _id: new ObjectId(id!) });

      if (!supplier) {
        return new Response(
          JSON.stringify({ error: "Supplier not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(JSON.stringify(supplier), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (method === "POST" && path.endsWith("/suppliers")) {
      const body = await req.json();

      //if (!body.fiscal_data || !body.fiscal_data.business_name || !body.fiscal_data.taxid) {
      // return new Response(
      //    JSON.stringify({ error: "Faltan datos fiscales requeridos (Razón Social y RFC)" }),
      //    { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      //  );
      //}

      const maxIdDoc = await collection
        .find()
        .sort({ idsupplier: -1 })
        .limit(1)
        .toArray();

      const nextId = maxIdDoc.length > 0 ? (maxIdDoc[0].idsupplier || 0) + 1 : 1;

      const newSupplier = {
        idsupplier: nextId,
        ...body,
        datastate: 1,
        archivado: false,
        status: body.status || "activo",
        history: [],
        created_at: new Date(),
        created_by: {
          user_id: "system",
          name: "System User"
        },
      };

      const result = await collection.insertOne(newSupplier);

      if (!result.acknowledged) {
        return new Response(
          JSON.stringify({ error: "Error al insertar el proveedor en la base de datos" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const createdSupplier = await collection.findOne({ _id: result.insertedId });

      return new Response(JSON.stringify(createdSupplier), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (method === "PUT" && path.match(/\/suppliers\/[^/]+$/)) {
      const id = path.split("/").pop();
      const body = await req.json();

      const updateData = {
        ...body,
        updated_at: new Date(),
      };

      delete updateData._id;
      delete updateData.idsupplier;

      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id!) },
        { $set: updateData },
        { returnDocument: "after" }
      );

      if (!result) {
        return new Response(
          JSON.stringify({ error: "Supplier not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (method === "DELETE" && path.match(/\/suppliers\/[^/]+$/)) {
      const id = path.split("/").pop();

      const result = await collection.updateOne(
        { _id: new ObjectId(id!) },
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