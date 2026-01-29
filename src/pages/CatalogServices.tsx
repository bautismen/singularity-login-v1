import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, RefreshCw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Service } from '../types/catalog';
import styles from './Catalogs.module.css';
import { useNotification } from '../contexts/NotificationContext';

const API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/catalog-services`;
const API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function CatalogServices() {
  const { t } = useLanguage();
  const { showSuccess, showError } = useNotification();
  const [items, setItems] = useState<Service[]>([]);
  const [filteredItems, setFilteredItems] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Service | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    service_name: '',
    category: 1,
    email_service_name: '',
    status: 1,
  });
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const isValidEmail = (email: string) => emailRegex.test(email);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterData();
  }, [items, searchQuery, filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        showError('Error al cargar los datos');
      }

      const data = await response.json();
      setItems(data.map((item: any) => ({
        id: item._id,
        service_name: item.service_name,
        category: item.category,
        email_service_name: item.email_service_name,
        status: item.status,
        archived: item.archived,
        data_state: item.data_state,
      })));
    } catch (error) {
      console.error('Error loading Services data:', error);
      showError(t('catalog.errorLoad'));
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let filtered = items.filter(item => !item.archived);

    if (filter === 'active') {
      filtered = filtered.filter(item => item.status === 1);
    } else if (filter === 'inactive') {
      filtered = filtered.filter(item => item.status === 0);
    }

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.service_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  };

  const openModal = (item?: Service) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        service_name: item.service_name,
        category: item.category,
        email_service_name: item.email_service_name || '',
        status: item.status,
      });
    } else {
      setEditingItem(null);
      setFormData({
        service_name: '',
        category: 1,
        email_service_name: '',
        status: 1,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      service_name: '',
      category: 1,
      email_service_name: '',
      status: 1,
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      if (formData.service_name.length === 0) {
      showError('Debe ingresar un nombre de servicio');
      return;
      }

      if (formData.email_service_name.length > 0 && !isValidEmail(formData.email_service_name)) {
        showError('Debe ingresar un correo electrónico válido');
        return;
      }

      if (editingItem) {
        const response = await fetch(`${API_URL}/${editingItem.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          showError('Error al actualizar el registro');
        }
      } else {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          showError('Error al crear el registro');
        }
      }

      await loadData();
      closeModal();
      showSuccess(t('catalog.successSave'));
    } catch (error) {
      console.error('Error saving Service:', error);
      showError(t('catalog.errorSave'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm(t('catalog.confirmDelete'))) {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          showError('Error al eliminar el registro');
        }

        await loadData();
        showSuccess(t('catalog.successDelete'));
      } catch (error) {
        console.error('Error deleting Service:', error);
        showError(t('catalog.errorDelete'));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('nav.catalogs.services')}</h1>
        <div className={styles.buttonGroup}>
          <button className={styles.buttonGroupItem} onClick={() => openModal()} disabled={loading}>
            <Plus size={20} />            
          </button>
           <button onClick={loadData} className={styles.buttonGroupItemLast}>
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      <div className={styles.searchBar}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder={t('catalog.search')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={loading}
        />
        <div className={styles.filterButtons}>
          <button
            className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
            disabled={loading}
          >
            {t('catalog.filterAll')}
          </button>
          <button
            className={`${styles.filterButton} ${filter === 'active' ? styles.active : ''}`}
            onClick={() => setFilter('active')}
            disabled={loading}
          >
            {t('catalog.filterActive')}
          </button>
          <button
            className={`${styles.filterButton} ${filter === 'inactive' ? styles.active : ''}`}
            onClick={() => setFilter('inactive')}
            disabled={loading}
          >
            {t('catalog.filterInactive')}
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ display: 'inline-block', width: '2rem', height: '2rem', border: '3px solid #e5e7eb', borderTopColor: '#14b8a6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        </div>
      )}

      {!loading && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('catalog.service.name')}</th>
              <th>{t('catalog.service.category')}</th>
              <th>{t('catalog.service.email')}</th>
              <th>{t('catalog.status.active')}</th>
              <th>{t('catalog.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.service_name}</td>
                  <td>
                    {item.category === 1 ? t('catalog.service.categoryMain') : t('catalog.service.categoryAccessory')}
                  </td>
                  <td>{item.email_service_name || '-'}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${item.status === 1 ? styles.active : styles.inactive}`}>
                      {item.status === 1 ? t('catalog.filterActive') : t('catalog.filterInactive')}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={`${styles.iconButton} ${styles.edit}`}
                        onClick={() => openModal(item)}
                        title={t('catalog.edit').replace('{name}', 'Servicio')}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className={`${styles.iconButton} ${styles.delete}`}
                        onClick={() => handleDelete(item.id)}
                        title={t('catalog.delete')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className={styles.noResults}>
                  {t('catalog.noResults')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingItem
                  ? t('catalog.edit').replace('{name}', 'Servicio')
                  : t('catalog.new').replace('{name}', 'Servicio')}
              </h2>
              <button className={styles.closeButton} onClick={closeModal}>
                <X size={24} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t('catalog.service.name')}</label>
                <input
                  type="text"
                  className={styles.input}
                  value={formData.service_name}
                  onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>{t('catalog.service.category')}</label>
                <select
                  className={styles.select}
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: parseInt(e.target.value) })}
                  disabled={loading}
                >
                  <option value={1}>{t('catalog.service.categoryMain')}</option>
                  <option value={2}>{t('catalog.service.categoryAccessory')}</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>{t('catalog.service.email')} (Opcional)</label>
                <input
                  type="email"
                  className={styles.input}
                  value={formData.email_service_name}
                  onChange={(e) => setFormData({ ...formData, email_service_name: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={formData.status === 1}
                    onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 1 : 0 })}
                    disabled={loading}
                  />
                  {' '}{t('catalog.status.active')}
                </label>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelButton} onClick={closeModal} disabled={loading}>
                {t('catalog.cancel')}
              </button>
              <button className={styles.saveButton} onClick={handleSave} disabled={loading}>
                {loading ? 'Guardando...' : t('catalog.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
