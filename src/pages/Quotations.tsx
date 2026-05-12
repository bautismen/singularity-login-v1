import { useState, useEffect, useRef } from "react";
import {  
  Plus,
  X,
  RotateCcw,
  Save,
  ArrowLeft,
  User,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";
import { Modal } from "../components/Modal";
import { ExecutiveModal } from "../components/requestQuotation/modals/ExecutiveModal"
import { MerchandiseModal } from "../components/requestQuotation/modals/MerchandiseModal"
import { GeneralDataSection } from "../components/requestQuotation/GeneralDataSection"
import { ExecutivesSection } from "../components/requestQuotation/ExecutivesSection"
import { ServiceCard } from "../components/requestQuotation/ServiceCard"
import { quotationService } from "../services/quotationService";
import { updateStatusQuotedRatebyRequestQuotation } from "../services/quotedRateServices";
import styles from "./Quotations.module.css";
import {
  QuotationRequest,
  Service,
  Executive,
  //Shipment,
  Cargo,
  ContainerRequest,
  StatusRequestQuotation,
  StatusRequestQuotationLabel,
} from "../types/requestQuotation";
import { pricingControlService } from "../services/pricingControlService";
import { useCatalogs } from "../hooks/useCatalogs";
import { useRequestQuotationForm } from "../hooks/useRequestQuotationForm";
import { useServices } from "../hooks/useServices";
import { useMerchandise } from "../hooks/useMerchandise";

interface QuotationsProps {
  mode?: "create" | "edit" | "view";
  quotationId?: string | null;
  onBack?: (newId?: string) => void;
}

export function Quotations({ mode = "create", quotationId, onBack }: QuotationsProps) {

  const { t } = useLanguage();
  const { user } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const { showSuccess, showError, showWarning } = useNotification();  
  // Hooks
  const {
    loadingCatalogs,    
    customers,
    requestTypes,
    availableServices,
    availableContainers,
    availableExecutives,
    incoterms, 
    countries,
    imoList,
    loadImos,
    loadContainers
  } = useCatalogs(); 
  const { merchandiseForm , showMerchandiseModal, showPackagingModal, editingMerchandise, 
    currentServiceIdMerch, currentPackages, useMetricSystem, byUnitsMerch, classificationFlags,
    openMerchandiseModal, closeMerchandiseModal, setMerchandiseForm, setUseMetricSystem, setByUnitsMerch, setClassificationFlags,
    openPackagingModal, closePackagingModal, addPackage, removePackage, calculateTotals, buildMerchandise }=  useMerchandise();
  const { formData, updateRequestFormData, resetRequestFormData, setRequestFormData } = useRequestQuotationForm({mode});
  const { services, projectionShipmentState,
    addService, removeService, duplicateService, updateService, setAllServices,
    updateShipment, updateOrderService, updateOrigin, updateDestination,
    handleTypeOperationChange, handleIncotermChange, handleTypeShipmentChange,
    updateProjectionShipment, handleProjectionShipmentState,
    updateServicesAssociated, updateContainersShipment,
    updateContainersQuantityShipment, removeMerchandise, saveMerchandise} = useServices(); 
  //estado local
  const [loading, setLoading] = useState(false);
  const isLoading = loading || loadingCatalogs;
  const [loadingContainers, setLoadingContainers] = useState(false);
  const [saving, setSaving] = useState(false);
  //const [services, setServices] = useState<Service[]>([]);
  const [containers, setContainers] = useState<ContainerRequest[]>([]);
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: "info" | "warning" | "error" | "success" | "confirm";
    title: string;
    message: string;
    onConfirm?: () => void;
    onNoAction?: () => void;
    showCancel?: boolean;
    showNoAction?: boolean;
  }>({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });
  //const [customers, setCustomers] = useState<any[]>([]);
  //const [requestTypes, setRequestTypes] = useState<any[]>([]);
  //const [availableServices, setAvailableServices] = useState<any[]>([]);
  //const [availableContainers, setAvailableContainers] = useState<Container[]>([],);
  //const [availableExecutives, setAvailableExecutives] = useState<any[]>([]);
  //const [incoterms, setIncoterms] = useState<any[]>([]);
  //const [countries, setCountries] = useState<any[]>([]);
  //const [imoList, setImoList] = useState<any[]>([]);
  //const [showMerchandiseModal, setShowMerchandiseModal] = useState(false);
  //const [editingMerchandise, setEditingMerchandise] = useState<Cargo | null>(null,);
  const [currentServiceId, setCurrentServiceId] = useState<number | null>(null);
  const [showContainersModal, setShowContainersModal] = useState(false);
  const [showExecutiveModal, setShowExecutiveModal] = useState(false);
  const [showCancelQuotationRequestModal, setShowCancelQuotationRequestModal] = useState(false);
  const [showRejectQuotationRequestModal, setShowRejectQuotationRequestModal] = useState(false);
  /*const [merchandiseForm, setMerchandiseForm] = useState<Cargo>({
    merchandiseName: "",
    merchandiseDescription: "",
    classification: [],
    stowable: 0,
    shipmentTypeCargo: "",
    idUnitMeasurement: 1,
    unitMeasurement: "cm",
    idUnitWeight: 1,
    unitWeight: "kg",
    volumeTotal: 0,
    weigthTotal: 0,
    units: [],
  });
  const [showPackagingModal, setShowPackagingModal] = useState(false);
  //const [currentPackages, setCurrentPackages] = useState<any[]>([]); 
  //const [useMetricSystem, setUseMetricSystem] = useState(true);
  //const [projectionShipmentState, setProjectionShipmentState] = useState<{[key: number]: boolean;}>({});
  const [classificationMerchFlags, setClassificationMerchFlags] = useState({
    showDangerouseMerch: false,
    showRefrigeratedMerch: false,
    showOversizedMerch: false,
    showBulkClassMerch: false,
    showGeneralMerch: false,
  });
  const [byUnitsMerch, setByUnitsMerch] = useState(true);
  const [formData, setFormData] = useState({
    referenceRequest: "QR...",
    customerId: "",
    client: "",
    prospect: "",
    showProspect: false,
    isPriority: false,
    isLicitation: false,
    customerCategory: 1,
    requestTypeId: 0,
    requestType: "",
    created: new Date().toISOString().split("T")[0],
    responseDeadline: "",
    statuscomments: null,
    idStatusRequest: StatusRequestQuotation.Creada,
  }); */
  //Roles
  const rolPricing = ["pricing"]; // Roles que puuedo ir agregando para validar los botones del menu/admin
  const isPricingUser = user?.roles?.every(() => true) && rolPricing.every((v) => user?.roles?.includes(v));

  useEffect(() => {
    if (mode !== "create" && quotationId) {
      loadQuotation(quotationId);
    } else if (mode === "create") {
      
      updateRequestFormData({
        ...formData,
        responseDeadline: calculateDateResponseDeadline()
          .toISOString()
          .split("T")[0],
      });
      
    }
  }, [mode, quotationId]);

  const resetForm = () => {
    resetRequestFormData();
    setAllServices([])
    /*setFormData({
      referenceRequest: "QR...",
      customerId: "",
      client: "",
      prospect: "",
      showProspect: false,
      isPriority: false,
      isLicitation: false,
      customerCategory: 1,
      requestTypeId: 0,
      requestType: "",
      created: new Date().toISOString().split("T")[0],
      responseDeadline: calculateDateResponseDeadline()
        .toISOString()
        .split("T")[0],
      statuscomments: null,
      idStatusRequest: 1,
    });
    setServices([]);*/    
  };

  /*const loadImos = async () => {
    try {
      const resultImos = await catalogService.getImos();
      setImoList(resultImos.data.filter((imo: any) => imo.status === 1));
    } catch (error) {
      showError(t("quote.errors.loadCatalogs"));
    }
  };*/

  /*const loadCatalogs = async () => {
    try {
      setLoading(true);
      const customersData = await getCustomers(true);
      const requestTypesData = await catalogService.getTypeRequests();
      const servicesData = await catalogService.getServices();
      const executivesData = await getExecutivesByDepartment("Pricing");
      const incotermsData = await catalogService.getIncoterms();
      const countriesData = await catalogService.getCountries();

      setCustomers(
        customersData.filter((c: any) => c.status === 1 || c.dataState === 1),
      );
      setRequestTypes(requestTypesData.data.filter((r: any) => r.status === 1));
      setAvailableServices(
        servicesData.data.filter((s: any) => s.status === 1),
      ); // && s.category === 1));
      setAvailableExecutives(
        executivesData.filter((e: any) => e.estado === 1 && e.activo === true),
      );
      setIncoterms(incotermsData.data.filter((i: any) => i.status === 1));
      setCountries(countriesData.data.filter((co: any) => co.status === 1));

      console.log(executivesData);
    } catch (error) {
      //console.error('Error loading catalogs:', error);
      showError(t("quote.errors.loadCatalogs"));
    } finally {
      setLoading(false);
    }
  };*/

  /*const loadPortsAirports = async (
    isPort: boolean,
    id_Country: string = "",
  ) => {
    try {
      if (id_Country !== "") {
        if (isPort) {
          const resultPorts =
            await catalogService.getPortsByIdCountry(id_Country);
          console.log("Ports", resultPorts);
          return resultPorts;
        } else {
          const resultAirports =
            await catalogService.getAirportsByIdCountry(id_Country);
          console.log("Airports", resultAirports);
          return resultAirports;
        }
      }
    } catch (error) {
      showError(t("quote.errors.loadCatalogs"));
      console.log(error);
    }
  };*/

  const loadQuotation = async (id: string) => {
    try {
      setLoading(true)
      const data = await quotationService.getById(id);
      setRequestFormData(data.data);
      /* setFormData({
        referenceRequest: data.data.referenceRequest || "",
        customerId: data.data.customer.idCustomer || "",
        client: data.data.customer.customerName || "",
        prospect: data.data.customer.prospectName || "",
        showProspect: data.data.customer.prospectName ? true : false,
        isPriority: data.data.priority === 1 ? true : false,
        isLicitation: data.data.licitation === 1 ? true : false,
        customerCategory: data.data.customer.customerCategory || 1,
        requestTypeId: data.data.idRequestType.toString() || 1,
        requestType: data.data.typeRequest || "",
        created: data.data.dateRequest
          ? new Date(data.data.dateRequest).toISOString().split("T")[0]
          : "",
        responseDeadline: data.data.dateDeadline
          ? new Date(data.data.dateDeadline).toISOString().split("T")[0]
          : "",
        statuscomments: data.data.statusComment || null,
        idStatusRequest: data.data.idStatusRequest || 1,
      });*/

      if (data.data.services && data.data.services.length > 0) {
        setAllServices(data.data.services);
        /*const loadedServices = data.data.services.map(
          (service: any, idx: number) => {
            return {
              idServiceItem: idx + 1,
              idService: service.idService,
              nameService: service.nameService || "",
              used: service.used || false,
              shipments: service.shipments.map((shipment: any) => {
                if ("projectionShipment" in shipment) {
                  setProjectionShipmentState((prev) => ({
                    ...prev,
                    [service.idServiceItem]: true,
                  }));
                }
                if ("containers" in shipment) {
                  setContainers(shipment.containers);
                }
                return shipment;
              }),
            };
          },
        );
        setServices(loadedServices);*/
      }

      if (data.data.assignedTo && data.data.assignedTo.length > 0) {
        setExecutives(data.data.assignedTo.map(
          (exec: Executive) => ({
            idEmployee: exec.idEmployee,
            nameEmployee: exec.nameEmployee || "",
            idUser: exec.idUser || "",
          }),
        ));
      }
    } catch (error) {
      //console.error('Error loading quotation:', error);
      showError(t("quote.errors.loadQuotation"));
    } finally {
      setLoading(false);
    }    
  };

  /*const addService = () => {
    const newService: Service = {
      idServiceItem: services.length + 1,
      idService: 0,
      nameService: "",
      used: false,
      shipments: [
        {
          idShipment: 1,
          origin: "",
          destination: "",
          idTypeShipment: 0,
          typeShipment: "",
          idTypeOperation: 0,
          typeOperation: "",
          idIncoterm: 0,
          incoterm: "",
          departureDateAproximate: "",
          projectionShipment: "",
          comments: "",
          servicesAsociated: [],
          cargo: [],
        },
      ],
    };
    setServices([...services, newService]);
  };*/

  /*const removeService = (idServiceItem: number) => {
    setServices(
      services.filter((service) => service.idServiceItem !== idServiceItem),
    );
  };*/

  /*const removeMerchandise = (serviceId: number, merchandise: Cargo) => {
    setServices(
      services.map((service) => {
        if (service.idServiceItem === serviceId) {
          return {
            ...service,
            shipments: service.shipments.map((shipment) =>
              shipment.idShipment === 1
                ? {
                    ...shipment,
                    cargo: shipment.cargo.filter(
                      (merch) => merch !== merchandise,
                    ),
                  }
                : shipment,
            ),
          };
        }
        return service;
      }),
    );
  };*/

  const removeExecutive = (id: string) => {
    setExecutives(
      executives.filter((executive) => executive.idEmployee !== id),
    );
  };

  const openMerchandiseModalForm = (service: Service, cargo?: Cargo) => {
    /*setCurrentServiceId(service.idServiceItem);
    setByUnitsMerch([2, 3, 10].includes(service.idService) ? false : true);
    setEditingMerchandise(cargo || null);
    setClassificationMerchFlags({
      showDangerouseMerch: false,
      showRefrigeratedMerch: false,
      showOversizedMerch: false,
      showBulkClassMerch: false,
      showGeneralMerch: false,
    });*/

    if (imoList.length === 0) {
      loadImos();
    }
    openMerchandiseModal(service, cargo);
    /*if (cargo) {
      setByUnitsMerch(cargo?.units?.length === 0 ? false : true);
      setUseMetricSystem(cargo?.idUnitMeasurement === 1 ? true : false);
      setClassificationMerchFlags({
        showDangerouseMerch: cargo?.classification.some(
          (classification) => classification.idClassificationMerchandise === 7,
        ),
        showRefrigeratedMerch: cargo?.classification.some(
          (classification) => classification.idClassificationMerchandise === 10,
        ),
        showOversizedMerch: cargo?.classification.some(
          (classification) => classification.idClassificationMerchandise === 8,
        ),
        showBulkClassMerch: cargo?.classification.some(
          (classification) => classification.idClassificationMerchandise === 5,
        ),
        showGeneralMerch: cargo?.classification.some(
          (classification) => classification.idClassificationMerchandise === 11,
        ),
      });

      setMerchandiseForm({
        merchandiseName: cargo.merchandiseName,
        merchandiseDescription: cargo.merchandiseDescription || "",
        classification: cargo.classification,
        stowable: cargo.stowable,
        shipmentTypeCargo: cargo.shipmentTypeCargo,
        idUnitMeasurement: cargo.idUnitMeasurement || useMetricSystem ? 1 : 2,
        unitMeasurement: cargo.unitMeasurement || useMetricSystem ? "cm" : "in",
        idUnitWeight: cargo.idUnitWeight || useMetricSystem ? 1 : 2,
        unitWeight: cargo.unitWeight || useMetricSystem ? "kg" : "lb",
        volumeTotal: cargo.volumeTotal,
        weigthTotal: cargo.weigthTotal,
        units: cargo.units,
      });

      setCurrentPackages(cargo.units || []);
    } else {
      setMerchandiseForm({
        merchandiseName: "",
        merchandiseDescription: "",
        classification: [],
        stowable: 0,
        shipmentTypeCargo: "",
        idUnitMeasurement: 1,
        unitMeasurement: "cm",
        idUnitWeight: 1,
        unitWeight: "kg",
        volumeTotal: 0,
        weigthTotal: 0,
        units: [],
      });

      setCurrentPackages([]);
    }
    setShowMerchandiseModal(true);*/

  };
 /*
  const closeMerchandiseModal = () => {
    setShowMerchandiseModal(false);
    setByUnitsMerch(true);
    setClassificationMerchFlags({
      showDangerouseMerch: false,
      showRefrigeratedMerch: false,
      showOversizedMerch: false,
      showBulkClassMerch: false,
      showGeneralMerch: false,
    });
    setEditingMerchandise(null);
    setCurrentServiceId(null);
  };

  const openPackagingModal = () => {
    setShowPackagingModal(true);
  };

  const closePackagingModal = () => {
    setShowPackagingModal(false);
  };

  const addPackage = (pkg: any) => {
    setCurrentPackages([
      ...currentPackages,
      {
        ...pkg,
        id: Date.now(),
        //unit: useMetricSystem ? 'metric' : 'imperial'
      },
    ]);
    closePackagingModal();
  };

  const removePackage = (packageId: any) => {
    setCurrentPackages(currentPackages.filter((p) => p !== packageId));
  };

  const calculateTotals = () => {
    let totalVolume = 0;
    let totalWeight = 0;

    currentPackages.forEach((pkg) => {
      const volume = pkg.length * pkg.height * pkg.width * pkg.quantity;
      const weight = pkg.weight * pkg.quantity;
      totalVolume += volume;
      totalWeight += weight;
    });

    return {
      totalVolume: Number(totalVolume.toFixed(2)),
      totalWeight: Number(totalWeight.toFixed(2)),
    };
  }; */

  const saveMerchandiseForm = () => {
    //if (!currentServiceId) return;
    console.log(currentServiceId, currentServiceIdMerch)
    if(!currentServiceIdMerch) return;

    /*if (!merchandiseForm?.merchandiseName.trim()) {
      showWarning(t("quote.warnings.merchandiseName"));
      return;
    }
    if(byUnitsMerch && currentPackages.length === 0){
       showWarning(t('quote.warnings.merchandisePackages'));
       return;
    }
    if(!byUnitsMerch  && 
      (merchandiseForm.volumeTotal == 0 || isNaN(merchandiseForm.volumeTotal) || 
      merchandiseForm.weigthTotal == 0 || isNaN(merchandiseForm.weigthTotal) ) ){
      showWarning(t('quote.warnings.merchandiseVolumenAndWeight'));
      return;
    }

    const dangerous = merchandiseForm.classification?.find(
      (c) => c.idClassificationMerchandise === 7,
    );

    if (
      dangerous &&
      (dangerous?.imo == null ||
        dangerous?.imoDescription == undefined ||
        dangerous?.un == null ||
        dangerous?.un == "")
    ) {
      showWarning(t("quote.warnings.IMOUN"));
      return;
    }

    const refrigerated = merchandiseForm.classification?.find(
      (c) => c.idClassificationMerchandise === 10,
    );
    if (refrigerated && refrigerated?.temperature == null) {
      showWarning(t("quote.warnings.temperature"));
      return;
    }

    const { totalVolume = 0, totalWeight = 0 } = calculateTotals();

    if (merchandiseForm.classification.length === 0) {
      merchandiseForm.classification.push({
        idClassificationMerchandise: 11,
        classificationMerchandise: "General",
      });
    }

    const newMerchandise: Cargo = {
      merchandiseName: merchandiseForm.merchandiseName,
      merchandiseDescription: merchandiseForm.merchandiseDescription,
      stowable: merchandiseForm.stowable,
      shipmentTypeCargo: merchandiseForm.shipmentTypeCargo,
      idUnitMeasurement: useMetricSystem ? 1 : 2,
      unitMeasurement: useMetricSystem ? "cm" : "in",
      idUnitWeight: useMetricSystem ? 1 : 2,
      unitWeight: useMetricSystem ? "kg" : "lb",
      volumeTotal: byUnitsMerch ? totalVolume : merchandiseForm.volumeTotal,
      weigthTotal: byUnitsMerch ? totalWeight : merchandiseForm.weigthTotal,
      ...(currentPackages && {
        units: currentPackages?.map((pkg) => ({
          ...pkg,
        })),
      }),
      classification: merchandiseForm.classification,
    };*/
    const newMerchandise = buildMerchandise();
    if(typeof newMerchandise === "string") {
      showWarning(t(newMerchandise))
      return;
    }else {
      saveMerchandise(currentServiceIdMerch, newMerchandise, editingMerchandise);
    }
    console.log(services, newMerchandise);
   
    /*setServices(
      services.map((service) => {
        if (service.idServiceItem === currentServiceId) {
          if (editingMerchandise) {
            return {
              ...service,
              shipments: service.shipments.map((shipment) =>
                shipment.idShipment === 1
                  ? {
                      ...shipment,
                      cargo: shipment.cargo.map((merch) =>
                        merch === editingMerchandise ? newMerchandise : merch,
                      ),
                    }
                  : shipment,
              ),
            };
          } else {
            return {
              ...service,
              shipments: service.shipments.map((shipment) =>
                shipment.idShipment === 1
                  ? {
                      ...shipment,
                      cargo: [...service.shipments[0].cargo, newMerchandise],
                    }
                  : shipment,
              ),
            };
          }
        }
        return service;
      }),
    );*/

    /*setMerchandiseForm({
      merchandiseName: "",
      merchandiseDescription: "",
      classification: [],
      stowable: 0,
      shipmentTypeCargo: "",
      idUnitMeasurement: 0,
      unitMeasurement: "",
      idUnitWeight: 0,
      unitWeight: "",
      volumeTotal: 0,
      weigthTotal: 0,
      units: [],
    });*/

    closeMerchandiseModal();
  };

  const openExecutiveModal = () => {
    setShowExecutiveModal(true);
  };

  const closeExecutiveModal = () => {
    setShowExecutiveModal(false);
  };

  const addExecutive = (executive: Executive) => {
    const isAlreadyAdded = executives.some(
      (e) => e.idEmployee === executive.idEmployee,
    );
    if (!isAlreadyAdded) {
      setExecutives([...executives, executive]);
    }
    closeExecutiveModal();
  };

  const openContainerModal = async (
    idServiceItem: number,
    containersInShipment: ContainerRequest[],
  ) => {
    setLoadingContainers(true);
    setShowContainersModal(true);
    setCurrentServiceId(idServiceItem);
    setContainers(containersInShipment);
    try {
      if (availableContainers.length === 0) {
        loadContainers();
        //const resultContainers = await catalogService.getContainers();
        //setAvailableContainers([...resultContainers.data]);
      }
    } catch (error) {
      showError(t("quote.errors.loadCatalogs"));
    } finally {
      setLoadingContainers(false);
    }
  };

  /*const duplicateService = (idServiceItem: number) => {
    const serviceToDuplicate = services.find(
      (service) => service.idServiceItem === idServiceItem,
    );
    if (serviceToDuplicate) {
      const newService = {
        ...serviceToDuplicate,
        idServiceItem: services.length + 1,
      };
      setServices([...services, newService]);
      setProjectionShipmentState((prevState) => {
        const currentValue = prevState[services.length + 1] ?? false;
        return {
          ...prevState,
          [services.length + 1]: !currentValue,
        };
      });
    }
  };*/

  /*const updateService = (id: number, changes: Record<any, any>) => {
    setServices(
      services.map((service) =>
        service.idServiceItem === id
          ? {
              ...service,
              ...changes,
            }
          : service,
      ),
    );
  }; */

  /*const updateShipment = (
    idServiceItem: number,
    idShipment: number,
    field: keyof Shipment,
    value: any,
  ) => {
    setServices(
      services.map((service) =>
        service.idServiceItem === idServiceItem
          ? {
              ...service,
              shipments: service.shipments.map((shipment) =>
                shipment.idShipment === idShipment
                  ? {
                      ...shipment,
                      [field]: value,
                    }
                  : shipment,
              ),
            }
          : service,
      ),
    );
  };*/

  /*const handleTypeOperationChange = (
    idServiceItem: number,
    idShipment: number,
    value: number,
    text: string,
  ) => {
    setServices(
      services.map((service) =>
        service.idServiceItem === idServiceItem
          ? {
              ...service,
              shipments: service.shipments.map((shipment) =>
                shipment.idShipment === idShipment
                  ? {
                      ...shipment,
                      idTypeOperation: value,
                      typeOperation: text,
                    }
                  : shipment,
              ),
            }
          : service,
      ),
    );

    if ([3, 4].includes(value)) {
      handleIncotermChange(idServiceItem, idShipment, 13, "N/A");
    }
  };*/

  /*const updateOrigin = (
    idServiceItem: number,
    idShipment: number,
    changes: Record<any, any>,
  ) => {
    setServices(
      services.map((service) =>
        service.idServiceItem === idServiceItem
          ? {
              ...service,
              shipments: service.shipments.map((shipment) =>
                shipment.idShipment === idShipment
                  ? {
                      ...shipment,
                      origin: {
                        ...shipment.origin,
                        ...changes,
                      },
                    }
                  : shipment,
              ),
            }
          : service,
      ),
    );
  };*/

  /*const updateDestination = (
    idServiceItem: number,
    idShipment: number,
    changes: Record<any, any>,
  ) => {
    setServices(
      services.map((service) =>
        service.idServiceItem === idServiceItem
          ? {
              ...service,
              shipments: service.shipments.map((shipment) =>
                shipment.idShipment === idShipment
                  ? {
                      ...shipment,
                      destination: {
                        ...shipment.destination,
                        ...changes,
                      },
                    }
                  : shipment,
              ),
            }
          : service,
      ),
    );
  };*/

  /*const updateContainersShipment = (
    idServiceItem: number,
    idShipment: number,
    containerUpdate: ContainerRequest,
  ) => {
    //console.log('update',idServiceItem,containerUpdate)
    setServices(
      services.map((service) =>
        service.idServiceItem === idServiceItem
          ? {
              ...service,
              shipments: service.shipments.map((shipment) => {
                if (shipment.idShipment !== idShipment) return shipment;

                const currentContainers = shipment.containers ?? [];
                const exists = currentContainers.some(
                  (currCont) =>
                    currCont.idContainer === containerUpdate.idContainer,
                );

                return {
                  ...shipment,
                  containers: exists
                    ? currentContainers.filter(
                        (cont) =>
                          cont.idContainer !== containerUpdate.idContainer,
                      )
                    : [...currentContainers, containerUpdate],
                };
              }),
            }
          : service,
      ),
    );

    setShowContainersModal(false);
  };*/

  /*const updateContainersQuantityShipment = (
    idServiceItem: number,
    idShipment: number,
    idContainer: number,
    changes: Record<any, any>,
  ) => {
    setServices(
      services.map((service) =>
        service.idServiceItem === idServiceItem
          ? {
              ...service,
              shipments: service.shipments.map((shipment) => {
                if (shipment.idShipment !== idShipment) return shipment;
                const currentContainers = shipment.containers ?? [];
                const exists = currentContainers.some(
                  (currCont) => currCont.idContainer === idContainer,
                );
                return {
                  ...shipment,
                  containers: currentContainers.map((contain) =>
                    contain.idContainer === idContainer
                      ? {
                          ...contain,
                          ...changes,
                        }
                      : contain,
                  ),
                };
              }),
            }
          : service,
      ),
    );
  };*/

  /*const updateProjectionShipment = (
    idServiceItem: number,
    idShipment: number,
    changes: Record<any, any>,
  ) => {
    setServices(
      services.map((service) =>
        service.idServiceItem === idServiceItem
          ? {
              ...service,
              shipments: service.shipments.map((shipment) =>
                shipment.idShipment === idShipment
                  ? {
                      ...shipment,
                      projectionShipment: {
                        ...shipment.projectionShipment,
                        ...changes,
                      },
                    }
                  : shipment,
              ),
            }
          : service,
      ),
    );
  };*/

  /*const updateServicesAssociated = (
    idServiceItem: number,
    idShipment: number,
    serviceAsociated: any,
  ) => {
    setServices(
      services.map((service) =>
        service.idServiceItem === idServiceItem
          ? {
              ...service,
              shipments: service.shipments.map((shipment) => {
                if (shipment.idShipment !== idShipment) return shipment;

                const currentServices = shipment.servicesAsociated ?? [];
                const exists = currentServices.some(
                  (s) =>
                    s.idServiceAsociated ===
                    serviceAsociated.idServiceAsociated,
                );

                return {
                  ...shipment,
                  servicesAsociated: exists
                    ? currentServices.filter(
                        (serv) =>
                          serv.idServiceAsociated !==
                          serviceAsociated.idServiceAsociated,
                      )
                    : [...currentServices, serviceAsociated],
                };
              }),
            }
          : service,
      ),
    );
  };*/

  /*const handleIncotermChange = (
    idServiceItem: number,
    idShipment: number,
    value: number,
    text: string,
  ) => {
    //console.log(value, text);
    setServices((prevServices) =>
      prevServices.map((service) =>
        service.idServiceItem === idServiceItem
          ? {
              ...service,
              shipments: service.shipments.map((shipment) =>
                shipment.idShipment === idShipment
                  ? {
                      ...shipment,
                      idIncoterm: value,
                      incoterm: text,
                    }
                  : shipment,
              ),
            }
          : service,
      ),
    );
  };*/

  /*const handleTypeShipmentChange = (
    idServiceItem: number,
    idShipment: number,
    value: number,
    text: string,
  ) => {
    setServices((prevServices) =>
      prevServices.map((service) =>
        service.idServiceItem === idServiceItem
          ? {
              ...service,
              shipments: service.shipments.map((shipment) =>
                shipment.idShipment === idShipment
                  ? {
                      ...shipment,
                      idTypeShipment: value,
                      typeShipment: text,
                    }
                  : shipment,
              ),
            }
          : service,
      ),
    );
  };*/

  /*const handleProjectionShipmentState = (idServiceItem: number) => {
    setProjectionShipmentState((prevState) => {
      const currentValue = prevState[idServiceItem] ?? false;
      return {
        ...prevState,
        [idServiceItem]: !currentValue,
      };
    });
  };*/

  const handleStatusUpdate = async (statusId: number, statusName: string) => {
    if(saving) return;
    try {
      setSaving(true);
      const quotationRequestData = {
        IdRequest: quotationId,
        IdStatusRequest: statusId,
        StatusRequest: statusName,
        statusComment:
          statusId === 10
            ? (
                document.getElementById(
                  "comments-cancelation",
                ) as HTMLInputElement
              ).value
            : statusId === 9
              ? (
                  document.getElementById(
                    "comments-rejection",
                  ) as HTMLInputElement
                ).value
              : "",
      };
      if (quotationId) {
        await quotationService.changeStatus(quotationRequestData);
        if (statusId === 8) {  // Aceptada         
          await pricingControlService.AcceptControl(quotationId);
          await updateStatusQuotedRatebyRequestQuotation(quotationId, 5);
        } else if (statusId === 9) { //rechazada
          await pricingControlService.RejectControl(quotationId, quotationRequestData.statusComment);
          await updateStatusQuotedRatebyRequestQuotation(quotationId, 6);
        }       
        showSuccess(
          t("quote.success.statusUpdated").replace("{status}", statusName),
        );
      }

      if (onBack) {
        onBack();
      }
    } catch (error) {
      //console.error('Error updating quotation status:', error);
      showError(t("quote.errors.updateStatus"));
    } finally {
      setSaving(false);
    }
  };

  const handleAsignateto = async () => {
    try {
      setSaving(true);
      const quotationData = {
        IdRequest: quotationId,
        Employees: executives.map((exec) => ({
          IdExecutive: exec.idEmployee,
          FullName: exec.nameEmployee,
          IdUser: exec.idUser,
          //control_number: 'SN',
        })),
      };

      if (quotationData.Employees.length === 0) {
        showError(t("quote.noExecutivesTitle"));
        return;
      }

      if (quotationId) {
        await quotationService.asignateExecutive(quotationData);
        showSuccess(t("quote.executiveAssigned"));
      }

      if (onBack) {
        onBack();
      }
    } catch (error) {
      //console.error('Error updating quotation status:', error);
      showError(t("quote.errors.executivesAssingned"));
    } finally {
      setSaving(false);
    }
  };

  const handleSendQuotation = async ()  => {
    let answer = "";
    if(executives.some((ex)=> ex.idUser === user?._id) === false) {
      answer = await autoAsignationRequestQuotation();
    }       
    //const answer = await autoAsignationRequestQuotation();
    if(answer === "confirm") {
      handleAsignateto() 
    }
    else { 
      handleStatusUpdate(2, "Enviada");
    }
  };

  const handleAcceptQuotation = () => {
    handleStatusUpdate(8, "Aceptada");
  };

  const handleCancelQuotation = () => {

    setModalState({
      isOpen: true,
      type: "confirm",
      title: "Está a punto de cancelar esta solicitud",
      message: "¿Desea continuar con la cancelación?",
      showCancel: true,
      onConfirm: async () => {
        setShowCancelQuotationRequestModal(true);
      },
    });
  };

  const handleRejectQuotation = () => {
    setModalState({
      isOpen: true,
      type: "confirm",
      title: "Está a punto de rechazar la cotización",
      message: "¿Desea continuar con el rechazo?",
      showCancel: true,
      onConfirm: async () => {
        setShowRejectQuotationRequestModal(true);
      },
    });
  };

  const autoAsignationRequestQuotation = () : Promise<'confirm' | 'reject'> => { 
    return new Promise((resolve) => {
      const iExecutive = availableExecutives.find(exec => exec._Iduser === user?._id)
      if (iExecutive) {
        setModalState({
          isOpen: true,
          type: 'confirm',
          title: 'Asignacion ejecutivo',
          message: '¿Desea asignarse esta solicitud a usted mismo?',
          showNoAction: true,
          onConfirm: async () => {
            executives.push({      
              idEmployee: iExecutive?._Id,            
              nameEmployee: iExecutive?.nombre + ' ' + iExecutive?.apellido_paterno + ' ' + iExecutive?.apellido_materno,
              idUser: iExecutive?._Iduser                 
            });
            resolve('confirm');
          },          
          onNoAction: async () => resolve('reject'),
        }); 
        return;    
      }
      resolve('reject');
    });     
  }

  const buildQuotationRequest = () => {
    const selectedCustomer = customers.find((c) => c.id === formData.customerId);
 
  // ── Helpers ──────────────────────────────────────────────────────────────────
    /** Construye el cargo común a shipments y serviceOrder */
    const buildCargo = (cargo: any[], idService: number) =>
      cargo.map((merchandise) => ({
        merchandiseName:        merchandise.merchandiseName,
        ...(merchandise.merchandiseDescription && {
          merchandiseDescription: merchandise.merchandiseDescription,
        }),
        classification:    merchandise.classification || [],
        stowable:          merchandise.stowable,
        shipmentTypeCargo: [2, 3, 10].includes(idService) ? 'Contenerizada' : 'Suelta',
        idUnitMeasurement: merchandise.idUnitMeasurement,
        unitMeasurement:   merchandise.unitMeasurement,
        idUnitWeight:      merchandise.idUnitWeight,
        unitWeight:        merchandise.unitWeight,
        volumeTotal:       merchandise.volumeTotal,
        weigthTotal:       merchandise.weigthTotal,
        ...(merchandise.units?.length > 0 && {
          units: merchandise.units.map((u: any) => ({
            quantity:    parseInt(u.quantity),
            length:      u.length,
            width:       u.width,
            height:      u.height,
            weight:      u.weight,
            idUnitCargo: u.idUnitCargo,
            unitCargo:   u.unitCargo,
          })),
        }),
    }));
 
    /** Construye el bloque de proyección — igual para shipment y serviceOrder */
    const buildProjection = (projection: any, idServiceItem: number) => {
      if (
        !projectionShipmentState[idServiceItem] ||
        !projection?.frecuency ||
        !projection?.idTypeMesurementFrecuency ||
        !projection?.measurementFrecuency ||
        !projection?.number
      ) return null;
  
      return {
        frecuency:                 projection.frecuency,
        idTypeMesurementFrecuency: projection.idTypeMesurementFrecuency,
        measurementFrecuency:      projection.measurementFrecuency,
        number:                    projection.number,
      };
    };
 
    /** Construye origin o destination con campos opcionales según idTypeShipment e idService */
    const buildLocation = (
      location:       any,
      idTypeShipment: number,
      idService:      number,
      side:           'origin' | 'destination'
    ) => {
      if (!location) return null;
  
      const isOriginPort      = side === 'origin'      && [2, 4].includes(idTypeShipment);
      const isDestinationPort = side === 'destination' && [2, 3].includes(idTypeShipment);
      const needsPort         = (isOriginPort || isDestinationPort) && [1, 2].includes(idService);
      const needsAirport      = (isOriginPort || isDestinationPort) && idService === 5;
      const needsCity         = [1, 3, 4].includes(idTypeShipment);
  
      return {
        idCountry:   location.idCountry,
        countryCode: location.countryCode,
        ...(needsCity     && location.city      && { city: location.city, zipCode: location.zipCode }),
        ...(needsPort     && location.portCode  && { portCode:    location.portCode    }),
        ...(needsAirport  && location.airportCode && { airportCode: location.airportCode }),
      };
    };
 
    /** Construye el bloque serviceOrder para servicios no-flete */
    const buildOrderService = (service: any) => {
      const order = service.serviceOrder ?? service.orderService;
      if (!order) return null;
  
      return {
        origin: {
            idCountry: service.orderService?.origin.idCountry,
            countryCode: service.orderService?.origin.countryCode,
            ...(service.orderService?.origin.city &&
              {
                city: service.orderService?.origin.city,
                zipCode: service.orderService?.origin.zipCode,
              }),
            ...(service.orderService?.origin.portCode &&
              {
                portCode: service.orderService?.origin.portCode,
              }),
            ...(service.orderService?.origin.airportCode &&
              {
                airportCode: service.orderService?.origin.airportCode,
              }),
        },
  
        ...(order.destination && 
          {
            destination: {
                idCountry:  service.orderService?.destination?.idCountry,
                countryCode:  service.orderService?.destination?.countryCode,
                ...( service.orderService?.destination.city &&
                  {
                    city:  service.orderService?.destination.city,
                    zipCode: service.orderService?.destination.zipCode,
                  }),
                ...( service.orderService?.destination.portCode &&
                  {
                    portCode:  service.orderService?.destination.portCode,
                  }),
                ...( service.orderService?.destination.airportCode &&
                  {
                    airportCode:  service.orderService?.destination.airportCode,
                  }),
            }          
          }
        ),
  
        ...(order.idTypeShipment  && { idTypeShipment:  order.idTypeShipment  }),
        ...(order.typeShipment    && { typeShipment:     order.typeShipment    }),
        ...(order.idTypeOperation && { idTypeOperation: order.idTypeOperation  }),
        ...(order.typeOperation   && { typeOperation:   order.typeOperation    }),
  
        departureDateAproximate: order.departureDateAproximate
          ? new Date(order.departureDateAproximate)
          : null,
  
        projectionShipment: buildProjection(order.projectionShipment, service.idServiceItem),
  
        ...(order.comments && { comments: order.comments }),
  
        cargo: buildCargo(order.cargo ?? [], service.idService),
      };
    };
  
    /** Construye el array de shipments para servicios de flete */
    const buildShipments = (service: any) =>
      (service.shipments ?? []).map((shipment: any, index: number) => ({
        idShipment: index + 1,
        origin:      buildLocation(shipment.origin,      shipment.idTypeShipment, service.idService, 'origin'),
        destination: buildLocation(shipment.destination, shipment.idTypeShipment, service.idService, 'destination'),
        idTypeShipment:  shipment.idTypeShipment,
        typeShipment:    shipment.typeShipment,
        idTypeOperation: shipment.idTypeOperation,
        typeOperation:   shipment.typeOperation,
        idIncoterm:      shipment.idIncoterm,
        incoterm:        shipment.incoterm,
        departureDateAproximate: shipment.departureDateAproximate
          ? new Date(shipment.departureDateAproximate)
          : null,
        ...(shipment.containers && [2, 3, 10].includes(service.idService) && {
          containers: shipment.containers,
        }),
        projectionShipment: buildProjection(shipment.projectionShipment, service.idServiceItem),
        comments: shipment.comments,
        ...(shipment.servicesAsociated?.length > 0 && {
          servicesAsociated: shipment.servicesAsociated,
        }),
        cargo: buildCargo(shipment.cargo ?? [], service.idService),
    }));
 
    // ── return principal ─────────────────────────────────────────────────────────
    return {
      referenceRequest: formData.referenceRequest,
      idStatusRequest:  formData.idStatusRequest,
      statusRequest:    StatusRequestQuotationLabel[formData.idStatusRequest],
      dateRequest:      new Date(formData.created),
      dateDeadline:     formData.isLicitation === false && formData.created
        ? calculateDateResponseDeadline()
        : new Date(formData.responseDeadline),
      idRequestType: formData.requestTypeId,
      typeRequest:   formData.requestType,
      priority:      formData.isPriority   ? 1 : 0,
      licitation:    formData.isLicitation ? 1 : 0,
      dateCreated:   new Date().toISOString(),
      dateUpdated:   new Date().toISOString(),
      createdBy: {
        idUser:       user?._id  || '',
        nameEmployee: user?.name || '',
        idEmployee:   null,
      },
      customer: formData.showProspect
        ? { prospectName: formData.prospect }
        : {
            idCustomer:       formData.customerId,
            customerName:     selectedCustomer?.fiscalData?.businessName,
            customerCategory: formData.customerCategory,
          },
      assignedTo: executives.map((exec) => ({
        idEmployee:   exec.idEmployee,
        nameEmployee: exec.nameEmployee,
        idUser:       exec.idUser,
      })),
      services: services.map((service, idx) => {
        const isFreight = service.shipments !== undefined;
        return {
          idServiceItem: idx + 1,
          idService:     service.idService,
          nameService:   service.nameService,
          ...(mode === 'create' && { used: false }),
          // Flete → shipments / Otros servicios → orderService
          ...(isFreight
            ? { shipments:    buildShipments(service)    }
            : { orderService: buildOrderService(service) }
          ),
        };
      }),
    };
  };

  const handleSaveQuotation = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      setSaving(true);

      const quotationData = buildQuotationRequest();
      console.log(JSON.stringify(quotationData, null, 2));
      if (quotationData.services.length == 0) {
        setModalState({
          isOpen: true,
          type: "warning",
          title: t("quote.serviceaddtitle"),
          message: t("quote.serviceaddmessage"),
          showCancel: false,
        });
        setSaving(false);
        return;
      }
      /*else 
        if(quotationData.services.find(service => service.shipments.find(ship => ship.cargo.length === 0)           
        && ![2, 3, 10].includes(service.idService) && console.log('idService',service.idService) )) { //mercancia es obligatoria si el servicio no es maritimo fcl, terr fcl y terr ftl
        
          setModalState({
          isOpen : true,
          type: 'warning',
          title: t('quote.merchaddtitle'),
          message: t('quote.merchaddmessage'),
          showCancel: false      
        });
        setSaving(false);
        return;
      } */

      await performSave(quotationData);
    } catch (error) {
      console.error('Error saving quotation:', error);
      showError(t("quote.errors.saveQuotation"));
    } finally {
      setSaving(false);
    }
  };

  const handleSendQuotationRequest = async () => {     
    setSaving(true);   
    if(!formRef.current?.reportValidity()) {
      setSaving(false) 
      return; 
    }
    if(executives.some((ex)=> ex.idUser === user?._id) === false) {
      await autoAsignationRequestQuotation();
    }       
    
    const quotationRequestData = buildQuotationRequest();
    quotationRequestData.idStatusRequest = StatusRequestQuotation.Enviada;
    quotationRequestData.statusRequest = StatusRequestQuotationLabel[StatusRequestQuotation.Enviada];
    console.log('SEND',quotationRequestData)
    if (quotationRequestData.services.length == 0) {
      setModalState({
        isOpen: true,
        type: "warning",
        title: t("quote.serviceaddtitle"),
        message: t("quote.serviceaddmessage"),
        showCancel: false,
      });
      setSaving(false);
      return;
    }
   await performSave(quotationRequestData);
  };

  const performSave = async (quotationData: QuotationRequest) => {
    try {
      let result: any;
       console.log(JSON.stringify(quotationData, null, 2))
      setSaving(true);
      if (mode === "edit" && quotationId) {
        quotationData.id = quotationId;
        const res = await quotationService.update(quotationData);
        //console.log('UPDATE: ', JSON.stringify(quotationData, null, 2), 'Result:', res);
        showSuccess(t("quote.success.updated"));
      } else {
        result = await quotationService.create(quotationData);
        //console.log(JSON.stringify(quotationData, null, 2), 'Create result:', result);
        showSuccess(t("quote.success.created"));
      }

      if (onBack && mode === "create") {
        onBack(result.atrribute?.value);
      } else {
        onBack();
      }
    } catch (error) {
      console.error('Error in performSave:', error);
      showError(t("quote.errors.saveQuotation"));
    } finally {
      setSaving(false);
    }
  };

  const handleSavePackage = (e: React.FormEvent) => {
    e.preventDefault();
    const selectElement = document.getElementById("package-type",) as HTMLSelectElement;    
    const UnitCargo = selectElement.options[selectElement.selectedIndex].text;
    const quantity = (document.getElementById("package-quantity") as HTMLInputElement).value;
    const length = (document.getElementById("package-length") as HTMLInputElement).value;
    const height = (document.getElementById("package-height") as HTMLInputElement).value;
    const width = (document.getElementById("package-width") as HTMLInputElement).value;
    const weight = (document.getElementById("package-weight") as HTMLInputElement).value;
    console.log('pack',UnitCargo)
    if (UnitCargo && quantity && length && height && width && weight) {
      addPackage({
        idUnitCargo: parseInt(selectElement.value),
        unitCargo: UnitCargo,
        quantity: parseInt(quantity),
        length: length,
        height: height,
        width: width,
        weight: weight,
      });
    }
  };

  /*const renderZipCodesOriginDestination = (service: Service) => {
    const isPort = [1, 2].includes(service.idService); //Maritimo FCL y LCL
    const resultPorts = loadPortsAirports(
      isPort,
      service.shipments[0].origin.idCountry,
    );
    console.log(resultPorts);
    switch (true) {
      //Terrestre FTL Terrestre LTL Terrestre FCL Terrestre LCL || 1 Door To Door
      case [3, 4, 10, 11].includes(service.idService) ||
        service.shipments[0].idTypeShipment === 1:
        return (
          <div className={styles.formGridCityZipcode}>
            <div className={styles.formGroupCityZipcode}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span className={styles.required}>*</span>
                  {t("ctrlpricing.cityo")}
                </label>
                <input
                  className={`${styles.input}`}
                  type="text"
                  maxLength={100}
                  value={service.shipments[0].origin.city}
                  onChange={(e) =>
                    updateOrigin(
                      service.idServiceItem,
                      service.shipments[0].idShipment,
                      { city: e.target.value },
                    )
                  }
                  disabled={mode === "view" || formData.idStatusRequest >= 2}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>{t("quote.originZip")}</label>
                <input
                  type="number"
                  min="1"
                  onInput={(e) => {
                    e.currentTarget.value = e.currentTarget.value.slice(0, 9);
                  }}
                  value={service.shipments[0].origin.zipCode}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e") {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || Number(value) > 0) {
                      updateOrigin(
                        service.idServiceItem,
                        service.shipments[0].idShipment,
                        { zipCode: parseInt(e.target.value) },
                      );
                    }
                  }}
                  className={styles.input}
                  disabled={mode === "view" || formData.idStatusRequest >= 2}
                />
              </div>
            </div>

            <div className={styles.formGroupCityZipcode}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span className={styles.required}>*</span>
                  {t("ctrlpricing.cityd")}
                </label>
                <input
                  className={`${styles.input}`}
                  type="text"
                  maxLength={100}
                  value={service.shipments[0].destination.city}
                  onChange={(e) =>
                    updateDestination(
                      service.idServiceItem,
                      service.shipments[0].idShipment,
                      { city: e.target.value },
                    )
                  }
                  disabled={mode === "view" || formData.idStatusRequest >= 2}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  {t("quote.destinationZip")}
                </label>
                <input
                  type="number"
                  min="0"
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e") {
                      e.preventDefault();
                    }
                  }}
                  onInput={(e) => {
                    e.currentTarget.value = e.currentTarget.value.slice(0, 9);
                  }}
                  value={service.shipments[0].destination.zipCode}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || Number(value) > 0) {
                      updateDestination(
                        service.idServiceItem,
                        service.shipments[0].idShipment,
                        { zipCode: parseInt(e.target.value) },
                      );
                    }
                  }}
                  className={styles.input}
                  disabled={mode === "view" || formData.idStatusRequest >= 2}
                />
              </div>
            </div>
          </div>
        );
      case service.shipments[0].idTypeShipment === 2: //2 Port To Port
        return (
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className={styles.required}>*</span>
                {isPort ? t("quote.originPort") : t("quote.originAirport")}
              </label>
              <select>
                className={styles.select}
                disabled={mode === "view" || formData.idStatusRequest >= 2}
                required
                {resultPorts?.map((type) => (
                  <option key={type._Id} value={type._Id}>
                    {type.request_type_name}
                  </option>
                ))}
              </select>
              
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className={styles.required}>*</span>
                {isPort
                  ? t("quote.destinationPort")
                  : t("quote.destinationAirport")}
              </label>
              <input
                type="text"
                maxLength={20}
                placeholder={isPort ? "MXVER" : "MXMEX"}
                value={
                  isPort
                    ? (service.shipments[0].destination.portCode ?? "")
                    : (service.shipments[0].destination.airportCode ?? "")
                }
                onChange={(e) =>
                  updateDestination(
                    service.idServiceItem,
                    service.shipments[0].idShipment,
                    isPort
                      ? { portCode: e.target.value.toUpperCase() }
                      : { airportCode: e.target.value.toUpperCase() },
                  )
                }
                className={styles.input}
                disabled={mode === "view" || formData.idStatusRequest >= 2}
                required
              />
            </div>
          </div>
        );
      case service.shipments[0].idTypeShipment === 3: //3 Door To Port
        return (
          <div className={styles.formGridCityZipcode}>
            <div className={styles.formGroupCityZipcode}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span className={styles.required}>*</span>
                  {t("ctrlpricing.cityo")}
                </label>
                <input
                  className={`${styles.input}`}
                  type="text"
                  maxLength={100}
                  value={service.shipments[0].origin.city}
                  onChange={(e) =>
                    updateOrigin(
                      service.idServiceItem,
                      service.shipments[0].idShipment,
                      { city: e.target.value },
                    )
                  }
                  disabled={mode === "view" || formData.idStatusRequest >= 2}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>{t("quote.originZip")}</label>
                <input
                  type="number"
                  min="0"
                  className={styles.input}
                  onInput={(e) => {
                    e.currentTarget.value = e.currentTarget.value.slice(0, 9);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e") {
                      e.preventDefault();
                    }
                  }}
                  value={service.shipments[0].origin.zipCode}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || Number(value) > 0) {
                      updateOrigin(
                        service.idServiceItem,
                        service.shipments[0].idShipment,
                        { zipCode: e.target.value },
                      );
                    }
                  }}
                  disabled={mode === "view" || formData.idStatusRequest >= 2}
                />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className={styles.required}>*</span>
                {isPort
                  ? t("quote.destinationPort")
                  : t("quote.destinationAirport")}
              </label>
              <input
                type="text"
                maxLength={20}
                placeholder={isPort ? "MXVER" : "MXMEX"}
                value={
                  isPort
                    ? (service.shipments[0].destination.portCode ?? "")
                    : (service.shipments[0].destination.airportCode ?? "")
                }
                onChange={(e) =>
                  updateDestination(
                    service.idServiceItem,
                    service.shipments[0].idShipment,
                    isPort
                      ? { portCode: e.target.value.toUpperCase() }
                      : { airportCode: e.target.value.toUpperCase() },
                  )
                }
                className={styles.input}
                disabled={mode === "view" || formData.idStatusRequest >= 2}
                required
              />
            </div>
          </div>
        );
      case service.shipments[0].idTypeShipment === 4: //4	Port To Door
        return (
          <div className={styles.formGridCityZipcode}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className={styles.required}>*</span>
                {isPort ? t("quote.originPort") : t("quote.originAirport")}
              </label>
              <input
                type="text"
                maxLength={20}
                placeholder={isPort ? "MXVER" : "MXMEX"}
                value={
                  isPort
                    ? (service.shipments[0].origin.portCode ?? "")
                    : (service.shipments[0].origin.airportCode ?? "")
                }
                onChange={(e) =>
                  updateOrigin(
                    service.idServiceItem,
                    service.shipments[0].idShipment,
                    isPort
                      ? { portCode: e.target.value.toUpperCase() }
                      : { airportCode: e.target.value.toUpperCase() },
                  )
                }
                className={styles.input}
                disabled={mode === "view" || formData.idStatusRequest >= 2}
                required
              />
            </div>
            <div className={styles.formGroupCityZipcode}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span className={styles.required}>*</span>
                  {t("ctrlpricing.cityd")}
                </label>
                <input
                  className={`${styles.input}`}
                  type="text"
                  maxLength={100}
                  value={service.shipments[0].destination.city}
                  onChange={(e) =>
                    updateDestination(
                      service.idServiceItem,
                      service.shipments[0].idShipment,
                      { city: e.target.value },
                    )
                  }
                  disabled={mode === "view" || formData.idStatusRequest >= 2}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  {t("quote.destinationZip")}
                </label>
                <input
                  type="number"
                  min="0"
                  onInput={(e) => {
                    e.currentTarget.value = e.currentTarget.value.slice(0, 9);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e") {
                      e.preventDefault();
                    }
                  }}
                  value={service.shipments[0].destination.zipCode}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || Number(value) > 0) {
                      updateDestination(
                        service.idServiceItem,
                        service.shipments[0].idShipment,
                        { zipCode: parseInt(e.target.value) },
                      );
                    }
                  }}
                  className={styles.input}
                  disabled={mode === "view" || formData.idStatusRequest >= 2}
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  }; */

  const renderResponseDeadline = () => {
    switch (true) {
      case formData.isLicitation === true:
        return (
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.required}>*</span>
              {t("quote.responseDeadline")}
            </label>
            <input
              type="date"
              required
              onKeyDown={(e) => e.preventDefault()}
              min={
                mode === "create"
                  ? new Date().toISOString().split("T")[0]
                  : undefined
              }
              value={formData.responseDeadline}
              onChange={(e) => {
                updateRequestFormData({
                  ...formData,
                  responseDeadline: e.target.value,
                });
              }}
              className={styles.input}
              placeholder="dd/mm/aaaa"
              disabled={mode === "view" || formData.idStatusRequest >= 2}
            />
          </div>
        );
      case formData.isLicitation === false && mode !== "create":
        return (
          <div className={styles.formGroup}>
            <label className={styles.label}>
              {t("quote.responseDeadline")}
            </label>
            <input
              className={styles.input}
              value={formData.responseDeadline}
              disabled
            ></input>
          </div>
        );
      default:
        return <div />;
    }
  };

  const formatDateForInput = (date: string) => {
    if (!date) return "";
    return date.split("T")[0];
  };

  const calculateDateResponseDeadline = () => {
    const [year, month, day] = formData.created.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    let workingDays = 0;

    while (workingDays < 2) {
      date.setDate(date.getDate() + 1); // avanzar un día
      const day = date.getDay();
      if (day !== 0 && day !== 6) {
        // no domingo ni sábado
        workingDays++;
      }
    }
    return date;
  };

  return (
    <div className={styles.container}>
      <form
        ref={formRef}
        onSubmit={handleSaveQuotation}
        onKeyDown={(e) => {if (e.key === "Enter") e.preventDefault(); }} >
        <div className={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {onBack && (
              <button
                type="button"
                disabled={saving}  
                onClick={() => onBack()}
                className={styles.backButton}
                title="Volver a lista">
                <ArrowLeft size={18} />
              </button>
            )}
            <h1 className={styles.title}>
              { mode === "view" ? t("quote.viewTitle") 
                : mode === "edit" ? t("quote.editTitle")
                : t("quote.title") }
            </h1>
          </div>
          <div className={styles.actionBar}>
            <button
              className={styles.actionBarSaveButton}
              type="submit"
              disabled={saving || mode === "view" || formData.idStatusRequest >= 2} >
              <Save size={18} />
              <span>{saving ? t("catalog.saving") : t("quote.save")}</span>
            </button>
            {mode === "create" && (
              <button
                type="button"
                disabled={saving}  
                className={styles.actionBarResetButton}
                onClick={resetForm}>
                <RotateCcw size={18} />
              </button>
            )}
            <button
              type="button"
              className={styles.actionBarResetButton}
              onClick={handleAsignateto}
              hidden={formData.idStatusRequest <= 1}
              disabled={saving || mode === "view"}>
              <User size={18} />
              <span>{t("quote.add")}</span>
            </button>
          </div>
        </div>
        {isLoading ? (
          <div className={styles.loading}> <div className={styles.spinner}/></div>
        ) : 
        (
          <div>
            {mode !== "create" && formData.idStatusRequest && (
              <div style={{ marginBottom: '1.25rem' }} >
                <span className={styles.statusRequest}>{StatusRequestQuotationLabel[formData.idStatusRequest]} </span>
              </div>
            )}
            <GeneralDataSection 
              formData={formData}
              mode={mode}
              loading={isLoading}
              customers={customers}
              requestTypes={requestTypes}
              onChangeFormData={updateRequestFormData}
              calculateResponseDeadline={calculateDateResponseDeadline}
              t={t} />

            {/*{formData?.statuscomments !== null && (
              <div>
                <label className={styles.label}>
                  Comentarios por cancelación
                </label>
                <label className={styles.labelInfoRed}>
                  {" "}
                  {formData.statuscomments}
                </label>
              </div>
            )}

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>{t("quote.generalData")}</h2>
              <div>
                <div
                  className={styles.formGrid}
                  style={{ marginTop: "1.5rem" }}
                >
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      <span className={styles.required}>*</span>
                      {t("quote.reference")}
                    </label>
                    <input
                      type="text"
                      value={formData.referenceRequest}
                      onChange={(e) =>
                        updateRequestFormData({
                          ...formData,
                          referenceRequest: e.target.value,
                        })
                      }
                      className={styles.input}
                      disabled
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      <span className={styles.required}>*</span>
                      {t("quote.requestType")}
                    </label>
                    <select
                      value={formData.requestTypeId}
                      onChange={(e) => {
                        const requestType = requestTypes.find(
                          (r) => r._Id === parseInt(e.target.value),
                        );
                        updateRequestFormData({
                          ...formData,
                          requestTypeId: parseInt(e.target.value),
                          requestType: requestType?.request_type_name || "",
                        });
                      }}
                      className={styles.select}
                      disabled={
                        loading ||
                        mode === "view" ||
                        formData.idStatusRequest >= 2
                      }
                      required
                    >
                      <option value="">{t("quote.selectType")}</option>
                      {requestTypes.map((type) => (
                        <option key={type._Id} value={type._Id}>
                          {type.request_type_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      <span className={styles.required}>*</span>
                      {t("quote.requestDate")}
                    </label>
                    <input
                      type="date"
                      onKeyDown={(e) => e.preventDefault()}
                      max={
                        mode === "create"
                          ? new Date().toISOString().split("T")[0]
                          : undefined
                      }
                      value={formData.created}
                      onChange={(e) => {
                        {
                          updateRequestFormData({
                            ...formData,
                            created: e.target.value,
                          });
                        }
                      }}
                      className={styles.input}
                      disabled={
                        mode === "view" || formData.idStatusRequest >= 2
                      }
                    />
                  </div>
                </div>

                <div
                  className={styles.formGrid}
                  style={{ marginTop: "1.5rem" }}
                >
                  <div className={styles.formGroupElementsInline}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>{t("quote.isBid")}</label>
                      <button
                        type="button"
                        className={`${styles.toggleSwitch} ${formData.isLicitation ? styles.active : ""}`}
                        onClick={() => {
                          updateRequestFormData({
                            ...formData,
                            isLicitation: !formData.isLicitation,
                          });
                        }}
                        disabled={
                          mode === "view" || formData.idStatusRequest >= 2
                        }
                      >
                        <div className={styles.toggleThumb}></div>
                      </button>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        {t("quote.isPriority")}
                      </label>
                      <button
                        type="button"
                        className={`${styles.toggleSwitch} ${formData.isPriority ? styles.active : ""}`}
                        onClick={() =>
                          updateRequestFormData({
                            ...formData,
                            isPriority: !formData.isPriority,
                          })
                        }
                        disabled={
                          mode === "view" || formData.idStatusRequest >= 2
                        }
                      >
                        <div className={styles.toggleThumb}></div>
                      </button>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        {t("quote.prospect")}
                      </label>
                      <button
                        type="button"
                        className={`${styles.toggleSwitch} ${formData.showProspect ? styles.active : ""}`}
                        onClick={() => {
                          updateRequestFormData({
                            ...formData,
                            showProspect: !formData.showProspect,
                          });
                        }}
                        disabled={
                          loading ||
                          mode === "view" ||
                          mode === "edit" ||
                          formData.idStatusRequest >= 2
                        }
                      >
                        <div className={styles.toggleThumb}></div>
                      </button>
                    </div>
                  </div>

                  {!formData.showProspect ? (
                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        <span className={styles.required}>*</span>
                        {t("quote.client")}
                      </label>
                      <select
                        value={formData.customerId}
                        onChange={(e) => {
                          const customer = customers.find(
                            (c) => c.id === e.target.value,
                          );
                          updateRequestFormData({
                            ...formData,
                            customerId: e.target.value,
                            client: customer?.fiscalData?.businessName || "",
                            customerCategory: customer?.clientLevelId,
                          });
                        }}
                        className={styles.clientSelect}
                        disabled={
                          loading ||
                          mode === "view" ||
                          mode === "edit" ||
                          formData.idStatusRequest >= 2
                        }
                        required
                      >
                        <option value="">{t("quote.selectClient")}</option>
                        {customers.map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.branchName
                              ? `${customer.branchName}, ${customer.fiscalData?.businessName}`
                              : customer.fiscalData?.businessName}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        <span className={styles.required}>*</span>
                        {t("quote.prospect")}
                      </label>
                      <input
                        type="text"
                        maxLength={50}
                        min={3}
                        required
                        value={formData.prospect}
                        onChange={(e) => {
                          updateRequestFormData({
                            ...formData,
                            prospect: e.target.value,
                          });
                        }}
                        className={styles.input}
                        disabled={
                          mode === "view" || formData.idStatusRequest >= 2
                        }
                      />
                    </div>
                  )}
                  {!formData.showProspect ? (
                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        {t("quote.customerCategory")}
                      </label>
                      <select
                        value={formData.customerCategory}
                        onChange={(e) =>
                          updateRequestFormData({
                            ...formData,
                            customerCategory: parseInt(e.target.value),
                          })
                        }
                        className={styles.select}
                        disabled
                      >
                        <option value={1}>Golden</option>
                        <option value={2}>Silver</option>
                        <option value={3}>Bronze</option>
                      </select>
                    </div>
                  ) : (
                    <div />
                  )}
                </div>

                <div
                  className={styles.formGrid}
                  style={{ marginTop: "1.5rem" }}
                >
                  {renderResponseDeadline()}
                  <div></div>
                  <div></div>
                </div> */} 

                {mode === "edit" && (
                  <div className={styles.statusButtonsContainer}>
                    <button
                      type="button"
                      className={styles.cancelButton}
                      onClick={handleCancelQuotation}
                      disabled={saving}
                      hidden={formData.idStatusRequest >= 5} >
                      {t("quote.cancelrequest")}
                    </button>

                    {showCancelQuotationRequestModal && (
                      <div
                        className={styles.modalOverlay}
                        onClick={() => {if(!saving) setShowCancelQuotationRequestModal(false);}}>
                        <div
                          className={styles.modalContentSmall}
                          onClick={(e) => e.stopPropagation()}>
                          <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>
                              {t("quote.reasons")}
                            </h2>
                            <button
                              type="button"
                              disabled={saving}
                              className={styles.closeButton}
                              onClick={() => {setShowCancelQuotationRequestModal(false);}}>
                              <X size={24} />
                            </button>
                          </div>
                          <div className={styles.modalBody}>
                            <div
                              className={styles.formGroup}
                              style={{ marginTop: "1.25rem" }} >
                              <label className={styles.label}>
                                {t("quote.writereasons")}
                              </label>
                              <textarea
                                id="comments-cancelation"
                                className={styles.textarea}
                                rows={3}
                                placeholder="" />
                              <div className={styles.modalFooter}>
                                <button
                                  type="button" 
                                  disabled={saving}                                  
                                  className={styles.saveModalButton}
                                  onClick={() => {handleStatusUpdate(10, "Cancelada")}}>
                                  {saving ? t('quote.saving') : t("quote.save")}                                                                
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      className={styles.sendButton}
                      onClick={handleSendQuotation}
                      disabled={saving}
                      hidden={formData.idStatusRequest >= 2}>
                      {t("quote.sendForQuote")}
                    </button>

                    <button
                      type="button"
                      className={styles.cancelButton}
                      onClick={handleRejectQuotation}
                      disabled={saving}
                      hidden={
                        formData.idStatusRequest !== 5 ||
                        formData.idStatusRequest === 8 ||
                        formData.idStatusRequest === 9
                      }>
                      {t("quote.reject")}
                    </button>

                    {showRejectQuotationRequestModal && (
                      <div
                        className={styles.modalOverlay}
                        onClick={() => {if(!saving) setShowRejectQuotationRequestModal(false);}}>
                        <div
                          className={styles.modalContentSmall}
                          onClick={(e) => e.stopPropagation()}>
                          <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>
                              {t("quote.reasonsreject")}
                            </h2>
                            <button
                              type="button"
                              disabled={saving}
                              className={styles.closeButton}
                              onClick={() => {setShowRejectQuotationRequestModal(false);}}>
                              <X size={24} />
                            </button>
                          </div>
                          <div className={styles.modalBody}>
                            <div
                              className={styles.formGroup}
                              style={{ marginTop: "1.25rem" }}>
                              <label className={styles.label}>
                                {t("quote.writereasonsreject")}
                              </label>
                              <textarea
                                id="comments-rejection"
                                className={styles.textarea}
                                rows={3}
                                placeholder="" />
                              <div className={styles.modalFooter}>
                                <button
                                  type="button"
                                  className={styles.saveModalButton}
                                  disabled={saving}
                                  onClick={() =>handleStatusUpdate(9, "Rechazada")}>
                                  {saving ? t("quote.saving") :t("quote.save")}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      className={styles.sendButton}
                      onClick={handleAcceptQuotation}
                      disabled={saving}
                      hidden={
                        formData.idStatusRequest !== 5 ||
                        formData.idStatusRequest === 8 ||
                        formData.idStatusRequest === 9
                      }>
                      {t("quote.accept")}
                    </button>
                  </div>
                )}

                {mode === "create" && (
                  <div className={styles.statusButtonsContainer}>
                    <button
                      type="button"
                      className={styles.sendButton}
                      onClick={handleSendQuotationRequest}
                      disabled={saving}>
                      {t("quote.sendForQuote")}
                    </button>
                  </div>
                )}
            {/*</div>
          </div>*/}

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>{t("quote.services")}</h2>

              {services?.map((service, index) => {
                /*const showProjection =
                  projectionShipmentState[service.idServiceItem] ??
                  service.shipments?.[0].projectionShipment;*/

                  return(
                    <ServiceCard
                    key={service.idServiceItem} 
                    service={service}
                    index={index}
                    mode={mode}
                    idStatusRequest={formData.idStatusRequest}
                    availableServices={availableServices}
                    incoterms={incoterms}
                    countries={countries}
                    availableContainers={availableContainers}
                    loadingContainers={loadingContainers}
                    showContainersModal={showContainersModal}
                    currentServiceId={currentServiceId}
                    projectionShipmentState={projectionShipmentState}
                    onUpdateService={updateService}
                    onRemoveService={removeService}
                    onDuplicateService={duplicateService}
                    onUpdateShipment={updateShipment}
                    onUpdateOrigin={updateOrigin}
                    onUpdateDestination={updateDestination}
                    onTypeOperationChange={handleTypeOperationChange}
                    onIncotermChange={handleIncotermChange}
                    onTypeShipmentChange={handleTypeShipmentChange}
                    onUpdateProjection={updateProjectionShipment}
                    onProjectionStateChange={handleProjectionShipmentState}
                    onUpdateServicesAssociated={updateServicesAssociated}
                    onOpenContainerModal={openContainerModal}
                    onUpdateContainersShipment={updateContainersShipment}
                    onUpdateContainersQuantity={updateContainersQuantityShipment}
                    onCloseContainerModal={()=> setShowContainersModal(false) }
                    onOpenMerchandiseModal={openMerchandiseModalForm}
                    onRemoveMerchandise={removeMerchandise}
                    onUpdateOrderService={updateOrderService}
                    t={t}
                    />
                  );

                /*return (
                  <div
                    key={service.idServiceItem}
                    className={styles.serviceCard}
                  >
                    <div className={styles.serviceHeader}>
                      <div className={styles.serviceNumber}>{index + 1}</div>
                      <div className={styles.serviceActions}>
                        <button
                          type="button"
                          className={styles.iconButton}
                          onClick={() =>
                            duplicateService(service.idServiceItem)
                          }
                          disabled={
                            mode === "view" || formData.idStatusRequest >= 2
                          }
                        >
                          <Copy size={18} />
                        </button>
                        <button
                          type="button"
                          className={`${styles.iconButton} ${styles.danger}`}
                          onClick={() => removeService(service.idServiceItem)}
                          disabled={
                            mode === "view" || formData.idStatusRequest >= 2
                          }
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>

                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>
                          <span className={styles.required}>*</span>
                          {t("quote.serviceType")}
                        </label>
                        <select
                          value={service.nameService}
                          onChange={(e) => {
                            updateService(service.idServiceItem, {
                              idService: parseInt(
                                e.target.selectedOptions[0].dataset.serviceId!,
                              ),
                              nameService: e.target.value,
                            });
                          }}
                          className={styles.select}
                          disabled={
                            loading ||
                            mode === "view" ||
                            formData.idStatusRequest >= 2
                          }
                          required
                        >
                          <option value="">{t("quote.select")}</option>
                          {availableServices
                            .filter(
                              (service) => service.status ===1 )
                            .map((service_) => (
                              <option
                                key={service_._Id}
                                value={service_.service_name}
                                data-service-id={service_._Id}>
                                {service_.service_name}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label}>
                          <span className={styles.required}>*</span>
                          {t("quote.operation")}
                        </label>
                        <select
                          value={service.shipments[0].idTypeOperation}
                          onChange={(e) =>
                            handleTypeOperationChange(
                              service.idServiceItem,
                              service.shipments[0].idShipment,
                              Number(e.target.value),
                              e.target.options[e.target.selectedIndex].text,
                            )
                          }
                          className={styles.select}
                          disabled={
                            mode === "view" || formData.idStatusRequest >= 2
                          }
                          required
                        >
                          <option value="">{t("quote.select")}</option>
                          <option value={1}>{t("quote.import")}</option>
                          <option value={2}>{t("quote.export")}</option>
                          <option value={3}>{t("quote.national")}</option>
                          <option value={4}>{t("quote.localUSA")}</option>
                          <option value={5}>{t("quote.Triangulacion")}</option>
                        </select>
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>
                          <span className={styles.required}>*</span>
                          {t("quote.incoterm")}
                        </label>
                        <select
                          value={service.shipments[0].idIncoterm || ""}
                          onChange={(e, ) =>
                            handleIncotermChange(
                              service.idServiceItem,
                              service.shipments[0].idShipment,
                              Number(e.target.value),
                              e.target.options[e.target.selectedIndex].text,
                            )
                          }
                          className={styles.select}
                          disabled={
                            loading ||
                            mode === "view" ||
                            formData.idStatusRequest >= 2
                          }
                          required>
                          <option value="">{t("quote.select")}</option>
                          {incoterms.map((inc) => (
                            <option key={inc._Id} value={inc._Id}>
                              {inc.incoterm}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>
                          <span className={styles.required}>*</span>
                          {t("quote.shippingType")}
                        </label>
                        <select
                          value={service.shipments[0].idTypeShipment}
                          onChange={(e) => {
                            handleTypeShipmentChange(
                              service.idServiceItem,
                              service.shipments[0].idShipment,
                              Number(e.target.value),
                              e.target.options[e.target.selectedIndex].text,
                            );
                          }}
                          className={styles.select}
                          disabled={
                            mode === "view" || formData.idStatusRequest >= 2
                          }
                          required
                        >
                          <option value="">{t("quote.select")}</option>
                          <option value={1}>{t("quote.doorToDoor")}</option>
                          <option
                            disabled={[3, 4, 10, 11].includes(
                              service.idService,
                            )}
                            value={2}
                          >
                            {t("quote.portToPort")}
                          </option>
                          <option value={3}>{t("quote.doorToPort")}</option>
                          <option value={4}>{t("quote.portToDoor")}</option>
                        </select>
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>
                          {t("quote.expectedDeparture")}
                        </label>
                        <input
                          type="date"
                          onKeyDown={(e) => e.preventDefault()}
                          min={
                            mode === "create"
                              ? new Date().toISOString().split("T")[0]
                              : undefined
                          }
                          value={formatDateForInput(
                            service.shipments[0].departureDateAproximate || "",
                          )}
                          onChange={(e) =>
                            updateShipment(
                              service.idServiceItem,
                              service.shipments[0].idShipment,
                              "departureDateAproximate",
                              e.target.value,
                            )
                          }
                          className={styles.input}
                          disabled={
                            mode === "view" || formData.idStatusRequest >= 2
                          }
                        />
                      </div>
                    </div>
                    <div
                      className={styles.formGrid}
                      style={{ marginTop: "1.25rem" }}
                    >
                      <div className={styles.formGroup}>
                        <label className={styles.label}>
                          <span className={styles.required}>*</span>
                          {t("quote.origin")}
                        </label>
                        <select
                          value={service.shipments[0].origin.idCountry}
                          onChange={(e) => {
                            updateOrigin(
                              service.idServiceItem,
                              service.shipments[0].idShipment,
                              {
                                idCountry: e.target.value,
                                countryCode:
                                  e.target.selectedOptions[0].dataset
                                    .shipmentOriginCountryName,
                              },
                            );
                          }}
                          className={styles.select}
                          disabled={
                            loading ||
                            mode === "view" ||
                            formData.idStatusRequest >= 2
                          }
                          required
                        >
                          <option value="">{t("quote.select")}</option>
                          {countries.map((country) => (
                            <option
                              key={country._Id}
                              value={country._Id}
                              data-shipment-origin-country-name={
                                country.country_code
                              }
                            >
                              {country.name_country} ({country.country_code})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>
                          <span className={styles.required}>*</span>
                          {t("quote.destination")}
                        </label>
                        <select
                          value={service.shipments[0].destination.idCountry}
                          onChange={(e) =>
                            updateDestination(
                              service.idServiceItem,
                              service.shipments[0].idShipment,
                              {
                                idCountry: e.target.value,
                                countryCode:
                                  e.target.selectedOptions[0].dataset
                                    .shipmentDestinationCountryName,
                              },
                            )
                          }
                          className={styles.select}
                          disabled={
                            loading ||
                            mode === "view" ||
                            formData.idStatusRequest >= 2
                          }
                          required
                        >
                          <option value="">{t("quote.select")}</option>
                          {countries.map((country) => (
                            <option
                              key={country._Id}
                              value={country._Id}
                              data-shipment-destination-country-name={
                                country.country_code
                              }
                            >
                              {country.name_country} ({country.country_code})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div style={{ marginTop: "1.25rem" }}>
                      <ZipCodesOriginDestination
                        service={service}
                        mode={mode}
                        idStatusRequest={formData.idStatusRequest}
                        onUpdateOrigin={updateOrigin}
                        onUpdateDestination={updateDestination}
                        t={t}
                      />
                    </div>

                    {[2, 3, 10].includes(service.idService) && (
                      <div style={{ marginTop: "1.25rem" }}>
                        <label className={styles.label}>
                          {t("quote.containers")}
                        </label>
                        <div className={styles.executivesCard}>
                          <div className={styles.executivesList}>
                            {service.shipments[0].containers?.map(
                              (container) => (
                                <div
                                  key={container.idContainer}
                                  className={styles.itemSimpleList}
                                >
                                  <div
                                    className={styles.formGroupElementsInline}
                                  >
                                    <div className={styles.formGroup}>
                                      <span className={styles.executiveLabel}>
                                        {t("quote.container")}
                                      </span>
                                      <span
                                        className={styles.executiveNameSimple}
                                      >
                                        {container.nameTypeContainer}
                                      </span>
                                    </div>
                                    <div className={styles.formGroup}>
                                      <label className={styles.label}>
                                        {t("quote.quantity")}
                                      </label>
                                      <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        className={styles.input}
                                        style={{ width: "80px" }}
                                        onInput={(e) => {
                                          e.currentTarget.value =
                                            e.currentTarget.value.slice(0, 9);
                                        }}
                                        onKeyDown={(e) => {
                                          if (
                                            e.key === "." ||
                                            e.key === "-" ||
                                            e.key === "e"
                                          ) {
                                            e.preventDefault();
                                          }
                                        }}
                                        value={container.quantity}
                                        onChange={(e) =>
                                          updateContainersQuantityShipment(
                                            service.idServiceItem,
                                            1,
                                            container.idContainer || 1,
                                            {
                                              quantity: parseInt(
                                                e.target.value,
                                              ),
                                            },
                                          )
                                        }
                                        disabled={
                                          loading ||
                                          mode === "view" ||
                                          formData.idStatusRequest >= 2
                                        }
                                      />
                                    </div>
                                    <div className={styles.formGroup}>
                                      <label className={styles.label}>
                                        {t("quote.totalVolume")}
                                      </label>
                                      <input
                                        type="number"
                                        className={styles.input}
                                        onKeyDown={(e) => {
                                          if (e.key === "-" || e.key === "e") {
                                            e.preventDefault();
                                          }
                                          if (
                                            e.currentTarget.value.length >= 7 &&
                                            e.key !== "Backspace" &&
                                            e.key !== "Delete"
                                          ) {
                                            e.preventDefault();
                                          }
                                        }}
                                        value={container.volumeTotal}
                                        onChange={(e) => {
                                          if (
                                            e.target.value === "" ||
                                            Number(e.target.value) > 0
                                          ) {
                                            updateContainersQuantityShipment(
                                              service.idServiceItem,
                                              1,
                                              container.idContainer || 1,
                                              {
                                                volumeTotal: Number(
                                                  e.target.value,
                                                ),
                                              },
                                            );
                                          }
                                        }}
                                        disabled={
                                          loading ||
                                          mode === "view" ||
                                          formData.idStatusRequest >= 2
                                        }
                                      />
                                    </div>
                                    <div className={styles.formGroup}>
                                      <label className={styles.label}>
                                        {t("quote.unitVolume")}
                                      </label>
                                      <select
                                        value={container.idUnitVolume}
                                        onChange={(e) => {
                                          updateContainersQuantityShipment(
                                            service.idServiceItem,
                                            1,
                                            container.idContainer || 1,
                                            {
                                              idUnitVolume: parseInt(
                                                e.target.value,
                                              ),
                                              unitVolume:
                                                e.target.options[
                                                  e.target.selectedIndex
                                                ].text,
                                            },
                                          );
                                        }}
                                        className={styles.select}
                                        disabled={
                                          loading ||
                                          mode === "view" ||
                                          formData.idStatusRequest >= 2
                                        }
                                      >
                                        <option value="">
                                          {t("quote.selectOption")}
                                        </option>
                                        <option value={1}>CBM</option>
                                        <option value={2}>CFT</option>
                                      </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                      <label className={styles.label}>
                                        {t("quote.totalWeight")}
                                      </label>
                                      <input
                                        type="number"
                                        className={styles.input}
                                        onKeyDown={(e) => {
                                          if (e.key === "-" || e.key === "e") {
                                            e.preventDefault();
                                          }
                                          if (
                                            e.currentTarget.value.length >= 7 &&
                                            e.key !== "Backspace" &&
                                            e.key !== "Delete"
                                          ) {
                                            e.preventDefault();
                                          }
                                        }}
                                        value={container.weigthTotal}
                                        onChange={(e) => {
                                          if (
                                            e.target.value === "" ||
                                            Number(e.target.value) > 0
                                          ) {
                                            updateContainersQuantityShipment(
                                              service.idServiceItem,
                                              1,
                                              container.idContainer || 1,
                                              {
                                                weigthTotal: Number(
                                                  e.target.value,
                                                ),
                                              },
                                            );
                                          }
                                        }}
                                        disabled={
                                          loading ||
                                          mode === "view" ||
                                          formData.idStatusRequest >= 2
                                        }
                                      />
                                    </div>
                                    <div className={styles.formGroup}>
                                      <label className={styles.label}>
                                        {t("quote.unitWeight")}
                                      </label>
                                      <select
                                        value={container.idUnitWeight}
                                        onChange={(e) => {
                                          updateContainersQuantityShipment(
                                            service.idServiceItem,
                                            1,
                                            container.idContainer || 1,
                                            {
                                              idUnitWeight: parseInt(
                                                e.target.value,
                                              ),
                                              unitWeight:
                                                e.target.options[
                                                  e.target.selectedIndex
                                                ].text,
                                            },
                                          );
                                        }}
                                        className={styles.select}
                                        disabled={
                                          loading ||
                                          mode === "view" ||
                                          formData.idStatusRequest >= 2
                                        }
                                      >
                                        <option value="">
                                          {t("quote.selectOption")}
                                        </option>
                                        <option value={1}>KGS</option>
                                        <option value={2}>LBS</option>
                                        <option value={3}>Toneladas</option>
                                      </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                      <button
                                        type="button"
                                        className={styles.removeIconButton}
                                        onClick={() =>
                                          updateContainersShipment(
                                            service.idServiceItem,
                                            1,
                                            container,
                                          )
                                        }
                                        title={t("quote.delete")}
                                        disabled={
                                          mode === "view" ||
                                          formData.idStatusRequest >= 2
                                        }
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                          <button
                            type="button"
                            className={styles.addExecutiveButton}
                            onClick={() =>
                              openContainerModal(
                                service.idServiceItem,
                                service.shipments[0].containers || [],
                              )
                            }
                            disabled={
                              mode === "view" || formData.idStatusRequest >= 2
                            }
                          >
                            <Plus size={16} />
                            {t("quote.container")}
                          </button>
                        </div>
                      </div>
                    )}

                    {/** MODAL CONTENEDORES 
                     *  <div
                        className={styles.modalOverlay}
                        onClick={() => {
                          setShowContainersModal(false);
                          setCurrentServiceId(null);
                        }}
                      >
                        <div
                          className={styles.modalContentSmall}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>
                              {t("quote.selectcontainer")}
                            </h2>
                            <button
                              type="button"
                              className={styles.closeButton}
                              onClick={() => {
                                setShowContainersModal(false);
                                setCurrentServiceId(null);
                              }}
                            >
                              <X size={24} />
                            </button>
                          </div>
                          <div className={styles.modalBody}>
                            {loadingContainers ? (
                              <div className={styles.loading}>
                                <div className={styles.spinner} />
                              </div>
                            ) : (
                              <div className={styles.executiveSelectionList}>
                                {availableContainers
                                  .filter((cont) =>
                                      !containers?.some(
                                        (container) =>
                                          container.idContainer === cont._Id,
                                      ),
                                  )
                                  .map((containerAvailable) => (
                                    <div
                                      key={containerAvailable._Id}
                                      className={styles.executiveSelectionItem}
                                      onClick={() =>
                                        updateContainersShipment(
                                          currentServiceId || 1,
                                          1,
                                          {
                                            idContainer: containerAvailable._Id,
                                            nameTypeContainer: `${containerAvailable.name_type}`,
                                            quantity: 1,
                                          },
                                        )
                                      }
                                    >
                                      <span>
                                        {containerAvailable.name_type}
                                      </span>
                                      <Plus
                                        size={18}
                                        className={styles.addIcon}
                                      />
                                    </div>
                                  ))}

                                {availableContainers.filter((cont) =>
                                  containers?.some(
                                    (container) =>
                                      container.idContainer === cont._Id,
                                  ),
                                ).length === 0 && (
                                  <div className={styles.noExecutivesMessage}>
                                    {t("quote.allContainersAdded")}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    //}
                    {showContainersModal && (
                     <ContainersModal 
                     availableContainers={availableContainers}
                     containersInShipment={containers}
                     loading={loadingContainers}
                     onAdd={(container) => { updateContainersShipment(currentServiceId!, 1, container); setShowContainersModal(false);}}
                     onClose={() => { setShowContainersModal(false); setCurrentServiceId(null) }}
                     t={t}
                     />
                    )}

                    <div style={{ marginTop: "1.25rem" }}>
                      <label className={styles.label}>
                        {t("quote.associatedServices")}
                      </label>
                      <div className={styles.associatedServices}>
                        <button
                          type="button"
                          className={`${styles.serviceChip} ${service.shipments[0].servicesAsociated?.some((servAsociated) => servAsociated.idServiceAsociated === 12) ? styles.selected : ""}`}
                          onClick={(e) =>
                            updateServicesAssociated(
                              service.idServiceItem,
                              service.shipments[0].idShipment,
                              {
                                idServiceAsociated: 12,
                                serviceAsociatedName: "Seguro",
                              },
                            )
                          }
                          disabled={
                            mode === "view" || formData.idStatusRequest >= 2
                          }
                        >
                          <span>{t("quote.insurance")}</span>
                        </button>
                        <button
                          type="button"
                          className={`${styles.serviceChip} ${service.shipments[0].servicesAsociated?.some((servAsociated) => servAsociated.idServiceAsociated === 13) ? styles.selected : ""}`}
                          onClick={() =>
                            updateServicesAssociated(
                              service.idServiceItem,
                              service.shipments[0].idShipment,
                              {
                                idServiceAsociated: 13,
                                serviceAsociatedName: "Maniobra",
                              },
                            )
                          }
                          disabled={
                            mode === "view" || formData.idStatusRequest >= 2
                          }
                        >
                          <span>{t("quote.maneuver")}</span>
                        </button>
                        <button
                          type="button"
                          className={`${styles.serviceChip} ${service.shipments[0].servicesAsociated?.some((servAsociated) => servAsociated.idServiceAsociated === 15) ? styles.selected : ""}`}
                          onClick={() =>
                            updateServicesAssociated(
                              service.idServiceItem,
                              service.shipments[0].idShipment,
                              {
                                idServiceAsociated: 15,
                                serviceAsociatedName: "Custodia",
                              },
                            )
                          }
                          disabled={
                            mode === "view" || formData.idStatusRequest >= 2
                          }
                        >
                          <span>{t("quote.custody")}</span>
                        </button>
                        <button
                          type="button"
                          className={`${styles.serviceChip} ${service.shipments[0].servicesAsociated?.some((servAsociated) => servAsociated.idServiceAsociated === 14) ? styles.selected : ""}`}
                          onClick={() =>
                            updateServicesAssociated(
                              service.idServiceItem,
                              service.shipments[0].idShipment,
                              {
                                idServiceAsociated: 14,
                                serviceAsociatedName: "Inspección",
                              },
                            )
                          }
                          disabled={
                            mode === "view" || formData.idStatusRequest >= 2
                          }
                        >
                          <span>{t("quote.inspection")}</span>
                        </button>
                        <button
                          type="button"
                          className={`${styles.serviceChip} ${service.shipments[0].servicesAsociated?.some((servAsociated) => servAsociated.idServiceAsociated === 7) ? styles.selected : ""}`}
                          onClick={() =>
                            updateServicesAssociated(
                              service.idServiceItem,
                              service.shipments[0].idShipment,
                              {
                                idServiceAsociated: 7,
                                serviceAsociatedName: "Despacho",
                              },
                            )
                          }
                          disabled={
                            mode === "view" || formData.idStatusRequest >= 2
                          }
                        >
                          <span>{t("quote.customsClearance")}</span>
                        </button>
                        <button
                          type="button"
                          className={`${styles.serviceChip} ${service.shipments[0].servicesAsociated?.some((servAsociated) => servAsociated.idServiceAsociated === 6) ? styles.selected : ""}`}
                          onClick={() =>
                            updateServicesAssociated(
                              service.idServiceItem,
                              service.shipments[0].idShipment,
                              {
                                idServiceAsociated: 6,
                                serviceAsociatedName: "Almacén",
                              },
                            )
                          }
                          disabled={
                            mode === "view" || formData.idStatusRequest >= 2
                          }
                        >
                          <span>{t("quote.warehouse")}</span>
                        </button>
                        <button
                          type="button"
                          className={`${styles.serviceChip} ${service.shipments[0].servicesAsociated?.some((servAsociated) => servAsociated.idServiceAsociated === 8) ? styles.selected : ""}`}
                          onClick={() =>
                            updateServicesAssociated(
                              service.idServiceItem,
                              service.shipments[0].idShipment,
                              {
                                idServiceAsociated: 8,
                                serviceAsociatedName: "Paquetería",
                              },
                            )
                          }
                          disabled={
                            mode === "view" || formData.idStatusRequest >= 2
                          }
                        >
                          <span>{t("quote.parcelService")}</span>
                        </button>
                        <button
                          type="button"
                          className={`${styles.serviceChip} ${service.shipments[0].servicesAsociated?.some((servAsociated) => servAsociated.idServiceAsociated === 9) ? styles.selected : ""}`}
                          onClick={() =>
                            updateServicesAssociated(
                              service.idServiceItem,
                              service.shipments[0].idShipment,
                              {
                                idServiceAsociated: 9,
                                serviceAsociatedName: "UVA",
                              },
                            )
                          }
                          disabled={
                            mode === "view" || formData.idStatusRequest >= 2
                          }
                        >
                          <span>UVA</span>
                        </button>
                        <button
                          type="button"
                          className={`${styles.serviceChip} ${service.shipments[0].servicesAsociated?.some((servAsociated) => servAsociated.idServiceAsociated === 16) ? styles.selected : ""}`}
                          onClick={() =>
                            updateServicesAssociated(
                              service.idServiceItem,
                              service.shipments[0].idShipment,
                              {
                                idServiceAsociated: 16,
                                serviceAsociatedName: "Free Hand",
                              },
                            )
                          }
                          disabled={
                            mode === "view" || formData.idStatusRequest >= 2
                          }
                        >
                          <span>Free Hand</span>
                        </button>
                        <button
                          type="button"
                          className={`${styles.serviceChip} ${service.shipments[0].servicesAsociated?.some((servAsociated) => servAsociated.idServiceAsociated === 17) ? styles.selected : ""}`}
                          onClick={() =>
                            updateServicesAssociated(
                              service.idServiceItem,
                              service.shipments[0].idShipment,
                              {
                                idServiceAsociated: 17,
                                serviceAsociatedName: "Previo en origen",
                              },
                            )
                          }
                          disabled={
                            mode === "view" || formData.idStatusRequest >= 2
                          }
                        >
                          <span>{t("quote.PreInspectionOrigin")}</span>
                        </button>
                      </div>
                    </div>
                    <div
                      className={styles.formGroup}
                      style={{ marginTop: "1.25rem" }}
                    >
                      <label className={styles.label}>
                        {t("quote.comments")}
                      </label>
                      <textarea
                        maxLength={500}
                        value={service.shipments[0].comments}
                        onChange={(e) =>
                          updateShipment(
                            service.idServiceItem,
                            service.shipments[0].idShipment,
                            "comments",
                            e.target.value,
                          )
                        }
                        className={styles.textarea}
                        rows={3}
                        placeholder=""
                        disabled={
                          mode === "view" || formData.idStatusRequest >= 2
                        }
                      />
                    </div>

                    <div style={{ marginTop: "1.25rem" }}>
                      <div className={styles.frequencyHeader}>
                        <input
                          type="checkbox"
                          id={`freq-${service.idService}`}
                          checked={showProjection}
                          onChange={() => {
                            handleProjectionShipmentState(
                              service.idServiceItem,
                            );
                          }}
                          className={styles.checkbox}
                          disabled={
                            mode === "view" || formData.idStatusRequest >= 2
                          }
                        />
                        <label
                          htmlFor={`freq-${service.idService}`}
                          className={styles.checkboxLabel}
                        >
                          {t("quote.programFrequency")}
                        </label>
                      </div>
                      {showProjection && (
                        <div className={styles.frequencyGrid}>
                          <div className={styles.formGroup}>
                            <label className={styles.label}>
                              {t("quote.frequencyPeriod")}
                            </label>
                            <select
                              required
                              value={
                                service.shipments[0].projectionShipment
                                  ?.frecuency
                              }
                              onChange={(e) =>
                                updateProjectionShipment(
                                  service.idServiceItem,
                                  service.shipments[0].idShipment,
                                  { frecuency: e.target.value },
                                )
                              }
                              className={styles.select}
                              disabled={
                                mode === "view" || formData.idStatusRequest >= 2
                              }
                            >
                              <option value="">{t("quote.select")}</option>
                              <option value="Semanal">
                                {t("quote.weekly")}
                              </option>
                              <option value="Mensual">
                                {t("quote.monthly")}
                              </option>
                              <option value="Anual">{t("quote.yearly")}</option>
                            </select>
                          </div>
                          <div className={styles.formGroup}>
                            <label className={styles.label}>
                              {t("quote.quantity")}
                            </label>
                            <input
                              required
                              type="number"
                              min="0"
                              step="any"
                              value={
                                service.shipments[0].projectionShipment?.number
                              }
                              onKeyDown={(e) => {
                                if (e.key === "-" || e.key === "e") {
                                  e.preventDefault();
                                }
                                if (
                                  e.currentTarget.value.length >= 7 &&
                                  e.key !== "Backspace" &&
                                  e.key !== "Delete"
                                ) {
                                  e.preventDefault();
                                }
                              }}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === "" || Number(value) > 0) {
                                  updateProjectionShipment(
                                    service.idServiceItem,
                                    service.shipments[0].idShipment,
                                    { number: Number(e.target.value) },
                                  );
                                }
                              }}
                              className={styles.input}
                              disabled={
                                mode === "view" || formData.idStatusRequest >= 2
                              }
                            />
                          </div>
                          <div className={styles.formGroup}>
                            <label className={styles.label}>
                              {t("quote.unit")}
                            </label>
                            <select
                              required
                              value={
                                service.shipments[0].projectionShipment
                                  ?.idTypeMesurementFrecuency
                              }
                              onInput={(e) => {
                                e.currentTarget.value =
                                  e.currentTarget.value.slice(0, 9);
                              }}
                              onChange={(e) =>
                                updateProjectionShipment(
                                  service.idServiceItem,
                                  service.shipments[0].idShipment,
                                  {
                                    idTypeMesurementFrecuency: parseInt(
                                      e.target.value,
                                    ),
                                    measurementFrecuency:
                                      e.target.options[e.target.selectedIndex]
                                        .text,
                                  },
                                )
                              }
                              className={styles.select}
                              disabled={
                                mode === "view" || formData.idStatusRequest >= 2
                              }
                            >
                              <option value="">{t("quote.select")}</option>
                              <option value={1}>{t("quote.kilos")}</option>
                              <option value={2}>{t("quote.tons")}</option>
                              <option value={3}>{t("quote.containers")}</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className={styles.merchandiseSection}>
                      <h3 className={styles.subsectionTitle}>
                        {t("quote.merchandise")}
                      </h3>
                      <div className={styles.merchandiseTable}>
                        <table className={styles.simpleTable}>
                          <thead>
                            <tr>
                              <th>{t("quote.merchandise")}</th>
                              <th>{t("quote.dangerous")}</th>
                              <th>{t("quote.refrigerated")}</th>
                              <th>{t("quote.stackable")}</th>
                              <th>{t("quote.totalVolume")}</th>
                              <th>{t("quote.totalWeight")}</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {service.shipments[0].cargo.map(
                              (merch, index = 0) => (
                                <tr key={index + 1}>
                                  <td>{merch.merchandiseName}</td>
                                  <td>
                                    {merch.classification?.some(
                                      (clas) =>
                                        clas.idClassificationMerchandise === 7,
                                    )
                                      ? "Si"
                                      : "No"}
                                  </td>
                                  <td>
                                    {merch.classification?.some(
                                      (clas) =>
                                        clas.idClassificationMerchandise === 10,
                                    )
                                      ? "Si"
                                      : "No"}
                                  </td>
                                  <td>{merch.stowable ? "Si" : "No"}</td>
                                  <td>
                                    {merch.volumeTotal}{" "}
                                    {merch.unitMeasurement}{" "}
                                  </td>
                                  <td>
                                    {merch.weigthTotal} {merch.unitWeight}
                                  </td>
                                  <td>
                                    <div className={styles.tableActions}>
                                      <button
                                        type="button"
                                        className={styles.iconButtonSmall}
                                        onClick={() =>
                                          removeMerchandise(
                                            service.idServiceItem,
                                            merch,
                                          )
                                        }
                                        title={t("quote.delete")}
                                        disabled={
                                          mode === "view" ||
                                          formData.idStatusRequest >= 2
                                        }
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                      <button
                                        type="button"
                                        className={styles.viewButtonGreen}
                                        onClick={() =>
                                          openMerchandiseModal(service, merch)
                                        }
                                        title={t("quote.view")}
                                      >
                                        <Eye size={14} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ),
                            )}
                          </tbody>
                        </table>
                      </div>
                      <button
                        type="button"
                        className={styles.addItemButton}
                        onClick={() => openMerchandiseModal(service)}
                        disabled={
                          mode === "view" || formData.idStatusRequest >= 2
                        }
                      >
                        <Plus size={16} />
                        {t("quote.addMerchandise")}
                      </button>
                    </div>
                  </div>
                );*/
              })}

              <button
                type="button"
                className={styles.addServiceButton}
                onClick={addService}
                disabled={mode === "view" || formData.idStatusRequest >= 2}>
                <Plus size={20} />
                <span>{t("quote.addService")}</span>
              </button>
            </div>
            
            {/** SECCION DE EJECUTIVOS */}
            <ExecutivesSection 
            executives={executives}
            mode={mode}
            idStatusRequest={formData.idStatusRequest}
            isPricingUser={isPricingUser}
            onOpenModal={openExecutiveModal}
            onRemove={removeExecutive}
            t={t}
            />
            {/*<div className={styles.section}
              hidden={(isPricingUser === false && formData.idStatusRequest < 2) || formData.idStatusRequest < 2 } >
              <h2 className={styles.sectionTitle}>
                {t("quote.executiveAssignment")}
              </h2>
              <div className={styles.executivesCard}>
                <div className={styles.executivesList}>
                  {executives.map((executive) => (
                    <div key={executive.idEmployee} className={styles.executiveItemSimple}>
                      <span className={styles.executiveLabel}>Ejecutivo</span>
                      <span className={styles.executiveNameSimple}> {executive.nameEmployee}</span>
                      <button
                        type="button"
                        className={styles.removeIconButton}
                        onClick={() => removeExecutive(executive.idEmployee || "")}
                        title={t("quote.delete")}
                        disabled={mode === "view"}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className={styles.addExecutiveButton}
                  onClick={openExecutiveModal}
                  disabled={mode === "view"}>
                  <Plus size={16} />
                  {t("quote.addExecutive")}
                </button>
              </div>
            </div>*/}

          </div>
        )
        }
      </form>

      {showMerchandiseModal && 
      (
        <MerchandiseModal 
        merchandiseForm={merchandiseForm}
        currentPackages={currentPackages}
        useMetricSystem={useMetricSystem}
        byUnitsMerch={byUnitsMerch}
        classificationFlags={classificationFlags}
        imoList={imoList}
        mode={mode}
        idStatusRequest={formData.idStatusRequest}
        showPackagingModal={showPackagingModal}
        onChangeMerchandiseForm={(changes) => setMerchandiseForm(prev => ({...prev, ...changes}))}
        onChangeMetricSystem={setUseMetricSystem}
        onChangeByUnits={setByUnitsMerch}
        onChangeClassificationFlags={(changes) => setClassificationFlags(prev => ({...prev, ...changes}))}
        onOpenPackagingModal={openPackagingModal}
        onClosePackagingModal={closePackagingModal}
        onAddPackage={addPackage}
        onRemovePackage={removePackage}
        onSave={saveMerchandiseForm}
        onClose={closeMerchandiseModal}
        calculateTotals={calculateTotals}
        t={t}
        />
      )
      /*(
        <div className={styles.modalOverlay} onClick={closeMerchandiseModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {t("quote.merchandiseModal")}
              </h2>
              <button
                type="button"
                className={styles.closeButton}
                onClick={closeMerchandiseModal}
              >
                <X size={24} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalRow}>
                <div className={styles.modalFieldLarge}>
                  <label className={styles.label}>
                    <span className={styles.required}>*</span>
                    {t("quote.merchandise")}
                  </label>
                  <input
                    type="text"
                    maxLength={80}
                    minLength={3}
                    placeholder="Baterías de Telefonos Modelo 388"
                    className={styles.input}
                    value={merchandiseForm?.merchandiseName}
                    onChange={(e) =>
                      setMerchandiseForm({
                        ...merchandiseForm,
                        merchandiseName: e.target.value,
                      })
                    }
                    disabled={mode === "view" || formData.idStatusRequest >= 2}
                  />
                </div>
                <div className={styles.modalFieldSmall}>
                  <label className={styles.label}>
                    {t("quote.isStackable")}
                  </label>
                  <div className={styles.toggleContainer}>
                    <button
                      type="button"
                      className={`${styles.toggleSwitch} ${merchandiseForm?.stowable === 1 ? styles.active : ""}`}
                      onClick={() =>
                        setMerchandiseForm({
                          ...merchandiseForm,
                          stowable: !merchandiseForm.stowable ? 1 : 0,
                        })
                      }
                      disabled={
                        mode === "view" || formData.idStatusRequest >= 2
                      }
                    >
                      <div className={styles.toggleThumb}></div>
                    </button>
                  </div>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  {t("quote.merchandiseDescription")}
                </label>
                <textarea
                  className={styles.textarea}
                  maxLength={500}
                  rows={3}
                  value={merchandiseForm?.merchandiseDescription}
                  disabled={mode === "view" || formData.idStatusRequest >= 2}
                  onChange={(e) =>
                    setMerchandiseForm({
                      ...merchandiseForm,
                      merchandiseDescription: e.target.value || "",
                    })
                  }
                ></textarea>
              </div>
              <div style={{ marginTop: "1.0rem" }}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <span className={styles.required}>*</span>
                    {t("quote.merchandiseClassification")}
                  </label>
                  <div className={styles.classificationGrid}>
                    <div className={styles.classificationColumn}>
                      <div className={styles.classificationCheckbox}>
                        <input
                          type="checkbox"
                          id="peligrosa"
                          className={styles.checkbox}
                          checked={classificationFlags.showDangerouseMerch}
                          onChange={(e) => {
                            setClassificationFlags({
                              ...classificationFlags,
                              showDangerouseMerch:
                                !classificationFlags.showDangerouseMerch,
                            });
                            const currentClassifications =
                              merchandiseForm?.classification ?? [];
                            const exists = currentClassifications.some(
                              (cl) => cl.idClassificationMerchandise === 7,
                            );

                            setMerchandiseForm({
                              ...merchandiseForm,
                              classification: exists
                                ? currentClassifications.filter(
                                    (ccl) =>
                                      ccl.idClassificationMerchandise !== 7,
                                  )
                                : [
                                    ...currentClassifications,
                                    {
                                      idClassificationMerchandise: 7,
                                      classificationMerchandise: "Peligrosa",
                                    },
                                  ],
                            });
                          }}
                          disabled={
                            mode === "view" || formData.idStatusRequest >= 2
                          }
                        />
                        <label
                          htmlFor="peligrosa"
                          className={styles.classificationLabel}
                        >
                          {t("quote.dangerousClass")}
                        </label>
                      </div>
                      <div className={styles.classificationCheckbox}>
                        <input
                          type="checkbox"
                          id="refrigerada"
                          className={styles.checkbox}
                          checked={
                            classificationFlags.showRefrigeratedMerch
                          }
                          onChange={(e) => {
                            setClassificationFlags({
                              ...classificationFlags,
                              showRefrigeratedMerch:
                                !classificationFlags.showRefrigeratedMerch,
                            });
                            const currentClassifications =
                              merchandiseForm?.classification ?? [];
                            const exists = currentClassifications.some(
                              (cl) => cl.idClassificationMerchandise === 10,
                            );

                            setMerchandiseForm({
                              ...merchandiseForm,
                              classification: exists
                                ? currentClassifications.filter(
                                    (ccl) =>
                                      ccl.idClassificationMerchandise !== 10,
                                  )
                                : [
                                    ...currentClassifications,
                                    {
                                      idClassificationMerchandise: 10,
                                      classificationMerchandise: "Refrigerada",
                                    },
                                  ],
                            });
                          }}
                          disabled={
                            mode === "view" || formData.idStatusRequest >= 2
                          }
                        />
                        <label
                          htmlFor="refrigerada"
                          className={styles.classificationLabel}
                        >
                          {t("quote.refrigeratedClass")}
                        </label>
                      </div>
                      <div className={styles.classificationCheckbox}>
                        <input
                          type="checkbox"
                          id="sobredimensionada"
                          className={styles.checkbox}
                          checked={classificationFlags.showOversizedMerch}
                          onChange={(e) => {
                            setClassificationFlags({
                              ...classificationFlags,
                              showOversizedMerch:
                                !classificationFlags.showOversizedMerch,
                            });
                            const currentClassifications =
                              merchandiseForm?.classification ?? [];
                            const exists = currentClassifications.some(
                              (cl) => cl.idClassificationMerchandise === 8,
                            );

                            setMerchandiseForm({
                              ...merchandiseForm,
                              classification: exists
                                ? currentClassifications.filter(
                                    (ccl) =>
                                      ccl.idClassificationMerchandise !== 8,
                                  )
                                : [
                                    ...currentClassifications,
                                    {
                                      idClassificationMerchandise: 8,
                                      classificationMerchandise:
                                        "Sobredimensionada",
                                    },
                                  ],
                            });
                          }}
                          disabled={
                            mode === "view" || formData.idStatusRequest >= 2
                          }
                        />
                        <label
                          htmlFor="sobredimensionada"
                          className={styles.classificationLabel}
                        >
                          {t("quote.oversizedClass")}
                        </label>
                      </div>
                      <div className={styles.classificationCheckbox}>
                        <input
                          type="checkbox"
                          id="granel"
                          className={styles.checkbox}
                          checked={classificationFlags.showBulkClassMerch}
                          onChange={(e) => {
                            setClassificationFlags({
                              ...classificationFlags,
                              showBulkClassMerch:
                                !classificationFlags.showBulkClassMerch,
                            });
                            const currentClassifications =
                              merchandiseForm?.classification ?? [];
                            const exists = currentClassifications.some(
                              (cl) => cl.idClassificationMerchandise === 5,
                            );

                            setMerchandiseForm({
                              ...merchandiseForm,
                              classification: exists
                                ? currentClassifications.filter(
                                    (ccl) =>
                                      ccl.idClassificationMerchandise !== 5,
                                  )
                                : [
                                    ...currentClassifications,
                                    {
                                      idClassificationMerchandise: 5,
                                      classificationMerchandise: "Granel",
                                    },
                                  ],
                            });
                          }}
                          disabled={
                            mode === "view" || formData.idStatusRequest >= 2
                          }
                        />
                        <label
                          htmlFor="granel"
                          className={styles.classificationLabel}
                        >
                          {t("quote.bulkClass")}
                        </label>
                      </div>
                      <div className={styles.classificationCheckbox}>
                        <input
                          type="checkbox"
                          id="general"
                          className={styles.checkbox}
                          checked={classificationFlags.showGeneralMerch}
                          onChange={(e) => {
                            setClassificationFlags({
                              ...classificationFlags,
                              showGeneralMerch:
                                !classificationFlags.showGeneralMerch,
                            });
                            const currentClassifications =
                              merchandiseForm?.classification ?? [];
                            const exists = currentClassifications.some(
                              (cl) => cl.idClassificationMerchandise === 11,
                            );

                            setMerchandiseForm({
                              ...merchandiseForm,
                              classification: exists
                                ? currentClassifications.filter(
                                    (ccl) =>
                                      ccl.idClassificationMerchandise !== 11,
                                  )
                                : [
                                    ...currentClassifications,
                                    {
                                      idClassificationMerchandise: 11,
                                      classificationMerchandise: "General",
                                    },
                                  ],
                            });
                          }}
                          disabled={
                            mode === "view" || formData.idStatusRequest >= 2
                          }
                        />
                        <label
                          htmlFor="general"
                          className={styles.classificationLabel}
                        >
                          General
                        </label>
                      </div>
                    </div>
                    <div className={styles.classificationColumn}>
                      {classificationFlags.showDangerouseMerch && (
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <div className={styles.formGroup}>
                            <label className={styles.label}>
                              *{t("quote.imo")}
                            </label>
                            <select
                              className={styles.select}
                              value={
                                merchandiseForm.classification?.find(
                                  (classification) =>
                                    classification.idClassificationMerchandise ===
                                    7,
                                )?.imo
                              }
                              onChange={(e) => {
                                const selectedImo = imoList.find(
                                  (imo_) => imo_.imo === e.target.value,
                                );
                                const currentClassifications =
                                  merchandiseForm?.classification ?? [];
                                setMerchandiseForm({
                                  ...merchandiseForm,
                                  classification: currentClassifications.map(
                                    (currentClas) =>
                                      currentClas.idClassificationMerchandise ===
                                      7
                                        ? {
                                            ...currentClas,
                                            imo: e.target.value,
                                            imoDescription:
                                              selectedImo?.description,
                                          }
                                        : currentClas,
                                  ),
                                });
                              }}
                            >
                              <option>{t("quote.selectOption")}</option>
                              {imoList.map((imoItem) => (
                                <option key={imoItem._id} value={imoItem.imo}>
                                  {imoItem.imo} - {imoItem.description}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className={styles.formGroup}>
                            <label className={styles.label}>
                              *{t("quote.un")}
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              placeholder="19"
                              className={styles.input}
                              style={{ width: "80px" }}
                              onInput={(e) => {
                                e.currentTarget.value =
                                  e.currentTarget.value.slice(0, 9);
                              }}
                              onKeyDown={(e) => {
                                if (
                                  e.key === "." ||
                                  e.key === "-" ||
                                  e.key === "e"
                                ) {
                                  e.preventDefault();
                                }
                              }}
                              value={
                                merchandiseForm?.classification.find(
                                  (classification) =>
                                    classification.idClassificationMerchandise ===
                                    7,
                                )?.un || ""
                              }
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === "" || Number(value) > 0) {
                                  const currentClassifications =
                                    merchandiseForm?.classification ?? [];
                                  setMerchandiseForm({
                                    ...merchandiseForm,
                                    classification: currentClassifications.map(
                                      (currentClas) =>
                                        currentClas.idClassificationMerchandise ===
                                        7
                                          ? {
                                              ...currentClas,
                                              un: e.target.value,
                                            }
                                          : currentClas,
                                    ),
                                  });
                                }
                              }}
                            />
                          </div>
                        </div>
                      )}
                      {classificationFlags.showRefrigeratedMerch && (
                        <div className={styles.formGroup}>
                          <label className={styles.label}>
                            * {t("quote.temperature")}
                          </label>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <input
                              type="text"
                              inputMode="numeric"
                              placeholder="80"
                              step="1"
                              className={styles.input}
                              style={{ width: "100px" }}
                              value={
                                merchandiseForm?.classification?.find(
                                  (classification) =>
                                    classification.idClassificationMerchandise ===
                                    10,
                                )?.temperature || ""
                              }
                              onChange={(e) => {
                                let value = e.target.value;
                                // eliminar todo lo que no sea número o "-"
                                value = value.replace(/[^0-9-]/g, "");

                                // permitir "-" solo al inicio
                                value = value.replace(/(?!^)-/g, "");

                                const currentClassifications =
                                  merchandiseForm?.classification ?? [];

                                setMerchandiseForm({
                                  ...merchandiseForm,
                                  classification: currentClassifications.map(
                                    (currentClas) =>
                                      currentClas.idClassificationMerchandise ===
                                      10
                                        ? {
                                            ...currentClas,
                                            temperature: value,
                                          }
                                        : currentClas,
                                  ),
                                });
                              }}
                            />
                            <select
                              className={styles.select}
                              style={{ width: "80px" }}
                              value={
                                merchandiseForm?.classification?.find(
                                  (classification) =>
                                    classification.idClassificationMerchandise ===
                                    10,
                                )?.tempUnit || ""
                              }
                              onChange={(e) => {
                                const currentClassifications =
                                  merchandiseForm?.classification ?? [];
                                setMerchandiseForm({
                                  ...merchandiseForm,
                                  classification: currentClassifications.map(
                                    (currentClas) =>
                                      currentClas.idClassificationMerchandise ===
                                      10
                                        ? {
                                            ...currentClas,
                                            tempUnit: e.target.value,
                                          }
                                        : currentClas,
                                  ),
                                });
                              }}
                            >
                              <option>°C</option>
                              <option>°F</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.modalRow} style={{ marginTop: "1.0rem" }}>
                <div>
                  <input
                    type="checkbox"
                    checked={byUnitsMerch}
                    onChange={() => {
                      setByUnitsMerch(!byUnitsMerch);
                      setCurrentPackages([]);
                    }}
                    className={styles.checkbox}
                    disabled={mode === "view" || formData.idStatusRequest >= 2}
                  />
                  <label className={styles.checkboxLabel}> Por unidades </label>
                </div>
                <div className={styles.formGroup}>
                  <div className={styles.unitTypeToggle}>
                    <span
                      className={
                        !useMetricSystem
                          ? styles.activeUnitLabel
                          : styles.inactiveUnitLabel
                      }
                    >
                      {t("quote.units.lbsInches")}
                    </span>
                    <button
                      type="button"
                      className={`${styles.toggleSwitch} ${useMetricSystem ? styles.active : ""}`}
                      onClick={() => setUseMetricSystem(!useMetricSystem)}
                      disabled={
                        mode === "view" || formData.idStatusRequest >= 2
                      }
                    >
                      <div className={styles.toggleThumb}></div>
                    </button>
                    <span
                      className={
                        useMetricSystem
                          ? styles.activeUnitLabel
                          : styles.inactiveUnitLabel
                      }
                    >
                      {t("quote.units.kgCm")}
                    </span>
                  </div>
                </div>
              </div>

              {!byUnitsMerch ? (
                <div
                  className={styles.modalRow}
                  style={{ marginTop: "1.0rem" }}
                >
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      {t("quote.totalVolume")} (
                      {useMetricSystem ? t("quote.cm") : t("quote.in")}){" "}
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      placeholder="0"
                      value={merchandiseForm.volumeTotal}
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key === "e") {
                          e.preventDefault();
                        }
                        if (
                          e.currentTarget.value.length >= 7 &&
                          e.key !== "Backspace" &&
                          e.key !== "Delete"
                        ) {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || Number(value) > 0) {
                          setMerchandiseForm({
                            ...merchandiseForm,
                            volumeTotal: Number(e.target.value),
                          });
                        }
                      }}
                      className={styles.input}
                      disabled={
                        mode === "view" || formData.idStatusRequest >= 2
                      }
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      {t("quote.totalWeight")} (
                      {useMetricSystem ? t("quote.kg") : t("quote.lbs")}){" "}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={merchandiseForm.weigthTotal}
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key === "e") {
                          e.preventDefault();
                        }
                        if (
                          e.currentTarget.value.length >= 7 &&
                          e.key !== "Backspace" &&
                          e.key !== "Delete"
                        ) {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || Number(value) > 0) {
                          setMerchandiseForm({
                            ...merchandiseForm,
                            weigthTotal: Number(e.target.value),
                          });
                        }
                      }}
                      className={styles.input}
                      placeholder="0"
                      disabled={
                        mode === "view" || formData.idStatusRequest >= 2
                      }
                    />
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: "1.5rem" }}>
                  <button
                    type="button"
                    className={styles.addPackageButtonIcon}
                    onClick={openPackagingModal}
                    disabled={mode === "view" || formData.idStatusRequest >= 2}
                  >
                    <Plus size={18} />
                    {t("quote.addPackaging")}
                  </button>
                  {currentPackages.length > 0 && (
                    <div
                      className={styles.packagesTable}
                      style={{ marginTop: "1rem" }}
                    >
                      <table className={styles.simpleTable}>
                        <thead>
                          <tr>
                            <th>{t("quote.packagingTable.packaging")}</th>
                            <th>{t("quote.packagingTable.quantity")}</th>
                            <th>
                              {t("quote.packagingTable.length")} (
                              {useMetricSystem ? t("quote.cm") : t("quote.in")})
                            </th>
                            <th>
                              {t("quote.packagingTable.height")} (
                              {useMetricSystem ? t("quote.cm") : t("quote.in")})
                            </th>
                            <th>
                              {t("quote.packagingTable.width")} (
                              {useMetricSystem ? t("quote.cm") : t("quote.in")})
                            </th>
                            <th>
                              {t("quote.packagingTable.weight")} (
                              {useMetricSystem ? t("quote.kg") : t("quote.lbs")}
                              )
                            </th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentPackages.map((pkg, index = 0) => (
                            <tr key={index + 1}>
                              <td>{pkg.unitCargo}</td>
                              <td>{pkg.quantity}</td>
                              <td>{pkg.length}</td>
                              <td>{pkg.height}</td>
                              <td>{pkg.width}</td>
                              <td>{pkg.weight}</td>
                              <td>
                                <button
                                  type="button"
                                  className={styles.removeRowButton}
                                  onClick={() => removePackage(pkg)}
                                  disabled={
                                    mode === "view" ||
                                    formData.idStatusRequest >= 2
                                  }
                                >
                                  <X size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {currentPackages.length > 0 && (
                    <div className={styles.modalFooterInfo}>
                      <div className={styles.totalsDisplay}>
                        <div>
                          <div className={styles.totalLabel}>
                            {t("quote.totalVolume")}
                          </div>
                          <div className={styles.totalValue}>
                            {calculateTotals().totalVolume.toFixed(2)}{" "}
                            {useMetricSystem ? "cm³" : "in³"}
                          </div>
                        </div>
                        <div>
                          <div className={styles.totalLabel}>
                            {t("quote.totalWeight")}
                          </div>
                          <div className={styles.totalValue}>
                            {calculateTotals().totalWeight.toFixed(2)}{" "}
                            {useMetricSystem ? "kg" : "lbs"}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.saveModalButton}
                onClick={saveMerchandiseForm}
                disabled={mode === "view" || formData.idStatusRequest >= 2}
              >
                {t("quote.save")}
              </button>
            </div>
          </div>
        </div>
      )*/
      }

      {/**MODAL EJECUTVOS */}
      {showExecutiveModal && (
        <ExecutiveModal 
        availableExecutives={availableExecutives}
        assignedExecutives={executives}
        onAdd={addExecutive}
        onClose={closeExecutiveModal}
        t={t}
        />

      /*<div className={styles.modalOverlay} onClick={closeExecutiveModal}>
          <div
            className={styles.modalContentSmall}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {t("quote.selectExecutive")}
              </h2>
              <button
                type="button"
                className={styles.closeButton}
                onClick={closeExecutiveModal}
              >
                <X size={24} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.executiveSelectionList}>
                {availableExecutives
                  .filter(
                    (exec) =>
                      !executives.some((e) => e.idEmployee === exec._Id),
                  )
                  .map((executive) => (
                    <div
                      key={executive._id}
                      className={styles.executiveSelectionItem}
                      onClick={() =>
                        addExecutive({
                          idEmployee: executive._Id,
                          nameEmployee: `${executive.nombre} ${executive.apellido_paterno} ${executive.apellido_materno}`,
                          idUser: executive._Iduser,
                        })
                      }
                    >
                      <span>
                        {executive.nombre} {executive.apellido_paterno}{" "}
                        {executive.apellido_materno}
                      </span>
                      <Plus size={18} className={styles.addIcon} />
                    </div>
                  ))}
                {availableExecutives.filter(
                  (exec) => !executives.some((e) => e.idEmployee === exec._Id),
                ).length === 0 && (
                  <div className={styles.noExecutivesMessage}>
                    {t("quote.allExecutivesAdded")}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>*/
      )}

     

      <Modal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        onConfirm={modalState.onConfirm}
        onNoAction={modalState.onNoAction}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        showCancel={modalState.showCancel}
        showNoAction = {modalState.showNoAction}
        confirmText={t("quote.continue")}
        cancelText={t("quote.cancel")}
        noActionText="No"
      />
    </div>
  );
}
