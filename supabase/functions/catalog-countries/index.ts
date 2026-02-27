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
    const collection = db.collection("Cat001Countries");

    if (method === "GET" && path.endsWith("/catalog-countries")) {
      const includeArchived = url.searchParams.get("includeArchived") === "true";
      const filter = includeArchived ? {} : { archived: { $ne: true } };

      const items = await collection
        .find(filter)
        .sort({ id_country: 1 })
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

    if (method === "GET" && path.match(/\/catalog-countries\/[^/]+$/)) {
      const id = path.split("/").pop();
      
      let filter: any;
      if (ObjectId.isValid(id!)) {
        filter = { _id: new ObjectId(id!) };
      } else {
        filter = { id_country: parseInt(id!) };
      }
      
      const item = await collection.findOne(filter);

      if (!item) {
        return new Response(
          JSON.stringify({ error: "Country not found" }),
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

    if (method === "POST" && path.endsWith("/catalog-countries")) {
      const body = await req.json();
      console.log("Creating Country:", body);

      const lastItem = await collection.findOne({}, { sort: { id_country: -1 } });
      const nextId = lastItem ? lastItem.id_country + 1 : 1;

      const newItem = {
        id_country: nextId,
        country_code: body.country_code,
        name_country: body.name_country,
        status: body.status !== undefined ? body.status : 1,
        archived: false,
        data_state: 1,
      };

      await collection.insertOne(newItem);
      console.log("Country created with ID:", nextId);

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

    if (method === "PUT" && path.match(/\/catalog-countries\/[^/]+$/)) {
      const id = path.split("/").pop();
      const body = await req.json();

      let filter: any;
      if (ObjectId.isValid(id!)) {
        filter = { _id: new ObjectId(id!) };
      } else {
        filter = { id_country: parseInt(id!) };
      }

      const updateData: any = {
        country_code: body.country_code,
        name_country: body.name_country,
        status: body.status,
      };

      const result = await collection.findOneAndUpdate(
        filter,
        { $set: updateData },
        { returnDocument: "after" }
      );

      if (!result) {
        return new Response(
          JSON.stringify({ error: "Country not found" }),
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

    if (method === "DELETE" && path.match(/\/catalog-countries\/[^/]+$/)) {
      const id = path.split("/").pop();

      let filter: any;
      if (ObjectId.isValid(id!)) {
        filter = { _id: new ObjectId(id!) };
      } else {
        filter = { id_country: parseInt(id!) };
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