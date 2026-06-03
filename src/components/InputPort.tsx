import React, { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { Port } from "../types/port";
import { Search } from "lucide-react";

type LocationType = "origin" | "destination";

interface PortInputProps {
  //data
  codePort?: string;
  namePort?: string;
  serviceIdItem?: number;
  ports: Port[];
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
  onChangePort: (port: Port | null, value: string) => void;
}

export const InputPort: React.FC<PortInputProps> = ({
  codePort,
  namePort,
  serviceIdItem,
  ports,
  type,
  label,
  required = false,
  isDisabled = false,
  groupClassName,
  labelClassName,
  inputClassName,
  //errorClassName,
  onChangePort,
}) => {
  const { t } = useLanguage();
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingPorts, setLoadingPorts] = useState(false);
  const [namePortSelected, setNamePortSelected] = useState("");
  const [codePortSelected, setCodePortSelected] = useState("");
  const datalistId = useMemo(
    () => `ports-${type ?? 0}-${serviceIdItem}`,
    [serviceIdItem],
  );

  //Seteo del valor de port
  useEffect(() => {
    setCodePortSelected(codePort || "");
    setNamePortSelected(namePort || "");
  }, [codePort, namePort]);

  //Carga los puertos maritimos
  /*useEffect(() => {
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
    },[idCountry]);*/

  const handleChange = (value: string) => {      
    setNamePortSelected(value); 
    setCodePortSelected(""); 
    setErrorMessage("");
    const portSelected = ports.find(
      (c) => c.port_code.toLowerCase() === value.toLowerCase() ||
             c.name_port.toLowerCase() === value.toLowerCase());    
    onChangePort(portSelected ?? null, value);
  };

  const handleBlur = () => {
    const trimmedValue = codePortSelected.trim();
    if (!trimmedValue) {
      setErrorMessage(required ? "required" : "");
      onChangePort(null, "");
      return;
    }
    const portSelected = ports.find(
      (c) => c.port_code.toLowerCase() === trimmedValue.toLowerCase(),
    );

    if (!portSelected) {
      setCodePortSelected("");
      setNamePortSelected("");
      setErrorMessage("No valid");
      onChangePort(null, "");
      return;
    }
    setCodePortSelected(portSelected.port_code);
    setNamePortSelected(portSelected.name_port);
    setErrorMessage("");
    onChangePort(portSelected, portSelected.port_code);
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
          value={namePortSelected}
          disabled={isDisabled}
          required={required}
          placeholder={
            loadingPorts ? t("app.loading") + "..." : t("quote.select")
          }
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
        />
        <datalist id={datalistId}>
          {ports.map((port) => (
            <option key={port._Id} value={port.port_code}>
              {port.name_port}
            </option>
          ))}
        </datalist>
        <div className="relative w-50">
          <input
            disabled
            type="text"
            className={inputClassName}
            value={codePortSelected}
          />
          <Search
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300"
            size={20}
          />
        </div>
      </div>
      {errorMessage && (
        <div className="absolute left-0 top-2 -mt-5 text-red-600 text-sm">
          {errorMessage}
        </div>
      )}
    </div>
  );
};
