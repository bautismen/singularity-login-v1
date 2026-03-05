import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, RefreshCw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Incoterm } from '../types/catalog';
//import styles from './Catalogs.module.css';
import { useNotification } from '../contexts/NotificationContext';
import { Modal } from '../components/Modal';

const API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/catalog-incoterms`;
const API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function CatalogIncoterms() {
  const { t } = useLanguage();
  const catalogName = t('catalog.incoterm.code');
  const { showSuccess, showError } = useNotification();
  const [items, setItems] = useState<Incoterm[]>([]);
  const [filteredItems, setFilteredItems] = useState<Incoterm[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Incoterm | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    incoterm: '',
    status: 1,
  });
  const disabled = editingItem ? true : false;

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
        showError('Error al cargar los datos');
      }

      const data = await response.json();
      setItems(data.map((item: any) => ({
        id: item._id,
        incoterm: item.incoterm,
        status: item.status,
        archived: item.archived,
        data_state: item.data_state,
      })));
    } catch (error) {
      console.error('Error loading Incoterms data:', error);
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
        item.incoterm.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  };

  const openModal = (item?: Incoterm) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        incoterm: item.incoterm,
        status: item.status,
      });
    } else {
      setEditingItem(null);
      setFormData({
        incoterm: '',
        status: 1,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      incoterm: '',
      status: 1,
    });
  };

  const handleSave = async (e: React.FormEvent) => {

    try {
      e.preventDefault();
      setLoading(true);    
      
      const exists = items.some( i =>
        i.incoterm === formData.incoterm   
      )

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

        if (exists) {
          showError(t('catalog.exists').replace('{name}', t('catalog.incoterm.code').toLowerCase()));
          setLoading(false);
          return;
        }

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
      console.error('Error saving Incoterm:', error);
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
            showError('Error al eliminar el registro');
          }

          await loadData();
          showSuccess(t('catalog.successDelete'));
        } catch (error) {
          console.error('Error deleting Incoterm:', error);
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
        <h1 className="title">{t('nav.catalogs.incoterms')}</h1>
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
              <th>{t('catalog.incoterm.code')}</th>
              <th>{t('catalog.status.active')}</th>
              <th>{t('catalog.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.incoterm}</td>
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
                <td colSpan={3} className="noResults">
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
                  <label className="label"><span className="required">*</span> {t('catalog.incoterm.code')}</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.incoterm}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();

                      // Solo letras y máximo 3 caracteres
                      if (/^[A-Za-z]{0,3}$/.test(value)) {
                        setFormData({ ...formData, incoterm: value });
                      }
                    }}                   
                    disabled={disabled}
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
                <button type="submit" className="saveButton" disabled={loading}>
                  {loading ? t('catalog.saving') : t('catalog.save')}
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
