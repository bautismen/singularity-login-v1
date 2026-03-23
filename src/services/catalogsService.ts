
const API_CATALOGS = import.meta.env.VITE_API_CATALOGS;
const API_TOKENSL = import.meta.env.VITE_TOKENSL;
const API_KEYSL = import.meta.env.VITE_APIKEYSL;

export const catalogService = {
    async getContainers() {
        const response = await fetch(`${API_CATALOGS}/v1/kl/catalog/getcatalog/Container`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${API_TOKENSL}`,
            'Content-Type': 'application/json',
            'x-api-key': API_KEYSL,
        },
        });
        if (!response.ok) {
            throw new Error('Error al cargar contenedores');
        }
        
        const data = await response.json();
        return {
            message: '',
            data: data.data || [],
        };     
    }
}