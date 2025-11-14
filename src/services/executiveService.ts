import { ObjectId } from 'mongodb';
import { getExecutivesCollection } from './mongodb';
import { Executive } from '../types/executive';

export async function createExecutive(executive: Omit<Executive, '_id'>): Promise<Executive> {
  try {
    const collection = await getExecutivesCollection();

    const newExecutive = {
      ...executive,
      estado: 1,
      archivado: false,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await collection.insertOne(newExecutive);

    return {
      ...newExecutive,
      _id: result.insertedId.toString(),
    };
  } catch (error) {
    console.error('Error creating executive:', error);
    throw new Error('Failed to create executive');
  }
}

export async function getExecutives(includeArchived = false): Promise<Executive[]> {
  try {
    const collection = await getExecutivesCollection();

    const filter = includeArchived ? {} : { estado: 1 };

    const executives = await collection
      .find(filter)
      .sort({ created_at: -1 })
      .toArray();

    return executives.map((exec) => ({
      ...exec,
      _id: exec._id.toString(),
    })) as Executive[];
  } catch (error) {
    console.error('Error fetching executives:', error);
    throw new Error('Failed to fetch executives');
  }
}

export async function getExecutiveById(id: string): Promise<Executive | null> {
  try {
    const collection = await getExecutivesCollection();
    const executive = await collection.findOne({ _id: new ObjectId(id) });

    if (!executive) {
      return null;
    }

    return {
      ...executive,
      _id: executive._id.toString(),
    } as Executive;
  } catch (error) {
    console.error('Error fetching executive:', error);
    throw new Error('Failed to fetch executive');
  }
}

export async function updateExecutive(id: string, updates: Partial<Executive>): Promise<Executive | null> {
  try {
    const collection = await getExecutivesCollection();

    const updateData = {
      ...updates,
      updated_at: new Date(),
    };

    delete (updateData as any)._id;

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return null;
    }

    return {
      ...result,
      _id: result._id.toString(),
    } as Executive;
  } catch (error) {
    console.error('Error updating executive:', error);
    throw new Error('Failed to update executive');
  }
}

export async function deleteExecutive(id: string): Promise<boolean> {
  try {
    const collection = await getExecutivesCollection();

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          estado: 0,
          archivado: true,
          updated_at: new Date()
        }
      }
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error deleting executive:', error);
    throw new Error('Failed to delete executive');
  }
}

export async function checkNominaExists(numero_nomina: string, excludeId?: string): Promise<boolean> {
  try {
    const collection = await getExecutivesCollection();

    const filter: any = { numero_nomina, estado: 1 };

    if (excludeId) {
      filter._id = { $ne: new ObjectId(excludeId) };
    }

    const count = await collection.countDocuments(filter);
    return count > 0;
  } catch (error) {
    console.error('Error checking nomina:', error);
    return false;
  }
}
