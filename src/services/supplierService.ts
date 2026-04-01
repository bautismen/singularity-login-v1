import { Supplier, Person, Company, SectorOfBusiness } from '../types/supplier';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const API_URL = import.meta.env.VITE_API_CATALOGS;
const API_KEY = import.meta.env.VITE_APIKEYSL;
const API_TOKENSL = import.meta.env.VITE_TOKENSL;

const headers = {
  'Authorization': `Bearer ${API_TOKENSL}`,
  'Content-Type': 'application/json',
  'x-api-key': API_KEY,
};

//Obtener proveedores
// export async function getSuppliers(includeArchived = false): Promise<Supplier[]> {
//   try {
//     const url = `${SUPABASE_URL}/functions/v1/suppliers?includeArchived=${includeArchived}`;
//     const response = await fetch(url, { headers });

//     if (!response.ok) {
//       throw new Error('Failed to fetch suppliers');
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Error fetching suppliers:', error);
//     throw new Error('Failed to fetch suppliers');
//   }
// }

export async function getSuppliers(includeArchived = false): Promise<Supplier[]> {
  try {
    const url = `${API_URL}/v1/kl/catalog/getcatalog/Supplier`;
    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error('Failed to fetch suppliers');
    }

    const data = await response.json();
    return data.data;

  } catch (error) {
    console.error('Error fetching suppliers:', error);
    throw new Error('Failed to fetch suppliers');
  }
}


export async function getSupplierById(id: string): Promise<Supplier | null> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/suppliers/${id}`, { headers });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch supplier');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching supplier:', error);
    throw new Error('Failed to fetch supplier');
  }
}

// export async function createSupplier(supplier: Partial<Supplier>): Promise<Supplier> {
//   try {
//     const response = await fetch(`${SUPABASE_URL}/functions/v1/suppliers`, {
//       method: 'POST',
//       headers,
//       body: JSON.stringify(supplier),
//     });

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
//       throw new Error(errorData.error || 'Failed to create supplier');
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Error creating supplier:', error);
//     throw error;
//   }
// }

export async function createSupplier(supplier: Partial<Supplier>): Promise<Supplier> {
  try {
    const response = await fetch(`${API_URL}/v1/kl/catalog/add/Supplier`, {
      method: 'POST',
      headers,
      body: JSON.stringify(supplier),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || 'Failed to create supplier');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating supplier:', error);
    throw error;
  }
}

// export async function updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier | null> {
//   try {
//     const response = await fetch(`${SUPABASE_URL}/functions/v1/suppliers/${id}`, {
//       method: 'PUT',
//       headers,
//       body: JSON.stringify(updates),
//     });

//     if (!response.ok) {
//       if (response.status === 404) return null;
//       throw new Error('Failed to update supplier');
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Error updating supplier:', error);
//     throw new Error('Failed to update supplier');
//   }
// }

export async function updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier | null> {
  try {
    const response = await fetch(`${API_URL}/v1/kl/catalog/update/Supplier/`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updates),
    });


    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to update supplier');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating supplier:', error);
    throw new Error('Failed to update supplier');
  }
}


// export async function deleteSupplier(id: string): Promise<boolean> {
//   try {
//     const response = await fetch(`${SUPABASE_URL}/functions/v1/suppliers/${id}`, {
//       method: 'DELETE',
//       headers,
//     });

//     if (!response.ok) {
//       throw new Error('Failed to delete supplier');
//     }

//     const result = await response.json();
//     return result.success;
//   } catch (error) {
//     console.error('Error deleting supplier:', error);
//     throw new Error('Failed to delete supplier');
//   }
// }

// export async function getPeople(status = 'activo'): Promise<Person[]> {
//   try {
//     const url = `${SUPABASE_URL}/functions/v1/people?status=${status}`;
//     const response = await fetch(url, { headers });

//     if (!response.ok) {
//       throw new Error('Failed to fetch people');
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Error fetching people:', error);
//     throw new Error('Failed to fetch people');
//   }
// }

// export async function createPerson(person: Partial<Person>): Promise<Person> {
//   try {
//     console.log('Creating person with data:', person);
//     const response = await fetch(`${SUPABASE_URL}/functions/v1/people`, {
//       method: 'POST',
//       headers,
//       body: JSON.stringify(person),
//     });

//     console.log('Response status:', response.status);
//     const responseText = await response.text();
//     console.log('Response body:', responseText);

//     if (!response.ok) {
//       let errorMessage = 'Failed to create person';
//       try {
//         const errorData = JSON.parse(responseText);
//         errorMessage = errorData.error || errorMessage;
//       } catch (e) {
//         errorMessage = responseText || errorMessage;
//       }
//       throw new Error(errorMessage);
//     }

//     return JSON.parse(responseText);
//   } catch (error) {
//     console.error('Error creating person:', error);
//     throw error;
//   }
// }

// export async function getCompanies(status = 'activo'): Promise<Company[]> {
//   try {
//     const url = `${SUPABASE_URL}/functions/v1/companies?status=${status}`;
//     const response = await fetch(url, { headers });

//     if (!response.ok) {
//       throw new Error('Failed to fetch companies');
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Error fetching companies:', error);
//     throw new Error('Failed to fetch companies');
//   }
// }

export async function getCompanies(status = 'activo'): Promise<Company[]> {
  const url = `${API_URL}/v1/kl/catalog/getcatalog/Companie`;

  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error('Error al obtener companies');

  const data = await response.json();
  return data.data;
}

// export async function createCompany(company: Partial<Company>): Promise<Company> {
//   try {
//     console.log('Creating company with data:', company);
//     const response = await fetch(`${SUPABASE_URL}/functions/v1/companies`, {
//       method: 'POST',
//       headers,
//       body: JSON.stringify(company),
//     });

//     console.log('Response status:', response.status);
//     const responseText = await response.text();
//     console.log('Response body:', responseText);

//     if (!response.ok) {
//       let errorMessage = 'Failed to create company';
//       try {
//         const errorData = JSON.parse(responseText);
//         errorMessage = errorData.error || errorMessage;
//       } catch (e) {
//         errorMessage = responseText || errorMessage;
//       }
//       throw new Error(errorMessage);
//     }

//     return JSON.parse(responseText);
//   } catch (error) {
//     console.error('Error creating company:', error);
//     throw error;
//   }
// }

export async function createCompany(company: Partial<Company>) {
  try {
    const response = await fetch(`${API_URL}/v1/kl/catalog/add/Companie`, {
      method: 'POST',
      headers,
      body: JSON.stringify(company),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || 'Failed to create company');
    }

    return await response.json();

  } catch (error) {
    console.error('Error creating company:', error);
    throw error;
  }
}

// export async function getSector(status = 'activo'): Promise<SectorOfBusiness[]> {
//   try {
//     const url = `${SUPABASE_URL}/functions/v1/catalog-sector-of-business?status=${status}`;
//     const response = await fetch(url, { headers });

//     if (!response.ok) {
//       throw new Error('Failed to fetch sector of business');
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Error fetching sector of business:', error);
//     throw new Error('Failed to fetch sector of business');
//   }
// }
