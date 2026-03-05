import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, RefreshCw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { User } from '../types/user';
//import styles from './Catalogs.module.css';
import { useNotification } from '../contexts/NotificationContext';
import { Modal } from '../components/Modal';

const API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/users`;
const API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function CatalogUsers() {
  const { t } = useLanguage();
  const catalogName = t('user.user');
  const { showSuccess, showError } = useNotification();
  const [items, setItems] = useState<User[]>([]);
  const [filteredItems, setFilteredItems] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    roles: ['user'],
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
  }, [items, searchQuery, roleFilter]);

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
      setItems(data);
    } catch (error) {
      console.error('Error loading Users data:', error);
      showError('user.errorLoad');
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let filtered = [...items];

    if (roleFilter !== 'all') {
      filtered = filtered.filter(item => item.roles.includes(roleFilter));
    }

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredItems(filtered);
  };

  const openModal = (item?: User) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        email: item.email,
        name: item.name || '',
        password: '',
        roles: item.roles,
      });
    } else {
      setEditingItem(null);
      setFormData({
        email: '',
        name: '',
        password: '',
        roles: ['user'],
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      email: '',
      name: '',
      password: '',
      roles: ['user'],
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      setLoading(true);

      // if (!formData.email) {
      //   alert('El email es obligatorio');
      //   return;
      // }

      if (!editingItem && !formData.password) {
        alert('La contraseña es obligatoria para nuevos usuarios');
        return;
      }

      const payload: any = {
        email: formData.email,
        name: formData.name || null,
        roles: formData.roles,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      if (editingItem) {
        const response = await fetch(`${API_URL}/${editingItem._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
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
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || t('catalog.errorSave'));
        }
        
      }

      await loadData();
      closeModal();
      showSuccess(t('user.successSave'));
    } catch (error: any) {
      console.error('Error saving User:', error);
      showError(error.message || t('user.errorSave'));
    } finally {
      setLoading(false);
    }
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
          setLoading(true);
          const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${API_KEY}`,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error(t('user.errorDelete'));
          }

          await loadData();
          showSuccess(t('user.successDelete'));
        } catch (error) {
          console.error('Error deleting User:', error);
          showError(t('user.errorDelete'));
        } finally {
          setLoading(false);
        }       
      }
    });
  };

  const toggleRole = (role: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="container">
      <div className="header">
        <h1 className="title">{t('user.title')}</h1>
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
          placeholder={t('user.search')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={loading}
        />
        <div className="filterButtons">
          <button
            className={`filterButton ${roleFilter === 'all' ? "active" : ''}`}
            onClick={() => setRoleFilter('all')}
            disabled={loading}
          >
            {t('user.filterAll')}
          </button>
          <button
            className={`filterButton ${roleFilter === 'user' ? "active" : ''}`}
            onClick={() => setRoleFilter('user')}
            disabled={loading}
          >
            {t('user.title')}
          </button>
          <button
            className={`filterButton ${roleFilter === 'admin' ? "active" : ''}`}
            onClick={() => setRoleFilter('admin')}
            disabled={loading}
          >
            {t('user.filterAdmins')}
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
              <th>{t('user.email')}</th>
              <th>{t('user.name')}</th>
              <th>{t('user.roles')}</th>
              <th>{t('user.created')}</th>
              <th>{t('user.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <tr key={item._id}>
                  <td>{item.email}</td>
                  <td>{item.name || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                      {item.roles.map(role => (
                        <span key={role} className="statusBadge" style={{
                          background: role === 'admin' ? '#fef3c7' : '#dbeafe',
                          color: role === 'admin' ? '#92400e' : '#1e40af',
                          border: 'none'
                        }}>
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>{formatDate(item.createdAt)}</td>
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
                        onClick={() => handleDelete(item._id)}
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
                  {t('user.noResults')}
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
                  {editingItem ? 
                    t('user.editUser') : 
                    t('user.newUser')}
                </h2>
                <button className="closeButton" onClick={closeModal}>
                  <X size={24} />
                </button>
              </div>

              <div className="modalBody">
                <div className="formGroup">
                  <label className="label">
                    <span className="required">* </span>
                    {t('user.email')}
                  </label>
                  <input
                    type="email"
                    className="input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={loading}
                    placeholder="usuario@ejemplo.com"
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
                    {t('user.name')}
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={formData.name}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      name: e.target.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "").replace(/\s{2,}/g, " ")
                    })}
                    disabled={loading}
                    placeholder={t('user.fullName')}
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
                    {t('user.password')} {/*editingItem ? '(dejar vacío para mantener actual)' : ''*/}
                  </label>
                  <input
                    type="password"
                    className="input"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={editingItem ? true : false} 
                    placeholder={t('user.password')}
                    required ={!editingItem}
                      onInvalid={(e) => 
                        e.currentTarget.setCustomValidity(t('catalog.requiredFields'))
                      }
                      onInput={(e) =>
                        e.currentTarget.setCustomValidity('')
                      }
                  />
                </div>

                <div className="formGroup">
                  <label className="label">{t('user.roles')}</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <label className="label" style={{ fontSize: '0.875rem', fontWeight: 'normal' }}>
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={formData.roles.includes('user')}
                        onChange={() => toggleRole('user')}
                        disabled={loading}
                      />
                      {' '}{t('user.user')}
                    </label>
                    <label className="label" style={{ fontSize: '0.875rem', fontWeight: 'normal' }}>
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={formData.roles.includes('admin')}
                        onChange={() => toggleRole('admin')}
                        disabled={loading}
                      />
                      {' '}{t('user.admin')}
                    </label>
                  </div>
                </div>
              </div>

              <div className="modalFooter">
                <button className="cancelButton" onClick={closeModal} disabled={loading}>
                  {t('user.cancel')}
                </button>
                <button className="saveButton" type="submit" disabled={loading}>
                  {loading ? t('catalog.saving') : t('user.save')}
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
