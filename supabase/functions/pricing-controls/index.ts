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
    console.log("MongoDB connected successfully");
    return cachedClient;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    cachedClient = null;
    throw error;
  }
}


interface PricingControlSupplier {
  idsuplier: number;
  supplier_associated_name: string;
}

interface PricingControlStatusControl {
  _id_status_control: number;
  status_control_name: string;
}

interface PricingControl {
  _id?: ObjectId;
  idcontrol: number;
  control: string;
  _idrequest: ObjectId;
  _id_executive: ObjectId;
  complete_name: string;
  creation_date: Date;
  quotation_date?: Date;
  updated_date: Date;
  _id_request_type: number;
  request_type_name: string;
  _id_customer: ObjectId;
  customer_business_name: string;
  status_control: PricingControlStatusControl;
  suppliers: PricingControlSupplier[];
  services: any[];
  network?: string;
  complexity?: string;
  currency?: string;
  unit_profit?: string;
  volume?: string;
  general_profit?: string;
  key_td?: string;
  comments_general?: string;
  _id_executive_pricing: ObjectId;
  complete_name_pricing: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const client = await getMongoClient();
    const db = client.db(MONGODB_DATABASE!);
    const controlsCollection = db.collection<PricingControl>("Reg018PricingControls");
    const requestsCollection = db.collection("Reg018QuotationRequests");

    const url = new URL(req.url);
    const method = req.method;

