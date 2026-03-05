import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, ChevronDown, ChevronUp, X, ArrowLeft, RefreshCw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { Supplier, Company, Contact, Address, MEXICAN_STATES, CONTACT_TYPES, SectorOfBusiness } from '../types/supplier';
import { getSuppliers, createSupplier, updateSupplier, getCompanies, getSector, createCompany } from '../services/supplierService';
import styles from './Suppliers.module.css';

export default function Suppliers() { //{ onNavigate }: { onNavigate: (route: string) => void }
  const { t } = useLanguage();
  const {showError } = useNotification();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  //const [people, setPeople] = useState<Person[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [sector, setSector] = useState<SectorOfBusiness[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'activo' | 'inactivo'>('todos');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    general: false,
    address: false,
    contacts: false,
  });
  //const [showPersonForm, setShowPersonForm] = useState(false);
  const [showCompanyForm, setShowCompanyForm] = useState(false);

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

  useEffect(() => {
    loadSuppliers();
    //loadPeople();
    loadCompanies();
    loadSector();
    loadCountries();
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseModal;
      }
    };

    if (showCompanyForm) {
      window.addEventListener("keydown", handleEsc);
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [showCompanyForm]);


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
      setLoading(true);
      e.preventDefault();

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

      const existe = suppliers.filter(supplier =>
        supplier.company_id === formData.company_id && supplier._id !== editingSupplier?._id
      );

      if (formData.company_id === selectedCompany?._id && existe.length > 0) {
        showError('Ya existe un proveedor con esta empresa');
        setLoading(false);
        return;
      }

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

  async function handleCreateCompany(e: React.FormEvent<HTMLFormElement>) {
    try {
      e.preventDefault();

      const created = await createCompany(newCompany);
      console.log('Company created:', created);
      setCompanies([...companies, created]);
      setFormData({ ...formData, company_id: created._id! });
      handleCloseModal()
      // loadCompanies()
      // handleCompanyChange(created._id!)
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

  function handleCompanyChange(selectedCompanyId: string) {
    const selectedCompany = companies.find(c => c._id === selectedCompanyId);

    if (!selectedCompany) {
      setFormData({
        ...formData,
        serctor_id: '', 
        sector: '',     //para que tambien limpie si ya selecciono alguno.
        company_id: '',
        is_national: false,
        fiscal_data: {
          business_name: '',
          rfc_taxid: '',
          country: 'MX',
          state: '',
        },
      });
      return;
    }

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
  }

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

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.fiscal_data.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.fiscal_data.rfc_taxid.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'todos' || supplier.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (isFormOpen) {
    return (
      <>
        <form onSubmit={handleSaveSupplier} className={styles.formContainer}>
              
          <div className={styles.formHeaderRow}>

            <div className={styles.header}>
              <button
                onClick={() => setIsFormOpen(false)} className={styles.backButton}
                title="Volver a lista" >
                <ArrowLeft size={18} />
              </button> 
              <h2 className={styles.formTitle}> {editingSupplier ? t('supp.editSupplier') : t('supp.newSupplier')}</h2>
            </div> {/*End form header */}
                
            <div className={styles.headerActions}>
              <button type="submit" className={styles.saveHeaderButton} disabled={loading}>
                <Plus size={18} />
                {loading ? t('catalog.saving') : t('catalog.save')}
              </button>
            </div> {/*End header actions */}

          </div> {/*End form header row */}

            <div className={styles.sectionCard}>

              <div className={styles.sectionTitle}>
                {t('supp.generalData')}
              </div> {/*End section title */}

              <div className={styles.twoColumnGrid}>
                
                <div className={styles.leftColumn}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                      <span className={styles.required}>* </span>{t('supp.selectCompany')}
                    </label>
                    <select
                      value={formData.company_id}
                      onChange={(e) => handleCompanyChange(e.target.value)}
                      className={styles.selectInput}
                      required
                      onInvalid={(e) => 
                        e.currentTarget.setCustomValidity(t('catalog.requiredFields'))
                      }
                      onInput={(e) =>
                        e.currentTarget.setCustomValidity('')
                      }
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
                    //onClick={() => onNavigate('catalogs/companies')}
                    onClick={() => setShowCompanyForm(true)}
                    className={
                      editingSupplier
                        ? styles.fullWidthGrayButton
                        : styles.fullWidthGreenButton
                    }
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
                      <span className={styles.required}>* </span>{t('supp.selectSector')}
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
                      onInvalid={(e) => 
                        e.currentTarget.setCustomValidity(t('catalog.requiredFields'))
                      }
                      onInput={(e) =>
                        e.currentTarget.setCustomValidity('')
                      }
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

                </div>  {/*End left column */}

                <div className={styles.rightColumn}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                      <span className={styles.required}>* </span>RFC/TAXID</label>
                    <input
                      type="text"
                      value={formData.fiscal_data.rfc_taxid}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/[^a-zA-Z0-9]/g, '') // solo letras y números
                          .slice(0, 13); // máximo 13 caracteres

                       setFormData({
                        ...formData,
                        fiscal_data: { ...formData.fiscal_data, rfc_taxid: value }})
                      }}                     
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
                        disabled = {editingSupplier ? true : false}
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
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          curp: e.target.value.toUpperCase()
                                              .replace(/[^A-Z0-9]/g, "")
                                              .slice(0, 18)
                        })}
                        className={styles.textInput}
                        placeholder="CURP"
                        disabled = {editingSupplier ? true : false}
                      />
                    </div>
                  )}
                </div> {/*End right column */}

              </div> {/*End two column grid */}

            </div> {/*End general data sectionCard */}

            <div className={styles.sectionCard}>
              <div className={styles.sectionTitleCollapsible}
                onClick={() => toggleSection('contacts')}>
                <div className={styles.sectionTitleWithDot}>
                  <span className={styles.greenDot}></span>
                  <span>{t('supp.contacts')}</span>
                </div>
                {collapsedSections.contacts ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
              </div>

              {!collapsedSections.contacts && (
                <div className={styles.sectionContent}>
                  <button  
                    type="button"
                    onClick={addContact} className={styles.addDashedButton}>
                    <Plus size={20} />
                    {t('supp.addContact')}
                  </button>
                  {formData.contacts.map((contact, index) => (
                    <div key={index} className={styles.itemCard}>
                      <div className={styles.itemHeader}>
                        <h4>{t('supp.contact')} {index + 1}</h4>
                        <button 
                          type="button" 
                          onClick={() => removeContact(index)} className={styles.removeButton}>
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
            </div> {/*End contacts section */}

            <div className={styles.sectionCard}>
              <div className={styles.sectionTitleCollapsible}
                onClick={() => toggleSection('address')}>
                <div className={styles.sectionTitleWithDot}>
                  <span className={styles.greenDot}></span>
                  <span>{t('supp.addresses')}</span>
                </div>
                {collapsedSections.address ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
              </div>

              {!collapsedSections.address && (
                <div className={styles.sectionContent}>
                  <button 
                    type="button" 
                    onClick={addAddress} className={styles.addDashedButton}>
                    <Plus size={20} />
                    {t('supp.addAddress')}
                  </button>
                  {formData.addresses.map((address, index) => (
                    <div key={index} className={styles.itemCard}>
                      <div className={styles.itemHeader}>
                        <h4>{t('supp.address')} {index + 1}</h4>
                        <button 
                          type="button" 
                          onClick={() => removeAddress(index)} className={styles.removeButton}>
                          <X size={18} />
                        </button>
                      </div>
                      <div className={styles.formRow}>
                        <label>
                          {t('supp.street')}
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
                          {t('supp.city')}
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
            </div> {/*End addresses section */}
        
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
                          rfc_taxid: e.target.value.replace(/[^a-zA-Z0-9-&]/g, '') // solo letras y números
                                                   .slice(0, 13) // máximo 13 caracteres

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

                  <div className={styles.countryField}>
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
        <h1 className={styles.title}>{t('supp.title')}</h1>
        <div className={styles.buttonGroup}>
          <button onClick={handleNewSupplier} className={styles.headerButton}>
            <Plus size={20} />
          </button>
          <button onClick={loadSuppliers} className={styles.headerButton} disabled={loading}>
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      <div className={styles.searchContainer}>
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
      ) : filteredSuppliers.length > 0 ? (
        <div className={styles.supplierList}>
          {filteredSuppliers.map((supplier) => (
            <div key={supplier._id} className={styles.supplierCard}>            
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
                      } >
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
                      className={styles.editButton}>
                      <Edit2 size={18} />
                    </button>
                  </div>
                </div>

              </div>
            </div>
        ))}
        </div> 
      ) : (
        <div className={styles.emptyState}>
          <p className={styles.noResults}>{t('supp.noResults')}</p>
        </div>
      )}
    </div>
  );
}
