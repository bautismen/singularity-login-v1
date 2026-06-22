import { useEffect, useRef, useCallback } from 'react';
import { useOperationsValidation, FieldError } from '../contexts/OperationsValidationContext';

const validateFields = 'input, select, textarea';

//obtiene el elemento por su name, id o data-field
function getFieldPath(element: HTMLElement): string {
    return element.dataset.field || (element as HTMLInputElement).name || element.id || 'unknown';
}

//Genera el mensaje de error del campo. si existe un mensaje personalizado (data-error-message) lo manda, sino manda uno generico.
function getErrorMessage(element: HTMLInputElement): string | null {
    if(element.dataset.errorMessage) return element.dataset.errorMessage;
    const label = element.closest(`.${element.dataset.fieldGroup || 'fieldGroup'}`)?.querySelector('label')?.textContent?.trim();
    return label ? `${label} es requerido` : 'campo requerido';
}

/** Se encarga de validar los subformularios dentro del contenedor.
 * Cada subformulario llama este hook con su key única y su función validadora.
 * Se registra al montar y se limpia al desmontar automáticamente.
 */
export const useSubFormValidator = (
    key: string, 
    options?: {serviceItem?: number; detailId?: number;}
) => {    
    const containerRef = useRef<HTMLDivElement>(null);
    const {registerValidator, unregisterValidator, getFieldError, errors} = useOperationsValidation();

    //recorre los elementos del form y verifica si tienen required y vacios. Con checkValidity se usa las reglas nativas del navegador. 
    const validate = useCallback((): FieldError[] => {
        if(!containerRef.current) return [];
        const fieldErrors: FieldError[] = [];
        const elements = containerRef.current?.querySelectorAll<HTMLInputElement>(validateFields);

        elements?.forEach((element) => {
            if(!element.required) return;
            //// checkValidity() usa las reglas nativas del navegador (required, minLength, pattern, type, etc.) sin re-declararlas
            if(!element.checkValidity()) {
                fieldErrors.push({
                    field: getFieldPath(element),
                    message: getErrorMessage(element),
                    serviceItem: options?.serviceItem,
                    detailId: options?.detailId,
                });
                // Evita uso fuera del Provider
                element.dataset.invalid = 'true';
            } else {
                delete element.dataset.invalid;
            }
        });
        return fieldErrors;       
    }, [key, options?.serviceItem, options?.detailId]);

    // Registra la función de validación en el contexto global
    useEffect(() => {
        registerValidator(key, validate);
        return () => unregisterValidator(key);
    },[key, validate]);
    
    //limpia marcas visuales cuando el error se resuelve. 
    useEffect(() => {
        if(!containerRef.current) return;
        const elements = containerRef.current.querySelectorAll<HTMLInputElement>(validateFields);
        elements?.forEach((element) => {
            const field = getFieldPath(element);
            const hasError = errors.some((error) => error.field === field && 
                                        error.serviceItem === options?.serviceItem && 
                                        error.detailId === options?.detailId);

            if(!hasError) delete element.dataset.invalid;
        });
    }, [errors]);

    return {containerRef, getFieldError};
}

