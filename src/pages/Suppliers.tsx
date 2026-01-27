import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { Supplier, Person, Company, Contact, Address, MEXICAN_STATES, CONTACT_TYPES } from '../types/supplier';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier, getPeople, getCompanies, createPerson, createCompany } from '../services/supplierService';
import styles from './Suppliers.module.css';
import { SectorOfBusiness } from '../types/catalog';

export default function Suppliers() {
  const { t } = useLanguage();
  const { showSuccess, showError, showWarning } = useNotification();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [sector, GetSector] = useState<SectorOfBusiness[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    general: false,
    address: false,
    contacts: false,
  });
  const [showPersonForm, setShowPersonForm] = useState(false);
  const [showCompanyForm, setShowCompanyForm] = useState(false);

  const [formData, setFormData] = useState({
    is_national: false,
    is_persona_fisica: false,
    curp: '',
    type: 'moral' as 'fisica' | 'moral',
    company_id: '',
    person_id: '',
    nationality: 'nacional' as 'nacional' | 'extranjero',
    status: 'activo' as 'activo' | 'inactivo',
    fiscal_data: {
      supplier_name: '',
      rfc_taxid: '',
      country: 'MX',
      state: '',
    },
    serctor_id: '',
    sector: '',
    contacts: [] as Contact[],
    addresses: [] as Address[],
  });

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

  useEffect(() => {
    loadSuppliers();
    loadPeople();
    loadCompanies();
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

  async function loadPeople() {
    try {
      const data = await getPeople();
      setPeople(data);
    } catch (error) {
      console.error('Error loading people:', error);
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

  function handleNewSupplier() {
    setEditingSupplier(null);
    setFormData({
      is_national: false,
      is_persona_fisica: false,
      curp: '',
      type: 'moral',
      company_id: '',
      person_id: '',
      nationality: 'nacional',
      status: 'activo',
      fiscal_data: {
        supplier_name: '',
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
    setFormData({
      type: supplier.type,
      company_id: supplier.company_id || '',
      person_id: supplier.person_id || '',
      nationality: supplier.nationality,
      fiscal_data: supplier.fiscal_data,
      contacts: supplier.contacts,
      addresses: supplier.addresses,
    });
    setIsFormOpen(true);
  }

  async function handleSaveSupplier() {
    try {
      setLoading(true);

      const selectedCompany = companies.find(c => c._id === formData.company_id);

      if (!selectedCompany && !formData.person_id) {
        showWarning('Debe seleccionar una empresa o persona');
        setLoading(false);
        return;
      }

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
        await updateSupplier(editingSupplier._idsupplier!, dataToSave);
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

  async function handleDeleteSupplier(id: string) {
    try {
      setLoading(true);
      await deleteSupplier(id);
      await loadSuppliers();
      showSuccess('Cliente eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting supplier:', error);
      showError(t('supp.errorDelete'));
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
    supplier.fiscal_data.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.fiscal_data.rfc_taxid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isFormOpen) {
    return (
      <div className={styles.formContainer}>
          <div className={styles.formHeaderRow}>
            <h2 className={styles.formTitle}>{t('supp.newSupplier')}</h2>
            <div className={styles.headerActions}>
              <button onClick={handleSaveSupplier} className={styles.saveHeaderButton} disabled={loading}>
                <Plus size={18} />
                Guardar
              </button>
              <button onClick={() => setIsFormOpen(false)} className={styles.cancelHeaderButton}>
                Cancelar
              </button>
              <button className={styles.actionsHeaderButton}>
                Acciones
                <ChevronDown size={18} />
              </button>
            </div>
          </div>

          <div className={styles.sectionCard}>
            <div className={styles.sectionTitle}>{t('supp.generalData')}</div>

            <div className={styles.twoColumnGrid}>
              <div className={styles.leftColumn}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>* Seleccionar Empresa</label>
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
                            supplier_name: selectedCompany.business_name || '',
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
                            supplier_name: '',
                            rfc_taxid: '',
                            country: 'MX',
                            state: '',
                          },
                        });
                      }
                    }}
                    className={styles.selectInput}
                  >
                    <option value="">Seleccionar Empresa</option>
                    {companies.map((company) => (
                      <option key={company._id} value={company._id}>
                        {company.business_name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCompanyForm(true)}
                  className={styles.fullWidthGreenButton}
                >
                  <Plus size={16} />
                  Nueva Empresa
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
                  />
                  <label htmlFor="is_national" className={styles.checkboxText}>Es nacional</label>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Seleccionar sector</label>
                  <select
                    value={formData.serctor_id}
                    onChange={(e) => setFormData({ ...formData, serctor_id: e.target.value })}
                    className={styles.selectInput}
                  >
                    <option value="">Seleccionar sector</option>
                    {sector.map((sector) => (
                      <option key={sector.id} value={sector.id}>
                        {sector.name}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              <div className={styles.rightColumn}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>RFC/TAXID</label>
                  <input
                    type="text"
                    value={formData.fiscal_data.rfc_taxid}
                    onChange={(e) => setFormData({
                      ...formData,
                      fiscal_data: { ...formData.fiscal_data, rfc_taxid: e.target.value }
                    })}
                    className={styles.textInput}
                    placeholder="RFC/TAXID"
                  />
                </div>

                <div className={styles.statusField}>
                  <span className={styles.statusText}>Activo</span>
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
                    <label htmlFor="is_persona_fisica" className={styles.checkboxText}>Persona física</label>
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
                <span>Contacto</span>
              </div>
              {collapsedSections.contacts ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </div>

            {!collapsedSections.contacts && (
              <div className={styles.sectionContent}>
                <button onClick={addContact} className={styles.addDashedButton}>
                  <Plus size={20} />
                  Agregar contacto
                </button>
                {formData.contacts.map((contact, index) => (
                  <div key={index} className={styles.itemCard}>
                    <div className={styles.itemHeader}>
                      <h4>Contacto {index + 1}</h4>
                      <button onClick={() => removeContact(index)} className={styles.removeButton}>
                        <X size={18} />
                      </button>
                    </div>
                    <div className={styles.formRow}>
                      <label>
                        Tipo de contacto
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
                        Nombre
                        <input
                          type="text"
                          value={contact.name}
                          onChange={(e) => updateContact(index, 'name', e.target.value)}
                        />
                      </label>
                    </div>
                    <div className={styles.formRow}>
                      <label>
                        Email
                        <input
                          type="email"
                          value={contact.email}
                          onChange={(e) => updateContact(index, 'email', e.target.value)}
                        />
                      </label>
                    </div>
                    <div className={styles.formRow}>
                      <label>
                        Teléfono
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
                <span>Domicilio</span>
              </div>
              {collapsedSections.address ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </div>

            {!collapsedSections.address && (
              <div className={styles.sectionContent}>
                <button onClick={addAddress} className={styles.addDashedButton}>
                  <Plus size={20} />
                  Agregar Domicilio
                </button>
                {formData.addresses.map((address, index) => (
                  <div key={index} className={styles.itemCard}>
                    <div className={styles.itemHeader}>
                      <h4>Domicilio {index + 1}</h4>
                      <button onClick={() => removeAddress(index)} className={styles.removeButton}>
                        <X size={18} />
                      </button>
                    </div>
                    <div className={styles.formRow}>
                      <label>
                        Calle
                        <input
                          type="text"
                          value={address.street}
                          onChange={(e) => updateAddress(index, 'street', e.target.value)}
                        />
                      </label>
                    </div>
                    <div className={styles.formRow}>
                      <label>
                        Ciudad
                        <input
                          type="text"
                          value={address.city}
                          onChange={(e) => updateAddress(index, 'city', e.target.value)}
                        />
                      </label>
                    </div>
                    <div className={styles.formRow}>
                      <label>
                        Estado
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
                        Código Postal
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

        {showCompanyForm && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h3>Nueva Empresa</h3>
                <button onClick={() => setShowCompanyForm(false)} className={styles.closeButton}>
                  <X size={24} />
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.formRow}>
                  <label>
                    Razón Social
                    <input
                      type="text"
                      value={newCompany.business_name}
                      onChange={(e) => setNewCompany({ ...newCompany, business_name: e.target.value })}
                    />
                  </label>
                </div>
                <div className={styles.formRow}>
                  <label>
                    RFC
                    <input
                      type="text"
                      value={newCompany.rfc_taxid}
                      onChange={(e) => setNewCompany({ ...newCompany, rfc_taxid: e.target.value })}
                    />
                  </label>
                </div>
                <div className={styles.formRow}>
                  <label>
                    Estado
                    <select
                      value={newCompany.state}
                      onChange={(e) => setNewCompany({ ...newCompany, state: e.target.value })}
                    >
                      <option value="">Seleccionar estado</option>
                      {MEXICAN_STATES.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
              <div className={styles.modalActions}>
                <button onClick={() => setShowCompanyForm(false)} className={styles.cancelButton}>
                  Cancelar
                </button>
                <button onClick={handleCreateCompany} className={styles.saveButton}>
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('supp.title')}</h1>
        <div className={styles.buttonGroup}>
          <button onClick={handleNewSupplier} className={styles.iconButton}>
            <Plus size={20} />
          </button>
          <button onClick={loadSuppliers} className={styles.iconButton}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
            </svg>
          </button>
          <button className={styles.actionsButton}>
            Acciones
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"/>
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
            <div className={styles.supplierInfo}>
              <h3>{supplier.fiscal_data.supplier_name}</h3>
              <p className={styles.taxId}>{supplier.fiscal_data.rfc_taxid}</p>
              <p className={styles.supplierType}>
                {supplier.type === 'fisica' ? 'Persona Física' : 'Persona Moral'}
              </p>
              <p className={styles.supplierLocation}>
                {supplier.fiscal_data.state}, {supplier.fiscal_data.country}
              </p>
            </div>
            <div className={styles.supplierActions}>
              <button
                onClick={() => handleEditSupplier(supplier)}
                className={styles.editButton}
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => handleDeleteSupplier(supplier._idsupplier!)}
                className={styles.deleteButton}
              >
                <Trash2 size={18} />
              </button>
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
