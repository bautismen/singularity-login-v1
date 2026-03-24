// src/services/companyService.ts
import { Company } from '../types/company';

const API_URL = import.meta.env.VITE_API_CATALOGS;
const API_KEY = import.meta.env.VITE_APIKEYSL;
const API_TOKENSL = import.meta.env.VITE_TOKENSL;

const headers = {
  'Authorization': `Bearer ${API_TOKENSL}`,
  'Content-Type': 'application/json',
  'x-api-key': API_KEY,
};

// ===== Obtener todas las companies =====
/*
export async function getCompanies(status: 'activo' | 'inactivo' = 'activo'): Promise<Company[]> {
  const url = `${SUPABASE_URL}/functions/v1/companies?status=${status}`;
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error('Error al obtener companies');
  return await response.json();
}

*/

export async function getCompanies(): Promise<Company[]> {
  const url = `${API_URL}/v1/kl/catalog/getcatalog/Companie`;

  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error('Error al obtener companies');

  const data = await response.json();
  return data.data;
}


// ===== Crear nueva company =====

export async function createCompany(company: Partial<Company>): Promise<Company> {
  try {
    const response = await fetch(`${API_URL}/v1/kl/catalog/add/Companie`, {
      method: 'POST',
      headers,
      body: JSON.stringify(company),
    });

    const responseText = await response.text();

    if (!response.ok) {
      let errorMessage = 'Failed to create company';
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return JSON.parse(responseText);
  } catch (error) {
    console.error('Error creating company:', error);
    throw error;
  }
}

// ===== Actualizar company =====
export async function updateCompany(id: string, updates: Partial<Company>): Promise<Company | null> {
  updates._Id =id
  try {
    const response = await fetch(`${API_URL}/v1/kl/catalog/update/Companie`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to update company');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating company:', error);
    throw new Error('Failed to update company');
  }
}

// ===== Eliminar company =====
/*export async function deleteCompany(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/companies/${id}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to delete company');
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error deleting company:', error);
    throw new Error('Failed to delete company');
  }
}*/


