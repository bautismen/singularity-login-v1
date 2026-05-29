import React, { useEffect, useMemo, useState } from "react";
import styles from "../pages/Quotations.module.css";
import { Shipment , OrderService} from "../types/requestQuotation";
import { useLanguage } from "../contexts/LanguageContext";

type LocationType = "origin" | "destination";

//Evento mensaje que se le manda al padre cuando el usuario cambia un pais. No almacena directamente solo presenta la info al padre. 
type CountryChangeEvent = {
  type: LocationType; //indica si el cambio fue para origin o destino
  country: any | null; //pais encontrado
  value: string; //texto seleccionado en el input
  changes: Record<string, any>; //objeto transformado para guardar por defecto es { idCountry: 1, countryCode: "MX" } pero la estructura se puede cambiar con mapCountryToChanges
  idServiceItem?: number; //estos son datos extra para que el padre sepa que item actualizar
  idShipment?: number;
};

interface CountryInputProps {
  type: LocationType;
  countries: any[];
  shipment?: Shipment;
  orderService?: OrderService;
  serviceIdItem: number;
  isDisabled?: boolean;
  required?: boolean;
  placeholder?: string;
  label: string;
  //nuevos: si la estructura no tiene shipment/order se pasa directamente el id o texto del pais
  value?: string;
  selectedCountryId?: string | number; 
  //metodos:
  /*
   Esta función sirve para cambiar la forma del objeto que se va a guardar.   
   Si NO la mandas, se guarda como antes:
    { 
      idCountry: country._Id,
      countryCode: country.country_code
    }
   Si SÍ la mandas, puedes guardar como quieras:
   { 
    country: country.country_code
   }
   Ejemplo: mapCountryToChanges={(country) => ({ country: country?.country_code ?? "" })}
   */
  mapCountryToChanges?:(country: any | null) => Record<string, any>; 
  /*
    Esta funcion es la que se llama cuando se cambia pais. 
  */
  onChangeCountry: (event: CountryChangeEvent) => void; //avisa que se selecciono un pais y el padre decide como guardar
  /*onUpdateLocation?: (
    idServiceItem: number,
    changes: Record<string, any>,
    idShipment?: number,
  ) => void;*/
   //estilos (opcionales)
   groupClassName?: string;
   labelClassName? : string;
   inputClassName? : string;
   errorClassName? : string;

}

export const InputCountry: React.FC<CountryInputProps> = ({
  type,
  countries,
  shipment,
  orderService,
  serviceIdItem,
  isDisabled = false,
  required = false,
  placeholder = "",
  label,
  //nuevos
  value,
  selectedCountryId,
  mapCountryToChanges,
  onChangeCountry,
  //onUpdateLocation,
  groupClassName,
  labelClassName,
  inputClassName,
  errorClassName
}) => {
  const { t } = useLanguage();
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  
  //Mantiene compatibilidad. Si manda selectedCountry se usa , sino se toma desde shipment/orderservice
  const resolvedSelectedCountryId  = selectedCountryId = (type === "origin" ? 
    shipment?.origin?.idCountry ?? orderService?.origin?.idCountry: 
    shipment?.destination?.idCountry ?? orderService?.destination?.idCountry);
  
  const datalistId = useMemo(
    () => `countries-${type}-${serviceIdItem}-${shipment?.idShipment ?? 0}`,
    [type, serviceIdItem, shipment?.idShipment],
  );

  //si el padre manda value , se sincroniza sino busca el nombre del pais usando el id seleccionado. 
  useEffect(() => {
    if(value !== undefined) {
      setInputValue(value);
      return;
    }
    const selectedCountry = countries.find(
      (c) => String(c._Id) === String(selectedCountryId),
    );

    setInputValue(selectedCountry?.name_country ?? "");
  }, [countries, resolvedSelectedCountryId, value]);

  //mapeo por defecto (primera estructura: Solicitudes). 
  const defaultMapCountryToChanges = (country: any | null) => ({
    idCountry: country?._Id ?? "",
    countryCode: country?.country_code ?? "",
  });

  //convierte el pais seleccionado a changes y emite el evento . 
  const updateCountry = (countrySelected: any | null, nextValue: string) => {
    //si el padre manda mapCountryToChanges usamos esa funcion para construir el objeto sino usamos el formato viejo
    const changes = mapCountryToChanges ? onChangeCountry(countrySelected) : defaultMapCountryToChanges(countrySelected)
    //aqui solo se avisa al padre que objeto se construyó. 
    onChangeCountry ({
      type, 
      country: countrySelected,
      value: nextValue, 
      changes, 
      idServiceItem: serviceIdItem, 
      idShipment: shipment?.idShipment
    });
  }

  const handleChange = (value: string) => {
    setInputValue(value);
    setError("");

    const countrySelected = countries.find(
      (c) => c.name_country.toLowerCase() === value.toLowerCase(),
    );
    updateCountry(countrySelected ?? null, value)
    /*onUpdateLocation(
      serviceIdItem,
      {
        idCountry: countrySelected?._Id ?? "",
        countryCode: countrySelected?.country_code ?? "",
      },
      shipment?.idShipment,
    );*/
  };

  const handleBlur = () => {
    const trimmedValue = inputValue.trim();

    if (!trimmedValue) {
      setError(required ? t('quote.inputCountryNoOne') : "");
      return;
    }

    const countrySelected = countries.find(
      (c) => c.name_country.toLowerCase() === trimmedValue.toLowerCase(),
    );

    if (!countrySelected) {
      setInputValue("")
      setError(('quote.inputCountryInvalid'));
      return;
    }

    setInputValue(countrySelected.name_country);
    setError("");
  };

  return (
    <div className={groupClassName ?? styles.formGroup}>
      <label className={labelClassName ?? styles.label}>
        {required && <span className={styles.required}>*</span>}
        {label}
      </label>

      <input
        list={datalistId}
        className={inputClassName ?? styles.select}
        value={inputValue}
        disabled={isDisabled}
        required={required}
        placeholder={placeholder}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
      />

      <datalist id={datalistId}>
        {countries.map((country) => (
          <option key={country._Id} value={country.name_country} >
            {country.country_code}
          </option>
        ))}
      </datalist>

      {error && <div className={errorClassName ?? styles.fieldError}>{error}</div>}
    </div>
  );
};

export default InputCountry;
