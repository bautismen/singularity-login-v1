import { createContext, useCallback, useContext, useRef, useState } from "react";
//estructura estándar del mensaje de error 
export interface FieldError {
    field: string;
    message: string;
    serviceItem?: number;
    detailId: number;
}
//funcion de validacion :  retorna el array de errores
export type ValidatorFn = () => FieldError[]

//interfaz del validador del contexto de Operations
interface OperationsValidationContextType {
    registerValidator: (key: string, fn: ValidatorFn) => void;
    unregisterValidator: (key: string ) => void;
    runAllValidators: () => FieldError[];
    //helpers visuales
    errors: FieldError[];
    setErrors: (errors: FieldError[]) => void;
    getFieldError: (serviceItem: number, detailId: number, field: string) => string | undefined;
    clearErrors: ()=> void;
}

const OperationsValidationContext = createContext<OperationsValidationContextType | null>(null);

export const OperationsValidationProvider = ({ children }) => {
    //useRef para no renderizar al registrar y eliminar los sub forms
    const validators = useRef<Map<string, ValidatorFn>>(new Map());
    const [errors, setErrors] = useState<FieldError[]>([]);

    const registerValidator = useCallback((key: string, fn: ValidatorFn) => {
        validators.current.set(key, fn);
    }, []);

    const unregisterValidator = useCallback((key: string) => {
        validators.current.delete(key);
    }, []);

    // Ejecuta todos los validadores registrados y acumula errores
    const runAllValidators = useCallback((): FieldError[] => {
        const allErrors: FieldError[] = [];
        validators.current.forEach((fn) => {
            allErrors.push(...fn());
        });
        setErrors(allErrors);
        return allErrors;
    }, []);
    // Busca el error de un campo específico dentro del estado global
    const getFieldError = useCallback((serviceItem: number, detailId: number, field: string) => {
        return errors.find(e => e.serviceItem === serviceItem && e.detailId === detailId && e.field === field)?.message;        
    }, [errors]);

    const clearErrors = useCallback(() => setErrors([]), []);
    //envuelve los componentes hijos dentro del Provider. Comparten lo que esta dentro del value mediante: "const y = useContext(OperationsValidationContext)"
    return(
        <OperationsValidationContext.Provider 
        value={{
            registerValidator,
            unregisterValidator, 
            runAllValidators, 
            errors, 
            setErrors,
            getFieldError,
            clearErrors,
        }}>
            {children}
        </OperationsValidationContext.Provider>
    );
};
// Hook personalizado para consumir el contexto de validación
export const useOperationsValidation = () => {
    const context = useContext(OperationsValidationContext);
    // Evita uso fuera del Provider
    if (!context) throw new Error('useOperationsValidation debe usarse dentro de OperationsValidationProvider');
    return context;
};
