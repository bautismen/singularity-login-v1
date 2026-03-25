import { useState, useEffect } from 'react';
import { Search, Plus, Save, Edit2, ChevronDown, ChevronUp, X, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { Customer, Person, Company, Contact, Address, History, MEXICAN_STATES, CONTACT_TYPES } from '../types/customer';
import { getCustomers, createCustomer, updateCustomer, getPeople, getCompanies, createCompany } from '../services/customerService';
import styles from './Customers.module.css';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_CATALOGS;
const API_KEY = import.meta.env.VITE_APIKEYSL;
const API_TOKENSL = import.meta.env.VITE_TOKENSL;

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
  const { user } = useAuth();
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    general: false,
    address: false,
    contacts: false,
  });

  const [showPersonForm, setShowPersonForm] = useState(false);
  const [showCompanyForm, setShowCompanyForm] = useState(false);

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
    // type: 'moral' as 'fisica' | 'moral',
    CompanyId: '',
    PersonId: '',
    // nationality: 'nacional' as 'nacional' | 'extranjero',
    // client_level: 'oro' as  'oro' | 'plata' | 'bronce',
    ClientLevelId: 1 as 1 | 2 | 3,
    FiscalData: {
      BusinessName: '',
      Country: 'MX',
      State: '',
      TaxId: '',
    },
    Contacts: [] as Contact[],
    Addresses: [] as Address[],
    IsCorresponsal: false,
    History: [] as History[],
    CreatedAt: Date,
    UpdatedAt: null | Date,
    CreatedBy: {IdUser: user._id, Name: user?.name},
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
    business_name: '',
    rfc_taxid: '',
    nationality: 'nacional',
    country: 'MX',
    state: '',
    status: 'activo',
    archivado: false,
    datastate: 1,
  });

  const [countries, setCountries] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    loadCustomers();
    loadPeople();
    loadCompanies();
    loadCountries();
  }, []);

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

  // async function loadCustomers() {
  //   try {
  //     setLoading(true);
  //     const data = await getCustomers(true);
  //     setCustomers(data);
  //   } catch (error) {
  //     console.error(t('cust.errorLoad'), error);
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  async function loadCustomers() {
    try {
      
      const response = await fetch(`${API_URL}/v1/kl/catalog/getcatalog/Customer`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_TOKENSL}`,
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar los datos');
      }

      const data = await response.json();
      console.log('loadCustomers', data)

      setCustomers(data.data.map((item: any) => ({
        _id: item.id,
        _idcustomer: item.idCustomer,
        is_branch: item.isBranch,
        branch_name: item.branchName,
        is_national: item.isNational,
        is_persona_fisica: item.isPersonaFisica,
        curp: item.curp,
        // type: item.type,
        company_id: item.companyId,
        person_id: item.personId,
        // nationality: item.nationality,
        // client_level: item.clientLevel ?? 'oro',
        client_level_id: item.clientLevelId,
        fiscal_data: {
          business_name: item.fiscalData.businessName,
          country: item.fiscalData.country,
          state: item.fiscalData.state,
          taxid: item.fiscalData.taxId,
        },
        contacts: item.contacts,
        addresses: item.addresses,
        is_corresponsal: item.isCorresponsal,
        history: item.history,
        created_at: item.createdAt ? new Date(item.createdAt) : undefined,
        created_by: item.createdBy || undefined,
        updated_at: item.updatedAt ? new Date(item.updatedAt) : undefined,
        status: item.status,
        archived: item.archived,
        data_state: item.dataState,
      })));
    } catch (error) {
      console.error(t('cust.errorLoad'), error);
    } finally {
      setLoading(false);
    }
  }

  async function loadPeople() {
    try {
      const data = await getPeople();
      setPeople(data);
    } catch (error) {
      console.error(t('cust.errorLoadPeople'), error);
    }
  }

  async function loadCompanies() {
    try {
      const data = await getCompanies();
      setCompanies(data);
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  }

  const loadCountries = async () => {
    try {
      const API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const BASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${BASE_URL}/functions/v1/catalog-countries`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const countriesData = await response.json();
      setCountries(countriesData.filter((c: any) => c.status === 1));
    } catch (error) {
      console.error('Error loading countries:', error);
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
      // type: 'moral',
      CompanyId: '',
      PersonId: '',
      // nationality: 'nacional',
      // client_level: 'oro',
      ClientLevelId: CLIENT_LEVEL_MAP.oro,
      FiscalData: {
        BusinessName: '',
        Country: 'MX',
        State: '',
        TaxId: '',
      },
      Contacts: [],
      Addresses: [],
      IsCorresponsal: false,
      History: [],
      CreatedAt: Date,
      CreatedBy: {IdUser: user._id, Name: user?.name},
      Status: 1,
      Archived: false,
      DataState: 1
    });
    setIsFormOpen(true);
  }

  function handleEditCustomer(customer: Customer) {
  setEditingCustomer(customer);

  const selectedCompany = companies.find(c => c._id === customer.company_id);

  setFormData({
    Id: customer._id,
    IdCustomer: customer._idcustomer,
    IsBranch: customer.is_branch,
    BranchName: customer.branch_name || '',
    IsNational: customer.is_national ?? false,
    IsPersonaFisica: customer.is_persona_fisica ?? false,
    Curp: customer.curp || '',
    // type: customer.type,
    CompanyId: customer.company_id || '',
    PersonId: customer.person_id || '',
    // nationality: customer.nationality ?? 'nacional',
    // client_level: customer.client_level ?? 'oro',
    ClientLevelId: customer.client_level_id ?? 1,
    FiscalData: selectedCompany ?
        {
          BusinessName: selectedCompany.business_name || '',
          Country: selectedCompany.country || 'MX',
          State: selectedCompany.state || '',
          TaxId: customer.fiscal_data.taxid || selectedCompany.rfc_taxid || '',
        } : customer.fiscal_data,
    Contacts: customer.contacts || [],
    Addresses: customer.addresses || [],
    IsCorresponsal: customer.is_corresponsal,
    History: customer.history,
    CreatedAt: customer.created_at,
    CreatedBy: customer.created_by,
    Status: customer.status,
    Archived: customer.archived,
    DataState: customer.data_state,
  });

  setIsFormOpen(true);
}

