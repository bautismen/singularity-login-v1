import { Executive } from '../types/executive';

const API_URL = import.meta.env.VITE_API_CATALOGS;
const API_KEY = import.meta.env.VITE_APIKEYSL;
const API_TOKENSL = import.meta.env.VITE_TOKENSL;

const headers = {
  'Authorization': `Bearer ${API_TOKENSL}`,
  'Content-Type': 'application/json',
  'x-api-key': API_KEY,
};

export async function createExecutive(executive: Omit<Executive, '_id'>) {
  try {    
    const response = await fetch(`${API_URL}/v1/kl/catalog/general/add/Executive`, {
      method: 'POST',
      headers,
      body: JSON.stringify(executive),
    });

    if (!response.ok && response.status !== 204) {
      throw new Error('Failed to create executive');
    }

    return  response;
  } catch (error) {
    console.error('Error creating executive:', error);
    throw new Error('Failed to create executive');
  }
}

export async function getExecutives(includeArchived = false): Promise<Executive[]> {
  try {
    const url = `${API_URL}/v1/kl/catalog/general/Executive`;
    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error('Failed to fetch executives');
    }

    const data = await response.json();
    return data.data;

  } catch (error) {
    console.error('Error fetching executives:', error);
    throw new Error('Failed to fetch executives');
  }
}

export async function getExecutiveById(id: string): Promise<Executive | null> {
  try {
    const response = await fetch(`${API_URL}/v1/kl/catalog/general/view=Executive&filtrer=${id}`, { headers });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch executive');
    }

    const data = await response.json();
    return data.data;

  } catch (error) {
    console.error('Error fetching executive:', error);
    throw new Error('Failed to fetch executive');
  }

}

export async function getExecutivesByDepartment(department : string): Promise<Executive[]>{
  try {    
    const response = await fetch(`${API_URL}/v1/kl/catalog/general/view=Executive&filtrer=${department}`, {headers});

    if(!response.ok) {
      console.log('ERROR fetch: ',response)
      throw new Error('Failed to fetch executive');
    }
    
    const data = await response.json();
    return data.data;

  } catch(error) {
    console.log('ERROR: ', error);
    throw new Error('Failed to fetch executives');
  }
}

export async function updateExecutive(id: string, updates: Executive): Promise<Executive | null> {
  try {
    const response = await fetch(`${API_URL}/v1/kl/catalog/general/Executive`, {
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
    const response = await fetch(`${API_URL}/v1/kl/catalog/general/delete/view=Executive&id=${id}`, {
      method: 'PUT',
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
