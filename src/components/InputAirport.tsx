import React, { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import styles from "../pages/Quotations.module.css";
import { Airport } from '../types/airport';
import { catalogService } from '../services/catalogsService';

type LocationType = "origin" | "destination";

interface InputAirportProps {
    //data
    idCountry?: string;
    value?: string;
    serviceIdItem?: number;
    airports: Airport[],
    type?: LocationType,
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
  airports,
  type,
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
    //const [Airports, setAirports] =  useState<Airport[]>([]);
    const [loadingAirports, setLoadingAirports] = useState(false);
    const [inputValue, setInputValue] = useState("");

    const datalistId = useMemo(
        () => `airports-${type}-${serviceIdItem}`,
        [serviceIdItem]
    );    

    //Carga los aeropuertos 
    /*useEffect(() => {        
        setLoadingAirports(true); 
        if (!idCountry) {
            console.log('!idCountry')
            setAirports([]);
            setLoadingAirports(false); 
            return;
        }
        const fetchData = async () => {
            try {                
               const result = await catalogService.getAirportsByIdCountry(idCountry);
               setAirports(result ?? []);     
               console.log('fetch', result)           
            } catch {
                setAirports([]);
                console.log('catch') 
            } finally {
                setLoadingAirports(false);
            }
        };
        fetchData();
    },[idCountry]);*/

    //Seteo del valor de airport
    useEffect(() => {     
        setInputValue(value);
        /*const airportSelected = Airports.find((c) => c.airport_code.toLowerCase() === value);
        console.log('useffect-air-seteo', value, airportSelected,Airports)
        onChangeAirport(airportSelected, value);*/
    }, [value]);

    const handleChange=(value: string)=> {
        setInputValue(value);
        setErrorMessage("");
        const airportSelected = airports.find((c) => c.airport_code.toLowerCase() === value.toLowerCase());
        onChangeAirport(airportSelected ?? null, value);
    }

    const handleBlur = () => {
        const trimmedValue = inputValue.trim();
        if (!trimmedValue) {
            setErrorMessage(required ? 'required' : "");
            onChangeAirport(null, "");
            return;
        }
        const airportSelected = airports.find((c) => c.airport_code.toLowerCase() === trimmedValue.toLowerCase());

        if (!airportSelected) {
            setInputValue("")
            setErrorMessage('No valid');
            onChangeAirport(null, "");
            return;
        }

        setInputValue(airportSelected.airport_code);
        setErrorMessage("");
        onChangeAirport(airportSelected, airportSelected.airport_code);
        console.log('blur', airportSelected)
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
            {airports.map((airport) => (
                <option key={airport._Id} value={airport.airport_code}>
                    {airport.name_airport}
                </option>
            ))}
        </datalist>
        {errorMessage && <div className={styles.fieldError}>{errorMessage} </div>}        
    </div>    
    )
}


