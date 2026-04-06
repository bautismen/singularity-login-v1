import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, RefreshCw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Service } from '../types/catalog';
//import styles from './Catalogs.module.css';
import { useNotification } from '../contexts/NotificationContext';
import { Modal } from '../components/Modal';

const API_URL = import.meta.env.VITE_API_CATALOGS;
const API_KEY = import.meta.env.VITE_APIKEYSL;
const API_TOKENSL = import.meta.env.VITE_TOKENSL;

export function CatalogServices() {
  const { t } = useLanguage();
  const catalogName = t('catalog.service');
  const { showSuccess, showError } = useNotification();
  const [items, setItems] = useState<Service[]>([]);
  const [filteredItems, setFilteredItems] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Service | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    _Id: 0,
    Service_name: '',
    Category: 1,
    Email_service_name: '',
    Status: 1,
    Archived: false,
    Data_state: 1,
  });
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const disabled = editingItem ? true : false;

  const isValidEmail = (email: string) => emailRegex.test(email);

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
      const response = await fetch(`${API_URL}/v1/kl/catalog/operations/Service`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_TOKENSL}`,
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
      });

      if (!response.ok) {
        showError('Error al cargar los datos');
      }

      const data = await response.json();
      setItems(data.data.map((item: any) => ({
        id: item._Id,
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
        _Id: item.id,
        Service_name: item.service_name,
        Category: item.category,
        Email_service_name: item.email_service_name || '',
        Status: item.status,
        Archived: item.archived,
        Data_state: item.data_state,
      });
    } else {
      setEditingItem(null);
      setFormData({
        _Id: 0,
        Service_name: '',
        Category: 1,
        Email_service_name: '',
        Status: 1,
        Archived: false,
        Data_state: 1,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      _Id: 0,
      Service_name: '',
      Category: 1,
      Email_service_name: '',
      Status: 1,
      Archived: false,
      Data_state: 1,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      setLoading(true);      

      if (formData.Email_service_name.length > 0 && !isValidEmail(formData.Email_service_name)) {
        showError('Debe ingresar un correo electrónico válido');
        return;
      }

      if (editingItem) {
        setFormData({ ...formData, _Id: editingItem.id });
        const response = await fetch(`${API_URL}/v1/kl/catalog/operations/Service`, {
          method: 'PUT',
          headers: {
             'Authorization': `Bearer ${API_TOKENSL}`,
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          showError('Error al actualizar el registro');
        }
      } else {
        console.log(JSON.stringify(formData));
        const response = await fetch(`${API_URL}/v1/kl/catalog/operations/add/Service`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_TOKENSL}`,
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
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
    
    setModalState({
      isOpen: true,
      type: 'confirm',
      title: t('modal.title').replace('{name}', catalogName.toLowerCase()),
      message: t('modal.message'),
      showCancel: true,
      onConfirm: async () => {
        try {
          setLoading(true);
          const response = await fetch(`${API_URL}/v1/kl/catalog/operations/view=Service&id=${id}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${API_TOKENSL}`,
              'Content-Type': 'application/json',
              'x-api-key': API_KEY,
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
    });
  };

  return (
    <div className="container">
      <div className="header">
        <h1 className="title">{t('nav.catalogs.services')}</h1>
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
                <td colSpan={5} className="noResults">
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
                <label className="label"><span className="required">*</span> {t('catalog.service.name')}</label>
                <input
                  type="text"
                  className="input"
                  value={formData.Service_name}
                  onChange={(e) => setFormData({ ...formData, Service_name: e.target.value })}
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
                <label className="label">{t('catalog.service.category')}</label>
                <select
                  className="select"
                  value={formData.Category}
                  onChange={(e) => setFormData({ ...formData, Category: parseInt(e.target.value) })}
                  disabled={loading}
                >
                  <option value={1}>{t('catalog.service.categoryMain')}</option>
                  <option value={2}>{t('catalog.service.categoryAccessory')}</option>
                </select>
              </div>

              <div className="formGroup">
                <label className="label">{t('catalog.service.email')} {t('catalog.optional')}</label>
                <input
                  type="email"
                  className="input"
                  value={formData.Email_service_name}
                  onChange={(e) => setFormData({ ...formData, Email_service_name: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="formGroup">
                <label className="label">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={formData.Status === 1}
                    onChange={(e) => setFormData({ ...formData, Status: e.target.checked ? 1 : 0 })}
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
