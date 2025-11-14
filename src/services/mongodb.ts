import { MongoClient, Db, Collection } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

const uri = import.meta.env.VITE_MONGODB_URI;
const dbName = import.meta.env.VITE_MONGODB_DATABASE;

export async function connectToMongoDB(): Promise<Db> {
  if (db) {
    return db;
  }

  if (!uri || !dbName) {
    throw new Error('MongoDB connection details not found in environment variables');
  }

  try {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);
    console.log('Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export async function getExecutivesCollection(): Promise<Collection> {
  const database = await connectToMongoDB();
  return database.collection('ejecutivos');
}

export async function closeMongoDB(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}
