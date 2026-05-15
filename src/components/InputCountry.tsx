import React, { useEffect, useMemo, useState } from "react";
import styles from "../pages/Quotations.module.css";
import { Shipment , OrderService} from "../types/requestQuotation";
import { useLanguage } from "../contexts/LanguageContext";

type LocationType = "origin" | "destination";

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
  onUpdateLocation: (
    idServiceItem: number,
    changes: Record<string, any>,
    idShipment?: number,
  ) => void;
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
  onUpdateLocation,
}) => {
  const { t } = useLanguage();
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
    
  const selectedCountryId = type === "origin" ? 
    shipment?.origin?.idCountry ?? orderService?.origin?.idCountry: 
    shipment?.destination?.idCountry ?? orderService?.destination?.idCountry;
  
  const datalistId = useMemo(
    () => `countries-${type}-${serviceIdItem}-${shipment?.idShipment ?? 0}`,
    [type, serviceIdItem, shipment?.idShipment],
  );

  useEffect(() => {
    const selectedCountry = countries.find(
      (c) => String(c._Id) === String(selectedCountryId),
    );

    setInputValue(selectedCountry?.name_country ?? "");
  }, [countries, selectedCountryId]);

  const handleChange = (value: string) => {
    setInputValue(value);
    setError("");

    const countrySelected = countries.find(
      (c) => c.name_country.toLowerCase() === value.toLowerCase(),
    );

    onUpdateLocation(
      serviceIdItem,
      {
        idCountry: countrySelected?._Id ?? "",
        countryCode: countrySelected?.country_code ?? "",
      },
      shipment?.idShipment,
    );
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
    <div className={styles.formGroup}>
      <label className={styles.label}>
        {required && <span className={styles.required}>*</span>}
        {label}
      </label>

      <input
        list={datalistId}
        className={styles.select}
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

      {error && <div className={styles.fieldError}>{error}</div>}
    </div>
  );
};

export default InputCountry;
