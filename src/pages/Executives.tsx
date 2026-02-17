import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Trash2, Plus, Edit, Search, X, ArrowLeft, RefreshCw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Executive, ExecutiveFormData, DEPARTMENTS } from '../types/executive';
import { getExecutives, createExecutive, updateExecutive, deleteExecutive, checkNominaExists } from '../services/executiveService';
import styles from './Executives.module.css';
import { useNotification } from '../contexts/NotificationContext';
import { Modal } from '../components/Modal';

const USERS_API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/users`;
const API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function Executives() {
  const { t } = useLanguage();
  const catalogName = t('quote.executive');
  const {showError } = useNotification();
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [filteredExecutives, setFilteredExecutives] = useState<Executive[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); 
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('active');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [users, setUsers] = useState<any[]>([]);

  const [formData, setFormData] = useState<ExecutiveFormData>({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    numero_nomina: '',
    fecha_ingreso: '',
    email: '',
    departamento: '',
    activo: true,
    _iduser: '',
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
      console.log(saving);
      setLoading(true);
      const data = await getExecutives(true);
      setExecutives(data);
    } catch (error) {
      showNotification('error', t('exec.errorLoad'));
    } finally {
      setLoading(false);
    }
  };

  const filterExecutives = () => {
    let filtered = [...executives];

    if (filter === 'active') {
      filtered = filtered.filter((exec) => exec.activo && exec.estado === 1);
    } else if (filter === 'inactive') {
      filtered = filtered.filter((exec) => !exec.activo && exec.estado === 1);
    } else {
      filtered = filtered.filter((exec) => exec.estado === 1);
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

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = async (): Promise<boolean> => {
    if (
      !formData.nombre ||
      !formData.apellido_paterno ||
      !formData.apellido_materno ||
      !formData.numero_nomina ||
      !formData.fecha_ingreso ||
      !formData.email ||
      !formData.departamento ||
      !formData._iduser
    ) {
      showNotification('error', t('catalog.requiredFields'));
      return false;
    }

    if (!validateEmail(formData.email)) {
      showNotification('error', t('exec.invalidEmail'));
      return false;
    }

    const nominaExists = await checkNominaExists(formData.numero_nomina, editingId || undefined);
    if (nominaExists) {
      showNotification('error', t('exec.nominaExists'));
      return false;
    }

    return true;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const isValid = await validateForm();

    if (!isValid) {
      setSaving(false); 
      return;
    } 

    try {
      if (editingId) {
        await updateExecutive(editingId, formData);
        showNotification('success', t('exec.successSave'));
      } else {
        await createExecutive(formData);
        showNotification('success', t('exec.successSave'));
      }
      resetForm();
      await loadExecutives();
      setShowForm(false);
    } catch (error) {
      showNotification('error', t('exec.errorSave'));
    }finally {
      setSaving(false);
    }
  };

  const handleEdit = (executive: Executive) => {    
    setFormData({
      nombre: executive.nombre,
      apellido_paterno: executive.apellido_paterno,
      apellido_materno: executive.apellido_materno,
      numero_nomina: executive.numero_nomina,
      fecha_ingreso: executive.fecha_ingreso,
      email: executive.email,
      departamento: executive.departamento,
      activo: executive.activo,
      _iduser: executive._iduser || '',
    });
    setEditingId(executive._id || null);
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
          showNotification('success', t('exec.successDelete'));
          await loadExecutives();
        } catch (error) {
          showNotification('error', t('exec.errorDelete'));
        }
      }
    });
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido_paterno: '',
      apellido_materno: '',
      numero_nomina: '',
      fecha_ingreso: '',
      email: '',
      departamento: '',
      activo: true,
      _iduser: '',
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
      const response = await fetch(USERS_API_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar ejecutivos');
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Cargando...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {notification && (
        <div className={`${styles.notification} ${styles[notification.type]}`}>
          {notification.message}
        </div>
      )}

      <div className={styles.header}>                                
        {!showForm ? (
          <>
           <h1 className={styles.title}>{t('exec.title')}</h1>
           <div className={styles.buttonGroup}>
              <button className={styles.headerButton} onClick={handleNewExecutive}>
                <Plus size={20} />
              </button>
              <button onClick={loadExecutives} className={styles.headerButton} disabled={loading}>
                <RefreshCw size={20} />
              </button>
           </div>
          </>          
        ): (
          <div style={{ display: 'flex', alignItems: 'left', gap: '1rem' }}>          
            <div className={styles.actionBar}>
              <button
                onClick={handleCancel}
                className={styles.actionBarResetButton}
                title="Volver a lista">
                <ArrowLeft size={18} />
              </button>              
            </div>  
            <h2 className={styles.formTitle}>
              {editingId ? t('exec.editExecutive') : t('exec.newExecutive')}
            </h2>      
        </div>
        )}
      </div>

      {!showForm ? (
        <>
          <div className={styles.controls}>
            <div className={styles.searchBar}>
              <Search className={styles.searchIcon} size={18} />
              <input
                type="text"
                placeholder={t('exec.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
              {searchTerm && (
                <button className={styles.clearSearch} onClick={() => setSearchTerm('')}>
                  <X size={16} />
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

          <div className={styles.section}>
            {filteredExecutives.length === 0 ? (
              <div className={styles.noResults}>{t('exec.noResults')}</div>
            ) : (
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
                      <tr key={executive._id}>
                        <td className={styles.nominaCell}>{executive.numero_nomina}</td>
                        <td>{executive.nombre} {executive.apellido_paterno} {executive.apellido_materno}</td>
                        <td>{executive.email}</td>
                        <td>{executive.departamento}</td>
                        <td>
                          <span
                            className={`${styles.statusBadge} ${
                              executive.activo ? styles.statusActive : styles.statusInactive
                            }`}
                          >
                            {executive.activo ? t('exec.disponible') : t('exec.noDisponible')}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actionButtons}>
                            <button
                              className={styles.actionButton}
                              onClick={() => handleEdit(executive)}
                              title="Editar"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className={`${styles.actionButton} ${styles.danger}`}
                              onClick={() => handleDelete(executive._id!)}
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
            )}
          </div>
        </>
      ) : (
        <form onSubmit={handleSave} className={styles.section}>
          <div className={styles.formHeader}>                        
            <div className={styles.actionBar}>
              <button type='submit' className={styles.actionBarSaveButton} disabled={saving}>
                <Save size={18} />
                <span>{t('exec.save')}</span>
              </button>
              <button type="button" className={styles.actionBarResetButton} onClick={resetForm} disabled={saving}>
                <RotateCcw size={18} />
              </button>
              {editingId && (
                <button type="button" className={styles.actionBarDeleteButton} disabled={saving}
                  onClick={() => handleDelete(editingId)}>
                  <Trash2 size={18} />
                </button>
              )}
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
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className={styles.required}>* </span>
                {t('exec.apellidoPaterno')}
              </label>
              <input
                type="text"
                value={formData.apellido_paterno}
                onChange={(e) => setFormData({ ...formData, apellido_paterno: e.target.value })}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className={styles.required}>*</span>
                {t('exec.apellidoMaterno')}
              </label>
              <input
                type="text"
                value={formData.apellido_materno}
                onChange={(e) => setFormData({ ...formData, apellido_materno: e.target.value })}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className={styles.required}>*</span>
                {t('exec.numeroNomina')}
              </label>
              <input
                type="text"
                value={formData.numero_nomina}
                onChange={(e) => setFormData({ ...formData, numero_nomina: e.target.value })}
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
                value={formData.fecha_ingreso}
                onChange={(e) => setFormData({ ...formData, fecha_ingreso: e.target.value })}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className={styles.required}>*</span>
                {t('exec.email')}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className={styles.required}>*</span>
                {t('exec.departamento')}
              </label>
              <select
                value={formData.departamento}
                onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                className={styles.select}
                required>
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
                value={formData._iduser}
                onChange={(e) => setFormData({ ...formData, _iduser: e.target.value })}
                className={styles.select}
                required>
                <option value="">Seleccionar...</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
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
                  className={`${styles.toggle} ${formData.activo ? styles.active : ''}`}
                  onClick={() => setFormData({ ...formData, activo: !formData.activo })}>
                  <div className={styles.toggleThumb}></div>
                </div>
              </div>
            </div>
          </div>
        </form>
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
