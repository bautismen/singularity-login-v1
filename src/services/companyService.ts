// src/services/companyService.ts
import { Company } from '../types/company';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const headers = {
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
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

export async function getCompanies(includeArchived = false): Promise<Company[]> {
  const url = `${SUPABASE_URL}/functions/v1/companies?includeArchived=${includeArchived}`;

  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error('Error al obtener companies');

  return await response.json();
}


// ===== Crear nueva company =====

export async function createCompany(company: Partial<Company>): Promise<Company> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/companies`, {
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
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/companies/${id}`, {
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
export async function deleteCompany(id: string): Promise<boolean> {
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
}


