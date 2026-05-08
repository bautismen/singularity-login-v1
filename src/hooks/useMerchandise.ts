import { useState } from 'react';
import { Cargo } from '../types/requestQuotation';
import { Service } from '../types/requestQuotation';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ClassificationFlags {
  showDangerouseMerch: boolean;
  showRefrigeratedMerch: boolean;
  showOversizedMerch: boolean;
  showBulkClassMerch: boolean;
  showGeneralMerch: boolean;
}

const EMPTY_FORM: Cargo = {
  merchandiseName: '',
  merchandiseDescription: '',
  classification: [],
  stowable: 0,
  shipmentTypeCargo: '',
  idUnitMeasurement: 1,
  unitMeasurement: 'cm',
  idUnitWeight: 1,
  unitWeight: 'kg',
  volumeTotal: 0,
  weigthTotal: 0,
  units: [],
};

const EMPTY_FLAGS: ClassificationFlags = {
  showDangerouseMerch: false,
  showRefrigeratedMerch: false,
  showOversizedMerch: false,
  showBulkClassMerch: false,
  showGeneralMerch: false,
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useMerchandise = () => {

  const [showMerchandiseModal, setShowMerchandiseModal] = useState(false);
  const [showPackagingModal, setShowPackagingModal]     = useState(false);
  const [editingMerchandise, setEditingMerchandise]     = useState<Cargo | null>(null);
  const [currentServiceIdMerch, setCurrentServiceIdMerch] = useState<number | null>(null);
  const [merchandiseForm, setMerchandiseForm]           = useState<Cargo>(EMPTY_FORM);
  const [currentPackages, setCurrentPackages]           = useState<any[]>([]);
  const [useMetricSystem, setUseMetricSystem]           = useState(true);
  const [byUnitsMerch, setByUnitsMerch]                 = useState(true);
  const [classificationFlags, setClassificationFlags]   = useState<ClassificationFlags>(EMPTY_FLAGS);
  const [serviceId, setServiceId] = useState<number | null>(null);

  // ── Modal mercancía ──────────────────────────────────────────────────────────

  const openMerchandiseModal = (service: Service, cargo?: Cargo) => {
    setCurrentServiceIdMerch(service.idServiceItem);
    setServiceId(service.idService);
    setByUnitsMerch([2, 3, 10].includes(service.idService) ? false : true);
    setEditingMerchandise(cargo || null);
    setClassificationFlags(EMPTY_FLAGS);    

    if (cargo) {
      setByUnitsMerch(cargo.units?.length === 0 ? false : true);
      setUseMetricSystem(cargo.idUnitMeasurement === 1);
      setClassificationFlags({
        showDangerouseMerch:   cargo.classification.some(c => c.idClassificationMerchandise === 7),
        showRefrigeratedMerch: cargo.classification.some(c => c.idClassificationMerchandise === 10),
        showOversizedMerch:    cargo.classification.some(c => c.idClassificationMerchandise === 8),
        showBulkClassMerch:    cargo.classification.some(c => c.idClassificationMerchandise === 5),
        showGeneralMerch:      cargo.classification.some(c => c.idClassificationMerchandise === 11),
      });
      setMerchandiseForm({
        merchandiseName:        cargo.merchandiseName,
        merchandiseDescription: cargo.merchandiseDescription || '',
        classification:         cargo.classification,
        stowable:               cargo.stowable,
        shipmentTypeCargo:      cargo.shipmentTypeCargo,
        idUnitMeasurement:      cargo.idUnitMeasurement || 1,
        unitMeasurement:        cargo.unitMeasurement   || 'cm',
        idUnitWeight:           cargo.idUnitWeight      || 1,
        unitWeight:             cargo.unitWeight        || 'kg',
        volumeTotal:            cargo.volumeTotal,
        weigthTotal:            cargo.weigthTotal,
        units:                  cargo.units,
      });
      setCurrentPackages(cargo.units || []);
    } else {
      setMerchandiseForm(EMPTY_FORM);
      setCurrentPackages([]);
    }

    setShowMerchandiseModal(true);
  };

  const closeMerchandiseModal = () => {
    setShowMerchandiseModal(false);
    setByUnitsMerch(true);
    setClassificationFlags(EMPTY_FLAGS);
    setEditingMerchandise(null);
    setCurrentServiceIdMerch(null);
    setServiceId(null);
    setMerchandiseForm(EMPTY_FORM);
    setCurrentPackages([]);
  };

  // ── Modal packaging ──────────────────────────────────────────────────────────

  const openPackagingModal  = () => setShowPackagingModal(true);
  const closePackagingModal = () => setShowPackagingModal(false);

  const addPackage = (pkg: any) => {
    setCurrentPackages(prev => [...prev, { ...pkg, id: Date.now() }]);
    closePackagingModal();
  };

  const removePackage = (pkg: any) => {
    setCurrentPackages(prev => prev.filter(p => p !== pkg));
  };

  // ── Totales ──────────────────────────────────────────────────────────────────

  const calculateTotals = () => {
    let totalVolume = 0;
    let totalWeight = 0;
    currentPackages.forEach(pkg => {
      totalVolume += pkg.length * pkg.height * pkg.width * pkg.quantity;
      totalWeight += pkg.weight * pkg.quantity;
    });
    return {
      totalVolume: Number(totalVolume.toFixed(2)),
      totalWeight: Number(totalWeight.toFixed(2)),
    };
  };

  // ── Validación y build del objeto final ─────────────────────────────────────

  /**
   * Valida el form y construye el objeto Cargo listo para guardar.
   * Devuelve el objeto si es válido, o un string con el key de traducción del error.
   */
  const buildMerchandise = (): Cargo | string => {
    if (!currentServiceIdMerch && !serviceId) return "'quote.warnings.merchandiseName'";

    if (!merchandiseForm.merchandiseName.trim()) {
      return 'quote.warnings.merchandiseName';
    }

    const dangerous = merchandiseForm.classification?.find(c => c.idClassificationMerchandise === 7);
    if (dangerous && (!dangerous.imo || !dangerous.un)) {
      return 'quote.warnings.IMOUN';
    }

    const refrigerated = merchandiseForm.classification?.find(c => c.idClassificationMerchandise === 10);
    if (refrigerated && !refrigerated.temperature) {
      return 'quote.warnings.temperature';
    }

    const { totalVolume, totalWeight } = calculateTotals();

    const classification = merchandiseForm.classification.length === 0
      ? [{ idClassificationMerchandise: 11, classificationMerchandise: 'General' }]
      : merchandiseForm.classification;

    return {
      merchandiseName:        merchandiseForm.merchandiseName,
      merchandiseDescription: merchandiseForm.merchandiseDescription,
      classification,
      stowable:          merchandiseForm.stowable,
      shipmentTypeCargo: [2, 3, 10].includes(serviceId || 0) ? 'Contenerizada' : 'Suelta',
      idUnitMeasurement: useMetricSystem ? 1 : 2,
      unitMeasurement:   useMetricSystem ? 'cm' : 'in',
      idUnitWeight:      useMetricSystem ? 1 : 2,
      unitWeight:        useMetricSystem ? 'kg' : 'lb',
      volumeTotal:  byUnitsMerch ? totalVolume : merchandiseForm.volumeTotal,
      weigthTotal:  byUnitsMerch ? totalWeight : merchandiseForm.weigthTotal,
      units: currentPackages.map(pkg => ({ ...pkg })),
    };
  };

  return {
    // estado
    showMerchandiseModal,
    showPackagingModal,
    editingMerchandise,
    currentServiceIdMerch,
    merchandiseForm,
    currentPackages,
    useMetricSystem,
    byUnitsMerch,
    classificationFlags,
    // acciones modal mercancía
    openMerchandiseModal,
    closeMerchandiseModal,
    setMerchandiseForm,
    setUseMetricSystem,
    setByUnitsMerch,
    setClassificationFlags,
    // acciones modal packaging
    openPackagingModal,
    closePackagingModal,
    addPackage,
    removePackage,
    // utils
    calculateTotals,
    buildMerchandise,
  };
};