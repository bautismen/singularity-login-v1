import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, ChevronDown, ChevronUp, X, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { Supplier, Company, Contact, Address, MEXICAN_STATES, CONTACT_TYPES, SectorOfBusiness } from '../types/supplier';
import { getSuppliers, createSupplier, updateSupplier, getCompanies, getSector } from '../services/supplierService';
import styles from './Suppliers.module.css';

export default function Suppliers({ onNavigate }: { onNavigate: (route: string) => void }) {
  const { t } = useLanguage();
  const {showError } = useNotification();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  //const [people, setPeople] = useState<Person[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [sector, setSector] = useState<SectorOfBusiness[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    general: false,
    address: false,
    contacts: false,
  });
  //const [showPersonForm, setShowPersonForm] = useState(false);
  //const [showCompanyForm, setShowCompanyForm] = useState(false);

  const [formData, setFormData] = useState({
    is_persona_fisica: false,
    curp: '',
    company_id: '',
    is_national: false,
    //person_id: '',
    status: 'activo' as 'activo' | 'inactivo',
    fiscal_data: {
      business_name: '',
      rfc_taxid: '',
      country: 'MX',
      state: '',
    },
    serctor_id: '',
    sector: '',
    contacts: [] as Contact[],
    addresses: [] as Address[],
  });

  // const [newPerson, setNewPerson] = useState<Partial<Person>>({
  //   name: '',
  //   rfc: '',
  //   nationality: 'nacional',
  //   country: 'MX',
  //   state: '',
  //   birth_date: '',
  //   status: 'activo',
  //   archivado: false,
  // });

  // const [newCompany, setNewCompany] = useState<Partial<Company>>({
  //   business_name: '',
  //   rfc_taxid: '',
  //   nationality: 'nacional',
  //   country: 'MX',
  //   state: '',
  //   status: 'activo',
  //   archivado: false,
  //   datastate: 1,
  // });

  useEffect(() => {
    loadSuppliers();
    //loadPeople();
    loadCompanies();
    loadSector();
  }, []);

  async function loadSuppliers() {
    try {
      setLoading(true);
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (error) {
      console.error('Error loading suppliers:', error);
    } finally {
      setLoading(false);
    }
  }

  // async function loadPeople() {
  //   try {
  //     const data = await getPeople();
  //     setPeople(data);
  //   } catch (error) {
  //     console.error('Error loading people:', error);
  //   }
  // }

  async function loadCompanies() {
    try {
      const data = await getCompanies();
      setCompanies(data);
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  }

  async function loadSector() {
    try {
      const data = (await getSector());
      setSector(data);
    } catch (error) {
      console.error('Error loading sector:', error);
    }
  }

  function toggleSection(section: string) {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  }

  function handleNewSupplier() {
    setEditingSupplier(null);
    setFormData({
      is_persona_fisica: false,
      curp: '',
      company_id: '',
      is_national: false,
      //person_id: '',
      status: 'activo',
      fiscal_data: {
        business_name: '',
        rfc_taxid: '',
        country: 'MX',
        state: '',
      },
      serctor_id: '',
      sector: '',
      contacts: [],
      addresses: [],
    });
    setIsFormOpen(true);
  }

  function handleEditSupplier(supplier: Supplier) {
    setEditingSupplier(supplier);
    //const selectedCompany = companies.find(c => c._id === supplier.company_id);
    setFormData({
      is_persona_fisica: supplier.is_persona_fisica || false,
      curp: supplier.curp || '',
      company_id: supplier.company_id || '',
      is_national: supplier.is_national || false,
      status: supplier.status || 'activo',
      fiscal_data: supplier.fiscal_data,
      // fiscal_data: selectedCompany ? {
      //   business_name: selectedCompany.business_name || '',
      //   rfc_taxid: selectedCompany.rfc_taxid || '',
      //   country: selectedCompany.country || 'MX',
      //   state: selectedCompany.state || '',
      // } : supplier.fiscal_data,
      //person_id: supplier.person_id || '',
      serctor_id: supplier.serctor_id || '',
      sector: supplier.sector || '',
      contacts: supplier.contacts || [],
      addresses: supplier.addresses || [],
    });
    setIsFormOpen(true);
  }

  async function handleSaveSupplier(e: React.FormEvent) {
    try {
      e.preventDefault();
      setLoading(true);

      const selectedCompany = companies.find(c => c._id === formData.company_id);

      // if (!selectedCompany) {
      //   showWarning('Debe seleccionar una empresa');
      //   setLoading(false);
      //   return;
      // }

      const dataToSave = {
        ...formData,
          fiscal_data: selectedCompany ? {
          business_name: selectedCompany.business_name,
          rfc_taxid: selectedCompany.rfc_taxid,
          country: selectedCompany.country,
          state: selectedCompany.state,
        } : formData.fiscal_data,
      };

      if (editingSupplier) {
        await updateSupplier(editingSupplier._id!, dataToSave);
      } else {
        await createSupplier(dataToSave);
      }

      await loadSuppliers();
      setIsFormOpen(false);
      setEditingSupplier(null);
    } catch (error) {
      console.error('Error saving supplier:', error);
      const errorMessage = error instanceof Error ? error.message : t('supp.errorSave');
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  // async function handleDeleteSupplier(id: string) {
  //   try {
  //     setLoading(true);
  //     await deleteSupplier(id);
  //     await loadSuppliers();
  //     showSuccess('Cliente eliminado exitosamente');
  //   } catch (error) {
  //     console.error('Error deleting supplier:', error);
  //     showError(t('supp.errorDelete'));
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  // async function handleCreatePerson() {
  //   try {
  //     const created = await createPerson(newPerson);
  //     console.log('Person created:', created);
  //     setPeople([...people, created]);
  //     setFormData({ ...formData, person_id: created._id! });
  //     setShowPersonForm(false);
  //     setNewPerson({
  //       name: '',
  //       rfc: '',
  //       nationality: 'nacional',
  //       country: 'MX',
  //       state: '',
  //       birth_date: '',
  //       status: 'activo',
  //       archivado: false,
  //     });
  //   } catch (error) {
  //     console.error('Error creating person:', error);
  //     showError('Error al crear la persona: ' + (error instanceof Error ? error.message : 'Error desconocido'));
  //   }
  // }

  // async function handleCreateCompany() {
  //   try {
  //     const created = await createCompany(newCompany);
  //     console.log('Company created:', created);
  //     setCompanies([...companies, created]);
  //     setFormData({ ...formData, company_id: created._id! });
  //     setShowCompanyForm(false);
  //     setNewCompany({
  //       business_name: '',
  //       rfc_taxid: '',
  //       nationality: 'nacional',
  //       country: 'MX',
  //       state: '',
  //       status: 'activo',
  //       archivado: false,
  //       datastate: 1,
  //     });
  //   } catch (error) {
  //     console.error('Error creating company:', error);
  //     showError('Error al crear la empresa: ' + (error instanceof Error ? error.message : 'Error desconocido'));
  //   }
  // }

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

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.fiscal_data.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.fiscal_data.rfc_taxid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isFormOpen) {
    return (
      <form onSubmit={handleSaveSupplier} className={styles.formContainer}>
            
        <div className={styles.formHeaderRow}>
          <div className={styles.header}>
            <button
              onClick={() => setIsFormOpen(false)} className={styles.backButton}
              title="Volver a lista"
            >
              <ArrowLeft size={18} />
            </button>
            
            <h2 className={styles.formTitle}>{t('supp.newSupplier')}</h2>
          </div>
              
          <div className={styles.headerActions}>
            <button type="submit" className={styles.saveHeaderButton} disabled={loading}>
              <Plus size={18} />
              {t('supp.save')}
            </button>
          </div>
        </div>

        <div className={styles.sectionCard}>
          <div className={styles.sectionTitle}>{t('supp.generalData')}</div>

            <div className={styles.twoColumnGrid}>
              <div className={styles.leftColumn}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    <span className={styles.required}>*</span>{t('supp.selectCompany')}
                  </label>
                  <select
                    value={formData.company_id}
                    onChange={(e) => {
                      const selectedCompanyId = e.target.value;
                      const selectedCompany = companies.find(c => c._id === selectedCompanyId);
                        
                      if (selectedCompany) {
                        // Cargar automáticamente los datos de la empresa seleccionada
                        setFormData({
                          ...formData,
                          company_id: selectedCompanyId,
                          is_national: selectedCompany.nationality === 'nacional' ? true : false,
                          fiscal_data: {
                            business_name: selectedCompany.business_name || '',
                            rfc_taxid: selectedCompany.rfc_taxid || '',
                            country: selectedCompany.country || 'MX',
                            state: selectedCompany.state || '',
                          },
                        });
                      } else {
                        // Si no hay empresa seleccionada, limpia los campos
                        setFormData({
                          ...formData,
                          company_id: '',
                          is_national: false,
                          fiscal_data: {
                            business_name: '',
                            rfc_taxid: '',
                            country: 'MX',
                            state: '',
                          },
                        });
                      }
                    }}
                    className={styles.selectInput}
                    required
                    disabled = {editingSupplier ? true : false}
                    >
                    <option value="">{t('supp.selectCompany')}</option>
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
                  className={styles.fullWidthGreenButton}
                  disabled = {editingSupplier ? true : false}
                >
                  <Plus size={16} />
                  {t('supp.newCompany')}
                </button>

                <div className={styles.checkboxField}>
                  <input
                    type="checkbox"
                    id="is_national"
                    checked={formData.is_national}
                    onChange={(e) => setFormData({
                      ...formData,
                      is_national: e.target.checked,
                      is_persona_fisica: false,
                      curp: ''
                    })}
                    className={styles.checkbox}
                    disabled
                  />
                  <label htmlFor="is_national" className={styles.checkboxText}>{t('supp.IsNational')}</label>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    <span className={styles.required}>*</span>{t('supp.selectSector')}
                    </label>
                  <select
                    value={formData.serctor_id}
                    onChange={(e) => 
                      setFormData({ 
                        ...formData, 
                        serctor_id: e.target.value,
                        sector: e.target.options[e.target.selectedIndex].text
                      })
                    }
                    className={styles.selectInput}
                    required
                  >
                    <option value="">{t('supp.selectSector')}</option>
                    {sector.map((sector) => (
                      <option key={sector._id} value={sector._id}>
                        {sector.name}
                      </option>
                    ))
                    }
                  </select>
                </div>

              </div>

              <div className={styles.rightColumn}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    <span className={styles.required}>*</span>RFC/TAXID</label>
                  <input
                    type="text"
                    value={formData.fiscal_data.rfc_taxid}
                    onChange={(e) => setFormData({
                      ...formData,
                      fiscal_data: { ...formData.fiscal_data, rfc_taxid: e.target.value }
                    })}
                    className={styles.textInput}
                    placeholder="RFC/TAXID"
                    disabled
                  />
                </div>

                <div className={styles.statusField}>
                  <span className={styles.statusText}>{t('supp.activo')}</span>
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

                {formData.is_national && (
                  <div className={styles.checkboxField}>
                    <input
                      type="checkbox"
                      id="is_persona_fisica"
                      checked={formData.is_persona_fisica}
                      onChange={(e) => setFormData({
                        ...formData,
                        is_persona_fisica: e.target.checked,
                        curp: e.target.checked ? formData.curp : ''
                      })}
                      className={styles.checkbox}
                    />
                    <label htmlFor="is_persona_fisica" className={styles.checkboxText}>
                      {t('supp.IsPersonFisica')}
                    </label>
                  </div>
                )}

                {formData.is_national && formData.is_persona_fisica && (
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                      <span className={styles.required}></span>CURP</label>
                    <input
                      type="text"
                      value={formData.curp}
                      onChange={(e) => setFormData({ ...formData, curp: e.target.value })}
                      className={styles.textInput}
                      placeholder="CURP"
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
                <span>{t('supp.contacts')}</span>
              </div>
              {collapsedSections.contacts ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </div>

            {!collapsedSections.contacts && (
              <div className={styles.sectionContent}>
                <button onClick={addContact} className={styles.addDashedButton}>
                  <Plus size={20} />
                  {t('supp.addContact')}
                </button>
                {formData.contacts.map((contact, index) => (
                  <div key={index} className={styles.itemCard}>
                    <div className={styles.itemHeader}>
                      <h4>{t('supp.contact')} {index + 1}</h4>
                      <button onClick={() => removeContact(index)} className={styles.removeButton}>
                        <X size={18} />
                      </button>
                    </div>
                    <div className={styles.formRow}>
                      <label>
                        {t('supp.TypeContact')}
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
                        {t('supp.contactName')}
                        <input
                          type="text"
                          value={contact.name}
                          onChange={(e) => updateContact(index, 'name', e.target.value)}
                        />
                      </label>
                    </div>
                    <div className={styles.formRow}>
                      <label>
                        {t('supp.contactEmail')}
                        <input
                          type="email"
                          value={contact.email}
                          onChange={(e) => updateContact(index, 'email', e.target.value)}
                        />
                      </label>
                    </div>
                    <div className={styles.formRow}>
                      <label>
                        {t('supp.contactPhone')}
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
                <span>{t('supp.addresses')}</span>
              </div>
              {collapsedSections.address ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </div>

            {!collapsedSections.address && (
              <div className={styles.sectionContent}>
                <button onClick={addAddress} className={styles.addDashedButton}>
                  <Plus size={20} />
                  {t('supp.addAddress')}
                </button>
                {formData.addresses.map((address, index) => (
                  <div key={index} className={styles.itemCard}>
                    <div className={styles.itemHeader}>
                      <h4>{t('supp.address')} {index + 1}</h4>
                      <button onClick={() => removeAddress(index)} className={styles.removeButton}>
                        <X size={18} />
                      </button>
                    </div>
                    <div className={styles.formRow}>
                      <label>
                        {t('supp.street')}
                        <input
                          type="text"
                          value={address.street}
                          onChange={(e) => updateAddress(index, 'street', e.target.value)}
                        />
                      </label>
                    </div>
                    <div className={styles.formRow}>
                      <label>
                        {t('supp.city')}
                        <input
                          type="text"
                          value={address.city}
                          onChange={(e) => updateAddress(index, 'city', e.target.value)}
                        />
                      </label>
                    </div>
                    <div className={styles.formRow}>
                      <label>
                        {t('supp.state')}
                        <select
                          value={address.state}
                          onChange={(e) => updateAddress(index, 'state', e.target.value)}
                        >
                          <option value="">Seleccionar estado</option>
                          {MEXICAN_STATES.map((state) => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div className={styles.formRow}>
                      <label>
                        {t('supp.postalCode')}
                        <input
                          type="text"
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
        <h1 className={styles.title}>{t('supp.title')}</h1>
        <div className={styles.buttonGroup}>
          <button onClick={handleNewSupplier} className={styles.iconButton}>
            <Plus size={22} />
          </button>
          <button onClick={loadSuppliers} className={styles.iconButton}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
            </svg>
          </button>
        </div>
      </div>

      <div className={styles.searchBar}>
        <Search size={20} />
        <input
          type="text"
          placeholder={t('supp.search')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.supplierList}>
        {filteredSuppliers.map((supplier) => (
          <div key={supplier._idsupplier} className={styles.supplierCard}>           
            <div className={styles.supplierRow}>
              <div className={styles.supplierInfo}>
                <div className={styles.supplierNameWrapper}>

                  <h3 className={styles.supplierName}>
                    {supplier.fiscal_data.business_name}
                  </h3>
                  
                  <p className={styles.supplierType}>
                    <span className={styles.badge}>
                      {supplier.is_persona_fisica === true 
                        ? 'Persona física' 
                        : 'Persona moral'
                      } 
                    </span>
                  </p>

                  <span className={supplier.status === 'activo'
                    ? styles.statusActive
                    : styles.statusInactive
                    }
                  >
                    {supplier.status}
                  </span>
                </div>
              </div>

                <div className={styles.supplierMeta}>
                  <p className={styles.taxId}>
                    {supplier.fiscal_data.rfc_taxid}
                  </p>

                  <p className={styles.supplierNationality}>
                    <span className={styles.badge}>
                      {supplier.is_national === true
                        ? 'Nacional'
                        : 'Extranjero'
                      }
                    </span>
                  </p>

                  <div className={styles.supplierActions}>
                    <button
                      onClick={() => handleEditSupplier(supplier)}
                      className={styles.editButton}
                    >
                      <Edit2 size={18} />
                    </button>
                  </div>
                </div>

            </div>
          </div>
        ))}
        {filteredSuppliers.length === 0 && (
          <p className={styles.noResults}>{t('supp.noResults')}</p>
        )}
      </div>
    </div>
  );
}
