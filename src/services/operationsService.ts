import { Operation, Control } from '../types/operations';

const API_URL = import.meta.env.VITE_API_OPERATIONS;
const API_KEY = import.meta.env.VITE_APIKEYSL;
const API_TOKENSL = import.meta.env.VITE_TOKENSL;

const headers = {
  'Authorization': `Bearer ${API_TOKENSL}`,
  'Content-Type': 'application/json',
  'x-api-key': API_KEY,
};

export async function getOperations(): Promise<Operation[]> {
  const url = `${API_URL}/v1/kl/t/Operations/references`;

  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error('Error al obtener la operación');

  const data = await response.json();
  return data.data;
}


export async function getControls(): Promise<Control[]> {
  const url = `${API_URL}/v1/kl/t/Operations/controls`;

  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error('Error al obtener los controles');

  const data = await response.json();
  return data.data;
}


export async function createOperation(operation: Partial<Operation>): Promise<Operation> {
  try {
    const response = await fetch(`${API_URL}/v1/kl/t/Operations/references/add`, {
      method: 'POST',
      headers,
      body: JSON.stringify(operation),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || 'Failed to create operation');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating operation:', error);
    throw error;
  }
}

export async function updateOperation(id: string, updates: Partial<Operation>): Promise<Operation | null> {
  try {
    const response = await fetch(`${API_URL}/v1/kl/t/Operations/references/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updates),
    });


    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to update operation');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating supplier:', error);
    throw new Error('Failed to update operation');
  }
}