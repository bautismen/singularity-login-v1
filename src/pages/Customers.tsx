import { useState, useEffect } from 'react';
import { Search, Plus, Save, Edit2, ChevronDown, ChevronUp, X, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Customer, Person, Company, Contacts, Address, History, MEXICAN_STATES, CONTACT_TYPES } from '../types/customer';
import { getCustomers, createCustomer, updateCustomer, getCompanies, createCompany } from '../services/customerService';
import styles from './Customers.module.css';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { catalogService } from '../services/catalogsService';

export default function Customers() { //{ onNavigate }: { onNavigate: (route: string) => void }
  const { t } = useLanguage();
  const { showError, showWarning } = useNotification();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'activo' | 'inactivo'>('todos');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    general: false,
    address: false,
    contacts: false,
  });
  const { user } = useAuth();
  const [showPersonForm, setShowPersonForm] = useState(false);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [sectores, setSectores] = useState<any[]>([]);

  const CLIENT_LEVEL_MAP = {
    oro: 1,
    plata: 2,
    bronce: 3,
  } as const;

  const [formData, setFormData] = useState({
    Id: '',
    IdCustomer: 0,
    IsBranch: false,
    BranchName: '',
    IsNational: false,
    IsPersonaFisica: false,
    Curp: '',
    CompanyId: '',
    PersonId: null,
    // client_level: 'oro' as  'oro' | 'plata' | 'bronce',
    ClientLevelId: 1 as 1 | 2 | 3,
    FiscalData: {
      BusinessName: '',
      Country: 'MX',
      TaxId: '',
    },
    Contacts: [] as Contacts[],
    Addresses: [] as Address[],
    IsCorrespondent: false,
    Sector_id: 0,
    Sector_name: '',
    History: [] as History[],
    CreatedAt: Date,
    UpdatedAt: Date,
    CreatedBy: {IdUser: user?._id, Name: user?.name},
    Status: 1 as 1 | 0,//'activo' as 'activo' | 'inactivo',
    Archived: false,
    DataState: 1
  });

  const getClientLevelMedal = (level: 1 | 2 | 3) => {
  switch (level) {
    case 1:
      return '/gold.png';
    case 2:
      return '/silver.png';
    case 3:
      return '/bronze.png';
    default:
      return '';
  }
};
  const [newPerson, setNewPerson] = useState<Partial<Person>>({
    name: '',
    rfc: '',
    nationality: 'nacional',
    country: 'MX',
    state: '',
    birth_date: '',
    status: 'activo',
    archivado: false,
  });

  const [newCompany, setNewCompany] = useState<Partial<Company>>({
    Business_name: '',
    Rfc_taxid: '',
    Nationality: 'nacional',
    Country: 'MX',
    Sector_id: 0,
    Sector_name: '',
    Status: 1,
    Archived: false,
    Data_state: 1,
  });

  const [countries, setCountries] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    loadCustomers();
     loadCompanies();
  }, []);

  useEffect(() => {
    // loadPeople();
    loadCountries();
    loadSector();
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseModal();
      }
    };

    if (showCompanyForm) {
      window.addEventListener("keydown", handleEsc);
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [showCompanyForm]);

  async function loadCustomers() {
    try {
      setLoading(true);
      const data = await getCustomers(true);
      setCustomers(data);
    } catch (error) {
      console.error(t('cust.errorLoad'), error);
    } finally {
      setLoading(false);
    }
  }

  // async function loadPeople() {
  //   try {
  //     const data = await getPeople();
  //     setPeople(data);
  //   } catch (error) {
  //     console.error(t('cust.errorLoadPeople'), error);
  //   }
  // }

  async function loadCompanies() {
    try {
      const dataCompanie = await getCompanies();
      setCompanies(dataCompanie.filter((c: any) => c.status === 1));

    } catch (error) {
      console.error('Error loading companies:', error);
    }
  }

  async function loadCountries() {
    try {
      // const API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
      // const BASE_URL = import.meta.env.VITE_SUPABASE_URL;
      // const response = await fetch(`${BASE_URL}/functions/v1/catalog-countries`, {
      //   headers: {
      //     'Authorization': `Bearer ${API_KEY}`,
      //     'Content-Type': 'application/json'
      //   }
      // });

      const countriesData = await catalogService.getCountries();
      setCountries(countriesData.data.filter((c: any) => c.status === 1));
    } catch (error) {
      console.error('Error loading countries:', error);
    }
  };

  const loadSector = async () => {
      try {
        const SectorData = await catalogService.getSector();
        setSectores(SectorData.data.filter((c: any) => c.status === 1));
      } catch (error) {
        console.error('Error loading sector:', error);
      }
    };

  function toggleSection(section: string) {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  }

  function handleNewCustomer() {
    setEditingCustomer(null);
    setFormData({
      Id: '',
      IdCustomer: 0,
      IsBranch: false,
      BranchName: '',
      IsNational: false,
      IsPersonaFisica: false,
      Curp: '',
      CompanyId: '',
      PersonId: null,
      // client_level: 'oro',
      ClientLevelId: CLIENT_LEVEL_MAP.oro,
      FiscalData: {
        BusinessName: '',
        Country: 'MX',
        TaxId: '',
      },
      Contacts: [],
      Addresses: [],
      IsCorrespondent: false,
      Sector_id: 0,
      Sector_name: '',
      History: [],
      CreatedAt: Date,
      UpdatedAt: Date,
      CreatedBy: {IdUser: user._id, Name: user?.name},
      Status: 1,
      Archived: false,
      DataState: 1
    });
    setIsFormOpen(true);
  }

  function handleEditCustomer(customer: Customer) {
  addHistory
  setEditingCustomer(customer);

  const selectedCompany = companies.find(c => c._Id === customer.companyId);
  // console.log(customer)
  
  setFormData({
    Id: customer.id,
    IdCustomer: customer.idCustomer,
    IsBranch: customer.isBranch,
    BranchName: customer.branchName || '',
    IsNational: customer.isNational ?? false,
    IsPersonaFisica: customer.isPersonaFisica ?? false,
    Curp: customer.curp || '',
    // type: customer.type,
    CompanyId: customer.companyId || '',
    PersonId: null,
    // nationality: customer.nationality ?? 'nacional',
    // client_level: customer.client_level ?? 'oro',
    ClientLevelId: customer.clientLevelId ?? 1,
    FiscalData: selectedCompany ?
        {
          BusinessName: selectedCompany.business_name || '',
          Country: selectedCompany.country || 'MX',
          TaxId: customer.fiscalData.taxId || selectedCompany.rfc_taxid || '',
        } : customer.fiscalData,
    Contacts: customer.contacts || [],
    Addresses: customer.addresses || [],
    IsCorrespondent: customer.isCorrespondent,
    Sector_id: selectedCompany.sector_id || customer.sector_id,
    Sector_name: selectedCompany.sector|| customer.sector_name,
    CreatedAt: new Date(),
    CreatedBy: customer.createdBy || [],
    UpdatedAt: new Date(),
    Status: customer.status,
    Archived: customer.archived,
    DataState: customer.dataState,
    History: [],
  });

  setIsFormOpen(true);
}

