import { useState, useEffect } from 'react';
import { Search, Plus, Save, Edit2, ChevronDown, ChevronUp, X, ArrowLeft, RefreshCw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Supplier, Company, Contact, Address, MEXICAN_STATES, CONTACT_TYPES, SectorOfBusiness } from '../types/supplier';
import { getSuppliers, createSupplier, updateSupplier, getCompanies, createCompany } from '../services/supplierService';
import styles from './Suppliers.module.css';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { catalogService } from '../services/catalogsService';

export default function Suppliers() { //{ onNavigate }: { onNavigate: (route: string) => void }
  const { t } = useLanguage();
  const {showError } = useNotification();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  //const [people, setPeople] = useState<Person[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [sector, setSectores] = useState<any[]>([]);
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
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    IsPersonaFisica: false,
    Curp: '',
    CompanyId: '',
    IsNational: false,
    //person_id: '',
    FiscalData: {
      BusinessName: '',
      RFCTaxId: '',
      Country: 'MX',
    },
    SectorId: 0,
    Sector_name: '',
    Contacts: [] as Contact[],
    Addresses: [] as Address[],
    History: [] as History[],
    CreatedAt: Date,
    UpdatedAt: Date,
    CreatedBy: {IdUser: user?._id, Name: user?.name},
    Status: 1 as 1 | 0,//'activo' as 'activo' | 'inactivo',
    Archived: false,
    DataState: 1
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
    Business_name: '',
    Rfc_taxid: '',
    Nationality: 'nacional',
    Country: 'MX',
    Sector_id: 0,
    Sector: '',
    Status: 1,
    Archived: false,
    Data_state: 1,
  });

  const [countries, setCountries] = useState<any[]>([]);

  useEffect(() => {
    loadSuppliers();
    //loadPeople();
    loadCompanies();
  }, []);

  useEffect(() => {
    loadSector();
    loadCountries();
  }, [searchTerm, statusFilter])

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
      setCompanies(data.filter((c: any) => c.status === 1));

    } catch (error) {
      console.error('Error loading companies:', error);
    }
  }

  async function loadSector() {
    try {
      const sectorData = await catalogService.getSector();
      setSectores(sectorData.data.filter((c: any) => c.status === 1));
    } catch (error) {
      console.error('Error loading sector:', error);
    }
  }

  const loadCountries = async () => {
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

  function toggleSection(section: string) {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  }

  function handleNewSupplier() {
    setEditingSupplier(null);
    setFormData({
      Id: '',
      IdSupplier: 0,
      IsPersonaFisica: false,
      Curp: '',
      CompanyId: '',
      IsNational: false,
      //person_id: '',
      FiscalData: {
        BusinessName: '',
        RFCTaxId: '',
        Country: 'MX',
      },
      SectorId: 0,
      Sector_name: '',
      Contacts: [],
      Addresses: [],
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

  function handleEditSupplier(supplier: Supplier) {
    setEditingSupplier(supplier);
    
    const selectedCompany = companies.find(c => c._Id === supplier.companyId);

    setFormData({
      Id: supplier.id || '',
      IdSupplier: supplier.idSupplier || 0,
      IsPersonaFisica: supplier.isPersonaFisica || false,
      Curp: supplier.curp || '',
      CompanyId: supplier.companyId || '',
      IsNational: supplier.isNational || false,
      FiscalData: selectedCompany ? {
        BusinessName: selectedCompany.business_name || '',
        RFCTaxId: selectedCompany.rfc_taxid || '',
        Country: selectedCompany.country || 'MX',
      } : supplier.fiscalData,
      //person_id: supplier.person_id || '',
      SectorId: supplier.sectorId || 0,
      Sector_name: supplier.sector_name || '',
      Contacts: supplier.contacts || [],
      Addresses: supplier.addresses || [],
      CreatedAt: new Date(),
      CreatedBy: supplier.createdBy || [],
      UpdatedAt: new Date(),
      Status: supplier.status,
      Archived: supplier.archived || false,
      DataState: supplier.data_State || 1,
      History: [],
    });
    setIsFormOpen(true);
  }

  async function handleSaveSupplier(e: React.FormEvent) {
    try {
      setLoading(true);
      e.preventDefault();

      const selectedCompany = companies.find(c => c._Id === formData.CompanyId);

      const dataToSave = {
        ...formData,
          FiscalData: selectedCompany ? {
          BusinessName: selectedCompany.business_name,
          RFCTaxId: selectedCompany.rfc_taxid,
          Country: selectedCompany.country,
        } : formData.FiscalData,
      };

      const existe = suppliers.some(supplier =>
        supplier.CompanyId === formData.CompanyId && supplier.Id !== editingSupplier?.Id
      );

      if (formData.CompanyId === selectedCompany?._Id && existe) {
        showError('Ya existe un proveedor con esta empresa');
        setLoading(false);
        return;
      }

      if (editingSupplier) {
        await updateSupplier(editingSupplier._Id!, dataToSave);
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
      await loadCompanies();
      // setCompanies([...companies, created]);
      handleCompanyChange(created.atrribute.value)
      setFormData({
        ...formData, 
        CompanyId: created.atrribute.value!,
        IsNational: newCompany.Nationality === 'nacional' ? true : false,
        FiscalData: {
          BusinessName: newCompany.Business_name,
          RFCTaxId: newCompany.Rfc_taxid,
          Country: newCompany.Country || 'MX',
        },
        SectorId: newCompany.Sector_id || 0,
        Sector_name: newCompany.Sector || ''
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
        Sector: '',
        Status: 1,
        Archived: false,
        Data_state: 1,
      });
  }

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
            Rfc_taxid: '',
          },
          SectorId: 0,
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
        RFCTaxId: selectedCompany.rfc_taxid || '',
        Country: selectedCompany.country || 'MX',
      },
      SectorId: selectedCompany.sector_id || 0,
      Sector_name: selectedCompany.sector_name || ''
    });
  }

  function addContact() {
    const newContact: Contact = {
      type: 'general',
      name: '',
      email: '',
      phone: '',
      position: '',
      status: 1,
      validFrom: new Date().toISOString(),
      validTo: null,
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

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.fiscalData.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.fiscalData.rfcTaxId.toLowerCase().includes(searchTerm.toLowerCase());

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
                <Save size={18} />
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
                      value={formData.CompanyId}
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
                        <option key={company._Id} value={company._Id}>
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
                      checked={formData.IsNational}
                      onChange={(e) => setFormData({
                        ...formData,
                        IsNational: e.target.checked,
                        IsPersonaFisica: false,
                        Curp: ''
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
                      value={formData.SectorId}
                      onChange={(e) => 
                        setFormData({ 
                          ...formData, 
                          SectorId: Number(e.target.value),
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
                      {sector.map((sector) => (
                        <option key={sector._Id} value={sector._Id}>
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
                      value={formData.FiscalData.RFCTaxId}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          FiscalData: { ...formData.FiscalData, RFCTaxId: e.target.value }
                        })
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
                        checked={formData.Status === 1}
                        onChange={(e) => setFormData({
                          ...formData,
                          Status: e.target.checked ? 1 : 0
                        })}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>

                  {formData.IsNational && (
                    <div className={styles.checkboxField}>
                      <input
                        type="checkbox"
                        id="is_persona_fisica"
                        checked={formData.IsPersonaFisica}
                        onChange={(e) => setFormData({
                          ...formData,
                          IsPersonaFisica: e.target.checked
                        }
                      )}
                        className={styles.checkbox}
                        disabled = {editingSupplier ? true : false}
                      />
                      <label htmlFor="is_persona_fisica" className={styles.checkboxText}>
                        {t('supp.IsPersonFisica')}
                      </label>
                    </div>
                  )}

                  {formData.IsNational && formData.IsPersonaFisica && (
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        <span className={styles.required}></span>CURP</label>
                      <input
                        type="text"
                        value={formData.Curp}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          Curp: formData.IsPersonaFisica === false ? '' :
                                 e.target.value.toUpperCase()
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
                  {formData.Contacts.map((contact, index) => (
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
                  {formData.Addresses.map((address, index) => (
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
                          <input
                            type="text"
                            value={address.state}
                            onChange={(e) => updateAddress(index, 'state', e.target.value)}
                          />
                        </label>
                      </div> {/*state*/}

                      <div className={styles.formRow}>
                        <label>
                          {t('supp.postalCode')}
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
                        value={newCompany.BusinessName}
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
                          Rfc_taxid: e.target.value.replace(/[^a-zA-Z0-9Ññ&.\-\/ ]/g, '') // solo letras y números
                                                   .slice(0, 20) // máximo 13 caracteres

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
                          //   Nationality: e.target.value ? "extranjero" : 'nacional',
                          //   Country: e.target.checked ? 'MX' : '',
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
                            Sector_id: Number(e.target.value),
                            Sector: e.target.options[e.target.selectedIndex].text
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
            <div key={supplier.Id} className={styles.supplierCard}>            
              <div className={styles.supplierRow}>
                <div className={styles.supplierInfo}>
                  <div className={styles.supplierNameWrapper}>

                    <h3 className={styles.supplierName}>
                      {supplier.fiscalData.businessName}
                    </h3>
                      
                    <p className={styles.supplierType}>
                      <span className={styles.badge}>
                        {supplier.isPersonaFisica === true 
                          ? 'Persona física' 
                          : 'Persona moral'
                        } 
                      </span>
                    </p>

                    <span className={supplier.status === 1
                      ? styles.statusActive
                      : styles.statusInactive
                      } >
                      {supplier.status === 1 
                            ? 'Activo'
                            : 'Inactivo'
                      }
                    </span>
                  </div>
                </div>

                <div className={styles.supplierMeta}>
                  <p className={styles.taxId}>
                    {supplier.fiscalData.rfcTaxId}
                  </p>

                  <p className={styles.supplierNationality}>
                    <span className={styles.badge}>
                      {supplier.isNational === true
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
