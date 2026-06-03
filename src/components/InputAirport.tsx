import React, { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { Airport } from "../types/airport";
import { Search } from "lucide-react";

type LocationType = "origin" | "destination";

interface InputAirportProps {
  //data
  codeAirport?: string;
  nameAirport?: string;
  serviceIdItem?: number;
  airports: Airport[];  
  type?: LocationType;
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
  codeAirport,
  nameAirport,
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
  onChangeAirport,
}) => {
  const { t } = useLanguage();
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingAirports, setLoadingAirports] = useState(false);
  const [nameAirportSelected, setNameAirportSelected] = useState("")
  const [codeAirportSelected, setCodeAirportSelected] = useState("");
  const datalistId = useMemo(
    () => `airports-${type}-${serviceIdItem}`,
    [serviceIdItem],
  );
  
  //Seteo del valor de airport
  useEffect(() => {
    setCodeAirportSelected(codeAirport || "");    
    setNameAirportSelected(nameAirport || "");
  }, [codeAirport, nameAirport]);

  const handleChange = (value: string) => {       
    setNameAirportSelected(value);
    setCodeAirportSelected(""); 
    setErrorMessage("");
    const airportfinded = airports.find(
      (c) => c.airport_code.toLowerCase() === value.toLowerCase() ||
        c.name_airport === value );    
    onChangeAirport(airportfinded ?? null, value);
  };

  const handleBlur = () => {
    const trimmedValue = codeAirportSelected.trim();
    if (!trimmedValue) {
      setErrorMessage(required ? "required" : "");
      onChangeAirport(null, "");
      return;
    }
    const airportSelected = airports.find(
      (c) => c.airport_code.toLowerCase() === trimmedValue.toLowerCase(),
    );

    if (!airportSelected) {
      setCodeAirportSelected("");    
      setNameAirportSelected("");
      setErrorMessage("No valid");
      onChangeAirport(null, "");
      return;
    }

    setCodeAirportSelected(airportSelected.airport_code);    
    setNameAirportSelected(airportSelected.name_airport);
    setErrorMessage("");
    onChangeAirport(airportSelected, airportSelected.airport_code);
  };

  return (
    <div className={groupClassName}>
      <label className={labelClassName}>
        {required && <span>*</span>}
        {label}
      </label>
      <div className="flex items-center bg-surface-container focus-within:border-secondary transition-all">
        <input
          
          list={datalistId}
          className={inputClassName}
          value={nameAirportSelected}
          disabled={isDisabled}
          required={required}
          placeholder={
            loadingAirports ? t("app.loading") + "..." : t("quote.select")
          }
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

        <div className="relative w-50">
          <input
            disabled
            type="text"
            className={inputClassName}
            value={codeAirportSelected}/>
          <Search
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300"
            size={20}
          />
        </div>        
      </div>
      {errorMessage && <div className="absolute left-0 top-2 -mt-5 text-red-600 text-sm">{errorMessage} </div>}
    </div>
  );
};
