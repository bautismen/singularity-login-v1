import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Customer, Person, Company, Contact, Address, MEXICAN_STATES, CONTACT_TYPES } from '../types/customer';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer, getPeople, getCompanies, createPerson, createCompany } from '../services/customerService';
import styles from './Customers.module.css';

export default function Customers() {
  const { t } = useLanguage();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    general: false,
    address: false,
    contacts: false,
  });
  const [showPersonForm, setShowPersonForm] = useState(false);
  const [showCompanyForm, setShowCompanyForm] = useState(false);

  const [formData, setFormData] = useState({
    is_branch: false,
    branch_name: '',
    type: 'moral' as 'fisica' | 'moral',
    company_id: '',
    person_id: '',
    nationality: 'nacional' as 'nacional' | 'extranjero',
    fiscal_data: {
      business_name: '',
      taxid: '',
      country: 'MX',
      state: '',
    },
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
    loadCustomers();
    loadPeople();
    loadCompanies();
  }, []);

  async function loadCustomers() {
    try {
      setLoading(true);
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
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

  function handleNewCustomer() {
    setEditingCustomer(null);
    setFormData({
      is_branch: false,
      branch_name: '',
      type: 'moral',
      company_id: '',
      person_id: '',
      nationality: 'nacional',
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
    setFormData({
      is_branch: customer.is_branch,
      branch_name: customer.branch_name || '',
      type: customer.type,
      company_id: customer.company_id || '',
      person_id: customer.person_id || '',
      nationality: customer.nationality,
      fiscal_data: customer.fiscal_data,
      contacts: customer.contacts,
      addresses: customer.addresses,
    });
    setIsFormOpen(true);
  }

  async function handleSaveCustomer() {
    try {
      setLoading(true);

      if (editingCustomer) {
        await updateCustomer(editingCustomer._idcustomer!, formData);
      } else {
        await createCustomer(formData);
      }

      await loadCustomers();
      setIsFormOpen(false);
      setEditingCustomer(null);
    } catch (error) {
      console.error('Error saving customer:', error);
      const errorMessage = error instanceof Error ? error.message : t('cust.errorSave');
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteCustomer(id: string) {
    if (!confirm(t('cust.delete') + '?')) return;

    try {
      setLoading(true);
      await deleteCustomer(id);
      await loadCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert(t('cust.errorDelete'));
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
    }
  }

  async function handleCreateCompany() {
    try {
      const created = await createCompany(newCompany);
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

  const filteredCustomers = customers.filter(customer =>
    customer.fiscal_data.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.fiscal_data.taxid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isFormOpen) {
    return (
      <div className={styles.container}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h2>{editingCustomer ? t('cust.editCustomer') : t('cust.newCustomer')}</h2>
            <button onClick={() => setIsFormOpen(false)} className={styles.closeButton}>
              <X size={24} />
            </button>
          </div>

          <div className={styles.section}>
            <div
              className={styles.sectionHeader}
              onClick={() => toggleSection('general')}
            >
              <h3>{t('cust.generalData')}</h3>
              {collapsedSections.general ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </div>

            {!collapsedSections.general && (
              <div className={styles.sectionContent}>
                <div className={styles.formRow}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={formData.is_branch}
                      onChange={(e) => setFormData({ ...formData, is_branch: e.target.checked })}
                    />
                    {t('cust.isBranch')}
                  </label>
                </div>

                {formData.is_branch && (
                  <div className={styles.formRow}>
                    <label>
                      {t('cust.branchName')}
                      <input
                        type="text"
                        value={formData.branch_name}
                        onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
                      />
                    </label>
                  </div>
                )}

                <div className={styles.formRow}>
                  <label>{t('cust.type')}</label>
                  <div className={styles.radioGroup}>
                    <label className={styles.radioLabel}>
                      <input
                        type="radio"
                        value="moral"
                        checked={formData.type === 'moral'}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as 'moral' | 'fisica' })}
                      />
                      {t('cust.moral')}
                    </label>
                    <label className={styles.radioLabel}>
                      <input
                        type="radio"
                        value="fisica"
                        checked={formData.type === 'fisica'}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as 'moral' | 'fisica' })}
                      />
                      {t('cust.fisica')}
                    </label>
                  </div>
                </div>

                {formData.type === 'moral' && (
                  <>
                    {!showCompanyForm ? (
                      <div className={styles.formRow}>
                        <label>
                          {t('cust.selectCompany')}
                          <select
                            value={formData.company_id}
                            onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                          >
                            <option value="">{t('cust.selectCompany')}</option>
                            {companies.map((company) => (
                              <option key={company._id} value={company._id}>
                                {company.business_name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowCompanyForm(true)}
                          className={styles.inlineButton}
                        >
                          <Plus size={16} />
                          {t('cust.newCompany')}
                        </button>
                      </div>
                    ) : (
                      <div className={styles.inlineForm}>
                        <div className={styles.inlineFormHeader}>
                          <h4>{t('cust.newCompany')}</h4>
                          <button onClick={() => setShowCompanyForm(false)} className={styles.closeInline}>
                            <X size={18} />
                          </button>
                        </div>
                        <div className={styles.formRow}>
                          <label>
                            {t('cust.companyName')}
                            <input
                              type="text"
                              value={newCompany.business_name}
                              onChange={(e) => setNewCompany({ ...newCompany, business_name: e.target.value })}
                            />
                          </label>
                        </div>
                        <div className={styles.formRow}>
                          <label>
                            {t('cust.rfc')}
                            <input
                              type="text"
                              value={newCompany.rfc_taxid}
                              onChange={(e) => setNewCompany({ ...newCompany, rfc_taxid: e.target.value })}
                            />
                          </label>
                        </div>
                        <div className={styles.formRow}>
                          <label>
                            {t('cust.state')}
                            <select
                              value={newCompany.state}
                              onChange={(e) => setNewCompany({ ...newCompany, state: e.target.value })}
                            >
                              <option value="">{t('cust.state')}</option>
                              {MEXICAN_STATES.map((state) => (
                                <option key={state} value={state}>{state}</option>
                              ))}
                            </select>
                          </label>
                        </div>
                        <button onClick={handleCreateCompany} className={styles.saveInlineButton}>
                          {t('cust.save')}
                        </button>
                      </div>
                    )}
                  </>
                )}

                {formData.type === 'fisica' && (
                  <>
                    {!showPersonForm ? (
                      <div className={styles.formRow}>
                        <label>
                          {t('cust.selectPerson')}
                          <select
                            value={formData.person_id}
                            onChange={(e) => setFormData({ ...formData, person_id: e.target.value })}
                          >
                            <option value="">{t('cust.selectPerson')}</option>
                            {people.map((person) => (
                              <option key={person._id} value={person._id}>
                                {person.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowPersonForm(true)}
                          className={styles.inlineButton}
                        >
                          <Plus size={16} />
                          {t('cust.newPerson')}
                        </button>
                      </div>
                    ) : (
                      <div className={styles.inlineForm}>
                        <div className={styles.inlineFormHeader}>
                          <h4>{t('cust.newPerson')}</h4>
                          <button onClick={() => setShowPersonForm(false)} className={styles.closeInline}>
                            <X size={18} />
                          </button>
                        </div>
                        <div className={styles.formRow}>
                          <label>
                            {t('cust.personName')}
                            <input
                              type="text"
                              value={newPerson.name}
                              onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
                            />
                          </label>
                        </div>
                        <div className={styles.formRow}>
                          <label>
                            {t('cust.rfc')}
                            <input
                              type="text"
                              value={newPerson.rfc}
                              onChange={(e) => setNewPerson({ ...newPerson, rfc: e.target.value })}
                            />
                          </label>
                        </div>
                        <div className={styles.formRow}>
                          <label>
                            {t('cust.birthDate')}
                            <input
                              type="date"
                              value={newPerson.birth_date}
                              onChange={(e) => setNewPerson({ ...newPerson, birth_date: e.target.value })}
                            />
                          </label>
                        </div>
                        <div className={styles.formRow}>
                          <label>
                            {t('cust.state')}
                            <select
                              value={newPerson.state}
                              onChange={(e) => setNewPerson({ ...newPerson, state: e.target.value })}
                            >
                              <option value="">{t('cust.state')}</option>
                              {MEXICAN_STATES.map((state) => (
                                <option key={state} value={state}>{state}</option>
                              ))}
                            </select>
                          </label>
                        </div>
                        <button onClick={handleCreatePerson} className={styles.saveInlineButton}>
                          {t('cust.save')}
                        </button>
                      </div>
                    )}
                  </>
                )}

                <div className={styles.formRow}>
                  <label>{t('cust.nationality')}</label>
                  <div className={styles.radioGroup}>
                    <label className={styles.radioLabel}>
                      <input
                        type="radio"
                        value="nacional"
                        checked={formData.nationality === 'nacional'}
                        onChange={(e) => setFormData({ ...formData, nationality: e.target.value as 'nacional' | 'extranjero' })}
                      />
                      {t('cust.nacional')}
                    </label>
                    <label className={styles.radioLabel}>
                      <input
                        type="radio"
                        value="extranjero"
                        checked={formData.nationality === 'extranjero'}
                        onChange={(e) => setFormData({ ...formData, nationality: e.target.value as 'nacional' | 'extranjero' })}
                      />
                      {t('cust.extranjero')}
                    </label>
                  </div>
                </div>

                <h4 className={styles.subsectionTitle}>{t('cust.fiscalData')}</h4>

                <div className={styles.formRow}>
                  <label>
                    {t('cust.businessName')}
                    <input
                      type="text"
                      value={formData.fiscal_data.business_name}
                      onChange={(e) => setFormData({
                        ...formData,
                        fiscal_data: { ...formData.fiscal_data, business_name: e.target.value }
                      })}
                    />
                  </label>
                </div>

                <div className={styles.formRow}>
                  <label>
                    {t('cust.taxId')}
                    <input
                      type="text"
                      value={formData.fiscal_data.taxid}
                      onChange={(e) => setFormData({
                        ...formData,
                        fiscal_data: { ...formData.fiscal_data, taxid: e.target.value }
                      })}
                    />
                  </label>
                </div>

                <div className={styles.formRow}>
                  <label>
                    {t('cust.state')}
                    <select
                      value={formData.fiscal_data.state}
                      onChange={(e) => setFormData({
                        ...formData,
                        fiscal_data: { ...formData.fiscal_data, state: e.target.value }
                      })}
                    >
                      <option value="">{t('cust.state')}</option>
                      {MEXICAN_STATES.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className={styles.section}>
            <div
              className={styles.sectionHeader}
              onClick={() => toggleSection('address')}
            >
              <h3>{t('cust.addresses')}</h3>
              {collapsedSections.address ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </div>

            {!collapsedSections.address && (
              <div className={styles.sectionContent}>
                {formData.addresses.map((address, index) => (
                  <div key={index} className={styles.itemCard}>
                    <div className={styles.itemHeader}>
                      <h4>{t('cust.addresses')} {index + 1}</h4>
                      <button onClick={() => removeAddress(index)} className={styles.removeButton}>
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
                          <option value="">{t('cust.state')}</option>
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
                          type="text"
                          value={address.postal_code}
                          onChange={(e) => updateAddress(index, 'postal_code', e.target.value)}
                        />
                      </label>
                    </div>
                  </div>
                ))}
                <button onClick={addAddress} className={styles.addButton}>
                  <Plus size={18} />
                  {t('cust.addAddress')}
                </button>
              </div>
            )}
          </div>

          <div className={styles.section}>
            <div
              className={styles.sectionHeader}
              onClick={() => toggleSection('contacts')}
            >
              <h3>{t('cust.contacts')}</h3>
              {collapsedSections.contacts ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </div>

            {!collapsedSections.contacts && (
              <div className={styles.sectionContent}>
                {formData.contacts.map((contact, index) => (
                  <div key={index} className={styles.itemCard}>
                    <div className={styles.itemHeader}>
                      <h4>{t('cust.contacts')} {index + 1}</h4>
                      <button onClick={() => removeContact(index)} className={styles.removeButton}>
                        <X size={18} />
                      </button>
                    </div>
                    <div className={styles.formRow}>
                      <label>
                        {t('cust.contactType')}
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
                    <div className={styles.formRow}>
                      <label>
                        {t('cust.contactPosition')}
                        <input
                          type="text"
                          value={contact.position}
                          onChange={(e) => updateContact(index, 'position', e.target.value)}
                        />
                      </label>
                    </div>
                  </div>
                ))}
                <button onClick={addContact} className={styles.addButton}>
                  <Plus size={18} />
                  {t('cust.addContact')}
                </button>
              </div>
            )}
          </div>

          <div className={styles.formActions}>
            <button onClick={() => setIsFormOpen(false)} className={styles.cancelButton}>
              {t('cust.cancel')}
            </button>
            <button onClick={handleSaveCustomer} className={styles.saveButton} disabled={loading}>
              {loading ? '...' : t('cust.save')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('cust.title')}</h1>
        <button onClick={handleNewCustomer} className={styles.newButton}>
          <Plus size={20} />
          {t('cust.newCustomer')}
        </button>
      </div>

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

      <div className={styles.customerList}>
        {filteredCustomers.map((customer) => (
          <div key={customer._idcustomer} className={styles.customerCard}>
            <div className={styles.customerInfo}>
              <h3>{customer.fiscal_data.business_name}</h3>
              <p className={styles.taxId}>{customer.fiscal_data.taxid}</p>
              <p className={styles.customerType}>
                {customer.type === 'fisica' ? t('cust.fisica') : t('cust.moral')}
                {customer.is_branch && ` - ${customer.branch_name}`}
              </p>
              <p className={styles.customerLocation}>
                {customer.fiscal_data.state}, {customer.fiscal_data.country}
              </p>
            </div>
            <div className={styles.customerActions}>
              <button
                onClick={() => handleEditCustomer(customer)}
                className={styles.editButton}
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => handleDeleteCustomer(customer._idcustomer!)}
                className={styles.deleteButton}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {filteredCustomers.length === 0 && (
          <p className={styles.noResults}>{t('cust.noResults')}</p>
        )}
      </div>
    </div>
  );
}
