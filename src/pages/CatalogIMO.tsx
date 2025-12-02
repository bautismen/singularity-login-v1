import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { ImoClass } from '../types/catalog';
import styles from './Catalogs.module.css';

export function CatalogIMO() {
  const { t } = useLanguage();
  const [items, setItems] = useState<ImoClass[]>([]);
  const [filteredItems, setFilteredItems] = useState<ImoClass[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ImoClass | null>(null);
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
    // Mock data - replace with actual Supabase call
    const mockData: ImoClass[] = [
      { id: 1, imo: '1.1', description: 'Objetos con riesgo de explosión de toda la masa.', status: 1, archived: false, data_state: 1 },
      { id: 2, imo: '1.2', description: 'Representan riesgo de proyección, pero no de explosión de toda la masa.', status: 1, archived: false, data_state: 1 },
      { id: 3, imo: '2.1', description: 'Gases inflamables.', status: 1, archived: false, data_state: 1 },
    ];
    setItems(mockData);
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
    // Mock save - replace with actual Supabase call
    if (editingItem) {
      setItems(items.map(item =>
        item.id === editingItem.id
          ? { ...item, ...formData }
          : item
      ));
    } else {
      const newItem: ImoClass = {
        id: Date.now(),
        ...formData,
        archived: false,
        data_state: 1,
      };
      setItems([...items, newItem]);
    }
    closeModal();
  };

  const handleDelete = async (id: number) => {
    if (confirm(t('catalog.confirmDelete'))) {
      // Mock delete - replace with actual Supabase call
      setItems(items.map(item =>
        item.id === id ? { ...item, archived: true } : item
      ));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('nav.catalogs.imo')}</h1>
        <div className={styles.headerActions}>
          <button className={styles.addButton} onClick={() => openModal()}>
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
        />
        <div className={styles.filterButtons}>
          <button
            className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            {t('catalog.filterAll')}
          </button>
          <button
            className={`${styles.filterButton} ${filter === 'active' ? styles.active : ''}`}
            onClick={() => setFilter('active')}
          >
            {t('catalog.filterActive')}
          </button>
          <button
            className={`${styles.filterButton} ${filter === 'inactive' ? styles.active : ''}`}
            onClick={() => setFilter('inactive')}
          >
            {t('catalog.filterInactive')}
          </button>
        </div>
      </div>

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
                  type="text"
                  className={styles.input}
                  value={formData.imo}
                  onChange={(e) => setFormData({ ...formData, imo: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>{t('catalog.imo.description')}</label>
                <textarea
                  className={styles.textarea}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={formData.status === 1}
                    onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 1 : 0 })}
                  />
                  {' '}{t('catalog.status.active')}
                </label>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelButton} onClick={closeModal}>
                {t('catalog.cancel')}
              </button>
              <button className={styles.saveButton} onClick={handleSave}>
                {t('catalog.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
