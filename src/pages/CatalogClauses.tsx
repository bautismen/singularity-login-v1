import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, X, RefreshCw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Clauses } from '../types/catalog';
import { useNotification } from '../contexts/NotificationContext';
import { Modal } from '../components/Modal';
import { useAuth } from '../contexts/AuthContext';
import { catalogService } from '../services/catalogsService';

const API_URL = import.meta.env.VITE_API_CATALOGS;
const API_KEY = import.meta.env.VITE_APIKEYSL;
const API_TOKENSL = import.meta.env.VITE_TOKENSL;

export function CatalogClauses() {
  const { t } = useLanguage();
  const catalogName = t('nav.catalogs.clauses');
  const { showSuccess, showError } = useNotification();
  const [items, setItems] = useState<Clauses[]>([]);
  const [filteredItems, setFilteredItems] = useState<Clauses[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [tagInput, setTagInput] = useState("");
  const [filteredTags, setFilteredTags] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [tags, setTags] = useState<any[]>([]);
  const listRef = useRef<Array<HTMLDivElement | null>>([]);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  
  const [formData, setFormData] = useState({
    _Id: "",
    _Idclausula: 0,
    Tags: [],
    Title: '',
    Conditions: {
      En: '',
      Es: ''
    },
    Created_at: Date,
    Created_by: { user_id: user?._id, name: user?.name },
    Updated_at: Date,
    Status: 1 as 1 | 0,
    Archived: false,
    Data_state: 1,
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

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };

    if (showModal) {
      window.addEventListener("keydown", handleEsc);
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [showModal]);

  useEffect(() => {
    if (!tagInput.trim()) {
      setFilteredTags([]);
      return;
    }

    const filtered = tags.filter(tag =>
      tag.tag.toLowerCase().includes(tagInput.toLowerCase()) &&
      !formData.Tags?.some(t => t.tag === tag.tag) // evitamos duplicados
    );

    setFilteredTags(filtered);
    setActiveIndex(0);
  }, [tagInput, formData.Tags]);

  useEffect(() => {

    if (!itemRefs.current.length) return;

    const activeItem = itemRefs.current[activeIndex];
    const container = listRef.current;

    if (activeItem && container) {
      const itemTop = activeItem.offsetTop;
      const itemBottom = itemTop + activeItem.offsetHeight;

      const containerTop = container.scrollTop;
      const containerBottom = containerTop + container.clientHeight;

      if (itemBottom > containerBottom) {
        container.scrollTop = itemBottom - container.clientHeight;
      } else if (itemTop < containerTop) {
        container.scrollTop = itemTop;
      }
    }
  }, [activeIndex]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/v1/kl/catalog/operations/Clause`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_TOKENSL}`,
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
      });
      // console.log(response)
      if (!response.ok) {
        throw new Error(t('catalog.errorLoad'));
      }

      const data = await response.json();
      setItems(data.data.map((item: any) => ({
        _id: item._Id,
        _idclausula: item._Idclausula,
        tags: item.tags,
        title: item.title,
        conditions: {
          en: item.conditions.en,
          es: item.conditions.es,
        },
        created_at: item.created_at,
        created_by: item.created_by ? {
          user_id: item.created_by.user_id,
          name: item.created_by.name,
        } : null,
        updated_at: item.updated_at,
        status: item.status !== undefined ? item.status : 1,
        archived: item.archived || false,
        data_state: item.data_state || 1,
      })));
    } catch (error) {
      console.error('Error loading Clause data:', error);
      showError(t('catalog.errorLoad'));
    } finally {
      setLoading(false);
    }
  };

  async function loadTags() {
    try {
      const tags = await catalogService.getTags();
      setTags(tags.data.filter((c: any) => c.status === 1));

    } catch (error) {
      console.error('Error loading tags:', error);
    }
  }

  const filterData = () => {
    let filtered = items.filter(item => !item.archived);

    if (filter === 'active') {
      filtered = filtered.filter(item => item.status === 1);
    } else if (filter === 'inactive') {
      filtered = filtered.filter(item => item.status === 0);
    }

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.tags.join(' , ').toLowerCase().includes(searchQuery.toLowerCase())
        // || item.version.toString().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  };

  const openModal = (item?: Clauses) => {
    loadTags();

    if (item) {
      setEditingItem(item);
      setFormData({
        _Id: item._id,
        _Idclausula: item._idclausula,
        Tags: item.tags,
        Title: item.title,
        Conditions: {
          En: item.conditions.en,
          Es: item.conditions.es,
        },
        Created_at: item.created_at.toString() ? new Date(item.created_at) : new Date(),
        Created_by: item.created_by ? {
          user_id: item.created_by.user_id,
          name: item.created_by.name,
        } : { user_id: '', name: '' },
        Updated_at: new Date(),
        Status: item.status !== undefined ? item.status : 1,
        Archived: item.archived,
        Data_state: item.data_state,
      });
    } else {
      setEditingItem(null);
      setFormData({
        _Id: "",
        _Idclausula: 0,
        Tags: [],
        Title: '',
        Conditions: {
          En: '',
          Es: ''
        },
        Created_at: new Date(),
        Created_by: {
          user_id: user?._id || '',
          name: user?.name || '',
        },
        Updated_at: Date,
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
      _Id: "",
      _Idclausula: 0,
      Tags: [],
      Title: '',
      Conditions: {
        En: '',
        Es: ''
      },
      Created_at: new Date(),
      Created_by: {
        user_id: user?._id || '',
        name: user?.name || '',
      },
      Updated_at: Date,
      Status: 1,
      Archived: false,
      Data_state: 1,
    });
    setTagInput("");
  };

  const handleSave = async (e: React.FormEvent) => {

    try {
      e.preventDefault();
      setLoading(true);

      if (!formData.Tags || formData.Tags.length === 0 ) {
        showError(t('catalog.requiredFields'));
        return;
      }

      if (editingItem) {
        setFormData({ ...formData, _Id: editingItem._id });

        // console.log(JSON.stringify(formData))
        const response = await fetch(`${API_URL}/v1/kl/catalog/operations/Clause`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${API_TOKENSL}`,
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error(t('catalog.errorUpdate'));
        }

      } else {

        const response = await fetch(`${API_URL}/v1/kl/catalog/operations/add/Clause`, {

          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_TOKENSL}`,
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
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
      console.error('Error saving Clause:', error);
      showError(t('catalog.errorSave'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: Number) => {

    setModalState({
      isOpen: true,
      type: 'confirm',
      title: t('modal.title').replace('{name}', catalogName.toLowerCase()),
      message: t('modal.message'),
      showCancel: true,
      onConfirm: async () => {
        try {
          setLoading(true);
          const response = await fetch(`${API_URL}/v1/kl/catalog/operations/view=Clause&id=${id}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${API_TOKENSL}`,
              'Content-Type': 'application/json',
              'x-api-key': API_KEY,
            },
          });

          if (!response.ok) {
            throw new Error('Error al eliminar el registro');
          }

          await loadData();
          showSuccess(t('catalog.successDelete'));
        } catch (error) {
          console.error('Error deleting Clause:', error);
          showError(t('catalog.errorDelete'));
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const selectTag = (tag: string) => {
    addTag(tag);
    setTagInput("");
    setShowSuggestions(false);

  };

  function addTag(tagName: string) {
    const tag = tagName.tag.trim();

    if (!tag) return;

    const exists = formData.Tags?.some(
      (t: string) => t === tag
    );

    if (exists) return;

    setFormData({
      ...formData,
      Tags: [...(formData.Tags || []), tag]
    });

  }

  return (
    <div className="container">
      <div className="header">
        <h1 className="title">{t(catalogName)}</h1>
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
              {/* <th>{t('catalog.clause.tags')}</th> */}
              <th>{t('catalog.clause.title')}</th>
              <th>{t('catalog.clause.es')}</th>
              <th>{t('catalog.status.active')}</th>
              <th>{t('catalog.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <tr key={item._id}>
                  {/* <td>{item.tags.join(', ')}</td> */}
                  <td>{item.title}</td>
                  <td className='textareaClausula'>{item.conditions.es}</td>
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
                        onClick={() => handleDelete(item._idclausula)}
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
        <form onSubmit={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const input = e.target as HTMLElement;

              // Permitir Enter en los input por salto de linea o para añadir tags
              if (input.id === "tag-input" || input.id === "textarea-es" || input.id === "textarea-en") {
                return;
              }

              // Bloquear para que no se cierre el modal al dar enter
              e.preventDefault();
            }
          }}
        >
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
                    {t('catalog.clause.title')}
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={formData.Title}
                    onChange={(e) => setFormData({ ...formData, Title: e.target.value.trim() })}
                    disabled={editingItem ? true : false}
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
                    {t('catalog.clause.es')}
                  </label>
                  <textarea
                    className="textarea"
                    id="textarea-es"
                    value={formData.Conditions.Es}
                    onChange={(e) => setFormData({ ...formData, Conditions: { ...formData.Conditions, Es: e.target.value } })}
                    // disabled = {editingItem ? true : false} 
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
                    {t('catalog.clause.en')}
                  </label>
                  <textarea
                    className="textarea"
                    id="textarea-en"
                    value={formData.Conditions.En}
                    onChange={(e) => setFormData({ ...formData, Conditions: { ...formData.Conditions, En: e.target.value } })}
                    // disabled = {editingItem ? true : false} 
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
                    {t('catalog.clause.tags')}
                  </label>

                  <div className="relative">

                    <div id="tags-container"
                      className="min-h-[56px] w-full p-3 rounded-lg 
                                 border border-gray-300 dark:border-gray-700 hover:dark:border-[#14b8a6] focus-within:border-[#14b8a6] focus-within:ring-0.5 focus-within:ring-[#14b8a6]
                                 bg-[#f9fafb] dark:bg-[#1f2937]
                                 flex flex-col gap-2 transition-all duration-200"

                    >
                      <div className="flex flex-wrap gap-2">
                        {formData.Tags?.map((tag: string, index: number) => (
                          tag == "" ? null : (
                            <span
                              key={index}
                              className="flex items-center gap-1 px-3 py-1 rounded-full text-xs
                                       bg-[#e5e7eb] text-black
                                       dark:bg-[#374151] dark:text-white
                                      "
                            >
                              {tag}

                              <button
                                type="button"
                                className="ml-1 text-gray-500 hover:text-red-500 dark:text-gray-300"
                                onClick={() => {
                                  const updated = formData.Tags.filter((_: any, i: number) => i !== index);
                                  setFormData({ ...formData, Tags: updated });
                                }}
                              >
                                ✕
                              </button>
                            </span>
                          )
                        ))}
                      </div>

                      <input
                        id="tag-input"
                        value={tagInput}
                        onChange={(e) => {
                          setTagInput(e.target.value);
                          setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                        className="w-full border-none outline-none text-sm
                                   bg-[#f9fafb] text-black placeholder-gray-500
                                   dark:bg-[#374151] dark:text-white dark:placeholder-gray-300
                                   px-2 py-1 rounded-md
                                 "
                        placeholder="Añadir etiqueta..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();

                            if (filteredTags.length > 0) {
                              selectTag(filteredTags[activeIndex]);
                            } else if (tagInput.trim()) {
                              selectTag(tagInput);
                            }
                          }

                          if (e.key === "ArrowDown") {
                            e.preventDefault();
                            setActiveIndex((prev) =>
                              prev < filteredTags.length - 1 ? prev + 1 : 0
                            );
                          }

                          if (e.key === "ArrowUp") {
                            e.preventDefault();
                            setActiveIndex((prev) =>
                              prev > 0 ? prev - 1 : filteredTags.length - 1
                            );
                          }
                        }}
                      />

                    </div>

                    {showSuggestions && filteredTags.length > 0 && (
                      <div
                        ref={listRef}
                        className="absolute left-0 w-full mt-1 rounded-lg shadow-lg z-20
                                     bg-white border border-gray-200
                                     dark:bg-[#1f2937] dark:border-gray-600
                                     max-h-40 overflow-y-auto
                                   "
                      >
                        {filteredTags.map((tag, index) => (
                          <button
                            key={tag._Id}
                            ref={(el) => (itemRefs.current[index] = el)}
                            type="button"
                            // onClick={() => selectTag(tag.tag)}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              selectTag(tag);
                            }}
                            className={`w-full text-left px-3 py-2 text-sm 
                                ${index === activeIndex
                                ? "bg-gray-200 dark:bg-[#374151]"
                                : "hover:bg-gray-100 dark:hover:bg-[#374151]"}
                                    text-black dark:text-white
                              `}
                          >
                            {tag.tag}
                          </button>
                        ))}
                      </div>
                    )}

                  </div>

                </div>

                <div className="formGroup">
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={formData.Status === 1}
                      onChange={(e) => setFormData({ ...formData, Status: e.target.checked ? 1 : 0 })}
                      disabled={loading}
                    />
                    <span className="slider"></span>
                  </label>
                  <span className="statusText">{' '}{t('catalog.status.active')}</span>
                </div>

              </div>

              <div className="modalFooter">
                <button className="cancelButton" onClick={closeModal} disabled={loading}>
                  {t('catalog.cancel')}
                </button>
                <button className="saveButton" type="submit" disabled={loading}>
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