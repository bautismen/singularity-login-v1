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
    const collection = db.collection("Cat018Status");

    if (method === "GET" && path.endsWith("/catalog-status")) {
      const includeArchived = url.searchParams.get("includeArchived") === "true";
      const filter = includeArchived ? {} : { archived: false };

      const items = await collection
        .find(filter)
        .sort({ _id: 1 })
        .toArray();

      return new Response(
        JSON.stringify(items),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (method === "GET" && path.match(/\/catalog-status\/[^/]+$/)) {
      const id = path.split("/").pop();
      
      let filter: any;
      if (ObjectId.isValid(id!)) {
        filter = { _id: new ObjectId(id!) };
      } else {
        filter = { _id: parseInt(id!) };
      }
      
      const item = await collection.findOne(filter);

      if (!item) {
        return new Response(
          JSON.stringify({ error: "Status not found" }),
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
        JSON.stringify(item),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (method === "POST" && path.endsWith("/catalog-status")) {
      const body = await req.json();
      console.log("Creating Status:", body);

      const lastItem = await collection.findOne({}, { sort: { _id: -1 } });
      const nextId = lastItem ? (typeof lastItem._id === 'number' ? lastItem._id + 1 : 1) : 1;

      const newItem = {
        _id: nextId,
        category: body.category,
        subcategory: body.subcategory,
        code: body.code || null,
        status_name: body.status_name,
        description: body.description || null,
        status: body.status !== undefined ? body.status : 1,
        archived: false,
        data_state: 1,
      };

      await collection.insertOne(newItem);
      console.log("Status created with ID:", nextId);

      return new Response(
        JSON.stringify(newItem),
        {
          status: 201,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (method === "PUT" && path.match(/\/catalog-status\/[^/]+$/)) {
      const id = path.split("/").pop();
      const body = await req.json();

      let filter: any;
      if (ObjectId.isValid(id!)) {
        filter = { _id: new ObjectId(id!) };
      } else {
        filter = { _id: parseInt(id!) };
      }

      const updateData: any = {
        category: body.category,
        subcategory: body.subcategory,
        code: body.code || null,
        status_name: body.status_name,
        description: body.description || null,
        status: body.status,
      };

      const result = await collection.findOneAndUpdate(
        filter,
        { $set: updateData },
        { returnDocument: "after" }
      );

      if (!result) {
        return new Response(
          JSON.stringify({ error: "Status not found" }),
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

    if (method === "DELETE" && path.match(/\/catalog-status\/[^/]+$/)) {
      const id = path.split("/").pop();

      let filter: any;
      if (ObjectId.isValid(id!)) {
        filter = { _id: new ObjectId(id!) };
      } else {
        filter = { _id: parseInt(id!) };
      }

      const result = await collection.updateOne(
        filter,
        {
          $set: {
            status: 0,
            archived: true,
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