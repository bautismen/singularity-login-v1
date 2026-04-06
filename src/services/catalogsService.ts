
const API_CATALOGS = import.meta.env.VITE_API_CATALOGS;
const API_TOKENSL = import.meta.env.VITE_TOKENSL;
const API_KEYSL = import.meta.env.VITE_APIKEYSL;

export const catalogService = {
    async getContainers() {
        const response = await fetch(`${API_CATALOGS}/v1/kl/catalog/operations/Container`, {
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
            message: data.messageStatus,
            data: data.data || [],
        };     
    },

    async getServices() {
        const response = await fetch(`${API_CATALOGS}/v1/kl/catalog/operations/Service`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${API_TOKENSL}`,
            'Content-Type': 'application/json',
            'x-api-key': API_KEYSL,
        },
        });
        if (!response.ok) {
            throw new Error('Error al cargar servicios');
        }        
        const data = await response.json();
        return {
            message: data.messageStatus,
            data: data.data || [],
        };     
    },

    async getTypeRequests() {
        const response = await fetch(`${API_CATALOGS}/v1/kl/catalog/operations/TypeResquet`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${API_TOKENSL}`,
            'Content-Type': 'application/json',
            'x-api-key': API_KEYSL,
        },
        });
        if (!response.ok) {
            throw new Error('Error al cargar tipos de solicitud');
        }        
        const data = await response.json();
        return {
            message: data.messageStatus,
            data: data.data || [],
        };     
    },

    async getIncoterms(){
        const response = await fetch(`${API_CATALOGS}/v1/kl/catalog/operations/Incoterm`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${API_TOKENSL}`,
            'Content-Type': 'application/json',
            'x-api-key': API_KEYSL,
        },
        });
        if (!response.ok) {
            throw new Error('Error al cargar incoterms');
        }        
        const data = await response.json();
        return {
            message: data.messageStatus,
            data: data.data || [],
        };     
    },

    async getCountries() {
        const response = await fetch(`${API_CATALOGS}/v1/kl/catalog/operations/Countrie`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${API_TOKENSL}`,
            'Content-Type': 'application/json',
            'x-api-key': API_KEYSL,
        },
        });
        if (!response.ok) {
            throw new Error('Error al cargar paises');
        }
        
        const data = await response.json();
        return {
            message: '',
            data: data.data || [],
        };     
    },

    async getImos() {
        const response = await fetch(`${API_CATALOGS}/v1/kl/catalog/operations/Imo`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${API_TOKENSL}`,
            'Content-Type': 'application/json',
            'x-api-key': API_KEYSL,
        },
        });
        if (!response.ok) {
            throw new Error('Error al cargar Imos');
        }
        
        const data = await response.json();
        return {
            message: '',
            data: data.data || [],
        };     

    },

    async getSector() {
        const response = await fetch(`${API_CATALOGS}/v1/kl/catalog/general/SectorOfBusiness`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${API_TOKENSL}`,
            'Content-Type': 'application/json',
            'x-api-key': API_KEYSL,
        },
        });
        if (!response.ok) {
            throw new Error('Error al cargar sectores de negocio');
        }
        
        const data = await response.json();
        return {
            message: '',
            data: data.data || [],
        };     

    }
}