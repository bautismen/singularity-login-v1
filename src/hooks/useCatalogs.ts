import { useState, useEffect } from 'react';
import { catalogService } from '../services/catalogsService';
import { getCustomers } from '../services/customerService';
import { getExecutivesByDepartment } from '../services/executiveService';
import { Container } from '../types/container';

export const useCatalogs = () => {

  const [loadingCatalogs, setloadingCatalogs] = useState(false);
  const [customers, setCustomers]                   = useState<any[]>([]);
  const [requestTypes, setRequestTypes]             = useState<any[]>([]);
  const [availableServices, setAvailableServices]   = useState<any[]>([]);
  const [availableContainers, setAvailableContainers] = useState<Container[]>([]);
  const [availableExecutives, setAvailableExecutives] = useState<any[]>([]);
  const [incoterms, setIncoterms]                   = useState<any[]>([]);
  const [countries, setCountries]                   = useState<any[]>([]);
  const [imoList, setImoList]                       = useState<any[]>([]);

  // ── Carga principal al montar ────────────────────────────────────────────────
  useEffect(() => {
    loadCatalogs();
  }, []);

  const loadCatalogs = async () => {
    try {
      setloadingCatalogs(true);
      const [customersData, requestTypesData, servicesData, executivesData, incotermsData, countriesData] =
        await Promise.all([
          getCustomers(true),
          catalogService.getTypeRequests(),
          catalogService.getServices(),
          getExecutivesByDepartment('Pricing'),
          catalogService.getIncoterms(),
          catalogService.getCountries(),
        ]);

      setCustomers(customersData.filter((c: any) => c.status === 1 || c.dataState === 1));
      setRequestTypes(requestTypesData.data.filter((r: any) => r.status === 1));
      setAvailableServices(servicesData.data.filter((s: any) => s.status === 1));
      setAvailableExecutives(executivesData.filter((e: any) => e.estado === 1 && e.activo === true));
      setIncoterms(incotermsData.data.filter((i: any) => i.status === 1));
      setCountries(countriesData.data.filter((co: any) => co.status === 1));
    } catch {
      throw new Error('loadCatalogs');
    } finally {
      setloadingCatalogs(false);
    }
  };

  // ── Carga lazy de IMOs (solo cuando se abre el modal de mercancía) ───────────
  const loadImos = async () => {
    if (imoList.length > 0) return; // ya cargados
    try {
      const resultImos = await catalogService.getImos();
      setImoList(resultImos.data.filter((imo: any) => imo.status === 1));
    } catch {
      throw new Error('loadImos');
    }
  };

  // ── Carga lazy de contenedores (solo cuando se abre el modal) ───────────────
  const loadContainers = async () => {
    if (availableContainers.length > 0) return; // ya cargados
    try {
      const resultContainers = await catalogService.getContainers();
      setAvailableContainers([...resultContainers.data]);
    } catch {
      throw new Error('loadContainers');
    }
  };

  /*const setContainers = (containers: Container[]) => {
    setAvailableContainers(containers);
  };*/

  return {
    // estado
    loadingCatalogs,
    customers,
    requestTypes,
    availableServices,
    availableContainers,
    availableExecutives,
    incoterms,
    countries,
    imoList,
    // acciones
    loadImos,
    loadContainers,
  };
};