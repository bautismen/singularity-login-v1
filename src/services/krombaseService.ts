import {
    CustomerKB, ResponseGetCustomerKB
} from '../types/customerKB';

const API_URL = import.meta.env.VITE_API_KROMBASE;
const API_KEY = import.meta.env.VITE_APIKEYSL;
const API_TOKENSL = import.meta.env.VITE_TOKENSL;

const headers = {
    Authorization: `Bearer ${API_TOKENSL}`,
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
};

export async function getCustomersKB(
    environmentId: number
    ): Promise<CustomerKB[]> {
    try {

        const response = await fetch(
        `${API_URL}/services/v1/kl/krombase/clientes-kb/info`,
        {
            method: 'GET',
            headers: {
            ...headers,
            environmentid_: environmentId.toString(),
            },
        }
        );

        if (!response.ok) {
        throw new Error('Error al obtener clientes KB');
        }

        const result: ResponseGetCustomerKB = await response.json();

        return result.data;

    } catch (error) {
        console.error('Error fetching customers KB:', error);
        throw error;
    }
}