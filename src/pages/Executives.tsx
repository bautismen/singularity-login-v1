import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Trash2, Plus, Edit2, Search, X, ArrowLeft, RefreshCw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Executive, ExecutiveFormData, DEPARTMENTS } from '../types/executive';
import { getExecutives, createExecutive, updateExecutive, deleteExecutive, checkNominaExists } from '../services/executiveService';
import styles from './Executives.module.css';
import { useNotification } from '../contexts/NotificationContext';
import { Modal } from '../components/Modal';

const API_URL = import.meta.env.VITE_API_CATALOGS;
const API_KEY = import.meta.env.VITE_APIKEYSL;
const API_TOKENSL = import.meta.env.VITE_TOKENSL;

export function Executives() {
  const { t } = useLanguage();
  const catalogName = t('quote.executive');
  const { showError, showWarning,showSuccess } = useNotification();
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [filteredExecutives, setFilteredExecutives] = useState<Executive[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [users, setUsers] = useState<any[]>([]);

  const [formData, setFormData] = useState<ExecutiveFormData>({
    _Id: '',
    Nombre: '',
    Apellido_paterno: '',
    Apellido_materno: '',
    Numero_nomina: '',
    Fecha_ingreso: '',
    Email: '',
    Departamento: '',
    Status: 1,
    _Iduser: '',
    Data_state: 1,
    Archivado: false,
  });

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'info' | 'warning' | 'error' | 'success' | 'confirm';
    title: string;
    message: string;
    onConfirm?: () => void;
    showCancel?: boolean;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  useEffect(() => {
    loadExecutives();
  }, []);

  useEffect(() => {
    loadUsers();
    filterExecutives();
  }, [executives, searchTerm, filter]);

  const loadExecutives = async () => {
    try {
      // console.log(saving);
      setLoading(true);
      const data = await getExecutives(true);
      setExecutives(data);
    } catch (error) {
      showError(t('exec.errorLoad'));
    } finally {
      setLoading(false);
    }
  };

  const filterExecutives = () => {
    let filtered = [...executives];

    if (filter === 'active') {
      filtered = filtered.filter((exec) => exec.status === 1 && exec.data_state === 1);
    } else if (filter === 'inactive') {
      filtered = filtered.filter((exec) => exec.status !== 1 && exec.data_state === 1);
    } else {
      filtered = filtered.filter((exec) => exec.data_state === 1);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (exec) =>
          exec.nombre.toLowerCase().includes(term) ||
          exec.apellido_paterno.toLowerCase().includes(term) ||
          exec.apellido_materno.toLowerCase().includes(term) ||
          exec.numero_nomina.toLowerCase().includes(term) ||
          exec.email.toLowerCase().includes(term)
      );
    }

    setFilteredExecutives(filtered);
  }; 

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = async (): Promise<boolean> => {
    if (
      !formData.Nombre ||
      !formData.Apellido_paterno ||
      !formData.Numero_nomina ||
      !formData.Fecha_ingreso ||
      !formData.Email ||
      !formData.Departamento ||
      !formData._Iduser
    ) {
      showWarning( t('catalog.requiredFields'));
      return false;
    }

    if (!validateEmail(formData.Email)) {
      showWarning(t('exec.invalidEmail'));
      return false;
    }

    /*const nominaExists = await checkNominaExists(formData.Numero_nomina, editingId || undefined);
    if (nominaExists) {
      showNotification('error', t('exec.nominaExists'));
      return false;
    }*/

    return true;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const isValid = await validateForm();
    
    if (!isValid) {
      // console.log('si soy fal')
      setSaving(false);
      return;
    }

    try {
      if (editingId) {
        await updateExecutive(editingId, formData);
        showSuccess(t('exec.successSave'));
      } else {
       const resul = await createExecutive(formData);
        
       if (resul.status===204)
       {
       
         showWarning(t('exec.nominaExists'));
         setSaving(false);
         return;
        
       }
       else
       {
        showSuccess(t('exec.successSave'));
       }
      }
      resetForm();
      await loadExecutives();
      setShowForm(false);
    } catch (error) {
      showError(t('exec.errorSave'));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (executive: Executive) => {
    setFormData({
      _Id: executive._Id,
      Nombre: executive.nombre,
      Apellido_paterno: executive.apellido_paterno,
      Apellido_materno: executive.apellido_materno,
      Numero_nomina: executive.numero_nomina,
      Fecha_ingreso: executive.fecha_ingreso,
      Email: executive.email,
      Departamento: executive.departamento,
      Status: executive.status,
      _Iduser: executive._Iduser || '',
      Data_state: executive.data_state,
      Archivado: executive.archivado,
    });
    setEditingId(executive._Id || null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {

    setModalState({
      isOpen: true,
      type: 'confirm',
      title: t('modal.title').replace('{name}', catalogName.toLowerCase()),
      message: t('modal.message'),
      showCancel: true,
      onConfirm: async () => {
        try {
          await deleteExecutive(id);
          showSuccess(t('exec.successDelete'));
          await loadExecutives();
        } catch (error) {
          showError(t('exec.errorDelete'));
        }
      }
    });
  };

  const resetForm = () => {
    setFormData({
      _Id: '',
      Nombre: '',
      Apellido_paterno: '',
      Apellido_materno: '',
      Numero_nomina: '',
      Fecha_ingreso: '',
      Email: '',
      Departamento: '',
      Status: 1,
      _Iduser: '',
      Data_state: 1,
      Archivado: false,
    });
    setEditingId(null);
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  const handleNewExecutive = () => {
    resetForm();
    setShowForm(true);
  };

  const loadUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/v1/kl/catalog/general/User`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_TOKENSL}`,
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar ejecutivos');
      }

      const data = await response.json();
      setUsers(data.data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  if (showForm) {
    return (
      <form onSubmit={handleSave} className={styles.formContainer}>

        <div className={styles.formHeaderRow}>

          <div className={styles.header}>
            <button
              onClick={handleCancel}
              className={styles.backButton}
              title="Volver a lista">
              <ArrowLeft size={18} />
            </button>
            <h2 className={styles.formTitle}> {editingId ? t('exec.editExecutive') : t('exec.newExecutive')}</h2>
          </div>

          <div className={styles.actionBar}>
            <button type='submit' className={styles.actionBarSaveButton} disabled={saving}>
              <Save size={18} />
              {loading ? t('catalog.saving') : t('catalog.save')}
            </button>
            <button type="button" className={styles.actionBarResetButton} onClick={resetForm} disabled={saving}>
              <RotateCcw size={18} />
            </button>
            {/* {editingId && (
              <button type="button" className={styles.actionBarDeleteButton} disabled={saving}
                onClick={() => handleDelete(editingId)}>
                <Trash2 size={18} />
              </button>
            )} */}
          </div>

        </div>

        <div className={styles.formGrid}>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.required}>*</span>
              {t('exec.nombre')}
            </label>
            <input
              type="text"
              value={formData.Nombre}
              onChange={(e) => setFormData({ 
                ...formData, 
                Nombre: e.target.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "").replace(/\s{2,}/g, " ")
              })}
              className={styles.input}
              required
              onInvalid={(e) =>
                e.currentTarget.setCustomValidity(t('catalog.requiredFields'))
              }
              onInput={(e) =>
                e.currentTarget.setCustomValidity('')
              }
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.required}>* </span>
              {t('exec.apellidoPaterno')}
            </label>
            <input
              type="text"
              value={formData.Apellido_paterno}
              onChange={(e) => setFormData({ 
                ...formData, 
                Apellido_paterno: e.target.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "").replace(/\s{2,}/g, " ")
              })}
              className={styles.input}
              required
              onInvalid={(e) =>
                e.currentTarget.setCustomValidity(t('catalog.requiredFields'))
              }
              onInput={(e) =>
                e.currentTarget.setCustomValidity('')
              }
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              {/* <span className={styles.required}>*</span> */}
              {t('exec.apellidoMaterno')}
            </label>
            <input
              type="text"
              value={formData.Apellido_materno}
              onChange={(e) => setFormData({ 
                ...formData, 
                Apellido_materno: e.target.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "").replace(/\s{2,}/g, " ")
              })}
              className={styles.input}
            // required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.required}>*</span>
              {t('exec.numeroNomina')}
            </label>
            <input
              type="number"
              min="1"
              value={formData.Numero_nomina}
              onKeyDown={(e) => {
                if (e.key === '-' || e.key === 'e') {
                  e.preventDefault();
                }
              }}
              onChange={(e) =>{
                setFormData({ ...formData, Numero_nomina: e.target.value })}
              } 
              className={styles.input}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.required}>*</span>
              {t('exec.fechaIngreso')}
            </label>
            <input
              type="date"
              min="1980-01-01"
              max={new Date(new Date().setMonth(new Date().getMonth() + 1))
                  .toISOString()
                  .split("T")[0]
              }
              value={formData.Fecha_ingreso}
              onChange={(e) => setFormData({ ...formData, Fecha_ingreso: e.target.value })}
              className={styles.inputdate}
              required
              onInvalid={(e) => 
                e.currentTarget.setCustomValidity(t('catalog.requiredFields'))
              }
              onInput={(e) =>
                e.currentTarget.setCustomValidity('')
              }
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.required}>*</span>
              {t('exec.email')}
            </label>
            <input
              type="email"
              value={formData.Email}
              onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
              className={styles.input}
              required
              onInvalid={(e) => 
                e.currentTarget.setCustomValidity(t('catalog.requiredFields'))
              }
              onInput={(e) =>
                e.currentTarget.setCustomValidity('')
              }
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.required}>*</span>
              {t('exec.departamento')}
            </label>
            <select
              value={formData.Departamento}
              onChange={(e) => setFormData({ ...formData, Departamento: e.target.value })}
              className={styles.select}
              required
              onInvalid={(e) => 
                e.currentTarget.setCustomValidity(t('catalog.requiredFields'))
              }
              onInput={(e) =>
                e.currentTarget.setCustomValidity('')
              }
              >
              <option value="">Seleccionar...</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.required}>*</span>
              {t('exec.user')}
            </label>
            <select
              value={formData._Iduser}
              onChange={(e) => setFormData({ ...formData, _Iduser: e.target.value })}
              className={styles.select}
              required
              onInvalid={(e) => 
                e.currentTarget.setCustomValidity(t('catalog.requiredFields'))
              }
              onInput={(e) =>
                e.currentTarget.setCustomValidity('')
              }
              >
              <option value="">Seleccionar...</option>
              {users.map((user) => (
                <option key={user._Id} value={user._Id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>{t('exec.activo')}</label>
            <div className={styles.toggleItem}>
              <label className={styles.label}>{t('exec.disponible')}</label>
              <div
                className={`${styles.toggle} ${formData.Status ? styles.active : ''}`}
                onClick={() => setFormData({...formData,Status: formData.Status === 1 ? 0 : 1})}>
                <div className={styles.toggleThumb}></div>
              </div>
            </div>
          </div>
        </div>
      </form>
    );
  }

  return (
    <div className={styles.container}>
      {/* {notification && (
        <div className={`${styles.notification} ${styles[notification.type]}`}>
          {notification.message}
        </div>
      )} */}
      <div className={styles.header}>
        <h1 className={styles.title}>{t('exec.title')}</h1>
        <div className={styles.buttonGroup}>
          <button onClick={handleNewExecutive} className={styles.headerButton}>
            <Plus size={20} />
          </button>
          <button onClick={loadExecutives} className={styles.headerButton} disabled={loading}>
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBar}>
          <Search size={20} />
          <input
            type="text"
            placeholder={t('exec.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')}>
              <X size={20} />
            </button>
          )}
        </div>

        <div className={styles.filters}>
          <button
            className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            {t('exec.filterAll')}
          </button>
          <button
            className={`${styles.filterButton} ${filter === 'active' ? styles.active : ''}`}
            onClick={() => setFilter('active')}
          >
            {t('exec.filterActive')}
          </button>
          <button
            className={`${styles.filterButton} ${filter === 'inactive' ? styles.active : ''}`}
            onClick={() => setFilter('inactive')}
          >
            {t('exec.filterInactive')}
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
        </div>
      ) : filteredExecutives.length > 0 ? (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('exec.numeroNomina')}</th>
                <th>{t('exec.nombre')}</th>
                <th>{t('exec.email')}</th>
                <th>{t('exec.departamento')}</th>
                <th>{t('exec.activo')}</th>
                <th>{t('exec.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredExecutives.map((executive) => (
                <tr key={executive._Id}>
                  <td className={styles.nominaCell}>
                    {executive.numero_nomina}
                  </td>
                  <td>
                    {executive.nombre} {" "}
                    {executive.apellido_paterno} {" "}
                    {executive.apellido_materno}
                  </td>
                  <td>
                    {executive.email}
                  </td>
                  <td>
                    {executive.departamento}</td>
                  <td>
                    <span className={`${styles.statusBadge} 
                      ${executive.status === 1
                        ? styles.statusActive
                        : styles.statusInactive
                      }`}>
                      {executive.status === 1 ? t('exec.disponible') : t('exec.noDisponible')}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button
                        className={`${styles.actionButton} ${styles.edit}`}
                        onClick={() => handleEdit(executive)}
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className={`${styles.actionButton} ${styles.danger}`}
                        onClick={() => handleDelete(executive._Id!)}
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p className={styles.noResults}>{t('supp.noResults')}</p>
        </div>
      )}

      <Modal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        onConfirm={modalState.onConfirm}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        showCancel={modalState.showCancel}
        confirmText={t('catalog.continue')}
        cancelText={t('catalog.cancel')}
      />

    </div>
  );
}
