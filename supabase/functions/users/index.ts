import { MongoClient, ObjectId } from "npm:mongodb@7.0.0";
import { createHash } from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
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

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
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
    const collection = db.collection("users");

    if (method === "GET" && path.endsWith("/users")) {
      const users = await collection
        .find({})
        .sort({ createdAt: -1 })
        .toArray();

      const sanitizedUsers = users.map(user => ({
        _id: user._id,
        email: user.email,
        name: user.name,
        roles: user.roles,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));

      return new Response(
        JSON.stringify(sanitizedUsers),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (method === "GET" && path.match(/\/users\/[^/]+$/)) {
      const id = path.split("/").pop();
      const user = await collection.findOne({ _id: new ObjectId(id!) });

      if (!user) {
        return new Response(
          JSON.stringify({ error: "User not found" }),
          {
            status: 404,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      const sanitizedUser = {
        _id: user._id,
        email: user.email,
        name: user.name,
        roles: user.roles,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      return new Response(
        JSON.stringify(sanitizedUser),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (method === "POST" && path.endsWith("/users")) {
      const body = await req.json();
      console.log("Creating user:", { email: body.email, name: body.name });

      const existingUser = await collection.findOne({ email: body.email });
      if (existingUser) {
        return new Response(
          JSON.stringify({ error: "Email already exists" }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      const newUser = {
        email: body.email,
        passwordHash: body.password ? hashPassword(body.password) : null,
        name: body.name || null,
        roles: body.roles || ["user"],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await collection.insertOne(newUser);
      console.log("User created with ID:", result.insertedId);

      return new Response(
        JSON.stringify({
          _id: result.insertedId,
          email: newUser.email,
          name: newUser.name,
          roles: newUser.roles,
          createdAt: newUser.createdAt,
          updatedAt: newUser.updatedAt,
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

    if (method === "PUT" && path.match(/\/users\/[^/]+$/)) {
      const id = path.split("/").pop();
      const body = await req.json();

      const updateData: any = {
        email: body.email,
        name: body.name,
        roles: body.roles,
        updatedAt: new Date(),
      };

      if (body.password) {
        updateData.passwordHash = hashPassword(body.password);
      }

      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id!) },
        { $set: updateData },
        { returnDocument: "after" }
      );

      if (!result) {
        return new Response(
          JSON.stringify({ error: "User not found" }),
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
        JSON.stringify({
          _id: result._id,
          email: result.email,
          name: result.name,
          roles: result.roles,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (method === "DELETE" && path.match(/\/users\/[^/]+$/)) {
      const id = path.split("/").pop();

      const result = await collection.deleteOne({ _id: new ObjectId(id!) });

      return new Response(
        JSON.stringify({ success: result.deletedCount > 0 }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (method === "GET" && path.endsWith("/check-email")) {
      const email = url.searchParams.get("email");
      const excludeId = url.searchParams.get("excludeId");

      const filter: any = { email };

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
