import { 
  DigitizationDocument,
  DownloadResponse,
  CategoryDocumentDTO,
  DocumentTypeDTO,
  RegionDTO,
  SectionDTO
} from "../types/digitization";

const ENVIRONMENT_ID = 2; // o el que corresponda

const API_KEY = import.meta.env.VITE_APIKEYSL;

const headers = {
  "x-api-key": API_KEY,
  "environmentId_": ENVIRONMENT_ID.toString(),
  "Content-Type": "application/json",
};
const DIGITIZATION_API_URL = `https://localhost:7011/`;
const DIGITIZATION_FUNCTION_URL = `operations/v1/kl/t/datastorage/`;
const DIGITIZATION_URL =DIGITIZATION_API_URL + DIGITIZATION_FUNCTION_URL;
/* ==============================
 * UTIL: File → Base64
 * ============================== */

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };

    reader.onerror = reject;
  });
}

/* ==============================
 * Obtener últimos documentos
 * ============================== */
export async function getRecentDocuments(
  limit: number = 100
): Promise<DigitizationDocument[]> {
  const url = `${DIGITIZATION_URL}docs/info?limit_=${limit}`;

  const response = await fetch(url, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.messageStatus || "Error al obtener documentos recientes"
    );
  }

  const result = await response.json();
  return result.data ?? [];
}


/* ==============================
 * Obtener documentos por referencia
 * ============================== */
export async function getDocumentsByReference(
  reference: string
): Promise<DigitizationDocument[]> {
  const url = `${DIGITIZATION_URL}qrreferences/${encodeURIComponent(
    reference
  )}/docs/info`;

  const response = await fetch(url, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.messageStatus || "Error al obtener documentos"
    );
  }

  const result = await response.json();
  return result.data ?? [];
}


/* =========================================
 * Obtener documentos por referencia y sección
 * ========================================= */
export async function getDocumentsByReferenceSection(
  reference: string,
  section: string
): Promise<DigitizationDocument[]> {
  const url = `${DIGITIZATION_URL}qrreferences/${encodeURIComponent(
    reference
  )}/sections/${encodeURIComponent(section)}/docs/info`;

  const response = await fetch(url, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.messageStatus || "Error al obtener documentos por sección"
    );
  }

  const result = await response.json();
  return result.data ?? [];
}

/* =========================================================
 * Obtener documentos por referencia, sección y tipo documento
 * ========================================================= */
export async function getDocumentsByReferenceSectionType(
  reference: string,
  section: string,
  documentType: string
): Promise<DigitizationDocument[]> {
  const url = `${DIGITIZATION_URL}qrreferences/${encodeURIComponent(
    reference
  )}/sections/${encodeURIComponent(section)}/doctypes/${encodeURIComponent(
    documentType
  )}/docs/info`;

  const response = await fetch(url, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.messageStatus ||
        "Error al obtener documentos por sección y tipo"
    );
  }

  const result = await response.json();
  return result.data ?? [];
}


/* ==============================
 * Descargar documento
 * ============================== */
export async function downloadDocument(
  id: number
): Promise<DownloadResponse> {
  const response = await fetch(
    `${DIGITIZATION_URL}docs/${id}/download`,
    {
      method: "GET",
      headers: {
        "x-api-key": API_KEY,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Error al descargar documento");
  }

  return await response.json();
}

/* ==============================
 * Subir documentos (BASE64 JSON)
 * ============================== */
export async function uploadDocuments(
  reference: string,
  sectionId: number,
  documentTypeId: number,
  createdby: {
    iduser: string;
    nameemployee: string;
  },
  files: File[],
  signal?: AbortSignal
): Promise<{ codeStatus: number; messageStatus?: string }> {

  const payloads = [];

  for (const file of files) {
    const base64 = await fileToBase64(file);

    payloads.push({
      file_model_64: {
        base64_data: base64,
        filename_64: file.name
      },
      createdby: {
        idUser: createdby.iduser,     
        nameemployee: createdby.nameemployee
      }
    });
  }

  const body = {
    payloads
  };

  const url = `${DIGITIZATION_URL}qrreferences/${encodeURIComponent(
    reference
  )}/sections/${sectionId}/doctypes/${documentTypeId}/add`;

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(errorText || "Error al subir el archivo");
  }

  const data = await response.json().catch(() => ({}));

  if (data.codeStatus !== 201 && data.codeStatus !== 200) {
    throw new Error(
      data.messageStatus || "Error al subir el archivo"
    );
  }

  return data;
}


/* ==============================
 * Eliminar documento
 * ============================== */
export async function deleteDocument(
  id: number
): Promise<{ codeStatus: number; messageStatus?: string }> {

  const response = await fetch(
    `${DIGITIZATION_URL}docs/${id}/delete`,
    {
      method: "DELETE",
      headers,
    }
  );

  //  Si es 204 → éxito directo (no hay body)
  if (response.status === 204) {
    return {
      codeStatus: 204,
      messageStatus: "Eliminado correctamente"
    };
  }

  //  Si no es 204, intentar leer JSON
  const data = await response.json().catch(() => ({}));

  if (data.codeStatus !== 204 && data.codeStatus !== 200) {
    throw new Error(
      data.messageStatus || "Error al eliminar documento"
    );
  }

  return data;
}

/* ==============================
 * CATALOGOS
 * ============================== */

class CatalogService {
  static async getCatalog<T>(
    endpoint: string,
    mapper?: (dto: any) => T
  ): Promise<T[]> {

    const url = `${DIGITIZATION_URL}catalogs/${endpoint}/info`;

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.messageStatus || "Catalog fetch error");
    }

    const json = await response.json();

    const rawData = json.data ?? [];

    return mapper
      ? rawData.map(mapper)
      : rawData;
  }
}

export function getCategoryDocuments() {
  return CatalogService.getCatalog<CategoryDocumentDTO>(
    "categorydocuments",
    (dto) => ({
      categorydocumentid: dto.categoryDocumentId,
      categorydocumentname: dto.categoryDocumentName,
      description: dto.description,
      status: dto.status
    })
  );
}

export function getDocumentTypes() {
  return CatalogService.getCatalog<DocumentTypeDTO>(
    "documenttypes",
    (dto) => ({
      documenttypeid: dto.documentTypeId,
      documentnametype: dto.documentNameType,
      documentkey: dto.documentKey,
      description: dto.description,
      formats: dto.formats,
      status: dto.status,
      category: dto.category,
      registerdate: dto.registerDate
    })
  );
}

export function getRegions() {
  return CatalogService.getCatalog<RegionDTO>(
    "regions",
    (dto) => ({
      regionid: dto.regionId,
      regionname: dto.regionName,
      description: dto.description,
      status: dto.status,
      countries: dto.countries,
      cities: dto.cities
    })
  );
}

export function getSections() {
  return CatalogService.getCatalog<SectionDTO>(
    "sections",
    (dto) => ({
      sectionid: dto.sectionId,
      section: dto.sectionName,
      description: dto.description,
      status: dto.status
    })
  );
}