import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { ImoClass } from '../types/catalog';
import styles from './Catalogs.module.css';
import { useNotification } from '../contexts/NotificationContext';

const API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/catalog-imo`;
const API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function CatalogIMO() {
  const { t } = useLanguage();
  const { showSuccess, showError } = useNotification();
  const [items, setItems] = useState<ImoClass[]>([]);
  const [filteredItems, setFilteredItems] = useState<ImoClass[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ImoClass | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    imo: '',
    description: '',
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
        throw new Error('Error al cargar los datos');
      }

      const data = await response.json();
      setItems(data.map((item: any) => ({
        id: item._id,
        imo: item.imo,
        description: item.description,
        status: item.status,
        archived: item.archived,
        data_state: item.data_state,
      })));
    } catch (error) {
      console.error('Error loading IMO data:', error);
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
        item.imo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  };

  const openModal = (item?: ImoClass) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        imo: item.imo,
        description: item.description,
        status: item.status,
      });
    } else {
      setEditingItem(null);
      setFormData({
        imo: '',
        description: '',
        status: 1,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      imo: '',
      description: '',
      status: 1,
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      if (formData.imo.length === 0) {
      showError('Debe ingresar un IMO');
      return;
      }

      if (formData.description.length === 0) {
      showError('Debe ingresar una descripción');
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
      console.error('Error saving IMO:', error);
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
        console.error('Error deleting IMO:', error);
        showError(t('catalog.errorDelete'));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('nav.catalogs.imo')}</h1>
        <div className={styles.headerActions}>
          <button className={styles.buttonGroupItem} onClick={() => openModal()} disabled={loading}>
            <Plus size={18} />
            {t('catalog.new').replace('{name}', 'IMO')}
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
              <th>{t('catalog.imo.code')}</th>
              <th>{t('catalog.imo.description')}</th>
              <th>{t('catalog.status.active')}</th>
              <th>{t('catalog.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.imo}</td>
                  <td>{item.description}</td>
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
                        title={t('catalog.edit').replace('{name}', 'IMO')}
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
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingItem
                  ? t('catalog.edit').replace('{name}', 'IMO')
                  : t('catalog.new').replace('{name}', 'IMO')}
              </h2>
              <button className={styles.closeButton} onClick={closeModal}>
                <X size={24} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t('catalog.imo.code')}</label>
                <input
                  type="number"
                  className={styles.input}
                  value={formData.imo}
                  onChange={(e) => setFormData({ ...formData, imo: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>{t('catalog.imo.description')}</label>
                <textarea
                  className={styles.textarea}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
