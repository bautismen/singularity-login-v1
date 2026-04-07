import { MongoClient, ObjectId } from 'npm:mongodb@6.3.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const MONGODB_URI = Deno.env.get("MONGODB_URI");
const DB_NAME = Deno.env.get("MONGODB_DATABASE");

let cachedClient: MongoClient | null = null;

async function getMongoClient() {
  if (cachedClient) {
    return cachedClient;
  }
  cachedClient = new MongoClient(MONGODB_URI);
  await cachedClient.connect();
  return cachedClient;
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    console.log('Request URL:', url.pathname);
    console.log('Request method:', req.method);
    
    const client = await getMongoClient();
    console.log('MongoDB connected');
    
    const db = client.db(DB_NAME);
    const users = db.collection('Cat001Users');
    const sessions = db.collection('sessions');

    if (url.pathname.includes('/signup') && req.method === 'POST') {
      console.log('Processing signup request');
      const body = await req.json();
      console.log('Signup body received:', { email: body.email, hasPassword: !!body.password });
      
      const { email, password, name } = body;

      if (!email || !password) {
        return new Response(
          JSON.stringify({ error: 'Email y contraseña son requeridos' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const existingUser = await users.findOne({ email });
      if (existingUser) {
        console.log('User already exists');
        return new Response(
          JSON.stringify({ error: 'El usuario ya existe' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const passwordHash = await hashPassword(password);
      const user = {
        email,
        passwordHash,
        name,
        roles: ['user'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.log('Inserting user into MongoDB');
      const result = await users.insertOne(user);
      console.log('User created successfully:', result.insertedId);
      
      return new Response(
        JSON.stringify({ _id: result.insertedId.toString(), email, name, roles: ['user'] }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (url.pathname.includes('/signin') && req.method === 'POST') {
      console.log('Processing signin request');
      const { email, password } = await req.json();

      if (!email || !password) {
        return new Response(
          JSON.stringify({ error: 'Email y contraseña son requeridos' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const passwordHash = await hashPassword(password);
      const user = await users.findOne({ email, passwordHash });

      if (!user) {
        console.log('Invalid credentials');
        return new Response(
          JSON.stringify({ error: 'Credenciales inválidas' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await sessions.insertOne({
        userId: user._id,
        token,
        expiresAt,
        createdAt: new Date(),
      });

      console.log('User signed in successfully');
      return new Response(
        JSON.stringify({
          user: { _id: user._id.toString(), email: user.email, name: user.name, roles: user.roles },
          token,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (url.pathname.includes('/signout') && req.method === 'POST') {
      const { token } = await req.json();
      await sessions.deleteOne({ token });
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (url.pathname.includes('/me') && req.method === 'GET') {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'No autorizado' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const token = authHeader.replace('Bearer ', '');
      const session = await sessions.findOne({
        token,
        expiresAt: { $gt: new Date() }
      });

      if (!session) {
        return new Response(
          JSON.stringify({ error: 'Sesión inválida' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const user = await users.findOne({ _id: session.userId });
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Usuario no encontrado' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ _id: user._id.toString(), email: user.email, name: user.name, roles: user.roles }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Route not found:', url.pathname);
    return new Response(
      JSON.stringify({ error: 'Ruta no encontrada: ' + url.pathname }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    console.error('Error stack:', error.stack);
    return new Response(
      JSON.stringify({ error: error.message || 'Error interno del servidor', details: error.stack }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});