async function handleSaveCustomer(e: React.FormEvent<HTMLFormElement>) {
  
  try {
    e.preventDefault();
    setLoading(true);

      const selectedCompany = companies.find(c => c._Id === formData.CompanyId);

      if (!selectedCompany && !formData.PersonId) {
      showWarning(t('cust.errorLoadCompanyPeople'));
        setLoading(false);
        return;
      }

      const dataToSave = {
        ...formData,
          FiscalData: selectedCompany ? {
          BusinessName: selectedCompany.business_name,
          Country: selectedCompany.country,
          TaxId: formData.FiscalData.TaxId || selectedCompany.rfc_taxid,
        } : formData.FiscalData,
      };

      const existsDuplicate = customers.some(customer =>
      customer.CompanyId === formData.CompanyId &&
      customer.Status === formData.Status &&
      customer.IsBranch === formData.IsBranch &&
      (
        // matriz
        !formData.IsBranch ||
        // sucursal
        customer.BranchName?.trim().toLowerCase() ===
          formData.BranchName.trim().toLowerCase()
      ) &&
      (
        // si es edición, excluir el mismo registro
        !editingCustomer ||
        customer.Id !== editingCustomer.Id
      )
    );

    if (existsDuplicate) {
      showError(t('cust.errorMatrizExists'));
      setLoading(false);
      return;
    }

      if (editingCustomer) {

        await updateCustomer(editingCustomer.Id!, dataToSave);

      } else {
      
        await createCustomer(dataToSave);

      }

      await loadCustomers();
      setIsFormOpen(false);
      setEditingCustomer(null);
    } catch (error) {
      console.error('Error saving customer:', error);
      const errorMessage = error instanceof Error ? error.message : t('cust.errorSave');
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  }
/*
  async function handleDeleteCustomer(id: string) {
    try {
      setLoading(true);
      await deleteCustomer(id);
      await loadCustomers();
      showError(t('cust.successDelete'));
    } catch (error) {
      console.error('Error deleting customer:', error);
      showError(t('cust.errorDelete'));
    } finally {
      setLoading(false);
    }
  }

  async function handleCreatePerson() {
    try {
      const created = await createPerson(newPerson);
      setPeople([...people, created]);
      setFormData({ ...formData, person_id: created._id! });
      setShowPersonForm(false);
      setNewPerson({
        name: '',
        rfc: '',
        nationality: 'nacional',
        country: 'MX',
        state: '',
        birth_date: '',
        status: 'activo',
        archivado: false,
      });
    } catch (error) {
      console.error('Error creating person:', error);
      showError('Error al crear la persona: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  */

  async function handleCreateCompany(e: React.FormEvent<HTMLFormElement>) {

    try {
      e.preventDefault();
      const created = await createCompany(newCompany);
      await loadCompanies();
      // setCompanies([...companies]);
      handleCompanyChange(created.atrribute.value);
      setFormData({ 
        ...formData, 
        CompanyId: created.atrribute.value!,
        // nationality: created.nationality,
        IsNational: newCompany.Nationality === 'nacional' ? true : false,
        FiscalData: {
          BusinessName: newCompany.Business_name,
          Country: newCompany.Country,
          TaxId: newCompany.Rfc_taxid,
        },
        Sector_id: newCompany.Sector_id,
        Sector_name: newCompany.Sector_name
      });
      handleCloseModal()
    } catch (error) {
      console.error('Error creating company:', error);
      showError('Error al crear la empresa: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  }

  function handleCloseModal(){
    setShowCompanyForm(false);
      setNewCompany({
        Business_name: '',
        Rfc_taxid: '',
        Nationality: undefined,
        Country: '',
        Sector_id: 0,
        Sector_name: '',
        Status: 1,
        Archived: false,
        Data_state: 1,
      });
  }

  function addHistory() {
    const newhistory: History = {
          userId: user?._id,
          userName: user?.name,
          date: new Date().toISOString(),
          changes: {
            field: '',
            oldValue: '',
            newValue: '',
          },
      };
      setFormData({ ...formData, History: [...formData.History, newhistory] });
  }

  function addContact() {
    const newContact: Contacts = {
      email: '',
      name: '',
      phone: '',
      position: '',
      status: 1, //'activo',
      type: 'general',
      validFrom: new Date().toISOString(),
      valiValidTo: null,
    };
    setFormData({ ...formData, Contacts: [...formData.Contacts, newContact] });
  }

  function removeContact(index: number) {
    setFormData({
      ...formData,
      Contacts: formData.Contacts.filter((_, i) => i !== index),
    });
  }

  function updateContact(index: number, field: keyof Contacts, value: string) {
    const updated = [...formData.Contacts];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, Contacts: updated });
  }

  function addAddress() {
    const newAddress: Address = {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'MX',
      status: 1,
      validFrom: new Date().toISOString(),
      validTo: null,
    };
    setFormData({ ...formData, Addresses: [...formData.Addresses, newAddress] });
  }

  function removeAddress(index: number) {
    setFormData({
      ...formData,
      Addresses: formData.Addresses.filter((_, i) => i !== index),
    });
  }

  function updateAddress(index: number, field: keyof Address, value: string) {
    const updated = [...formData.Addresses];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, Addresses: updated });
  }

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.fiscalData.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.fiscalData.taxId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'todos' || statusFilter === (customer.status === 1 ? 'activo' : 'inactivo');

    return matchesSearch && matchesStatus;
  });

  function handleCompanyChange(selectedCompanyId: string) {
    const selectedCompany = companies.find(c => c._Id === selectedCompanyId);
    if (!selectedCompany) {
      setFormData({
        ...formData,
        CompanyId: '',
        IsNational: false,
        FiscalData: {
          BusinessName: '',
          Country: 'MX',
          TaxId: '',
        },
        Sector_id: 0,
        Sector_name: ''
      });
      return;
    }

    setFormData({
      ...formData,
      CompanyId: selectedCompanyId,
      IsNational: selectedCompany.nationality === 'nacional' ? true : false,
      FiscalData: {
        BusinessName: selectedCompany.business_name || '',
        Country: selectedCompany.country || 'MX',
        TaxId: selectedCompany.rfc_taxid || '',
      },
      IsPersonaFisica: selectedCompany.rfc_taxid.length === 13 ? true : false,
      Sector_id: selectedCompany.sector_id || 0,
      Sector_name: selectedCompany.sector_name || ''
    });
  }

  if (isFormOpen) {
    return (
      <>
        <form onSubmit={handleSaveCustomer} className={styles.formContainer}>

          <div className={styles.formHeaderRow}>
            <div className={styles.header}>
              <button
                onClick={() => setIsFormOpen(false)}
                className={styles.backButton}
                title="Volver a lista"
              >
                <ArrowLeft size={18} />
              </button>
              <h2 className={styles.formTitle}>
                {editingCustomer ? t('cust.editCustomer') : t('cust.newCustomer')}
              </h2>
            </div>

            <div className={styles.headerActions}>
              <button 
                type="submit" // <-- importante
                className={styles.saveHeaderButton} 
                disabled={loading}
              >
                <Save size={18} />
                {loading ? t('catalog.saving') : t('catalog.save')}
              </button>

              {/*
              <button 
                type="button"
                onClick={() => setIsFormOpen(false)} 
                className={styles.cancelHeaderButton}
              >
                {t('cust.cancel')}
              </button>
              */}
            </div>
          </div>

          <div className={styles.sectionCard}>
            <div className={styles.sectionTitle}>{t('cust.TitleDataGeneral')}</div>

            <div className={styles.twoColumnGrid}>
              <div className={styles.leftColumn}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    <span className={styles.required}>* </span>
                      {t('cust.selectCompany')}
                  </label>
                  <select
                    value={formData.CompanyId}
                    disabled={!!editingCustomer}
                    onChange={(e) => handleCompanyChange(e.target.value)}
                    className={styles.selectInput}
                    required  // <-- Aqui el "required"
                    onInvalid={(e) => 
                      e.currentTarget.setCustomValidity(t('cust.RequiredCompany')) /* si todavia no tiene capturado */
                    }
                    onInput={(e) =>
                      e.currentTarget.setCustomValidity('') /* se limpia msj si ya se capturo */
                    }
                  >
                    <option value="">{t('cust.selectCompany')}</option>
                    {companies.map((company) => (
                      <option key={company._Id} value={company._Id}>
                        {company.business_name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  // onClick={() => onNavigate('catalogs/companies')}
                  onClick={() => setShowCompanyForm(true)}
                  className={
                    editingCustomer
                      ? styles.fullWidthGrayButton
                      : styles.fullWidthGreenButton
                  }
                  disabled={!!editingCustomer}
                >
                  <Plus size={16} />
                  {t('cust.newCompany')}
                </button>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    <span className={styles.required}>* </span>{t('supp.selectSector')}
                  </label>
                  <select
                    value={formData.Sector_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        Sector_id: parseInt(e.target.value),
                        Sector_name: e.target.options[e.target.selectedIndex].text
                      })
                    }
                    className={styles.selectInput}
                    required
                    onInvalid={(e) =>
                      e.currentTarget.setCustomValidity(t('catalog.requiredFields'))
                    }
                    onInput={(e) =>
                      e.currentTarget.setCustomValidity('')
                    }
                    // disabled={!!editingCustomer}
                  >
                    <option value="">{t('supp.selectSector')}</option>
                    {sectores.map((sector) => (
                      <option key={sector._Id} value={sector._Id}>
                        {sector.name}
                      </option>
                    ))
                    }
                  </select>
                </div>

                <div className={styles.checkboxField}>
                  <input
                    type="checkbox"
                    id="is_branch"
                    checked={formData.IsBranch}
                    onChange={(e) => setFormData({ ...formData, IsBranch: e.target.checked })}
                    className={styles.checkbox}
                    disabled={loading}
                  />
                  <label htmlFor="is_branch" className={styles.checkboxText}>{t('cust.isBranch')}</label>
                </div>

                <div className={styles.checkboxField}>
                  <input
                    type="checkbox"
                    id="is_national"
                    checked={formData.IsNational}
                    disabled
                    onChange={(e) => setFormData({
                      ...formData,
                      IsNational: e.target.checked,
                      IsPersonaFisica: false,
                      Curp: ''
                    })}
                    className={styles.checkbox}
                  />
                  <label htmlFor="is_national" className={styles.checkboxText}>{t('cust.Isnational')}</label>
                </div>

                 {formData.IsNational && (
                  <div className={styles.checkboxField}>
                    <input
                      type="checkbox"
                      id="is_persona_fisica"
                      checked={formData.IsPersonaFisica}
                      onChange={(e) => {
                        const checked = e.target.checked;

                        setFormData({
                          ...formData,
                          IsPersonaFisica: checked,
                          // type: checked ? 'fisica' : 'moral',
                          // PersonId: checked ? formData.PersonId : '',
                          Curp: checked ? formData.Curp : '',
                        });
                      }}
                      className={styles.checkbox}
                      disabled={!!editingCustomer}
                    />
                    <label
                      htmlFor="is_persona_fisica"
                      className={styles.checkboxText}
                    >
                      {t('cust.NaturalPerson')}
                    </label>
                  </div>
                )}

                <div className={styles.checkboxField}>
                  <input
                    type="checkbox"
                    id="is_correspondent"
                    checked={formData.IsCorrespondent}
                    onChange={(e) => setFormData({ ...formData, IsCorrespondent: e.target.checked })}
                    className={styles.checkbox}
                    disabled={loading}
                  />
                  <label htmlFor="is_correspondent" className={styles.checkboxText}>{t('cust.isCorrespondent')}</label>
                </div>

              </div>

              <div className={styles.rightColumn}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    <span className={styles.required}>* </span>
                    RFC/TAXID 
                  </label>
                  <input
                    type="text"
                    value={formData.FiscalData.TaxId}
                    disabled
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        FiscalData: { ...formData.FiscalData, TaxId: e.target.value }
                      })
                    }
                    className={styles.textInput}
                    placeholder="RFC/TAXID"
                  />
                </div>

                <div className={styles.statusField}>
                  <span className={styles.statusText}>{t('cust.checkActive')}</span>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={formData.Status === 1}
                      onChange={(e) => setFormData({
                        ...formData,
                        Status: e.target.checked ? 1 : 0
                      })}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                {/* Nivel de cliente */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    {t('cust.clientLevel')}
                  </label>
                  <select
                    value={formData.ClientLevelId}
                    onChange={(e) => {
                      const level = e.target.value as 'oro' | 'plata' | 'bronce';
                      setFormData({
                        ...formData,
                        // client_level: level,
                        ClientLevelId: CLIENT_LEVEL_MAP[level],
                      });
                    }}
                    className={styles.selectInput}
                    required
                    disabled={formData.Status !== 1}
                  >
                    <option value="" disabled>
                      {t('cust.selectLevel')}
                    </option>
                    <option value={1}>{t('cust.clientLevelGold')}</option>
                    <option value={2}>{t('cust.clientLevelSilver')}</option>
                    <option value={3}>{t('cust.clientLevelBronze')}</option>
                    {/* <option value="oro">{t('cust.clientLevelGold')}</option>
                    <option value="plata">{t('cust.clientLevelSilver')}</option>
                    <option value="bronce">{t('cust.clientLevelBronze')}</option> */}
                  </select>

                </div>         
                {formData.IsBranch && (
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>{t('cust.branchName')}</label>
                    <input
                      type="text"
                      value={formData.BranchName}
                      onChange={(e) => setFormData({ ...formData, BranchName: e.target.value })}
                      className={styles.textInput}
                      placeholder={t('cust.branchName')}
                      disabled={!!editingCustomer}
                    />
                  </div>
                )}

                {formData.IsNational && formData.IsPersonaFisica && (
                  <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>CURP</label>
                  <input
                    type="text"
                    value={formData.Curp}
                    onChange={(e) => setFormData({
                      ...formData, 
                      Curp: e.target.value.toUpperCase()
                                          .replace(/[^A-Z0-9]/g, "")
                                          .slice(0, 18)
                      })}
                    className={styles.textInput}
                    placeholder="CURP"
                    disabled={!!editingCustomer}
                  />
                </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.sectionCard}>
            <div
              className={styles.sectionTitleCollapsible}
              onClick={() => toggleSection('contacts')}
            >
              <div className={styles.sectionTitleWithDot}>
                <span className={styles.greenDot}></span>
                <span>{t('cust.contacts')}</span>
              </div>
              {collapsedSections.contacts ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </div>

            {!collapsedSections.contacts && (
              <div className={styles.sectionContent}>
                <button
                    type="button"
                    onClick={addContact}
                    className={styles.addDashedButton}
                  >
                  <Plus size={20} />
                  {t('cust.addContact')}
                </button>
                {formData.Contacts.map((contact, index) => (
                  <div key={index} className={styles.itemCard}>
                    <div className={styles.itemHeader}>
                      <h4>{t('cust.contact')} {index + 1}</h4>
                      <button onClick={() => removeContact(index)} className={styles.removeButton}>
                        <X size={18} />
                      </button>
                    </div>
                    <div className={styles.formRow}>
                      <label>
                        {t('cust.TypeContact')}
                        <select
                          value={contact.type}
                          onChange={(e) => updateContact(index, 'type', e.target.value)}
                        >
                          {CONTACT_TYPES.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div className={styles.formRow}>
                      <label>
                      {t('cust.contactName')}
                        <input
                          type="text"
                          value={contact.name}
                          onChange={(e) => updateContact(
                            index, 
                            'name', 
                            e.target.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "").replace(/\s{2,}/g, " ")
                          )}
                        />
                      </label>
                    </div>
                    <div className={styles.formRow}>
                      <label>
                        {t('cust.contactEmail')}
                        <input
                          type="email"
                          value={contact.email}
                          onChange={(e) => updateContact(index, 'email', e.target.value)}
                        />
                      </label>
                    </div>
                    <div className={styles.formRow}>
                      <label>
                        {t('cust.contactPhone')}
                        <input
                          type="text"
                            value={contact.phone}
                            onChange={(e) => {
                              const value = e.target.value
                                .replace(/\D/g, '') // solo números
                                .slice(0, 10); // máximo 10 dígitos

                              updateContact(index, 'phone', value);
                            }}
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.sectionCard}>
            <div
              className={styles.sectionTitleCollapsible}
              onClick={() => toggleSection('address')}
            >
              <div className={styles.sectionTitleWithDot}>
                <span className={styles.greenDot}></span>
                <span> {t('cust.addresses')}</span>
              </div>
              {collapsedSections.address ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </div>

            {!collapsedSections.address && (
              <div className={styles.sectionContent}>
                <button 
                type="button"
                onClick={addAddress} className={styles.addDashedButton}>
                  <Plus size={20} />
                  {t('cust.addAddress')}
                </button>
                {formData.Addresses.map((address, index) => (
                  <div key={index} className={styles.itemCard}>
                    <div className={styles.itemHeader}>
                      <h4>{t('cust.addresses')} {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeAddress(index)}
                        className={styles.removeButton}
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <div className={styles.formRow}>
                      <label>
                        {t('cust.street')}
                        <input
                          type="text"
                          value={address.street}
                          onChange={(e) => updateAddress(
                            index, 
                            'street', 
                            e.target.value.replace(/[^A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s.,#\/-]/g, "").replace(/\s{2,}/g, " ")
                          )}
                        />
                      </label>
                    </div>
                    <div className={styles.formRow}>
                      <label>
                        {t('cust.city')}
                        <input
                          type="text"
                          value={address.city}
                          onChange={(e) => updateAddress(
                            index, 
                            'city', 
                            e.target.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "").replace(/\s{2,}/g, " ")
                          )}
                        />
                      </label>
                    </div>
                    
                    <div className={styles.formRow}>
                      <label>
                        {t('cust.state')}
                        <input
                          type="text"
                          value={address.state}
                          onChange={(e) => updateAddress(
                            index, 
                            'state', 
                            e.target.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "").replace(/\s{2,}/g, " ")
                          )}
                        />
                      </label>
                    </div>
                    <div className={styles.formRow}>
                      <label>
                        {t('cust.postalCode')}
                        <input
                          type="number" 
                          value={address.postalCode}
                          onChange={(e) => updateAddress(index, 'postalCode', e.target.value)}
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </form>

        {showCompanyForm && ( /* aqui guarda la empresa */
          <div className={styles.modalOverlay} onClick={() => handleCloseModal()} >
            <form onSubmit={handleCreateCompany} className={styles.modalContent}>
              <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} >

                <div className={styles.modalHeader}>
                  <h3>{t('comp.TitleNew')} </h3>
                  <button onClick={() => handleCloseModal()} className={styles.closeButton}>
                    <X size={24} />
                  </button>
                </div> {/*modalHeader*/}

                <div className={styles.modalBody}>

                  <div className={styles.formRow}>
                    <label>
                      <span className="required">* </span>
                      {t('cust.CompanyName')}
                      <input
                        type="text"
                        value={newCompany.Business_name}
                        onChange={(e) => setNewCompany({ 
                          ...newCompany, 
                          Business_name: e.target.value.replace(/[^A-Za-z0-9ÁÉÍÓÚáéíóúÑñÄ\s.,&'’()+-]/g, "") 
                        })}
                        required
                        onInvalid={(e) =>
                          e.currentTarget.setCustomValidity(t('catalog.requiredFields'))
                        }
                        onInput={(e) =>
                          e.currentTarget.setCustomValidity('')
                        }
                      />
                    </label>
                  </div>{/*CompanyName*/}

                  <div className={styles.formRow}>
                    <label>
                      <span className="required">* </span>
                      RFC
                      <input
                        type="text"
                        value={newCompany.Rfc_taxid}
                        onChange={(e) => setNewCompany({ 
                          ...newCompany, 
                          Rfc_taxid: e.target.value
                            .replace(/[^a-zA-Z0-9Ññ&.\-\/ ]/g, '') // caracteres permitidos para RFC y TAX ID internacionales
                            .slice(0, 20)
                        })}
                        required
                        onInvalid={(e) =>
                          e.currentTarget.setCustomValidity(t('catalog.requiredFields'))
                        }
                        onInput={(e) =>
                          e.currentTarget.setCustomValidity('')
                        }
                      />
                    </label>
                  </div>{/*RFC*/}

                  <div className={styles.formRow}>
                    <label>
                      <span className="required">* </span>
                      {t('cust.country')}
                    </label>

                  <div className={styles.countryControls}>
                    <select
                      value={newCompany.Country}
                      onChange={(e) => setNewCompany({
                        ...newCompany,
                        Country: e.target.value,
                        Nationality: e.target.value === 'MX' ? 'nacional' : 'extranjero'
                      })}
                      className={styles.textInput}
                      required
                      onInvalid={(e) =>
                        e.currentTarget.setCustomValidity(t('catalog.requiredFields'))
                      }
                      onInput={(e) =>
                        e.currentTarget.setCustomValidity('')
                      }
                    >
                      <option value="">Seleccionar país</option>
                      {countries.map((c) => {
                        const code = c.country_code || c.code;
                        return (
                          <option key={code} value={code}>
                            {c.name_country || c.name}
                          </option>
                        );
                      })}
                    </select>

                    <div className={styles.countryCheckbox} >
                      <label className={styles.checkboxText}>
                        <input
                          type="checkbox"
                          className="checkbox"
                          checked={newCompany.Country === 'MX' ? true : false}
                          // onChange={(e) =>
                          // setNewCompany({
                          //   ...newCompany,
                          //   nationality: e.target.value ? "extranjero" : 'nacional',
                          //   country: e.target.checked ? 'MX' : '',
                          // })
                          // }
                          disabled
                        />
                        {' '} {t('cust.Isnational')}
                      </label>
                    </div> {/*Nacional*/}
                    </div>
                  </div>{/*País*/}

                  <div className={styles.formRow}>
                    <label>
                      <span className="required">* </span>
                      Sector
                      <select
                        value={newCompany.Sector_id}
                        onChange={(e) =>
                          setNewCompany({
                            ...newCompany,
                            Sector_id: parseInt(e.target.value),
                            Sector_name: e.target.options[e.target.selectedIndex].text
                          })
                        }
                        className={styles.selectInput}
                        required
                        onInvalid={(e) =>
                          e.currentTarget.setCustomValidity(t('catalog.requiredFields'))
                        }
                        onInput={(e) =>
                          e.currentTarget.setCustomValidity('')
                        }
                      >
                        <option value="">{t('supp.selectSector')}</option>
                        {sectores.map((sector) => (
                          <option key={sector._Id} value={sector._Id}>
                            {sector.name}
                          </option>
                        ))
                        }
                      </select>
                    </label>
                  </div>

                </div>

                <div className={styles.modalActions}>
                  <button type="button" onClick={() => handleCloseModal()} 
                    className={styles.cancelButton}>
                    {t('cust.cancel')}
                  </button>
                  <button 
                    type="submit" 
                    className={styles.saveButton}>
                    {loading ? t('catalog.saving') : t('catalog.save')}
                  </button>
                </div>

              </div>
            </form>
          </div>
        )}
      </>
    );
  }

  return (
    <div className={styles.container}>

      <div className={styles.header}>
        <h1 className={styles.title}>{t('cust.title')}</h1>
        <div className={styles.buttonGroup}>
          <button onClick={handleNewCustomer} className={styles.iconButton}>
            <Plus size={20} />
          </button>
          <button onClick={loadCustomers} className={styles.iconButton}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
            </svg>
          </button>
        </div>
      </div>

      <div className={styles.searchContainer}>
        <div className={styles.searchBar}>
          <Search size={20} />
          <input
            type="text"
            placeholder={t('cust.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filterButtons}>
          <button
            className={`${styles.filterButton} ${statusFilter === 'todos' ? styles.filterButtonActive : ''}`}
            onClick={() => setStatusFilter('todos')}
          >
            {t('catalog.filterAll')}
          </button>
          <button
            className={`${styles.filterButton} ${statusFilter === 'activo' ? styles.filterButtonActive : ''}`}
            onClick={() => setStatusFilter('activo')}
          >
            {t('catalog.filterActive')}
          </button>
          <button
            className={`${styles.filterButton} ${statusFilter === 'inactivo' ? styles.filterButtonActive : ''}`}
            onClick={() => setStatusFilter('inactivo')}
          >
            {t('catalog.filterInactive')}
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
        </div>
      ) : filteredCustomers.length > 0 ? (
        <div className={styles.customerList}>
          {filteredCustomers.map((customer) => {
            const medalSrc = customer.clientLevelId
            ? getClientLevelMedal(customer.clientLevelId)
            : null;

            return (
              <div key={customer.id} className={styles.customerCard}>

                <div className={styles.customerRow}>
                  <div className={styles.customerInfo}>
                    <div className={styles.customerNameWrapper}>

                      {medalSrc && (
                        <div className={styles.medalWrapper}>
                          <img
                            src={medalSrc}
                            // alt={customer.client_level}
                            className={styles.medalImage}
                          />
                        </div>
                      )}

                      <h3 className={styles.customerName}>
                        {customer.fiscalData.businessName}
                      </h3>
                      <p className={styles.customerType}>
                        <span className={styles.badge}>
                          {customer.isPersonaFisica === true
                            ? 'Persona física'
                            : 'Persona moral'}
                        </span>
                      </p>
                      <p>
                        <span
                          className={
                            customer.status === 1
                              ? styles.statusActive
                              : styles.statusInactive
                          }
                        >
                          {customer.status === 1 
                            ? 'Activo'
                            : 'Inactivo'
                          }
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className={styles.customerMeta}>
                    <p className={styles.taxId}>
                      {customer.fiscalData.taxId}
                    </p>

                    <p className={styles.customerNationality}>
                      <span className={styles.badge}>
                        {customer.isNational === true
                          ? 'Nacional'
                          : 'Extranjero'}
                      </span>
                    </p>
                    <div className={styles.customerActions}>
                      <button
                        onClick={() => handleEditCustomer(customer)}
                        className={styles.editButton}
                      >
                        <Edit2 size={18} />
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p className={styles.noResults}>{t('catalog.noResults')}</p>
        </div>
      )}

    </div>
  );
}
