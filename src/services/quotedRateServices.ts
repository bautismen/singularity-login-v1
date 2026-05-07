import { QuotedRate } from "../types/quotedRate";

const ENVIRONMENT_ID = 2;

const API_KEY = import.meta.env.VITE_APIKEYSL;

const VITE_API_QUOTEDRATE =
  import.meta.env.VITE_API_QUOTEDRATE +
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

    /* prueba debugueo */
    const jsonFormatted = JSON.stringify(data, null, 2);
    console.log("JSON FORMATEADO INSERCION uploadQuotedRate:");
    console.log(jsonFormatted);
    console.log(url);

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

    console.log("JSON FORMATEADO UPDATE:");
    console.log(JSON.stringify(data, null, 2));
    console.log(url);

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
  id_: string,
  data: QuotedRate
) => {
  try {
    const url = `${VITE_API_QUOTEDRATE}/idquoterate/${id_}/update`;


    console.log("JSON FORMATEADO UPDATE:");
    console.log(JSON.stringify(data, null, 2));
    console.log(url);

    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
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
    const url = `${VITE_API_QUOTEDRATE}/quotedrate/quotationrequest/${quotationrequest_}/control/${controlnumber_}/info`;

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error?.message || "Error al obtener quoted rate info");
    }


    const data = await response.json();
    
   /* prueba debugueo */
    console.log("JSON FORMATEADO:");
    console.log(JSON.stringify(data, null, 2));

    return data;

  } catch (error) {
    console.error("getQuotedRateInfo error:", error);
    throw error;
  }
};