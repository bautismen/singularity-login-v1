import { useEffect, useState } from 'react';
import { Plus, Save, Edit2, Search } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { Company } from '../types/company';
import { getCompanies, createCompany, updateCompany } from '../services/companyService';
import styles from './Companies.module.css';
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext';
import { catalogService } from '../services/catalogsService';

export default function Companies() {
  const { t } = useLanguage();
  const [countries, setCountries] = useState<any[]>([]);
  const { user } = useAuth();

  const loadCountries = async () => {
    try {
      const countriesData = await catalogService.getCountry();
      setCountries(countriesData.data.filter((c: any) => c.status === 1));
    } catch (error) {
      console.error('Error loading countries:', error);
    }
  };

async function loadCompanies() {
    try {
      setLoading(true);
      const data = await getCompanies();
      setCompanies(data);
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const { showError, showSuccess } = useNotification();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'activo' | 'inactivo'>('todos');
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState<Partial<Company>>({
    _Id: "",
    Business_name: '',
    Rfc_taxid: '',
    Nationality: 'nacional',
    Country: 'MX',    
    Status: 1,
    Archived: false,
    Data_state: 1,    
    Created_by: {User_id: user._id ,Name: user?.name}
  });

useEffect(() => {
  loadCompanies();
  loadCountries();
}, []);

useEffect(() => {
  if (formData.Nationality === 'nacional' && countries.length > 0) {
    // Solo actualiza si no está MX ya
    if (formData.Country !== 'MX') {
      setFormData(f => ({ ...f, country: 'MX' }));
    }
  }
}, [countries, formData.Nationality]);

const handleEditCompanies = (company: Company) => {
  setEditingCompany(company);
  setFormData({
    Business_name: company.business_name ?? '',
    Rfc_taxid: company.rfc_taxid ?? '',
    Nationality: company.nationality ?? 'nacional',
    Country: company.country ?? 'MX',    
    Status: company.status === 1 ? 1 : 0,
    Archived: company.archived,
    Data_state: company.data_state,
    Created_by: company.created_by,
  });
  setIsFormOpen(true);
};
/*
async function handleDeleteCompanies(id: string) {
  try {
    setLoading(true);
    await deleteCompany(id);
    await loadCompanies();
    showSuccess(t('comp.DeleteSucess'));
  } catch (error) {
    console.error(error);
    showError(t('comp.errorDelete'));
  } finally {
    setLoading(false);
  }
}

*/
  
const handleSaveCompany = async (e: React.FormEvent) => {
  try {
    e.preventDefault();
    setLoading(true);
    // Validaciones básicas
    if (!formData.Business_name || !formData.Rfc_taxid) {
      /*showError(t('comp.errorLoadcompanyRFC'));*/
      setLoading(false);
      return;
    }

    if (formData.Nationality === 'extranjero' && !formData.Country) {
      showError(t('comp.errorNationality'));
      setLoading(false);
      return;
    }

    // Prepara el objeto a enviar
    const dataToSave = {
      ...formData,
      Country: formData.Nationality === 'nacional' ? 'MX' : formData.Country,
      Archived: formData.Archived ?? false,
      Data_state: formData.Data_state ?? 1,
      Created_by: formData.Created_by || {User_id: user._id, Name:user?.name || ''}
    };


    // Llamada al backend
    let savedCompany;
    if (editingCompany) {
      savedCompany = await updateCompany(editingCompany._Id!, dataToSave);
      showSuccess(t('comp.okupdate'));
    } else {
      savedCompany = await createCompany(dataToSave);
      showSuccess(t('comp.oksave'));
    }

    // Limpiar formulario
    setEditingCompany(null);
    setFormData({
      Business_name: '',
      Rfc_taxid: '',
      Nationality: 'nacional',
      Country: 'MX',      
      Status: 1,
      Archived: false,
      Data_state: 1,
      Created_by: {User_id: user._id ,Name: user?.name},
    });

    // Recargar empresas
    await loadCompanies();

    setIsFormOpen(false);
  } catch (error: any) {
    console.error('Error saving company:', error);
    // Mostrar el mensaje real si existe
    const errorMessage = error instanceof Error ? error.message : 'Error al guardar la empresa';
    showError(errorMessage);
  } finally {
    setLoading(false);
  }
};


const filteredCompanies = companies.filter(c => {
  const matchesSearch = c.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.rfc_taxid.toLowerCase().includes(searchTerm.toLowerCase());      

    let matchesStatus = true;

  if (statusFilter === 'activo') {
        matchesStatus = c.status === 1;
    } else if (statusFilter === 'inactivo') {
        matchesStatus = c.status === 0;
    }

  return matchesSearch && matchesStatus;
});

function handleNewCompany() {
  setEditingCompany(null);
  setFormData({
    Business_name: '',
    Rfc_taxid: '',
    Nationality: 'nacional',
    Country: 'MX',    
    Status: 1,
    Archived: false,
    Data_state: 1,
    Created_by: {User_id: user._id ,Name: user?.name},
  });
  setIsFormOpen(true);
}

if (isFormOpen) {
  return (
    <form onSubmit={handleSaveCompany} className={styles.formContainer}>
      <div className={styles.formHeaderRow}>
        <div className={styles.header}>
          <button
            type="button" // botón normal para cerrar
            onClick={() => setIsFormOpen(false)}
            className={styles.backButton}
            title="Volver a lista"
          >
            <ArrowLeft size={18} />
          </button>

          <h2 className={styles.formTitle}>
            {editingCompany ? t('comp.TitleEdit') : t('comp.TitleNew')}
          </h2>
        </div>

        <div className={styles.headerActions}>
          <button
            type="submit" // <-- clave para que required funcione
            className={styles.saveHeaderButton}
            disabled={loading}
          >
            <Save size={18} />
            {loading ? t('catalog.saving') : t('catalog.save')}
          </button>
        </div>
      </div>

      <div className={styles.sectionCard}>
        <div className={styles.sectionTitle}>{t('cust.TitleDataGeneral')}</div>

        <div className={styles.twoColumnGrid}>
          {/* Columna izquierda */}
          <div className={styles.leftColumn}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>{t('comp.CompanyName')}</label>
              <input
                type="text"
                value={formData.Business_name}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  Business_name: e.target.value.replace(/[^A-Za-z0-9ÁÉÍÓÚáéíóúÑñÄ\s.,&'’()+-]/g, "")
                })}
                className={styles.textInput}
                placeholder={t('comp.CompanyName')}
                required
                onInvalid={(e) => 
                  e.currentTarget.setCustomValidity(t('comp.CompanynameRequired')) /* si todavia no tiene capturado */
                }
                onInput={(e) =>
                  e.currentTarget.setCustomValidity('') /* se limpia msj si ya se capturo */
                }
              />
            </div> {/* CompanyName */}

            {/* Nacionalidad */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>{t('comp.Nacionality')}</label>
              <div className={styles.checkboxField}>
                <input
                  type="checkbox"
                  id="is_national"
                  checked={formData.Nationality === 'nacional'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      Nationality: e.target.checked ? 'nacional' : 'extranjero',
                      Country: e.target.checked ? 'MX' : '', 
                    })
                  }
                  className={styles.checkbox}
                />
                <label htmlFor="is_national" className={styles.checkboxText}>
                  {t('comp.Isnational')}
                </label>
              </div>
            </div>
          </div>

          {/* Columna derecha */}
          <div className={styles.rightColumn}>
            
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>RFC / TAXID</label>
              <input
                type="text"
                value={formData.Rfc_taxid}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/[^a-zA-Z0-9Ññ&.\-\/ ]/g, '') // caracteres permitidos para RFC y TAX ID internacionales
                    .slice(0, 20);

                  setFormData({ ...formData, Rfc_taxid: value });
                }}
                className={styles.textInput}
                placeholder="RFC o TAXID"
                required
                onInvalid={(e) => 
                  e.currentTarget.setCustomValidity(t('comp.RFCTAXIDRequired')) /* si todavia no tiene capturado */
                }
                onInput={(e) =>
                  e.currentTarget.setCustomValidity('') /* se limpia msj si ya se capturo */
                }
              />
            </div> {/* RFC / TAXID */}

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>{t('comp.Country')}</label>
              <select
                value={formData.Country}
                onChange={(e) =>
                  setFormData({ ...formData, Country: e.target.value })
                }
                className={styles.textInput}
                disabled={formData.Nationality === 'nacional'}
                required={formData.Nationality === 'extranjero'} // solo required si es extranjero
              >
                <option value="">{t('comp.SelectCountry')}</option>
                {countries.map((c) => {
                  const code = c.country_code || c.code;
                  return (
                    <option key={code} value={code}>
                      {c.name_country || c.name}
                    </option>
                  );
                })}
              </select>
            </div> {/* Country */}

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>{t('comp.status')}</label>
              <div className={styles.checkboxField}>
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.Status === 1}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      Status: e.target.checked ? 1 : 0,
                    })
                  }
                  className={styles.checkbox}
                />
                <label htmlFor="is_active" className={styles.checkboxText}>
                  {formData.Status === 1 ? t('catalog.status.active') : t('catalog.status.inactive')}
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('nav.companies') || 'Empresas'}</h1>
        <div className={styles.buttonGroup}>
          <button onClick={handleNewCompany} className={styles.iconButton}>
            <Plus size={20} />
          </button>
          <button onClick={loadCompanies} className={styles.iconButton}>
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
            placeholder={t('comp.search') || 'Buscar...'}
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
      ) : filteredCompanies.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.noResults}>{t('catalog.noResults')}</p>
        </div>
      ) : (
        <div className={styles.cardGrid}>
          {filteredCompanies.map(company => (
            <div key={company._Id} className={styles.companyCard}>
              <h3>{company.business_name}</h3>
              <p>RFC/TAXID: {company.rfc_taxid}</p>
              <p>{company.country}</p>
              <p> <span className={company.status === 1 ? styles.statusActive : styles.statusInactive}>{company.status === 1 ? 'Activo' : 'Inactivo'}</span></p>
              <div className={styles.cardActions}>
                <button 
                  onClick={() => handleEditCompanies(company)} 
                  className={styles.editButton}>
                    <Edit2 size={16} />
                </button>
                {/*
                <button 
                  onClick={() => handleDeleteCompanies(company._id!)}
                  className={styles.deleteButton}>
                    <Trash2 size={16} />
                </button>
                */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
