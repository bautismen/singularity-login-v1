import { useEffect, useState } from 'react';
import styles from '../../pages/Quotations.module.css'; 
import { catalogService } from '../../services/catalogsService';
import {Service, OrderService, Shipment} from '../../types/requestQuotation';
import { Port } from '../../types/port';
import { Airport } from '../../types/airport';

interface ZipCodesOriginDestinationProps {
  service: Service;
  mode: 'create' | 'edit' | 'view';
  idStatusRequest: number;
  destinationRequired: boolean;
  showAirportsOrderService?: boolean;
  onUpdateOrigin: (idServiceItem: number, changes: Record<string, any>,  idShipment?: number) => void;
  onUpdateDestination: (idServiceItem: number, changes: Record<string, any>, idShipment?: number) => void;
  t: (key: string) => string;
}

export const ZipCodesOriginDestination = ({
  service,
  mode,
  idStatusRequest,
  destinationRequired,
  showAirportsOrderService,
  onUpdateOrigin,
  onUpdateDestination,
  t,
} : ZipCodesOriginDestinationProps) => {

  const [portsOrigin, setPortsOrigin]       = useState<Port[]>([]);
  const [airportsOrigin, setAirportsOrigin] = useState<Airport[]>([]);
  const [portsDestination, setPortsDestination] = useState<Port[]>([]);
  const [airportsDestination, setAirportsDestination] = useState<Airport[]>([]);
  const [loadingPorts, setLoadingPorts] = useState(false);

  //Error Mensaje
  const [errorOrigin, setErrorOrigin] = useState("");
  const [errorDestination, setErrorDestination] = useState("");

  //Type Guard : shipment o serviceOrder
  const isShipment = (s: Shipment | OrderService): s is Shipment => {
    return 'idShipment' in s;
  };
  const shipmentOrOrder = service.shipments?.[0] || service.orderService;
  const idShipment = shipmentOrOrder && isShipment(shipmentOrOrder) ? shipmentOrOrder.idShipment : undefined;
  
  // Marítimo FCL (1) y LCL (2) → usa puertos; Aéreo (5) → usa aeropuertos
  const isPort     = (showAirportsOrderService !== undefined ? !showAirportsOrderService : [1, 2].includes(service.idService));
  const isAir      = (showAirportsOrderService !== undefined ? showAirportsOrderService : service.idService === 5);
  const isDisabled = mode === 'view' || idStatusRequest >= 2;  

  const originListId = `${isAir ? "airports" : "ports"}-origin-${service.idServiceItem}-${idShipment ?? "order"}`;
  const destinationListId = `${isAir ? "airports" : "ports"}-destination-${service.idServiceItem}-${idShipment ?? "order"}`;


  // ── Carga puertos / aeropuertos cuando cambia el país de origen ──────────────
  useEffect(() => {
    const idCountry = shipmentOrOrder?.origin?.idCountry;
    const needsPortOrAirport = [2, 3, 4].includes(shipmentOrOrder?.idTypeShipment || 0);
    console.log('ports',shipmentOrOrder,portsOrigin , idCountry, needsPortOrAirport )
    if (!idCountry || !needsPortOrAirport) {
      setPortsOrigin([]);
      setAirportsOrigin([]);
      return;
    }

    let cancelled = false;
    setLoadingPorts(true);

    const fetchData = async () => {
      try {
        if (isAir) {
          const result = await catalogService.getAirportsByIdCountry(idCountry);
          if (!cancelled) setAirportsOrigin(result ?? []);
        } else {
          const result = await catalogService.getPortsByIdCountry(idCountry);
          if (!cancelled) setPortsOrigin(result ?? []);
        }
      } catch {
        // silencioso; el error de catálogos lo maneja el padre si lo necesita
      } finally {
        if (!cancelled) setLoadingPorts(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [shipmentOrOrder?.origin?.idCountry, shipmentOrOrder?.idTypeShipment, isAir]);

  // ── Carga puertos / aeropuertos cuando cambia el país de destino ──────────────
  useEffect(() => {
    const idCountry = shipmentOrOrder?.destination?.idCountry;
    const needsPortOrAirport = [2, 3, 4].includes(shipmentOrOrder?.idTypeShipment || 0);

    if (!idCountry || !needsPortOrAirport) {
      setPortsDestination([]);
      setAirportsDestination([]);
      return;
    }

    let cancelled = false;
    setLoadingPorts(true);

    const fetchData = async () => {
      try {
        if (isAir) {
          const result = await catalogService.getAirportsByIdCountry(idCountry);
          if (!cancelled) setAirportsDestination(result ?? []);
        } else {
          const result = await catalogService.getPortsByIdCountry(idCountry);
          if (!cancelled) setPortsDestination(result ?? []);
        }
      } catch {
        // silencioso; el error de catálogos lo maneja el padre si lo necesita
      } finally {
        if (!cancelled) setLoadingPorts(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [shipmentOrOrder?.destination?.idCountry, shipmentOrOrder?.idTypeShipment, isAir]);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const originLabel      = isAir ? t('quote.originAirport')      : t('quote.originPort');
  const destinationLabel = isAir ? t('quote.destinationAirport') : t('quote.destinationPort');

  const originPortAirportValue      = isPort ? shipmentOrOrder?.origin?.portCode      ?? '' : shipmentOrOrder?.origin?.airportCode      ?? '';
  const destinationPortAirportValue = isPort ? shipmentOrOrder?.destination?.portCode ?? '' : shipmentOrOrder?.destination?.airportCode ?? '';

  const updateOriginPortAirport = (value: string) => {
    console.log('ORDER', isPort, isAir,shipmentOrOrder, value)

    onUpdateOrigin(service.idServiceItem, 
      isPort ? 
      { 
        portCode: value.toUpperCase() ,
        airportCode: ''
      } : { 
        airportCode: value.toUpperCase() ,
        portCode: ''
      },
      idShipment 
    );
  }

  const updateDestinationPortAirport = (value: string) =>
    onUpdateDestination(service.idServiceItem, 
      isPort ? { portCode: value.toUpperCase() } : { airportCode: value.toUpperCase() },
      idShipment,
    );

  // ── Bloque: Ciudad + CP ───────────────────────────────────────────────────────

  const CityZipOrigin = (
    <div className={styles.formGroupCityZipcode}>
      {/* Ciudad origen */}
      <div className={styles.formGroup}>
        <label className={styles.label}>
          <span className={styles.required}>*</span>
          {t('ctrlpricing.cityo')}
        </label>
        <input
          className={styles.input}
          type="text"
          maxLength={100}
          value={shipmentOrOrder?.origin?.city ?? ''}
          onChange={(e) => {
            onUpdateOrigin(service.idServiceItem,  { city: e.target.value, portCode: '', airportCode: '' }, idShipment )
            console.log('ORDER', isPort, isAir,shipmentOrOrder)
          }}
          disabled={isDisabled}
          required
        />
      </div>
      {/* CP origen */}
      <div className={styles.formGroup}>
        <label className={styles.label}>{t('quote.originZip')}</label>
        <input
          type="number"
          min="1"
          className={styles.input}
          onInput={(e) => { e.currentTarget.value = e.currentTarget.value.slice(0, 9); }}
          onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
          value={shipmentOrOrder?.origin?.zipCode ?? ''}
          onChange={(e) => {
            const value = e.target.value;
            if (value === '' || Number(value) > 0) {
              onUpdateOrigin(service.idServiceItem, { zipCode: parseInt(value) , portCode: '', airportCode: '' }, idShipment );
            }
          }}
          disabled={isDisabled}
        />
      </div>
    </div>
  );

  const CityZipDestination = (
    <div className={styles.formGroupCityZipcode}>
      {/* Ciudad destino */}
      <div className={styles.formGroup}>
        <label className={styles.label}>
          {destinationRequired && (<span className={styles.required}>*</span>) }
          {t('ctrlpricing.cityd')}
        </label>
        <input
          className={styles.input}
          type="text"
          maxLength={100}
          value={shipmentOrOrder?.destination?.city ?? ''}
          onChange={(e) =>
            onUpdateDestination(service.idServiceItem,  { city: e.target.value, portCode: '', airportCode: '' }, idShipment)
          }
          disabled={isDisabled}
          required={destinationRequired}
        />
      </div>
      {/* CP destino */}
      <div className={styles.formGroup}>
        <label className={styles.label}>{t('quote.destinationZip')}</label>
        <input
          type="number"
          min="0"
          className={styles.input}
          onInput={(e) => { e.currentTarget.value = e.currentTarget.value.slice(0, 9); }}
          onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
          value={shipmentOrOrder?.destination?.zipCode ?? ''}
          onChange={(e) => {
            const value = e.target.value;
            if (value === '' || Number(value) > 0) {
              onUpdateDestination(service.idServiceItem,  { zipCode: parseInt(value), portCode: '', airportCode: '' }, idShipment);
            }
          }}
          disabled={isDisabled}
        />
      </div>
    </div>
  );

  // ── Bloque: Puerto / Aeropuerto (select) ──────────────────────────────────────

  const PortAirportOriginSelect = (
    <div className={styles.formGroup}>
      <label className={styles.label}>
        <span className={styles.required}>*</span>
        {originLabel}
      </label>
      <input
        list={originListId}
        className={styles.select}
        value={originPortAirportValue}
        disabled={isDisabled || loadingPorts}
        placeholder={loadingPorts ? t('app.loading')+"..."  : t('quote.select')}
        required
        onChange={(e) =>{ setErrorOrigin(""); updateOriginPortAirport(e.target.value)}}
        onBlur={(e) => {
          if(e.target.value.length == 0){            
            setErrorOrigin("Seleccione un elemento válido de la lista")            
            return;
          }
          const itemSelected = isAir ? 
          airportsOrigin.find((item) => item.airport_code === e.target.value.toUpperCase())
          : portsOrigin.find((item) => item.port_code === e.target.value.toUpperCase());

          if(!itemSelected) {
            updateOriginPortAirport("");
            setErrorOrigin('Seleccione un elemento valido');
            return;
          }
        }}
      />
      <datalist id={originListId} > 
        {isAir
          ? airportsOrigin.map((airport) => (
              <option key={airport._Id} value={airport.airport_code}>
                {airport.name_airport}
              </option>
            ))
          : portsOrigin.map((port) => (
              <option key={port._Id} value={port.port_code}>
                {port.name_port}
              </option>
            ))
        }
      </datalist>
       {errorOrigin && <div className={styles.fieldError}>{errorOrigin}</div>}
    </div>
  );

  const PortAirportDestinationSelect = (
    <div className={styles.formGroup}>
      <label className={styles.label}>
        {destinationRequired && (<span className={styles.required}>*</span>) }
        {destinationLabel}
      </label>
      <input
        list={destinationListId}
        className={styles.select}
        value={destinationPortAirportValue}
        disabled={isDisabled || loadingPorts}
        placeholder={loadingPorts ? t('app.loading')+"..."  : t('quote.select')}
        required={destinationRequired}
        onChange={(e) =>{ setErrorDestination(""); updateDestinationPortAirport(e.target.value)}}
        onBlur={(e) => {
          if(e.target.value.length == 0){
            setErrorDestination("Seleccione un elemento válido de la lista")
            return;
          }
          const itemSelected = isAir ? 
          airportsDestination.find((item) => item.airport_code === e.target.value.toLocaleUpperCase())
          : portsDestination.find((item) => item.port_code === e.target.value.toLocaleUpperCase());
          if(!itemSelected) {
            updateDestinationPortAirport("");
            setErrorDestination('Seleccione un elemento valido');
            return;
          }
        }}
      />
      <datalist id={destinationListId}  >      
        {isAir
          ? airportsDestination.map((airport) => (
              <option key={airport._Id} value={airport.airport_code}>
                 {airport.name_airport}
              </option>
            ))
          : portsDestination.map((port) => (
              <option key={port._Id} value={port.port_code}>
                {port.name_port}
              </option>
            ))
        }
      </datalist>
      {errorDestination && <div className={styles.fieldError}>{errorDestination}</div>}
    </div>
  );

  // ─── Layout según idTypeShipment ─────────────────────────────────────────────
  switch (true) {

    // 1 - Door To Door  |  Terrestres: FTL(3), LTL(4), FCL(10), LCL(11)
    case [3, 4, 10, 11].includes(service.idService) || shipmentOrOrder?.idTypeShipment === 1:
      return (
        <div className={styles.formGridCityZipcode}>
          {CityZipOrigin}
          {CityZipDestination}
        </div>
      );

    // 2 - Port To Port
    case shipmentOrOrder?.idTypeShipment === 2:
      return (
        <div className={styles.formGrid}>
          {PortAirportOriginSelect}
          {PortAirportDestinationSelect}
        </div>
      );

    // 3 - Door To Port
    case shipmentOrOrder?.idTypeShipment === 3:
      return (
        <div className={styles.formGridCityZipcode}>
          {CityZipOrigin}
          {PortAirportDestinationSelect}
        </div>
      );

    // 4 - Port To Door
    case shipmentOrOrder?.idTypeShipment === 4:
      return (
        <div className={styles.formGridCityZipcode}>
          {PortAirportOriginSelect}
          {CityZipDestination}
        </div>
      );    
    //5 - Una sola ubicacion para otros servicios que lo requieran: [x,x,x].includes(service.idService) {service.trafico? {cityZip, PuertoAirport}}

    default:
      return null;
  }
};

export default ZipCodesOriginDestination;
