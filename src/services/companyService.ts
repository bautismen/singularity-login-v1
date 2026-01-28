// src/services/companyService.ts
import { Company } from '../types/company';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const headers = {
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

// ===== Obtener todas las companies =====

export async function getCompanies(status: 'activo' | 'inactivo' = 'activo'): Promise<Company[]> {
  const url = `${SUPABASE_URL}/functions/v1/companies?status=${status}`;
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error('Error al obtener companies');
  return await response.json();
}


/*
export async function getCompanies(): Promise<Company[]> {
  const url = `${SUPABASE_URL}/functions/v1/companies?archivado=false`;

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error('Error al obtener companies');
  }

  return response.json();
}
*/
// ===== Crear nueva company =====

export async function createCompany(company: Partial<Company>): Promise<Company> {
  try {
    console.log('Creating company with data:', company);
    const response = await fetch(`${SUPABASE_URL}/functions/v1/companies`, {
      method: 'POST',
      headers,
      body: JSON.stringify(company),
    });

    console.log('Response status:', response.status);
    const responseText = await response.text();
    console.log('Response body:', responseText);

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

export async function deleteCompany(id: string): Promise<void> {
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/companies/${id}`,
    {
      method: 'DELETE',
      headers,
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Failed to delete company');
  }
}

