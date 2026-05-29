import React, { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import styles from "../pages/Quotations.module.css";
import { Port } from '../types/port';
import { catalogService } from '../services/catalogsService';

type LocationType = "origin" | "destination";

interface PortInputProps {
    //data
    idCountry?: string;
    value?: string;
    serviceIdItem?: number;
    type? :LocationType;
    //configuracion
    label: string;
    required?: boolean;
    isDisabled?: boolean;
    groupClassName: string;
    labelClassName: string;
    inputClassName: string;
    //errorClassName: string;
    //metodos
    onChangePort: (port: Port | null, value: string) => void;
    }

export const InputPort: React.FC<PortInputProps> = ({
  idCountry,
  value,
  serviceIdItem,
  type,
  label,
  required = false,
  isDisabled = false,
  groupClassName,
  labelClassName,
  inputClassName,
  //errorClassName,
  onChangePort
}) => {
    const { t } = useLanguage();
    const [errorMessage, setErrorMessage] = useState("");
    const [Ports, setPorts] =  useState<Port[]>([]);
    const [loadingPorts, setLoadingPorts] = useState(false);
    const [inputValue, setInputValue] = useState("");

    const datalistId = useMemo(
        () => `ports-${type ?? 0}-${serviceIdItem}`,
        [serviceIdItem]
    );
    console.log('PUERTO: ',datalistId, value);

    //Seteo del valor de port
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    //Carga los puertos maritimos
    useEffect(() => {
        setLoadingPorts(true); 
        if (!idCountry) {
            setPorts([]);
            setLoadingPorts(false); 
            return;
        }
        const fetchData = async () => {
            try {                
               const result = await catalogService.getPortsByIdCountry(idCountry);
               setPorts(result ?? []);                
            } catch {
                setPorts([]);
                // silencioso; el error de catálogos lo maneja el padre si lo necesita
            } finally {
                setLoadingPorts(false);
            }
        };
        fetchData();
    },[idCountry]);

    const handleChange=(value: string)=> {
        setInputValue(value);
        setErrorMessage("");
        const portSelected = Ports.find((c) => c.port_code.toLowerCase() === value.toLowerCase());
        onChangePort(portSelected, value);
    }

    const handleBlur = () => {
        const trimmedValue = inputValue.trim();
        if (!trimmedValue) {
            setErrorMessage(required ? 'required' : "");
            return;
        }
        const portSelected = Ports.find((c) => c.port_code.toLowerCase() === trimmedValue.toLowerCase());

        if (!portSelected) {
            setInputValue("")
            setErrorMessage('No valid');
            return;
        }

        setInputValue(portSelected.port_code);
        setErrorMessage("");
  };
    
    return (
    <div className={groupClassName}>
        <label className={labelClassName}>
            {required && <span>*</span>}
            {label}
        </label>
        <input
        list={datalistId}
        className={inputClassName}
        value={inputValue}
        disabled={isDisabled}
        required={required}
        placeholder={loadingPorts ? t('app.loading')+"..."  : t('quote.select')} 
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        />
        
        <datalist id={datalistId}>
            {Ports.map((port) => (
                <option key={port._Id} value={port.port_code}>
                    {port.name_port}
                </option>
            ))}
        </datalist>
        {errorMessage && <div className={styles.fieldError}>{errorMessage} </div>}
        
    </div>    
    )
}


