import { Customer, Person, Company } from '../types/customer';

// const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
// const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const API_URL = import.meta.env.VITE_API_CATALOGS;
const API_KEY = import.meta.env.VITE_APIKEYSL;
const API_TOKENSL = import.meta.env.VITE_TOKENSL;

// const headers = {
//   'Authorization': `Bearer ${SUPABASE_KEY}`,
//   'Content-Type': 'application/json',
// };

const headers = {
  'Authorization': `Bearer ${API_TOKENSL}`,
  'Content-Type': 'application/json',
  'x-api-key': API_KEY,
};

//Obtener clientes
// export async function getCustomers(includeArchived = false): Promise<Customer[]> {
//   try {
//     const url = `${SUPABASE_URL}/functions/v1/customers?includeArchived=${true}`;
//     const response = await fetch(url, { headers });

//     if (!response.ok) {
//       throw new Error('Failed to fetch customers');
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Error fetching customers:', error);
//     throw new Error('Failed to fetch customers');
//   }
// }

export async function getCustomers(includeArchived = false): Promise<Customer[]> {
  try {
    const url = `${API_URL}/v1/kl/catalog/getcatalog/Customer`;
    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error('Failed to fetch customers');
    }

    const data = await response.json();
    return data.data;

  } catch (error) {
    console.error('Error fetching customers:', error);
    throw new Error('Failed to fetch customers');
  }
}



// export async function getCustomerById(id: string): Promise<Customer | null> {
//   try {
//     const response = await fetch(`${SUPABASE_URL}/functions/v1/customers/${id}`, { headers });

//     if (!response.ok) {
//       if (response.status === 404) return null;
//       throw new Error('Failed to fetch customer');
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Error fetching customer:', error);
//     throw new Error('Failed to fetch customer');
//   }
// }

export async function createCustomer(customer: Partial<Customer>): Promise<Customer> {
  
  try {
    const response = await fetch(`${API_URL}/v1/kl/catalog/add/Customer`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_TOKENSL}`,
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
          },
          body: JSON.stringify(customer),
        });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || 'Failed to create customer');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
}

export async function updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | null> {   
  try {
    const response = await fetch(`${API_URL}/v1/kl/catalog/update/Customer/`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to update customer');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating customer:', error);
    throw new Error('Failed to update customer');
  }
}

// export async function deleteCustomer(id: string): Promise<boolean> {
//   try {
//     const response = await fetch(`${SUPABASE_URL}/functions/v1/customers/${id}`, {
//       method: 'DELETE',
//       headers,
//     });

//     if (!response.ok) {
//       throw new Error('Failed to delete customer');
//     }

//     const result = await response.json();
//     return result.success;
//   } catch (error) {
//     console.error('Error deleting customer:', error);
//     throw new Error('Failed to delete customer');
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
//     const response = await fetch(`${SUPABASE_URL}/functions/v1/people`, {
//       method: 'POST',
//       headers,
//       body: JSON.stringify(person),
//     });

//     const responseText = await response.text();

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

export async function getCompanies(): Promise<Company[]> {
  const url = `${API_URL}/v1/kl/catalog/getcatalog/Companie`;

  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error('Error al obtener companies');

  const data = await response.json();
  return data.data;
}


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
