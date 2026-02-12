import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, RefreshCw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { RequestType } from '../types/catalog';
import styles from './Catalogs.module.css';
import { useNotification } from '../contexts/NotificationContext';

const API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/catalog-request-types`;
const API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function CatalogRequestTypes() {
  const { t } = useLanguage();
  const catalogName = t('nav.catalogs.requestType');
  const { showSuccess, showError } = useNotification();
  const [items, setItems] = useState<RequestType[]>([]);
  const [filteredItems, setFilteredItems] = useState<RequestType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<RequestType | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    request_type_name: '',
    status: 1,
  });

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
        throw new Error(t('catalog.errorLoad'));
      }

      const data = await response.json();
      setItems(data.map((item: any) => ({
        id: item._id,
        request_type_name: item.request_type_name,
        status: item.status !== undefined ? item.status : 1,
        archived: item.archived || false,
        data_state: item.data_state || 1,
      })));
    } catch (error) {
      console.error('Error loading Request Types data:', error);
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
        item.request_type_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  };

  const openModal = (item?: RequestType) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        request_type_name: item.request_type_name,
        status: item.status,
      });
    } else {
      setEditingItem(null);
      setFormData({
        request_type_name: '',
        status: 1,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      request_type_name: '',
      status: 1,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      setLoading(true);

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
          throw new Error(t('catalog.errorUpdate'));
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
          throw new Error(t('catalog.errorSave'));
        }

      }

      await loadData();
      closeModal();
      showSuccess(t('catalog.successSave'));
    } catch (error) {
      console.error('Error saving Request Type:', error);
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
          throw new Error('Error al eliminar el registro');
        }

        await loadData();
        showSuccess(t('catalog.successDelete'));
      } catch (error) {
        console.error('Error deleting Request Type:', error);
        showError(t('catalog.errorDelete'));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('nav.catalogs.requestTypes')}</h1>
        <div className={styles.buttonGroup}>
          <button className={styles.headerButton} onClick={() => openModal()} disabled={loading}>
            <Plus size={20} /> 
          </button>
          <button onClick={loadData} className={styles.headerButton}>
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
              <th>{t('catalog.requestType.name')}</th>
              <th>{t('catalog.status.active')}</th>
              <th>{t('catalog.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.request_type_name}</td>
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
                        title={t('catalog.edit').replace('{name}', catalogName.toLowerCase())}
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
                <td colSpan={4} className={styles.noResults}>
                  {t('catalog.noResults')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {showModal && (
        <form onSubmit={handleSave}>
          <div className={styles.modalOverlay} onClick={closeModal}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>
                  {editingItem
                    ? t('catalog.edit').replace('{name}', catalogName.toLowerCase())
                    : t('catalog.new').replace('{name}', catalogName.toLowerCase())}
                </h2>
                <button className={styles.closeButton} onClick={closeModal}>
                  <X size={24} />
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <span className={styles.required}>* </span>
                    {t('catalog.requestType.name')}
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    value={formData.request_type_name}
                    onChange={(e) => setFormData({ ...formData, request_type_name: e.target.value })}
                    disabled={loading}
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
                <button className={styles.saveButton} type="submit" disabled={loading}>
                  {loading ? 'Guardando...' : t('catalog.save')}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
