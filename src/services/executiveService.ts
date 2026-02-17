import { Executive } from '../types/executive';

const API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/executives`;
const API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const headers = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
};

export async function createExecutive(executive: Omit<Executive, '_id'>): Promise<Executive> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(executive),
    });

    if (!response.ok) {
      throw new Error('Failed to create executive');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating executive:', error);
    throw new Error('Failed to create executive');
  }
}

export async function getExecutives(includeArchived = false): Promise<Executive[]> {
  try {
    const url = `${API_URL}?includeArchived=${includeArchived}`;
    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error('Failed to fetch executives');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching executives:', error);
    throw new Error('Failed to fetch executives');
  }
}

export async function getExecutiveById(id: string): Promise<Executive | null> {
  try {
    const response = await fetch(`${API_URL}/${id}`, { headers });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch executive');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching executive:', error);
    throw new Error('Failed to fetch executive');
  }

}

export async function getExecutivesByDepartment(department : string): Promise<Executive[]>{
  try {    
    const response = await fetch(`${API_URL}/functions/v1/executives?departamento=${department}`, {headers});

    if(!response.ok) {
      console.log('ERROR fetch: ',response)
      throw new Error('Failed to fetch executive');
    }
    
    return await response.json();

  } catch(error) {
    console.log('ERROR: ', error);
    throw new Error('Failed to fetch executives');
  }
}

export async function updateExecutive(id: string, updates: Partial<Executive>): Promise<Executive | null> {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to update executive');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating executive:', error);
    throw new Error('Failed to update executive');
  }
}

export async function deleteExecutive(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to delete executive');
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error deleting executive:', error);
    throw new Error('Failed to delete executive');
  }
}

export async function checkNominaExists(numero_nomina: string, excludeId?: string): Promise<boolean> {
  try {
    const url = `${API_URL}/check-nomina?nomina=${encodeURIComponent(numero_nomina)}${excludeId ? `&excludeId=${excludeId}` : ''}`;
    const response = await fetch(url, { headers });

    if (!response.ok) {
      return false;
    }

    const result = await response.json();
    return result.exists;
  } catch (error) {
    console.error('Error checking nomina:', error);
    return false;
  }
}
