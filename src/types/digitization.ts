/* ==============================
 * Documento Digitalizado
 * ============================== */
export interface DigitizationDocument {
  id: string;

  documentId: number;
  documentName: string;
  documentNameSave: string;

  categoryName: string;
  origin: "interno" | "externo";

  sectionId: number;
  section: string;

  registrationDate: string;
  registrationYear: number;
  registrationMonth: number;

  referenceType: number;
  reference: string;

  expiration: boolean;
  expirationDate: string | null;

  environment: string;
  environmentId: number;

  status: "Activo" | "Inactivo";
  datastate: number;
  archived: boolean;
  visibility: "Privado" | "Publico";

  fileSizeMB: number;
  format: string;
  version: number;
  description?: string;

  documenttype: {
    _Id: string;
    documentTypeId: number;
    documentNameType: string;
  };

  customer?: {
    _Id: string;
    customerName: string;
    rfctaxid: string;
  };

  userLoad?: {
    userId: string;
    userName: string;
  };

  metadataGcs?: {
    nameDocument: string;
    generation: string;
    idFileGCS: string;
    bucket: string;
    rutaGCS: string;
    mediaLink: string;
    selfLink: string;
    sizeBytes: number;
    urlDescargaPublica: string;
    contentType: string;
    storageClass: string;
    md5Hash: string;
    timeCreated: string;
    timeUpdated: string;
  };
}

export interface DownloadResponse {
  codeStatus: number;
  messageStatus: string;
  meta: {
    fileName: string;
    fileBytes: string;      // Base64
    downloadPath: string;
  };
}

/* ==============================
 * Catalogos Digitization
 * ============================== */

export interface CategoryDocumentDTO {
  categorydocumentid: string;
  categorydocumentname: string;
  description: string;
  status: boolean;
  created?: {
    $date: string;
  };
}

export interface DocumentTypeDTO {
  documenttypeid: number;
  documentnametype: string;
  documentkey: string;
  description: string;
  formats: string[];
  status: boolean;
  category: string;
  registerdate: string;
}

export interface RegionDTO {
  id?: { $oid: string; };
  regionid: number;
  regionname: string;
  description: string;
  countries?: {
    id_country: number;
    country_code: string;
  }[];
  cities?: string[];
  status: boolean;
}

export interface SectionDTO {
  sectionid: number;
  section: string;
  description: string;
  status: boolean;
  created?: {
    $date: string;
  };
}