import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, RefreshCw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Country } from '../types/catalog';
//import styles from './Catalogs.module.css';
import { useNotification } from '../contexts/NotificationContext';
import { Modal } from '../components/Modal';

const API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/catalog-countries`;
const API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function CatalogCountries() {
  const { t } = useLanguage();
  const catalogName = t('nav.catalogs.country');
  const { showSuccess, showError } = useNotification();
  const [items, setItems] = useState<Country[]>([]);
  const [filteredItems, setFilteredItems] = useState<Country[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Country | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    country_code: '',
    name_country: '',
    status: 1,
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
        id: item.id_country,
        id_country: item.id_country,
        country_code: item.country_code,
        name_country: item.name_country,
        status: item.status !== undefined ? item.status : 1,
        archived: item.archived || false,
        data_state: item.data_state || 1,
      })));
    } catch (error) {
      console.error('Error loading Countries data:', error);
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
        item.country_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name_country.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  };

  const openModal = (item?: Country) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        country_code: item.country_code,
        name_country: item.name_country,
        status: item.status,
      });
    } else {
      setEditingItem(null);
      setFormData({
        country_code: '',
        name_country: '',
        status: 1,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      country_code: '',
      name_country: '',
      status: 1,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    
    try {
      e.preventDefault();
      setLoading(true);

      if (editingItem) {
        const response = await fetch(`${API_URL}/${editingItem.id_country}`, {
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
      console.error('Error saving Country:', error);
      showError(t('catalog.errorSave'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    
    setModalState({
      isOpen: true,
      type: 'confirm',
      title: t('modal.title').replace('{name}', catalogName.toLowerCase()),
      message: t('modal.message'),
      showCancel: true,
      onConfirm: async () => {
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
          console.error('Error deleting Country:', error);
          showError(t('catalog.errorDelete'));
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <div className="container">
      <div className="header">
        <h1 className="title">{t('nav.catalogs.countries')}</h1>
        <div className="buttonGroup">
          <button className="headerButton" onClick={() => openModal()} disabled={loading}>
            <Plus size={20} />
          </button>
          <button onClick={loadData} className="headerButton">
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      <div className="searchBar">
        <input
          type="text"
          className="searchInput"
          placeholder={t('catalog.search')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={loading}
        />
        <div className="filterButtons">
          <button
            className={`filterButton ${filter === 'all' ? "active" : ''}`}
            onClick={() => setFilter('all')}
            disabled={loading}
          >
            {t('catalog.filterAll')}
          </button>
          <button
            className={`filterButton ${filter === 'active' ? "active" : ''}`}
            onClick={() => setFilter('active')}
            disabled={loading}
          >
            {t('catalog.filterActive')}
          </button>
          <button
            className={`filterButton ${filter === 'inactive' ? "active" : ''}`}
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
        <table className="table">
          <thead>
            <tr>
              <th>{t('catalog.country.code')}</th>
              <th>{t('catalog.country.name')}</th>
              <th>{t('catalog.status.active')}</th>
              <th>{t('catalog.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <tr key={item.id_country}>
                  <td>{item.country_code}</td>
                  <td>{item.name_country}</td>
                  <td>
                    <span className={`statusBadge ${item.status === 1 ? "active" : "inactive"}`}>
                      {item.status === 1 ? t('catalog.status.active') : t('catalog.status.inactive')}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button
                        className="iconButton edit"
                        onClick={() => openModal(item)}
                        title={t('catalog.edit').replace('{name}', catalogName.toLowerCase())}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="iconButton delete"
                        onClick={() => handleDelete(item.id_country)}
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
                <td colSpan={4} className="noResults">
                  {t('catalog.noResults')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {showModal && (
        <form onSubmit={handleSave}> 
          <div className="modalOverlay" onClick={closeModal}>
            <div className="modalContent" onClick={(e) => e.stopPropagation()}>
              <div className="modalHeader">
                <h2 className="modalTitle">
                  {editingItem
                    ? t('catalog.edit').replace('{name}', catalogName.toLowerCase())
                    : t('catalog.new').replace('{name}', catalogName.toLowerCase())}
                </h2>
                <button className="closeButton" onClick={closeModal}>
                  <X size={24} />
                </button>
              </div>

              <div className="modalBody">
                <div className="formGroup">
                  <label className="label">
                    <span className="required">* </span>
                    {t('catalog.country.code')}
                    </label>
                  <input
                    type="text"
                    className="input"
                    value={formData.country_code}
                    onChange={(e) => setFormData({ ...formData, country_code: e.target.value.toUpperCase() })}
                    disabled = {editingItem ? true : false} 
                    maxLength={2}
                    placeholder="US, MX, CA..."
                    required
                    onInvalid={(e) => 
                      e.currentTarget.setCustomValidity(t('catalog.requiredFields'))
                    }
                    onInput={(e) =>
                      e.currentTarget.setCustomValidity('')
                    }
                  />
                </div>

                <div className="formGroup">
                  <label className="label">
                    <span className="required">* </span>
                      {t('catalog.country.name')}
                    </label>
                  <input
                    type="text"
                    className="input"
                    value={formData.name_country}
                    onChange={(e) => setFormData({ ...formData, name_country: e.target.value })}
                    disabled = {editingItem ? true : false} 
                    required
                    onInvalid={(e) => 
                      e.currentTarget.setCustomValidity(t('catalog.requiredFields'))
                    }
                    onInput={(e) =>
                      e.currentTarget.setCustomValidity('')
                    }
                  />
                </div>

                <div className="formGroup">
                  <label className="label">
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={formData.status === 1}
                      onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 1 : 0 })}
                      disabled={loading}
                    />
                    {' '}{t('catalog.status.active')}
                  </label>
                </div>
              </div>

              <div className="modalFooter">
                <button className="cancelButton" onClick={closeModal} disabled={loading}>
                  {t('catalog.cancel')}
                </button>
                <button className="saveButton" type="submit" disabled={loading}>
                  {loading ? 'Guardando...' : t('catalog.save')}
                </button>
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
