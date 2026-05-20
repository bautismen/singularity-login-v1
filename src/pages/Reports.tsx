import { useEffect, useRef, useState } from 'react';
import { Search, Filter,SlidersHorizontal, BarChart2,ChevronUp, ChevronDown, ChevronLeft, ChevronRight,Table,FileText } from 'lucide-react';
import {useLanguage } from "../contexts/LanguageContext";
import styles from './Reports.module.css';
import { useAuth } from '../contexts/AuthContext';
import { Report } from '../types/reports';
import { reportsServices } from '../services/reportsService';
import { getExecutives } from '../services/executiveService';
import { getCustomers } from '../services/customerService';

export function Reports() {
  
  
  const CHIP_VALUES = ['All', 'Financial', 'Operational', 'Inventory'] as const;
  type Chip = typeof CHIP_VALUES[number];
  const CHIP_TRANSLATIONS: Record<Chip, { es: string; en: string }> = {
    All: {
      es: 'Todos',
      en: 'All'
    },
    Financial: {
      es: 'Financiero',
      en: 'Financial'
    },
    Operational: {
      es: 'Operacional',
      en: 'Operational'
    },
    Inventory: {
      es: 'Inventario',
      en: 'Inventory'
    }
  };
  const [controlData, setControlData] = useState<any>(null);
  const [actives, setActives] = useState<Chip>('All');
  const [filter, setFilter] = useState<Chip>('All');
  const [filteredItems, setFilteredItems] = useState<Report[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [idSelected, setIdSelected] = useState<string>('');
  const [catalogs, setCatalogs] = useState<{ [key: string]: any[] }>({});
  const [formValues, setFormValues] = useState<{ [key: string]: string }>({});
  const [displayValues, setDisplayValues] = useState<{ [key: string]: string }>({});
  const [isOpen, setIsOpen] = useState(true);
  const contentRef = useRef(null);
  const [title, settitle] = useState('');
  const { t, language } = useLanguage();
  const [idReport, setidReport] = useState<string>('');
  const [reportResult, setReportResult] = useState<any[]>([]);
  const [isviewParameters, setisviewParameters] = useState(false);
  const [isviewResult, setisviewResult] = useState(false);
  const [headerMapping, setHeaderMapping] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalPages = Math.ceil(reportResult.length / pageSize);
  const paginatedData = reportResult.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };
  const [currentPageTop, setCurrentPageTop] = useState(1);
  const [pageSizeTop, setPageSizeTop] = useState(10);

  const totalPagesTop = Math.ceil(filteredItems.length / pageSizeTop);

  const paginatedTopData = filteredItems.slice(
    (currentPageTop - 1) * pageSizeTop,
    currentPageTop * pageSizeTop
  );

  const handlePageSizeTopChange = (size: number) => {
    setPageSizeTop(size);
    setCurrentPageTop(1);
  };

  useEffect(() => {
  loadData();
}, []);

 useEffect(() => {
  if (controlData) {
    filterData();
  }
}, [searchQuery, filter, controlData]);

useEffect(() => {
  const loadCatalogs = async () => {
    if (!idSelected) return;

    const report = controlData?.find(a => a.id_report === idSelected);
    if (!report?.parameter) return;

    const newCatalogs: any = {};

    for (const p of report.parameter) {
      if (p.type === 'catalogo') {
        if (p.catalog === 'Ejecutivos') {
          newCatalogs[p.catalog] = await getExecutives();
        }
        if (p.catalog === 'Clientes') {
          newCatalogs[p.catalog] = await getCustomers();
        }
      }
    }

    setCatalogs(newCatalogs);
  };

  loadCatalogs();
}, [idSelected]);

const loadData = async () => {
  try {
    setLoading(true);
    const data = await reportsServices.getall();
    setControlData(data);
  } catch (error) {
    setLoading(false);
    console.error('Error fetching control data:', error);
  }  
}

const filterData = () => {
  setLoading(true);
    let filtered = controlData?.filter(item => !item.archived) || [];

    if (filter !== 'All') {
      filtered = filtered.filter(item => item.category.toLowerCase() === filter.toLowerCase());
    }

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name_report.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredItems(filtered);
    setCurrentPageTop(1);
    setLoading(false);
  };

const AVATAR_SRC = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzWWaigVY2dG2LPf68xDU_iE3Ecmfu1NLAtbyJRmpbZde8gihW52xYdqDvsVzhOZriVSDpLqjIWa5bxnWxN7W0BSERckk9S4V-oCjG0c0Stmtrk4U0rEWN1aFSdXQe0QDnsy9G8wDYh78jztkotskRvIfbdDo8MU7iBqy7wA0AvDzpDtYkmFyYiyeIXLvdlsYKLRQotGUa94PQxp0E4iqrEsbOBz_wzpQ3E-onuSBnEKab9Dn34B9DmzKHml-tcgu_oYm8L7u1nDg';

const HEADERS = [ t('report.header1'), t('report.header2') , t('report.header3') , t('report.header4') , t('report.header6') ];

// ✅ SOLO UNO seleccionado
const toggleSelected = (id: string) => {
  // ✅ Limpiar los inputs al cambiar de reporte
  setFormValues({});
  setDisplayValues({});

  setControlData((prev) =>
    prev.map((r) => {
      if (r.id_report === id) {
        setIdSelected(id);
        setidReport(r.id);
        settitle(r.name_report);
        setIsOpen(false);
        setisviewParameters(true);
        const mappingParsed =
        typeof r.dataset?.mapping === 'string'
        ? JSON.parse(r.dataset.mapping)
        : r.dataset?.mapping || {};

        setHeaderMapping(mappingParsed);
        return { ...r, selected: true };
      }
      return { ...r, selected: false };
    })
  );
};

const renderParameter = (id: string) => {
  if (!idSelected || !id) return null;

  const report = controlData?.find(a => a.id_report === id);
  if (!report?.parameter) return null;

  // 🔹 dividir en grupos de 3
  const chunks: any[][] = [];
  for (let i = 0; i < report.parameter.length; i += 3) {
    chunks.push(report.parameter.slice(i, i + 3));
  }

  return chunks.map((group, index) => (     
    <div key={index} className={styles.rowGroup}>
      {group.map((p: any) => (
        <div className={styles.formGroup} key={p.id}>
          <label className={styles.label}>{language === 'es' ? p.showlabel.es : p.showlabel.en}:</label>

          {p.type === 'date' && (
            <>
            <div>
              <input name={p.name+'_start'} type="date" className={styles.date}
                value={formValues[p.name+'_start'] ?? ''}
                onChange={e => handleInputChange(p.name+'_start', e.target.value)} />

              <input name={p.name+'_end'} type="date" className={styles.date}
                value={formValues[p.name+'_end'] ?? ''}
                onChange={e => handleInputChange(p.name+'_end', e.target.value)} />
            </div>
            </>
          )}

          {p.type === 'string' && (
            <input name={p.name} type="text" className={styles.input}
              value={formValues[p.name] ?? ''}
              onChange={e => handleInputChange(p.name, e.target.value)} />
          )}

          {p.type === 'int' && (
            <input name={p.name} type="number" className={styles.input}
              value={formValues[p.name] ?? ''}
              onChange={e => handleInputChange(p.name, e.target.value)} />
          )}
         {p.type === 'catalogo' && (
            <>
              <input
                list={`catalog-${p.name}`}
                className={styles.select}
                value={displayValues[p.name] ?? ""}
                onChange={(e) =>
                  handleDatalistChange(p.name, p.catalog, e.target.value)
                }
                onBlur={(e) => {
                  const value = e.target.value;
                  const exists = catalogs[p.catalog]?.some(
                    (item: any) => getOptionLabel(p.catalog, item) === value
                  );
                  if (!exists) {
                    setDisplayValues(prev => ({ ...prev, [p.name]: '' }));
                    setFormValues(prev => ({ ...prev, [p.name]: '' }));
                  }
                }}
                placeholder={`Seleccionar ${language === 'es' ? p.showlabel.es : p.showlabel.en}...`}
              />

              <datalist id={`catalog-${p.name}`}>
                {catalogs[p.catalog]?.map((dat: any) => (
                  <option
                    key={dat.id}
                    value={getOptionLabel(p.catalog, dat)}
                  />
                ))}
              </datalist>
            </>
          )}
        </div>
      ))}
    </div>
  ));
};

const handleDatalistChange = (name: string, catalog: string, inputText: string) => {
  // Muestra el texto en el input
  setDisplayValues(prev => ({ ...prev, [name]: inputText }));

  // Busca el item por el texto y guarda su ID
  const match = catalogs[catalog]?.find(
    (item: any) => getOptionLabel(catalog, item) === inputText
  );

  setFormValues(prev => ({
    ...prev,
    [name]: match ? String(match.id ?? match._Id ?? '') : ''
  }));
};

const getOptionLabel = (catalog: string, dat: any) => {
  switch (catalog) {
    case 'Ejecutivos':
      return `${dat.nombre} ${dat.apellido_paterno} ${dat.apellido_materno}`;
    case 'Clientes':
      return dat.fiscalData?.businessName;
    default:
      return '';
  }
};

const handleInputChange = (name: string, value: string) => {
  setFormValues(prev => ({ ...prev, [name]: value }));
};

const buildParams = (): Record<string, string> | null => {
  const report = controlData?.find(
    a => a.id_report === idSelected
  );

  if (!report?.parameter) return null;

  const params: Record<string, string> = {};

  for (const p of report.parameter) {

    if (p.type === 'date') {

      const valueInicio =
        formValues[p.name + '_start']?.trim();

      const valueFin =
        formValues[p.name + '_end']?.trim();

      if (valueInicio) {
        params[p.name + '_start'] = valueInicio;
      }

      if (valueFin) {
        params[p.name + '_end'] = valueFin;
      }

    } else {

      const value =
        formValues[p.name]?.trim();

      if (value) {
        params[p.name] = value;
      }

    }
  }

  return params;
};

const handlecreate = () => {
  setLoading(true);
  const params = buildParams();
  reportsServices.getReport(idReport, params)
    .then(result => {
      setReportResult(Array.isArray(result) ? result : [result]);
      setisviewResult(true);   
    })
    .catch(error => {
      console.error('Error al generar el reporte:', error);
      setisviewResult(false);      
    })
    .finally(() => {
      setLoading(false);
    });
};

 if (loading && !controlData) {
    return (
      <div className={styles.formContainer}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <section className={styles.section}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t('report.title')}</h2>          
          <div className={styles.buttonGroup}>
            <button className={styles.headerButton}>
                <Filter size={16} />                
              </button>
          </div>          
        </div>
        <p className={styles.subtitle}>
            {t('report.subtitle')}
          </p>
        <div className={styles.searchBar}>
          {/* Search */}         
            <Search size={20} className={styles.icon} />
            <input
              type="text"
              placeholder={t('report.seartoogle')}
              className="searchInput"
               onChange={(e) => setSearchQuery(e.target.value)}
            />        

          {/* Filter Chips */}
          <div className={styles.filterButtons}>
           {CHIP_VALUES.map((chip) => (
              <button
                key={chip}
                onClick={() => {
                  setActives(chip);
                  setFilter(chip);
                }}
                className={`
                  filterButton ${actives === chip ? "active" : ''}
                `}
              >
                {CHIP_TRANSLATIONS[chip][language]}
              </button>
            ))}           
          </div>          
        </div>
         
      <div className="headercard">
          <div className={styles.headerRow}>
          <h4 className={styles.tdreport}>{title}</h4>
          <button onClick={() => setIsOpen(!isOpen)} className={styles.iconbutonlucide}>
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
        <div
          ref={contentRef}
          style={{
            maxHeight: isOpen
            ? contentRef.current?.scrollHeight + "px"
              : "0px",
              overflow: "hidden",
              transition: "max-height 0.3s ease",
          }}
        >
        <div className="flex items-center justify-end gap-2 mb-4">
          <span className="text-xs text-gray-500">
            Mostrar:
          </span>

          <select
            value={pageSizeTop}
            onChange={(e) =>
              handlePageSizeTopChange(Number(e.target.value))
            }
            className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 text-xs rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-1.5 outline-none transition-all cursor-pointer"
          >
            {[10, 50, 100].map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        <table className={styles.table}>
          <thead>
            <tr className={styles.trheader}>
              {HEADERS.map((h, index) => (
                <th key={`${h}-${index}`} className={`${styles.thheader} ${h === 'ACCIÓN' ? styles.thheaderCenter : ''}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={styles.tbody}>
            {paginatedTopData?.map(r => (
              <tr key={r.id_report}  className={`${styles.trbody} ${
                r.selected ? styles.trbodySelected : styles.trbodyHover}`} onClick={() => toggleSelected(r.id_report)}>
                <td className={styles.tdid}>{r.id_report}</td>
                <td className={styles.tdcategory}>
                  <span
                    className={`${styles.spancategory} ${
                      r.category.toLowerCase() === 'financial'
                        ? styles.Financial
                        : r.category.toLowerCase() === 'operational'
                        ? styles.Operational
                        : r.category.toLowerCase() === 'inventory'
                        ? styles.Inventory
                        : ''
                    }`}
                  >{r.category}</span>
                </td>
                <td className={styles.tdreport}>{r.name_report}</td>
                <td className={styles.tddescription}>{r.description}</td>            
                <td className={styles.tddescription}>{new Date(r.creation).toLocaleDateString()}</td>              
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-6 py-4 bg-gray-50 flex items-center justify-between border-t border-gray-100">

          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Mostrando {Math.min(currentPageTop * pageSizeTop, filteredItems.length)} de {filteredItems.length} reportes
          </p>

          <div className="flex items-center gap-2">

            <button
              onClick={() =>
                setCurrentPageTop(p => Math.max(1, p - 1))
              }
              disabled={currentPageTop === 1}
              className="p-1 text-gray-400 hover:text-teal-700 transition-colors disabled:opacity-30"
            >
              <ChevronLeft size={20} />
            </button>

            {Array.from(
              { length: totalPagesTop },
              (_, i) => i + 1
            )
              .filter(
                p =>
                  p === 1 ||
                  p === totalPagesTop ||
                  Math.abs(p - currentPageTop) <= 1
              )
              .map((p, idx, arr) => (
                <div key={p} className="flex items-center">

                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="text-gray-400 text-xs">
                      ...
                    </span>
                  )}

                  <button
                    onClick={() => setCurrentPageTop(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      currentPageTop === p
                        ? 'bg-teal-700 text-white shadow-md'
                        : 'text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {p}
                  </button>

                </div>
              ))}

            <button
              onClick={() =>
                setCurrentPageTop(p =>
                  Math.min(totalPagesTop, p + 1)
                )
              }
              disabled={currentPageTop === totalPagesTop}
              className="p-1 text-gray-400 hover:text-teal-700 transition-colors disabled:opacity-30"
            >
              <ChevronRight size={20} />
            </button>

          </div>
        </div>
    </div>
    </div>
      </section>
      <section className={styles.seccionparameter} hidden={!isviewParameters}>
        <div className={styles.divparameter}>
          <div className={styles.diviconparameter}>
            <span className={styles.spaniconparameter}><SlidersHorizontal  size={20} /></span>
          </div>
          <div>
            <h3 className={styles.h3parameter}>{t('report.titleparameter')}</h3>
            <p className="text-sm text-gray-500 mt-1">{t('report.subtitleparameter')}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-x-12 gap-y-10 w-full">
          {idSelected && renderParameter(idSelected)}
        </div>
        <div className="mt-12 flex justify-end">
          <button className="bg-[#00685d] text-white px-8 py-3.5 rounded-lg font-bold text-sm shadow-xl hover:shadow-[#00685d]/20 transition-all flex items-center gap-2" onClick={() => {
                handlecreate();                 
              }}>
            <span className="material-symbols-outlined text-lg"><BarChart2 size={20} /></span> {t('report.button')}
          </button>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden" hidden={!isviewResult}>
        <div className="flex items-center justify-end gap-2">
          <span className="text-xs text-gray-500">
            Mostrar:
          </span>

          <select
            value={pageSize}
            onChange={(e) =>
              handlePageSizeChange(Number(e.target.value))
            }
            className="
              px-3 py-1 rounded text-xs font-bold
              bg-white border border-gray-300
              text-gray-700 outline-none
            "
          >
            {[10, 50, 100].map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      <div className="px-8 py-6 flex items-center justify-between">
      <h3 className="text-lg font-bold text-gray-900">Resultados de Consulta</h3>
      <div className="flex gap-2">
      <button className="bg-[#d3e2f5] text-[#3c5d8a] px-5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:brightness-95 transition-all">
      <span className="material-symbols-outlined text-lg"><Table size={20} /></span> Excel
                              </button>
      <button className="bg-[#5c6c84] text-white px-5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:brightness-95 transition-all">
      <span className="material-symbols-outlined text-lg"><FileText size={20} /></span> PDF
                              </button>
      </div>
      </div>
      <div className="overflow-x-auto">
     {reportResult.length > 0 && (() => {
      // ✅ Excluir _id de los encabezados
      const headers = Object.keys(reportResult[0])
        .filter(h => h !== '_id');

          return (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/80 border-y border-gray-100">
                  {headers.map(h => (
                    <th key={h} className="px-8 py-4 table-header uppercase">
                    {headerMapping[h] || h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedData.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    {headers.map(h => (
                      <td key={h} className="px-8 py-5 text-xs text-gray-700">
                        {row[h] ?? '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          );
      })()}
      </div>
      <div className="px-8 py-5 bg-gray-50 flex items-center justify-between border-t border-gray-100">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Mostrando {Math.min(currentPage * pageSize, reportResult.length)} de {reportResult.length} registros
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1 text-gray-400 hover:text-teal-700 transition-colors disabled:opacity-30"
          >
            <ChevronLeft size={20} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
            .map((p, idx, arr) => (
              <>
                {idx > 0 && arr[idx - 1] !== p - 1 && (
                  <span key={`dots-${p}`} className="text-gray-400 text-xs">...</span>
                )}
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    currentPage === p
                      ? 'bg-teal-700 text-white shadow-md'
                      : 'text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {p}
                </button>
              </>
            ))
          }

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1 text-gray-400 hover:text-teal-700 transition-colors disabled:opacity-30"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      </section>

    </div>
  );
}