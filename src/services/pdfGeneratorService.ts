import { pdfGeneratorQuotedRate } from "../types/pdfGenerator";

const ENVIRONMENT_ID = 2;

const API_KEY = import.meta.env.VITE_APIKEYSLPDFGEN;

const API_TOKENSL = import.meta.env.VITE_TOKENSL;

const VITE_API_PDFGENERATOR =
    import.meta.env.VITE_API_PDFGENERATOR +
    `/kl/reports/v1/utils/PdfGenerator`;

const headers = {
    'Authorization': `Bearer ${API_TOKENSL}`,
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
};

export const GeneratePreviewQuotedRate = async (
  data: pdfGeneratorQuotedRate
) => {
try {
    const url = `${VITE_API_PDFGENERATOR}/generate-bydata`;

    const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Error al previsualizar");
    }

    //  blob
    return await response.blob();


} catch (error) {
    console.error("uploadQuotedRate error:", error);
    throw error;
}
};