async function handleSaveCustomer(e: React.FormEvent<HTMLFormElement>) {
  
  try {
    e.preventDefault();
    setLoading(true);

      const selectedCompany = companies.find(c => c._id === formData.CompanyId);

      if (!selectedCompany && !formData.PersonId) {
      showWarning(t('cust.errorLoadCompanyPeople'));
        setLoading(false);
        return;
      }

      //const maxIdDoc = customers.length
        // .find()
        // .sort({ idcustomer: -1 })
        // .limit(1)
        // .toArray();

      const nextId = customers.length > 0 ? (customers[0]._idcustomer || 0) + 1 : 1;

      setFormData({ ...formData, IdCustomer: nextId })

      const dataToSave = {
        ...formData,
          FiscalData: selectedCompany ? {
          BusinessName: selectedCompany.business_name,
          Country: selectedCompany.country,
          State: selectedCompany.state,
          TaxId: formData.FiscalData.TaxId || selectedCompany.rfc_taxid,
        } : formData.FiscalData,
      };

      const existsDuplicate = customers.some(customer =>
      customer.company_id === formData.CompanyId &&
      customer.status === formData.Status &&
      customer.is_branch === formData.IsBranch &&
      (
        // matriz
        !formData.IsBranch ||
        // sucursal
        customer.branch_name?.trim().toLowerCase() ===
          formData.BranchName.trim().toLowerCase()
      ) &&
      (
        // si es edición, excluir el mismo registro
        !editingCustomer ||
        customer._idcustomer !== editingCustomer._idcustomer
      )
    );

    if (existsDuplicate) {
      showError(t('cust.errorMatrizExists'));
      setLoading(false);
      return;
    }

      if (editingCustomer) {
        // await updateCustomer(editingCustomer._idcustomer!, dataToSave);
        console.log('_id', editingCustomer._id)

        setFormData({ ...formData, Id: editingCustomer._id });     
        const response = await fetch(`${API_URL}/v1/kl/catalog/update/Customer`, {          
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${API_TOKENSL}`,
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
          },
          body: JSON.stringify(dataToSave),
        });

        if (!response.ok) {
          showError('Error al actualizar el registro');
        }

      } else {
      //   await createCustomer(dataToSave);

        const response = await fetch(`${API_URL}/v1/kl/catalog/add/Customer`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_TOKENSL}`,
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
          },
          body: JSON.stringify(dataToSave),
        });

        if (!response.ok) {
          showError('Error al crear el registro');
        }

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
      setCompanies([...companies, created]);
      handleCompanyChange(created._id!)
      setFormData({ 
        ...formData, 
        CompanyId: created._id!,
        // nationality: created.nationality,
        IsNational: created.nationality === 'nacional' ? true : false,
        FiscalData: {
          BusinessName: created.business_name,
          Country: created.country,
          State: created.state,
          TaxId: created.rfc_taxid,
        },
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
        business_name: '',
        rfc_taxid: '',
        nationality: undefined,
        country: '',
        state: '',
        status: 'activo',
        archivado: false,
        datastate: 1,
      });
  }

  function addContact() {
    const newContact: Contact = {
      Email: '',
      Name: '',
      Phone: '',
      Position: '',
      Status: 1, //'activo',
      Type: 'general',
      ValidFrom: new Date().toISOString(),
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

  function updateContact(index: number, field: keyof Contact, value: string) {
    const updated = [...formData.Contacts];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, Contacts: updated });
  }

  function addAddress() {
    const newAddress: Address = {
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'MX',
      status: 'activo',
      valid_from: new Date().toISOString(),
      valid_to: null,
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
    const matchesSearch = customer.fiscal_data.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.fiscal_data.taxid.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'todos' || statusFilter === (customer.status === 1 ? 'activo' : 'inactivo');

    return matchesSearch && matchesStatus;
  });

  function handleCompanyChange(selectedCompanyId: string) {
    const selectedCompany = companies.find(c => c._id === selectedCompanyId);

    if (!selectedCompany) {
      setFormData({
        ...formData,
        CompanyId: '',
        IsNational: false,
        FiscalData: {
          BusinessName: '',
          Country: 'MX',
          State: '',
          TaxId: '',
        },
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
        State: selectedCompany.state || '',
        TaxId: selectedCompany.rfc_taxid || '',
      },
      IsPersonaFisica: selectedCompany.rfc_taxid.length === 13 ? true : false,
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
                      <option key={company._id} value={company._id}>
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
                          PersonId: checked ? formData.PersonId : '',
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
                  {/* <label className={styles.fieldLabel}>
                    {t('cust.clientLevel')}
                  </label> */}

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
                        <select
                          value={address.state}
                          onChange={(e) => updateAddress(index, 'state', e.target.value)}
                        >
                          <option value="">{t('cust.selectstate')}</option>
                          {MEXICAN_STATES.map((state) => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div className={styles.formRow}>
                      <label>
                        {t('cust.postalCode')}
                        <input
                          type="number" 
                          value={address.postal_code}
                          onChange={(e) => updateAddress(index, 'postal_code', e.target.value)}
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
                        value={newCompany.business_name}
                        onChange={(e) => setNewCompany({ 
                          ...newCompany, 
                          business_name: e.target.value.replace(/[^A-Za-z0-9ÁÉÍÓÚáéíóúÑñÄ\s.,&'’()+-]/g, "") 
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
                        value={newCompany.rfc_taxid}
                        onChange={(e) => setNewCompany({ 
                          ...newCompany, 
                          rfc_taxid: e.target.value
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
                      value={newCompany.country}
                      onChange={(e) => setNewCompany({
                        ...newCompany,
                        country: e.target.value,
                        nationality: e.target.value === 'MX' ? 'nacional' : 'extranjero'
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
                          checked={newCompany.country === 'MX' ? true : false}
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
                      {t('cust.state')}
                      <input
                        type="text"
                        value={newCompany.state}
                        onChange={(e) => setNewCompany({ ...newCompany, state: e.target.value })}
                      />
                      {/* <select
                        value={newCompany.state}
                        onChange={(e) => setNewCompany({ ...newCompany, state: e.target.value })}
                      >
                        <option value="">Seleccionar estado</option>
                        {MEXICAN_STATES.map((state) => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select> */}
                    </label>
                  </div> {/*state*/}

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
            const medalSrc = customer.client_level_id
            ? getClientLevelMedal(customer.client_level_id)
            : null;

            return (
              <div key={customer._idcustomer} className={styles.customerCard}>

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
                        {customer.fiscal_data.business_name}
                      </h3>
                      <p className={styles.customerType}>
                        <span className={styles.badge}>
                          {customer.is_persona_fisica === true
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
                      {customer.fiscal_data.taxid}
                    </p>

                    <p className={styles.customerNationality}>
                      <span className={styles.badge}>
                        {customer.is_national === true
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