    // GET: Obtener controles por request ID o por ID específico
    if (method === "GET") {
      const requestId = url.searchParams.get("requestId");
      const id = url.searchParams.get("id");

      if (id) {
        const control = await controlsCollection.findOne({ _id: new ObjectId(id) });

        if (!control) {
          return new Response(
            JSON.stringify({ error: "Control no encontrado" }),
            {
              status: 404,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        return new Response(JSON.stringify(control), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (requestId) {
        const controls = await controlsCollection
          .find({ _idrequest: new ObjectId(requestId) })
          .toArray();

        return new Response(JSON.stringify(controls), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({ error: "Se requiere requestId o id" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // POST: Crear nuevo control
    if (method === "POST") {
      const body = await req.json();
      console.log('POST body received:', JSON.stringify(body, null, 2));

      const { _idrequest, suppliers, services, status_control, network, complexity, currency, unit_profit, volume, general_profit, key_td, comments_general, _id_executive_pricing, complete_name_pricing } = body;

      if (!_idrequest) {
        return new Response(
          JSON.stringify({ error: "Se requiere _idrequest" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      console.log('Looking for request with ID:', _idrequest);

      // Obtener la solicitud original
      const request = await requestsCollection.findOne({
        _id: new ObjectId(_idrequest),
      });

      if (!request) {
        console.error('Request not found:', _idrequest);
        return new Response(
          JSON.stringify({ error: "Solicitud no encontrada" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      console.log('Request found:', request._id);

      // Generar número de control consecutivo
      const lastControl = await controlsCollection
        .find()
        .sort({ idcontrol: -1 })
        .limit(1)
        .toArray();

      const nextIdControl = lastControl.length > 0 ? lastControl[0].idcontrol + 1 : 1;

      // Generar código de control: C + año(2) + mes(2) + "-" + consecutivo(4)
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = (now.getMonth() + 1).toString().padStart(2, "0");
      const consecutive = nextIdControl.toString().padStart(4, "0");
      const controlCode = `C${year}${month}-${consecutive}`;

      // Crear el nuevo control
      const newControl: PricingControl = {
        idcontrol: nextIdControl,
        control: controlCode,
        _idrequest: new ObjectId(_idrequest),
        _id_executive: new ObjectId(request.requesting_data._id_executive),
        complete_name: request.requesting_data.complete_name,
        creation_date: now,
        updated_date: now,
        _id_request_type: request._id_request_type,
        request_type_name: request.request_type_name,
        _id_customer: new ObjectId(request._id_customer),
        customer_business_name: request.customer_business_name,
        status_control: status_control || {
          _id_status_control: 4,
          status_control_name: "Asignada",
        },
        suppliers: suppliers || [],
        services: services || [],
        network: network || "",
        complexity: complexity || "",
        currency: currency || "USD",
        unit_profit: unit_profit || "",
        volume: volume || "",
        general_profit: general_profit || "",
        key_td: key_td || "",
        comments_general: comments_general || "",
        _id_executive_pricing: new ObjectId(_id_executive_pricing),
        complete_name_pricing: complete_name_pricing,
      };

      const result = await controlsCollection.insertOne(newControl);

      // Marcar servicios como usados en la solicitud original
      if (services && services.length > 0) {
        const serviceIds = services.map((s: any) => {
          if (s.idservice !== undefined) return s.idservice;          
          return null;
        }).filter((id: any) => id !== null);

        if (serviceIds.length > 0) {
          await requestsCollection.updateOne(
            { _id: new ObjectId(_idrequest) },
            {
              $set: {
                "services.$[elem].used": true,
              },
            },
            {
              arrayFilters: [{ "elem.idservice": { $in: serviceIds } }],
            }
          );
        }
      }

      const createdControl = await controlsCollection.findOne({
        _id: result.insertedId,
      });

      // Actualizar assigned_to en la solicitud
      const executiveId = new ObjectId(request.requesting_data._id_executive);
      const pricingControlEntry = {
        _id_pricing_controls: result.insertedId,
        _id_status_control: newControl.status_control._id_status_control,
        control: controlCode,
        updated_date: now,
      };

      // Verificar si el ejecutivo ya existe en assigned_to
      const requestWithAssignedTo = await requestsCollection.findOne({
        _id: new ObjectId(_idrequest),
        "assigned_to._id_executive": executiveId,
      });

      if (requestWithAssignedTo) {
        // El ejecutivo ya existe, agregar el control a su array pricing_control_numbers
        await requestsCollection.updateOne(
          {
            _id: new ObjectId(_idrequest),
            "assigned_to._id_executive": executiveId,
          },
          {
            $push: {
              "assigned_to.$.pricing_control_numbers": pricingControlEntry,
            },
          }
        );
      } else {
        // El ejecutivo no existe en assigned_to, agregarlo con el control
        await requestsCollection.updateOne(
          { _id: new ObjectId(_idrequest) },
          {
            $push: {
              assigned_to: {
                _id_executive: executiveId,
                complete_name: request.requesting_data.complete_name,
                pricing_control_numbers: [pricingControlEntry],
              },
            },
          }
        );
      }

      return new Response(JSON.stringify(createdControl), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // PUT: Actualizar control existente
    if (method === "PUT") {
      const body = await req.json();
      const { _id, suppliers, services, status_control, network, complexity, currency, unit_profit, volume, general_profit, key_td, comments_general } = body;

      if (!_id) {
        return new Response(
          JSON.stringify({ error: "Se requiere _id" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Obtener el control actual
      const currentControl = await controlsCollection.findOne({
        _id: new ObjectId(_id),
      });

      if (!currentControl) {
        return new Response(
          JSON.stringify({ error: "Control no encontrado" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Preparar actualización
      const updateData: any = {
        updated_date: new Date(),
      };

      if (suppliers !== undefined) {
        updateData.suppliers = suppliers;
      }

      if (network !== undefined) {
        updateData.network = network;
      }

      if (complexity !== undefined) {
        updateData.complexity = complexity;
      }

      if (currency !== undefined) {
        updateData.currency = currency;
      }

      if (unit_profit !== undefined) {
        updateData.unit_profit = unit_profit;
      }

      if (volume !== undefined) {
        updateData.volume = volume;
      }

      if (general_profit !== undefined) {
        updateData.general_profit = general_profit;
      }

      if (key_td !== undefined) {
        updateData.key_td = key_td;
      }

      if (comments_general !== undefined) {
        updateData.comments_general = comments_general;
      }

      if (services !== undefined) {
        // Manejar cambios en servicios
        const oldServiceIds = currentControl.services.map((s: any) => s.idservice);
        const newServiceIds = services.map((s: any) => s.idservice);

        // Servicios removidos: marcar como no usados
        const removedServiceIds = oldServiceIds.filter(
          (id: number) => !newServiceIds.includes(id)
        );

        // Servicios agregados: marcar como usados
        const addedServiceIds = newServiceIds.filter(
          (id: number) => !oldServiceIds.includes(id)
        );

        if (removedServiceIds.length > 0) {
          await requestsCollection.updateOne(
            { _id: currentControl._idrequest },
            {
              $set: {
                "services.$[elem].used": false,
              },
            },
            {
              arrayFilters: [{ "elem.idservice": { $in: removedServiceIds } }],
            }
          );
        }

        if (addedServiceIds.length > 0) {
          await requestsCollection.updateOne(
            { _id: currentControl._idrequest },
            {
              $set: {
                "services.$[elem].used": true,
              },
            },
            {
              arrayFilters: [{ "elem.idservice": { $in: addedServiceIds } }],
            }
          );
        }

        updateData.services = services;
      }

      if (status_control !== undefined) {
        updateData.status_control = status_control;

        // Si se marca como cotizada, agregar fecha de cotización
        if (status_control._id_status_control === 5 && !currentControl.quotation_date) {
          updateData.quotation_date = new Date();
        }
      }

      await controlsCollection.updateOne(
        { _id: new ObjectId(_id) },
        { $set: updateData }
      );

      const updatedControl = await controlsCollection.findOne({
        _id: new ObjectId(_id),
      });

      // Actualizar el pricing_control_numbers en assigned_to de la solicitud
      if (updatedControl) {
        await requestsCollection.updateOne(
          {
            _id: currentControl._idrequest,
            "assigned_to.pricing_control_numbers._id_pricing_controls": new ObjectId(_id),
          },
          {
            $set: {
              "assigned_to.$[executive].pricing_control_numbers.$[control]._id_status_control": updatedControl.status_control._id_status_control,
              "assigned_to.$[executive].pricing_control_numbers.$[control].updated_date": updatedControl.updated_date,
            },
          },
          {
            arrayFilters: [
              { "executive._id_executive": currentControl._id_executive },
              { "control._id_pricing_controls": new ObjectId(_id) },
            ],
          }
        );
      }

      return new Response(JSON.stringify(updatedControl), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // DELETE: Eliminar control
    if (method === "DELETE") {
      const id = url.searchParams.get("id");

      if (!id) {
        return new Response(
          JSON.stringify({ error: "Se requiere id" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Obtener el control antes de eliminarlo
      const control = await controlsCollection.findOne({
        _id: new ObjectId(id),
      });

      if (!control) {
        return new Response(
          JSON.stringify({ error: "Control no encontrado" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Marcar servicios como no usados
      if (control.services && control.services.length > 0) {
        const serviceIds = control.services.map((s: any) => s.idservice);

        await requestsCollection.updateOne(
          { _id: control._idrequest },
          {
            $set: {
              "services.$[elem].used": false,
            },
          },
          {
            arrayFilters: [{ "elem.idservice": { $in: serviceIds } }],
          }
        );
      }

      // Eliminar el control del array pricing_control_numbers en assigned_to
      await requestsCollection.updateOne(
        { _id: control._idrequest },
        {
          $pull: {
            "assigned_to.$[].pricing_control_numbers": {
              _id_pricing_controls: new ObjectId(id),
            },
          },
        }
      );

      // Eliminar el control de la colección
      await controlsCollection.deleteOne({ _id: new ObjectId(id) });

      return new Response(
        JSON.stringify({ message: "Control eliminado exitosamente" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Método no permitido" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
