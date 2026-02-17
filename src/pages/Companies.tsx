import { useEffect, useState } from 'react';
import { Plus, Edit2, Search } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { Company } from '../types/company';
import { getCompanies, createCompany, updateCompany } from '../services/companyService';
import styles from './Companies.module.css';
import { ArrowLeft } from 'lucide-react'

export default function Companies() {
  const { t } = useLanguage();
  const [countries, setCountries] = useState<any[]>([]);

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
  loadCompanies();
  loadCountries();
}, []);

useEffect(() => {
  if (formData.nationality === 'nacional' && countries.length > 0) {
    // Solo actualiza si no está MX ya
    if (formData.country !== 'MX') {
      setFormData(f => ({ ...f, country: 'MX' }));
    }
  }
}, [countries, formData.nationality]);

const handleEditCompanies = (company: Company) => {
  setEditingCompany(company);
  setFormData({
    business_name: company.business_name ?? '',
    rfc_taxid: company.rfc_taxid ?? '',
    nationality: company.nationality ?? 'nacional',
    country: company.country ?? 'MX',
    state: company.state ?? '',
    status: company.status === 'activo' ? 'activo' : 'inactivo',
    archivado: company.archivado,
    datastate: company.datastate,
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
    if (!formData.business_name || !formData.rfc_taxid) {
      /*showError(t('comp.errorLoadcompanyRFC'));*/
      setLoading(false);
      return;
    }

    if (formData.nationality === 'extranjero' && !formData.country) {
      showError(t('comp.errorNationality'));
      setLoading(false);
      return;
    }

    // Prepara el objeto a enviar
    const dataToSave = {
      ...formData,
      country: formData.nationality === 'nacional' ? 'MX' : formData.country,
      status: formData.status || 'activo',
      archivado: formData.archivado ?? false,
      datastate: formData.datastate ?? 1,
    };


    // Llamada al backend
    let savedCompany;
    if (editingCompany) {
      savedCompany = await updateCompany(editingCompany._id!, dataToSave);
      showSuccess(t('comp.okupdate'));
    } else {
      savedCompany = await createCompany(dataToSave);
      showSuccess(t('comp.oksave'));
    }

    console.log('Empresa guardada:', savedCompany);

    // Limpiar formulario
    setEditingCompany(null);
    setFormData({
      business_name: '',
      rfc_taxid: '',
      nationality: 'nacional',
      country: 'MX',
      state: '',
      status: 'activo',
      archivado: false,
      datastate: 1,
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

  const matchesStatus = statusFilter === 'todos' || c.status === statusFilter;

  return matchesSearch && matchesStatus;
});

function handleNewCompany() {
  setEditingCompany(null);
  setFormData({
    business_name: '',
    rfc_taxid: '',
    nationality: 'nacional',
    country: 'MX',
    state: '',
    status: 'activo',
    archivado: false,
    datastate: 1,
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
            {t('comp.Save')}
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
                value={formData.business_name}
                onChange={(e) =>
                  setFormData({ ...formData, business_name: e.target.value })
                }
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
            </div>

            {/* Nacionalidad */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>{t('comp.Nacionality')}</label>
              <div className={styles.checkboxField}>
                <input
                  type="checkbox"
                  id="is_national"
                  checked={formData.nationality === 'nacional'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nationality: e.target.checked ? 'nacional' : 'extranjero',
                      country: e.target.checked ? 'MX' : '', 
                    })
                  }
                  className={styles.checkbox}
                />
                <label htmlFor="is_national" className={styles.checkboxText}>
                  {t('comp.Isnational')}
                </label>
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>RFC / TAXID</label>
              <input
                type="text"
                value={formData.rfc_taxid}
                onChange={(e) =>
                  setFormData({ ...formData, rfc_taxid: e.target.value })
                }
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
            </div>
          </div>

          {/* Columna derecha */}
          <div className={styles.rightColumn}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>{t('comp.state')}</label>
              <input
                type="text"
                required
                onInvalid={(e) => 
                  e.currentTarget.setCustomValidity(t('comp.stateRequired')) /* si todavia no tiene capturado */
                }
                onInput={(e) =>
                  e.currentTarget.setCustomValidity('') /* se limpia msj si ya se capturo */
                }
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                className={styles.textInput}
                placeholder={t('comp.state')}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>{t('comp.Country')}</label>
              <select
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                className={styles.textInput}
                disabled={formData.nationality === 'nacional'}
                required={formData.nationality === 'extranjero'} // solo required si es extranjero
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
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>{t('comp.status')}</label>
              <div className={styles.checkboxField}>
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.status === 'activo'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.checked ? 'activo' : 'inactivo',
                    })
                  }
                  className={styles.checkbox}
                />
                <label htmlFor="is_active" className={styles.checkboxText}>
                  {formData.status === 'activo' ? t('catalog.status.active') : t('catalog.status.inactive')}
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
            <div key={company._id} className={styles.companyCard}>
              <h3>{company.business_name}</h3>
              <p>RFC/TAXID: {company.rfc_taxid}</p>
              <p>{company.country}</p>
              <p> <span className={company.status === 'activo' ? styles.statusActive : styles.statusInactive}>{company.status}</span></p>
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
