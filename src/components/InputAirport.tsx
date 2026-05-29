import React, { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import styles from "../pages/Quotations.module.css";
import { Airport } from '../types/airport';
import { catalogService } from '../services/catalogsService';

interface InputAirportProps {
    //data
    idCountry?: string;
    value?: string;
    serviceIdItem?: number;
    //configuracion
    label: string;
    required?: boolean;
    isDisabled?: boolean;
    groupClassName: string;
    labelClassName: string;
    inputClassName: string;
    //errorClassName: string;
    //metodos
    onChangeAirport: (port: Airport | null, value: string) => void;
    }

export const InputAirport: React.FC<InputAirportProps> = ({
  idCountry,
  value,
  serviceIdItem,
  label,
  required = false,
  isDisabled = false,
  groupClassName,
  labelClassName,
  inputClassName,
  //errorClassName,
  onChangeAirport
}) => {
    const { t } = useLanguage();
    const [errorMessage, setErrorMessage] = useState("");
    const [Airports, setAirports] =  useState<Airport[]>([]);
    const [loadingAirports, setLoadingAirports] = useState(false);
    const [inputValue, setInputValue] = useState("");

    const datalistId = useMemo(
        () => `airports-${serviceIdItem}`,
        [serviceIdItem]
    );

    //Seteo del valor de airport
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    //Carga los aeropuertos 
    useEffect(() => {
        setLoadingAirports(true); 
        if (!idCountry) {
            setAirports([]);
            setLoadingAirports(false); 
            return;
        }
        const fetchData = async () => {
            try {                
               const result = await catalogService.getAirportsByIdCountry(idCountry);
               setAirports(result ?? []);                
            } catch {
                setAirports([]);
            } finally {
                setLoadingAirports(false);
            }
        };
        fetchData();
    },[idCountry]);

    const handleChange=(value: string)=> {
        setInputValue(value);
        setErrorMessage("");
        const airportSelected = Airports.find((c) => c.airport_code.toLowerCase() === value.toLowerCase());
        onChangeAirport(airportSelected, value);
    }

    const handleBlur = () => {
        const trimmedValue = inputValue.trim();
        if (!trimmedValue) {
            setErrorMessage(required ? 'required' : "");
            return;
        }
        const airportSelected = Airports.find((c) => c.airport_code.toLowerCase() === trimmedValue.toLowerCase());

        if (!airportSelected) {
            setInputValue("")
            setErrorMessage('No valid');
            return;
        }

        setInputValue(airportSelected.airport_code);
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
        placeholder={loadingAirports ? t('app.loading')+"..."  : t('quote.select')} 
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        />
        
        <datalist id={datalistId}>
            {Airports.map((airport) => (
                <option key={airport._Id} value={airport.airport_code}>
                    {airport.name_airport}
                </option>
            ))}
        </datalist>
        {errorMessage && <div className={styles.fieldError}>{errorMessage} </div>}        
    </div>    
    )
}


