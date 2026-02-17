import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, ChevronDown, ChevronUp, X, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { Customer, Person, Company, Contact, Address, MEXICAN_STATES, CONTACT_TYPES } from '../types/customer';
import { getCustomers, createCustomer, updateCustomer, getPeople, getCompanies } from '../services/customerService';
import styles from './Customers.module.css';
import { useNavigate } from 'react-router-dom';

export default function Customers({ onNavigate }: { onNavigate: (route: string) => void }) {
  const { t } = useLanguage();
  const {  showError, showWarning } = useNotification();
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
  const [showPersonForm, setShowPersonForm] = useState(false);

  const CLIENT_LEVEL_MAP = {
    oro: 1,
    plata: 2,
    bronce: 3,
  } as const;

  {/* const [showCompanyForm, setShowCompanyForm] = useState(false);*/}

  
  const [formData, setFormData] = useState({
    is_branch: false,
    branch_name: '',
    is_national: false,
    is_persona_fisica: false,
    curp: '',
    type: 'moral' as 'fisica' | 'moral',
    company_id: '',
    person_id: '',
    nationality: 'nacional' as 'nacional' | 'extranjero',
    status: 'activo' as 'activo' | 'inactivo',
    client_level: 'oro' as  'oro' | 'plata' | 'bronce',
    client_level_id: 1 as 1 | 2 | 3,
    fiscal_data: {
      business_name: '',
      taxid: '',
      country: 'MX',
      state: '',
    },
    contacts: [] as Contact[],
    addresses: [] as Address[],
  });

  const getClientLevelMedal = (level: 'oro' | 'plata' | 'bronce') => {
  switch (level) {
    case 'oro':
      return '/gold.png';
    case 'plata':
      return '/silver.png';
    case 'bronce':
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

  {/* 
      const [newCompany, setNewCompany] = useState<Partial<Company>>({
    business_name: '',
    rfc_taxid: '',
    nationality: '',
    country: 'MX',
    state: '',
    status: 'activo',
    archivado: false,
    datastate: 1,
  });
  */}


  useEffect(() => {
    loadCustomers();
    loadPeople();
    loadCompanies();
  }, []);

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

  function toggleSection(section: string) {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  }

  function handleNewCustomer() {
    setEditingCustomer(null);
    setFormData({
      is_branch: false,
      branch_name: '',
      is_national: false,
      is_persona_fisica: false,
      curp: '',
      type: 'moral',
      company_id: '',
      person_id: '',
      nationality: 'nacional',
      status: 'activo',
      client_level: 'oro',
      client_level_id: CLIENT_LEVEL_MAP.oro,
      fiscal_data: {
        business_name: '',
        taxid: '',
        country: 'MX',
        state: '',
      },
      contacts: [],
      addresses: [],
    });
    setIsFormOpen(true);
  }

  function handleEditCustomer(customer: Customer) {
  setEditingCustomer(customer);

  const selectedCompany = companies.find(c => c._id === customer.company_id);

  setFormData({
    is_branch: customer.is_branch,
    branch_name: customer.branch_name || '',
    is_national: customer.is_national ?? false,
    is_persona_fisica: customer.is_persona_fisica ?? false,
    curp: customer.curp || '',
    type: customer.type,
    company_id: customer.company_id || '',
    person_id: customer.person_id || '',
    nationality: customer.nationality ?? 'nacional',
    status: customer.status,
    client_level: customer.client_level ?? 'oro',
    client_level_id:
    customer.client_level_id ??
    CLIENT_LEVEL_MAP[customer.client_level ?? 'oro'],
    fiscal_data: selectedCompany
      ? {
          business_name: selectedCompany.business_name || '',
          taxid: customer.fiscal_data.taxid || selectedCompany.rfc_taxid || '',
          country: selectedCompany.country || 'MX',
          state: selectedCompany.state || '',
        }
      : customer.fiscal_data,
    contacts: customer.contacts || [],
    addresses: customer.addresses || [],
  });

  setIsFormOpen(true);
}

async function handleSaveCustomer(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  try {
    setLoading(true);

      const selectedCompany = companies.find(c => c._id === formData.company_id);

      if (!selectedCompany && !formData.person_id) {
      showWarning(t('cust.errorLoadCompanyPeople'));
        setLoading(false);
        return;
      }

      const dataToSave = {
        ...formData,
          fiscal_data: selectedCompany ? {
          business_name: selectedCompany.business_name,
          taxid: formData.fiscal_data.taxid || selectedCompany.rfc_taxid,
          country: selectedCompany.country,
          state: selectedCompany.state,
        } : formData.fiscal_data,
      };

      const existsDuplicate = customers.some(customer =>
      customer.company_id === formData.company_id &&
      customer.status === formData.status &&
      customer.is_branch === formData.is_branch &&
      (
        // matriz
        !formData.is_branch ||
        // sucursal
        customer.branch_name?.trim().toLowerCase() ===
          formData.branch_name.trim().toLowerCase()
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
        await updateCustomer(editingCustomer._idcustomer!, dataToSave);
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
      console.log('Person created:', created);
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
  }
*/
/*
  async function handleCreateCompany() {
    try {
      const created = await createCompany(newCompany);
      console.log('Company created:', created);
      setCompanies([...companies, created]);
      setFormData({ ...formData, company_id: created._id! });
      setShowCompanyForm(false);
      setNewCompany({
        business_name: '',
        rfc_taxid: '',
        nationality: 'nacional',
        country: 'MX',
        state: '',
        status: 'activo',
        archivado: false,
        datastate: 1,
      });
    } catch (error) {
      console.error('Error creating company:', error);
      showError('Error al crear la empresa: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  }
    */

  function addContact() {
    const newContact: Contact = {
      type: 'general',
      name: '',
      email: '',
      phone: '',
      position: '',
      status: 'activo',
      valid_from: new Date().toISOString(),
      valid_to: null,
    };
    setFormData({ ...formData, contacts: [...formData.contacts, newContact] });
  }

  function removeContact(index: number) {
    setFormData({
      ...formData,
      contacts: formData.contacts.filter((_, i) => i !== index),
    });
  }

  function updateContact(index: number, field: keyof Contact, value: string) {
    const updated = [...formData.contacts];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, contacts: updated });
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
    setFormData({ ...formData, addresses: [...formData.addresses, newAddress] });
  }

  function removeAddress(index: number) {
    setFormData({
      ...formData,
      addresses: formData.addresses.filter((_, i) => i !== index),
    });
  }

  function updateAddress(index: number, field: keyof Address, value: string) {
    const updated = [...formData.addresses];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, addresses: updated });
  }

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.fiscal_data.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.fiscal_data.taxid.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'todos' || customer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (isFormOpen) {
  return (
    <form
      onSubmit={handleSaveCustomer} // <- aquí
      className={styles.formContainer}
    >
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
                <Plus size={18} />
                {t('cust.save')}
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
                    value={formData.company_id}
                    disabled={!!editingCustomer}
                    onChange={(e) => {
                      const selectedCompanyId = e.target.value;
                      const selectedCompany = companies.find(c => c._id === selectedCompanyId);
                      if (selectedCompany) {
                        setFormData({
                          ...formData,
                          company_id: selectedCompanyId,
                          nationality: selectedCompany.nationality === 'nacional' ? 'nacional' : 'extranjero', 
                          is_national: selectedCompany.nationality === 'nacional',
                          curp: selectedCompany.rfc_taxid,
                          fiscal_data: {
                            business_name: selectedCompany.business_name || '',
                            taxid: selectedCompany.rfc_taxid || '',
                            country: selectedCompany.country || 'MX',
                            state: selectedCompany.state || '',
                          },
                        });
                      }
                    }}
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
                  onClick={() => onNavigate('catalogs/companies')}
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
                    checked={formData.is_branch}
                    onChange={(e) => setFormData({ ...formData, is_branch: e.target.checked })}
                    className={styles.checkbox}
                    disabled={!!editingCustomer}
                  />
                  <label htmlFor="is_branch" className={styles.checkboxText}>{t('cust.isBranch')}</label>
                </div>

                <div className={styles.checkboxField}>
                  <input
                    type="checkbox"
                    id="is_national"
                    checked={formData.is_national}
                    disabled
                    onChange={(e) => setFormData({
                      ...formData,
                      is_national: e.target.checked,
                      is_persona_fisica: false,
                      curp: ''
                    })}
                    className={styles.checkbox}
                  />
                  <label htmlFor="is_national" className={styles.checkboxText}>{t('cust.Isnational')}</label>
                </div>

                 {formData.is_national && (
                  <div className={styles.checkboxField}>
                    <input
                      type="checkbox"
                      id="is_persona_fisica"
                      checked={formData.is_persona_fisica}
                      onChange={(e) => {
                        const checked = e.target.checked;

                        setFormData({
                          ...formData,
                          is_persona_fisica: checked,
                          type: checked ? 'fisica' : 'moral',
                          person_id: checked ? formData.person_id : '',
                          curp: checked ? formData.curp : '',
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
                    value={formData.fiscal_data.taxid}
                    disabled
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fiscal_data: { ...formData.fiscal_data, taxid: e.target.value }
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
                      checked={formData.status === 'activo'}
                      onChange={(e) => setFormData({
                        ...formData,
                        status: e.target.checked ? 'activo' : 'inactivo'
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
                    value={formData.client_level}
                    onChange={(e) => {
                      const level = e.target.value as 'oro' | 'plata' | 'bronce';
                      setFormData({
                        ...formData,
                        client_level: level,
                        client_level_id: CLIENT_LEVEL_MAP[level],
                      });
                    }}
                    className={styles.selectInput}
                    required
                    disabled={formData.status !== 'activo'}
                  >
                    <option value="" disabled>
                      {t('cust.selectLevel')}
                    </option>
                    <option value="oro">{t('cust.clientLevelGold')}</option>
                    <option value="plata">{t('cust.clientLevelSilver')}</option>
                    <option value="bronce">{t('cust.clientLevelBronze')}</option>
                  </select>

                </div>         
                {formData.is_branch && (
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>{t('cust.branchName')}</label>
                    <input
                      type="text"
                      value={formData.branch_name}
                      onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
                      className={styles.textInput}
                      placeholder={t('cust.branchName')}
                      disabled={!!editingCustomer}
                    />
                  </div>
                )}

                


                {formData.is_national && formData.is_persona_fisica && (
                  <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>CURP</label>
                  <input
                    type="text"
                    value={formData.curp}
                    onChange={(e) => setFormData({ ...formData, curp: e.target.value })}
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
                {formData.contacts.map((contact, index) => (
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
                          onChange={(e) => updateContact(index, 'name', e.target.value)}
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
                          onChange={(e) => updateContact(index, 'phone', e.target.value)}
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
                {formData.addresses.map((address, index) => (
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
                          onChange={(e) => updateAddress(index, 'street', e.target.value)}
                        />
                      </label>
                    </div>
                    <div className={styles.formRow}>
                      <label>
                        {t('cust.city')}
                        <input
                          type="text"
                          value={address.city}
                          onChange={(e) => updateAddress(index, 'city', e.target.value)}
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

      <div className={styles.customerList}>
      {filteredCustomers.map((customer) => {
        const medalSrc = customer.client_level
      ? getClientLevelMedal(customer.client_level)
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
                    alt={customer.client_level}
                    className={styles.medalImage}
                  />
                </div>
              )}

              <h3 className={styles.customerName}>
                {customer.fiscal_data.business_name}
              </h3>
              <p className={styles.customerType}>
                <span className={styles.badge}>
                  {customer.type === 'fisica'
                    ? 'Persona física'
                    : 'Persona moral'}
                </span>
              </p>
              <p>
              <span
                className={
                  customer.status === 'activo'
                    ? styles.statusActive
                    : styles.statusInactive
                }
              >
                {customer.status}
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
                {customer.nationality === 'nacional'
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

  {filteredCustomers.length === 0 && (
    <p className={styles.noResults}>{t('cust.noResults')}</p>
  )}
</div>
    </div>
  );
}
