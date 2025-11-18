import { Customer, Person, Company } from '../types/customer';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const headers = {
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};


//Obtener clientes
export async function getCustomers(includeArchived = false): Promise<Customer[]> {
  try {
    const url = `${SUPABASE_URL}/functions/v1/customers?includeArchived=${includeArchived}`;
    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error('Failed to fetch customers');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw new Error('Failed to fetch customers');
  }
}




export async function getCustomerById(id: string): Promise<Customer | null> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/customers/${id}`, { headers });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch customer');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching customer:', error);
    throw new Error('Failed to fetch customer');
  }
}

export async function createCustomer(customer: Partial<Customer>): Promise<Customer> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/customers`, {
      method: 'POST',
      headers,
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
    const response = await fetch(`${SUPABASE_URL}/functions/v1/customers/${id}`, {
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

export async function deleteCustomer(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/customers/${id}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to delete customer');
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw new Error('Failed to delete customer');
  }
}

export async function getPeople(status = 'activo'): Promise<Person[]> {
  try {
    const url = `${SUPABASE_URL}/functions/v1/people?status=${status}`;
    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error('Failed to fetch people');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching people:', error);
    throw new Error('Failed to fetch people');
  }
}

export async function createPerson(person: Partial<Person>): Promise<Person> {
  try {
    console.log('Creating person with data:', person);
    const response = await fetch(`${SUPABASE_URL}/functions/v1/people`, {
      method: 'POST',
      headers,
      body: JSON.stringify(person),
    });

    console.log('Response status:', response.status);
    const responseText = await response.text();
    console.log('Response body:', responseText);

    if (!response.ok) {
      let errorMessage = 'Failed to create person';
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
    console.error('Error creating person:', error);
    throw error;
  }
}

export async function getCompanies(status = 'activo'): Promise<Company[]> {
  try {
    const url = `${SUPABASE_URL}/functions/v1/companies?status=${status}`;
    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error('Failed to fetch companies');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw new Error('Failed to fetch companies');
  }
}

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
