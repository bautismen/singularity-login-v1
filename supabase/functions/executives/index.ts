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
    console.error("Missing MongoDB configuration:", {
      hasUri: !!MONGODB_URI,
      hasDb: !!MONGODB_DATABASE,
    });
    throw new Error("MongoDB configuration is missing. Please set MONGODB_URI and MONGODB_DATABASE environment variables.");
  }

  if (cachedClient) {
    return cachedClient;
  }

  try {
    console.log("Connecting to MongoDB...");
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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    console.log(`Request: ${method} ${path}`);

    const client = await getMongoClient();
    const db = client.db(MONGODB_DATABASE!);
    const collection = db.collection("ejecutivos");

    if (method === "GET" && path.endsWith("/executives")) {
      const includeArchived = url.searchParams.get("includeArchived") === "true";
      const department = url.searchParams.get("departamento");

      const filter: any = includeArchived ? {} : { estado: 1 };

      if (department) {
        filter.departamento = department;
      }

      const executives = await collection
        .find(filter)
        .sort({ created_at: -1 })
        .toArray();

      return new Response(
        JSON.stringify(executives),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (method === "GET" && path.match(/\/executives\/[^/]+$/)) {
      const id = path.split("/").pop();
      const executive = await collection.findOne({ _id: new ObjectId(id!) });

      if (!executive) {
        return new Response(
          JSON.stringify({ error: "Executive not found" }),
          {
            status: 404,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      return new Response(
        JSON.stringify(executive),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (method === "POST" && path.endsWith("/executives")) {
      const body = await req.json();
      console.log("Creating executive:", body);

      const newExecutive = {
        ...body,
        estado: 1,
        archivado: false,
        created_at: new Date(),
        updated_at: new Date(),
      _iduser: new ObjectId(body._iduser),
      };

      const result = await collection.insertOne(newExecutive);
      console.log("Executive created with ID:", result.insertedId);

      return new Response(
        JSON.stringify({
          ...newExecutive,
          _id: result.insertedId.toString(),
        }),
        {
          status: 201,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (method === "PUT" && path.match(/\/executives\/[^/]+$/)) {
      const id = path.split("/").pop();
      const body = await req.json();
      body._iduser = new ObjectId(body._iduser);

      const updateData = {
        ...body,
        updated_at: new Date(),
      };

      delete updateData._id;

      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id!) },
        { $set: updateData },
        { returnDocument: "after" }
      );

      if (!result) {
        return new Response(
          JSON.stringify({ error: "Executive not found" }),
          {
            status: 404,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      return new Response(
        JSON.stringify(result),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (method === "DELETE" && path.match(/\/executives\/[^/]+$/)) {
      const id = path.split("/").pop();

      const result = await collection.updateOne(
        { _id: new ObjectId(id!) },
        {
          $set: {
            estado: 0,
            archivado: true,
            updated_at: new Date(),
          },
        }
      );

      return new Response(
        JSON.stringify({ success: result.modifiedCount > 0 }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (method === "GET" && path.endsWith("/check-nomina")) {
      const nomina = url.searchParams.get("nomina");
      const excludeId = url.searchParams.get("excludeId");

      const filter: any = { numero_nomina: nomina, estado: 1 };

      if (excludeId) {
        filter._id = { $ne: new ObjectId(excludeId) };
      }

      const count = await collection.countDocuments(filter);

      return new Response(
        JSON.stringify({ exists: count > 0 }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Not found" }),
      {
        status: 404,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Internal server error",
        details: error.toString(),
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