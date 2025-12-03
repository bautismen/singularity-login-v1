import { MongoClient, ObjectId } from "npm:mongodb@7.0.0";

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
    const collection = db.collection("Reg018QuotationRequests");

    if (method === "GET" && path.endsWith("/quotation-requests")) {
      const includeArchived = url.searchParams.get("includeArchived") === "true";
      const filter = includeArchived ? {} : { archived: { $ne: true } };

      const items = await collection
        .find(filter)
        .sort({ request_date: -1 })
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

    if (method === "GET" && path.match(/\/quotation-requests\/[^/]+$/)) {
      const id = path.split("/").pop();
      
      let filter: any;
      if (ObjectId.isValid(id!)) {
        filter = { _id: new ObjectId(id!) };
      } else {
        filter = { reference_request: id };
      }
      
      const item = await collection.findOne(filter);

      if (!item) {
        return new Response(
          JSON.stringify({ error: "Quotation request not found" }),
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

    if (method === "POST" && path.endsWith("/quotation-requests")) {
      const body = await req.json();
      console.log("Creating Quotation Request:", body);

      const newItem = {
        reference_request: body.reference_request,
        priority: body.priority || 0,
        customer_category: body.customer_category || 1,
        _id_status_request: body._id_status_request || 1,
        status_request_name: body.status_request_name || "Nueva",
        request_date: body.request_date ? new Date(body.request_date) : new Date(),
        deadline_date: body.deadline_date ? new Date(body.deadline_date) : null,
        _id_request_type: body._id_request_type,
        request_type_name: body.request_type_name,
        _id_customer: body._id_customer ? new ObjectId(body._id_customer) : null,
        customer_business_name: body.customer_business_name,
        licitation: body.licitation || false,
        requesting_data: body.requesting_data || {},
        assigned_to: body.assigned_to || [],
        services: body.services || [],
        archived: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = await collection.insertOne(newItem);
      console.log("Quotation Request created with ID:", result.insertedId);

      return new Response(
        JSON.stringify({
          ...newItem,
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

    if (method === "PUT" && path.match(/\/quotation-requests\/[^/]+$/)) {
      const id = path.split("/").pop();
      const body = await req.json();

      let filter: any;
      if (ObjectId.isValid(id!)) {
        filter = { _id: new ObjectId(id!) };
      } else {
        filter = { reference_request: id };
      }

      const updateData: any = {
        ...body,
        updated_at: new Date(),
      };

      if (body.request_date) {
        updateData.request_date = new Date(body.request_date);
      }
      if (body.deadline_date) {
        updateData.deadline_date = new Date(body.deadline_date);
      }
      if (body._id_customer) {
        updateData._id_customer = new ObjectId(body._id_customer);
      }

      delete updateData._id;

      const result = await collection.findOneAndUpdate(
        filter,
        { $set: updateData },
        { returnDocument: "after" }
      );

      if (!result) {
        return new Response(
          JSON.stringify({ error: "Quotation request not found" }),
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

    if (method === "DELETE" && path.match(/\/quotation-requests\/[^/]+$/)) {
      const id = path.split("/").pop();

      let filter: any;
      if (ObjectId.isValid(id!)) {
        filter = { _id: new ObjectId(id!) };
      } else {
        filter = { reference_request: id };
      }

      const result = await collection.updateOne(
        filter,
        {
          $set: {
            archived: true,
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