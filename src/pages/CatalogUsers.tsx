import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import styles from './Catalogs.module.css';

const API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/users`;
const API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface User {
  _id: string;
  email: string;
  name: string | null;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export function CatalogUsers() {
  const { t } = useLanguage();
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
        throw new Error('Error al cargar los datos');
      }

      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error loading Users data:', error);
      alert('Error al cargar usuarios');
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

  const handleSave = async () => {
    try {
      setLoading(true);

      if (!formData.email) {
        alert('El email es obligatorio');
        return;
      }

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
          throw new Error('Error al actualizar el registro');
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
          throw new Error(errorData.error || 'Error al crear el registro');
        }
      }

      await loadData();
      closeModal();
      alert('Usuario guardado exitosamente');
    } catch (error: any) {
      console.error('Error saving User:', error);
      alert(error.message || 'Error al guardar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
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
        alert('Usuario eliminado exitosamente');
      } catch (error) {
        console.error('Error deleting User:', error);
        alert('Error al eliminar usuario');
      } finally {
        setLoading(false);
      }
    }
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
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Usuarios</h1>
        <div className={styles.headerActions}>
          <button className={styles.addButton} onClick={() => openModal()} disabled={loading}>
            <Plus size={18} />
            Nuevo Usuario
          </button>
        </div>
      </div>

      <div className={styles.searchBar}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Buscar usuario..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={loading}
        />
        <div className={styles.filterButtons}>
          <button
            className={`${styles.filterButton} ${roleFilter === 'all' ? styles.active : ''}`}
            onClick={() => setRoleFilter('all')}
            disabled={loading}
          >
            Todos
          </button>
          <button
            className={`${styles.filterButton} ${roleFilter === 'user' ? styles.active : ''}`}
            onClick={() => setRoleFilter('user')}
            disabled={loading}
          >
            Usuarios
          </button>
          <button
            className={`${styles.filterButton} ${roleFilter === 'admin' ? styles.active : ''}`}
            onClick={() => setRoleFilter('admin')}
            disabled={loading}
          >
            Administradores
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
              <th>Email</th>
              <th>Nombre</th>
              <th>Roles</th>
              <th>Creado</th>
              <th>Acciones</th>
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
                        <span key={role} className={styles.statusBadge} style={{
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
                    <div className={styles.actions}>
                      <button
                        className={`${styles.iconButton} ${styles.edit}`}
                        onClick={() => openModal(item)}
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className={`${styles.iconButton} ${styles.delete}`}
                        onClick={() => handleDelete(item._id)}
                        title="Eliminar"
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
                  No se encontraron usuarios
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
                {editingItem ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
              <button className={styles.closeButton} onClick={closeModal}>
                <X size={24} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Email *</label>
                <input
                  type="email"
                  className={styles.input}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={loading}
                  placeholder="usuario@ejemplo.com"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Nombre</label>
                <input
                  type="text"
                  className={styles.input}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={loading}
                  placeholder="Nombre completo"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Contraseña {editingItem ? '(dejar vacío para mantener actual)' : '*'}
                </label>
                <input
                  type="password"
                  className={styles.input}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={loading}
                  placeholder="Contraseña"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Roles</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <label className={styles.label} style={{ fontSize: '0.875rem', fontWeight: 'normal' }}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={formData.roles.includes('user')}
                      onChange={() => toggleRole('user')}
                      disabled={loading}
                    />
                    {' '}Usuario
                  </label>
                  <label className={styles.label} style={{ fontSize: '0.875rem', fontWeight: 'normal' }}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={formData.roles.includes('admin')}
                      onChange={() => toggleRole('admin')}
                      disabled={loading}
                    />
                    {' '}Administrador
                  </label>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelButton} onClick={closeModal} disabled={loading}>
                Cancelar
              </button>
              <button className={styles.saveButton} onClick={handleSave} disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
