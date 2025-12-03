import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Status } from '../types/catalog';
import styles from './Catalogs.module.css';

const API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/catalog-status`;
const API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function CatalogStatus() {
  const { t } = useLanguage();
  const [items, setItems] = useState<Status[]>([]);
  const [filteredItems, setFilteredItems] = useState<Status[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Status | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    subcategory: '',
    code: '',
    status_name: '',
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
        category: item.category,
        subcategory: item.subcategory,
        code: item.code,
        status_name: item.status_name,
        description: item.description,
        status: item.status,
        archived: item.archived,
        data_state: item.data_state,
      })));
    } catch (error) {
      console.error('Error loading Status data:', error);
      alert(t('catalog.errorLoad'));
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
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subcategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.status_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.code && item.code.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredItems(filtered);
  };

  const openModal = (item?: Status) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        category: item.category,
        subcategory: item.subcategory,
        code: item.code || '',
        status_name: item.status_name,
        description: item.description || '',
        status: item.status,
      });
    } else {
      setEditingItem(null);
      setFormData({
        category: '',
        subcategory: '',
        code: '',
        status_name: '',
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
      category: '',
      subcategory: '',
      code: '',
      status_name: '',
      description: '',
      status: 1,
    });
  };

  const handleSave = async () => {
    try {
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
          throw new Error('Error al actualizar el registro');
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
          throw new Error('Error al crear el registro');
        }
      }

      await loadData();
      closeModal();
      alert(t('catalog.successSave'));
    } catch (error) {
      console.error('Error saving Status:', error);
      alert(t('catalog.errorSave'));
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
        alert(t('catalog.successDelete'));
      } catch (error) {
        console.error('Error deleting Status:', error);
        alert(t('catalog.errorDelete'));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('nav.catalogs.status')}</h1>
        <div className={styles.headerActions}>
          <button className={styles.addButton} onClick={() => openModal()} disabled={loading}>
            <Plus size={18} />
            {t('catalog.new').replace('{name}', 'Estatus')}
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
              <th>{t('catalog.status.category')}</th>
              <th>{t('catalog.status.subcategory')}</th>
              <th>{t('catalog.status.code')}</th>
              <th>{t('catalog.status.name')}</th>
              <th>{t('catalog.status.active')}</th>
              <th>{t('catalog.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.category}</td>
                  <td>{item.subcategory}</td>
                  <td>{item.code || '-'}</td>
                  <td>{item.status_name}</td>
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
                        title={t('catalog.edit').replace('{name}', 'Estatus')}
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
                <td colSpan={6} className={styles.noResults}>
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
                  ? t('catalog.edit').replace('{name}', 'Estatus')
                  : t('catalog.new').replace('{name}', 'Estatus')}
              </h2>
              <button className={styles.closeButton} onClick={closeModal}>
                <X size={24} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t('catalog.status.category')}</label>
                <input
                  type="text"
                  className={styles.input}
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>{t('catalog.status.subcategory')}</label>
                <input
                  type="text"
                  className={styles.input}
                  value={formData.subcategory}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>{t('catalog.status.code')} (Opcional)</label>
                <input
                  type="text"
                  className={styles.input}
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>{t('catalog.status.name')}</label>
                <input
                  type="text"
                  className={styles.input}
                  value={formData.status_name}
                  onChange={(e) => setFormData({ ...formData, status_name: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>{t('catalog.status.description')} (Opcional)</label>
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
