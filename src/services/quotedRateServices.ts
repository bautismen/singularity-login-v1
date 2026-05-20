import { QuotedRate,ResponseGet } from "../types/quotedRate";

const ENVIRONMENT_ID = 2;

const API_KEY = import.meta.env.VITE_APIKEYSL;

const VITE_API_QUOTEDRATE =
  import.meta.env.VITE_API_URL +
  `/operations/v1/kl/t/quotedrate`;

const headers = {
  "x-api-key": API_KEY,
  "environmentid_": ENVIRONMENT_ID.toString(), 
  "Content-Type": "application/json",
};

export const uploadQuotedRate = async (
  quotationrequest_: string,
  controlnumber_: string,
  data: QuotedRate
) => {
  try {
    const url = `${VITE_API_QUOTEDRATE}/quotationrequest/${quotationrequest_}/control/${controlnumber_}/add`;

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error?.message || "Error al subir quoted rate");
    }

    return await response.json();

  } catch (error) {
    console.error("uploadQuotedRate error:", error);
    throw error;
  }
};

export const updateQuotedRate = async (
  quotenumber_: string,
  data: QuotedRate
) => {
  try {
    const url = `${VITE_API_QUOTEDRATE}/quotenumber/${quotenumber_}/update`;

    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error?.message || "Error al actualizar quoted rate");
    }

    return await response.json();

  } catch (error) {
    console.error("updateQuotedRate error:", error);
    throw error;
  }
};


export const updateStatusQuotedRate = async (
  idquotedrate_: string,
  idstatusquote_: Number
) => {
  try {
    const url = `${VITE_API_QUOTEDRATE}/idquotedrate/${idquotedrate_}/statusquoterate/${idstatusquote_}/update`;

    const response = await fetch(url, {
      method: "PUT",
      headers
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error?.message || "Error al actualizar status quoted rate");
    }

    return await response.json();

  } catch (error) {
    console.error("updateQuotedRate error:", error);
    throw error;
  }
};


export const GetQuotedRateByQuotationRequestAndControlInfo = async (
  quotationrequest_: string,
  controlnumber_: string
) => {
  try {
    const url = `${VITE_API_QUOTEDRATE}/quotationrequest/${quotationrequest_}/control/${controlnumber_}/info`;

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error?.message || "Error al obtener quoted rate info");
    }

    const data = await response.json();
    
    return data;

  } catch (error) {
    console.error("getQuotedRateInfo error:", error);
    throw error;
  }
};

export const updateStatusQuotedRatebyRequestQuotation = async (
  idquotationrequest_ : string, 
  idstatusquote_: number 
) => {
  try {
    const url = `${VITE_API_QUOTEDRATE}/quotationrequest/${idquotationrequest_}/statusquoterate/${idstatusquote_}/update`;

    const response = await fetch(url, {
      method: "PUT",
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error?.message || "Error al actualizar status quoted rate");
    }

    return await response.json();

  } catch(error) {
    console.error("uploadQuotedRate error:", error);
    throw error;
  }  
};


export const GetQuotedRateByDocumentInfo = async (
  ids: string[],
): Promise<ResponseGet<QuotedRate[]>> => {

  try {

    if (!ids || ids.length === 0) {
      throw new Error("Debe enviar al menos un id");
    }

    const query = ids
      .map(id => `idDocuments_=${encodeURIComponent(id)}`)
      .join("&");

    const url = `${VITE_API_QUOTEDRATE}/iddocuments/info?${query}`;

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error?.message || "Error al obtener quoted rate info");
    }

    return await response.json();

  } catch (error) {
    console.error("getQuotedRateInfo error:", error);
    throw error;
  }
};

export const updateStatusControlQuotedRate = async (
  idquotedrate_: string,
  idstatuscontrol_: number
) => {
  try {

    const url =
      `${VITE_API_QUOTEDRATE}` + `/idquotedrate/${idquotedrate_}/statuscontrol/${idstatuscontrol_}/update`;

    const response = await fetch(url, {
      method: "PUT",
      headers,
    });

    if (!response.ok) {
      const error = await response.json();

      throw new Error(
        error?.message ||
        "Error al actualizar status control quoted rate"
      );
    }

    return await response.json();

  } catch (error) {

    console.error(
      "updateStatusControlQuotedRate error:",
      error
    );

    throw error;
  }
};