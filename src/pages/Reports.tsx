import  React, { useEffect, useRef, useState } from 'react';
import { Search, Filter,SlidersHorizontal, BarChart2,ChevronUp, ChevronDown, ChevronLeft, ChevronRight,Table,FileText } from 'lucide-react';
import {useLanguage } from "../contexts/LanguageContext";
import styles from './Reports.module.css';
import { useAuth } from '../contexts/AuthContext';
import { Report } from '../types/reports';
import { reportsServices } from '../services/reportsService';
import { getExecutivesByDepartment } from '../services/executiveService';
import { getCustomers } from '../services/customerService';
import * as XLSX from 'xlsx-js-style';
import { useReactToPrint } from "react-to-print";
import { useNotification } from '../contexts/NotificationContext';
import { Shower } from '@mui/icons-material';

export function Reports() {
  
  
  const CHIP_VALUES = ['All', 'Pricing', 'Operations', 'Customer'] as const;
  type Chip = typeof CHIP_VALUES[number];
  const CHIP_TRANSLATIONS: Record<Chip, { es: string; en: string }> = {
    All: {
      es: 'Todos',
      en: 'All'
    },
    Pricing: {
      es: 'Pricing',
      en: 'Pricing'
    },
    Operations: {
      es: 'Operaciones',
      en: 'Operations'
    },
    Customer: {
      es: 'Cliente',
      en: 'Customer'
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
  const [isOpenParam, setIsOpenParam] = useState(true);
  const contentParam = useRef(null);
  const [title, settitle] = useState('');
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [idReport, setidReport] = useState<string>('');
  const [reportResult, setReportResult] = useState<any[]>([]);
  const [isviewParameters, setisviewParameters] = useState(false);
  const [isviewResult, setisviewResult] = useState(false);
  const [headerMapping, setHeaderMapping] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalPages = Math.ceil(reportResult.length / pageSize);
  const componentPDF = useRef(null);
  const [searchReport, setsearchReport] = useState('');
  const [filteredReportResult, setFilteredReportResult] = useState<any[]>([]);
  const paginatedData = filteredReportResult.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };
  const [currentPageTop, setCurrentPageTop] = useState(1);
  const [pageSizeTop, setPageSizeTop] = useState(10);
  const { showError, showWarning, showInfo } = useNotification();

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
  if (reportResult) {
    const filteredReportResult = filterReportResult (reportResult, searchReport);
    setFilteredReportResult(filteredReportResult);
  }
}, [searchReport, reportResult]);

useEffect(() => {
  const loadCatalogs = async () => {
    if (!idSelected) return;

    const report = controlData?.find(a => a.id_report === idSelected);
    if (!report?.parameter) return;

    const newCatalogs: any = {};

    for (const p of report.parameter) {
      if (p.type === 'catalogo') {
        if (p.catalog === 'EjecutivosPricing') {
          newCatalogs[p.catalog] = await getExecutivesByDepartment("Pricing");
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

useEffect(() => {
  if (!idSelected || !controlData) return;

  const report = controlData.find(
    (r: any) => r.id_report === idSelected
  );

  if (!report) return;

  const mapping =
    language === 'es'
      ? report.dataset?.mapping?.es
      : report.dataset?.mapping?.en;

  const mappingParsed =
    typeof mapping === 'string'
      ? JSON.parse(mapping)
      : mapping || {};

  setHeaderMapping(mappingParsed);

  // Opcional: actualizar también el título
  settitle(report.name_report);

}, [language, idSelected, controlData]);

const loadData = async () => {
  try {
    setLoading(true);
    const data = await reportsServices.getall();
    setControlData(data);
  } catch (error) {
    setLoading(false);
    showError('Error fetching control data:' + error);
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

const filterReportResult = (
  data: any[],
  query: string
) => {

  if (!query.trim()) return data;

  return data.filter((row) =>
    Object.values(row).some((value) =>
      String(value ?? '')
        .toLowerCase()
        .includes(query.toLowerCase())
    )
  );
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

  return chunks.map((group, chunkIndex) => (     
    <div key={`chunk-${chunkIndex}`} className={styles.rowGroup}>
      {group.map((p: any, paramIndex: number) => (
        <div className={styles.formGroup}key={p.id ?? p.name ?? `param-${chunkIndex}-${paramIndex}`}>
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
              {catalogs[p.catalog]?.map((dat: any, index: number) => (
                <option
                  key={
                    p.catalog === 'EjecutivosPricing'
                      ? dat._Iduser
                      : (dat._Id ?? dat.id ?? `${p.name}-option-${index}`)
                  }
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
  setDisplayValues(prev => ({ ...prev, [name]: inputText }));

  const match = catalogs[catalog]?.find(
    (item: any) => getOptionLabel(catalog, item) === inputText
  );

  // ✅ Resuelve el ID correcto según el catálogo
  const resolveId = (item: any): string => {
    if (!item) return '';
    if (catalog === 'EjecutivosPricing') return String(item._Iduser ?? '');
    return String(item._Id ?? item.id ?? '');
  };

  setFormValues(prev => ({
    ...prev,
    [name]: match ? resolveId(match) : ''
  }));
};

const getOptionLabel = (catalog: string, dat: any) => {
  switch (catalog) {
    case 'Ejecutivos':
      return `${dat.nombre} ${dat.apellido_paterno} ${dat.apellido_materno}`;
    case 'EjecutivosPricing':
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

const buildParams = (): Record<string, string | number> | null => {

  const report = controlData?.find(
    a => a.id_report === idSelected
  );

  if (!report?.parameter) return null;

  const params: Record<string, string | number> = {};

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

        if (p.type === 'int') {
          params[p.name] = parseInt(value, 10);
        } else {
          params[p.name] = value;
        }

      }
    }
  }

  return params;
};

const handlecreate = async () => {
  try {
    setLoading(true);

    const params = buildParams();

    if(!params || Object.keys(params).length === 0) {
      showWarning(t('report.mesage1'));
      setisviewResult(false);
      setLoading(false);
      setIsOpenParam(true);
      return;
    }

    const result = await reportsServices.getReport(
      idReport,
      params
    );
    
    if (result.length === 0) {
      showInfo(t('report.mesage2'));
      setisviewResult(false);
      setLoading(false);
      setIsOpenParam(true);
      return;
    }

    setReportResult(
      Array.isArray(result)
        ? result
        : [result]
    );

    setisviewResult(true);

  } catch (error) {
    showError('Error al generar el reporte:' + error);

    setisviewResult(false);

  } finally {
    setLoading(false);
    setIsOpenParam(false);
  }
};

const parseDate = (value: string): Date | null => {
  if (!value || typeof value !== 'string') return null;

  const clean = value.trim();

  // yyyy-mm-dd o yyyy/mm/dd
  let match = clean.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (match) {
    const [, y, m, d] = match;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

  // dd-mm-yyyy | dd/mm/yyyy | mm-dd-yyyy | mm/dd/yyyy
  match = clean.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (match) {
    let [, p1, p2, y] = match;

    const n1 = Number(p1);
    const n2 = Number(p2);

    // Si el primer número es > 12 asumimos dd-mm-yyyy
    if (n1 > 12) {
      return new Date(Number(y), n2 - 1, n1);
    }

    // Si el segundo número es > 12 asumimos mm-dd-yyyy
    if (n2 > 12) {
      return new Date(Number(y), n1 - 1, n2);
    }

    // Ambiguo (05-06-2025)
    // Por defecto lo tratamos como dd-mm-yyyy
    return new Date(Number(y), n2 - 1, n1);
  }

  const date = new Date(clean);
  return isNaN(date.getTime()) ? null : date;
};

const exportToExcel = () => {
  if (!reportResult || reportResult.length === 0) return;

  // Encabezados
  const headers = Object.keys(reportResult[0]).filter(
    h => h !== '_id'
  );

  const mappedHeaders = headers.map(
    h => headerMapping[h] || h
  );

  // Datos
  const data = reportResult.map(row => {
    const obj: any = {};

    headers.forEach(h => {
      obj[headerMapping[h] || h] = row[h];
    });

    return obj;
  });

  // Crear hoja vacía
  const worksheet = XLSX.utils.aoa_to_sheet([]);

  // Fila 1 y 2
  XLSX.utils.sheet_add_aoa(
    worksheet,
    [
      [title.toUpperCase()],
      [
        `${t('report.generatedby')}: ${user?.name}`,
      ],
      [
        `${t('report.generationdate')}: ${new Date().toLocaleString(language === 'es' ? 'es-MX' : 'en-US')}`,
      ],      
      mappedHeaders
    ],
    { origin: 'A1' }
  );

  // Datos desde fila 5
  XLSX.utils.sheet_add_json(
    worksheet,
    data,
    {
      origin: 'A5',
      skipHeader: true
    }
  );

  // Combinar columnas para títulos
  worksheet['!merges'] = [
    {
      s: { r: 0, c: 0 },
      e: { r: 0, c: mappedHeaders.length - 1 }
    },
    {
      s: { r: 1, c: 0 },
      e: { r: 1, c: mappedHeaders.length - 1 }
    }
  ];

  // Tamaño automático columnas
  worksheet['!cols'] = mappedHeaders.map(h => ({
    wch: Math.max(h.length + 5, 20)
  }));

  // ===== FILTROS =====
  // La fila 4 contiene los encabezados
  const rangeH = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');

  worksheet['!autofilter'] = {
    ref: XLSX.utils.encode_range({
      s: { r: 3, c: 0 }, // A4
      e: {
        r: rangeH.e.r,
        c: mappedHeaders.length - 1
      }
    })
  };

  // ===== ESTILOS =====

  // Título fila 1
  if (worksheet['A1']) {
    worksheet['A1'].s = {
      font: {
        sz: 14,
        bold: true,
        color: { rgb: '037F8C' },
        fontName: 'Arial',
      },
      alignment: {
        horizontal: 'left',
        vertical: 'center'
      }       
    };
  }

  // Subtítulo fila 2
  if (worksheet['A2']) {
    worksheet['A2'].s = {
      font: {
        sz: 9,
        fontName: 'Arial',
        bold: true,

      },
      alignment: {
        horizontal: 'left',
        vertical: 'center'
      }
    };
  }

  if (worksheet['A3']) {
    worksheet['A3'].s = {
      font: {
        sz: 9,
        fontName: 'Arial',
      },
      alignment: {
        horizontal: 'left',
        vertical: 'center'
      }
    };
  }

  // Encabezados fila 4 en negritas
  mappedHeaders.forEach((_, index) => {
    const cellRef = XLSX.utils.encode_cell({
      r: 3, // fila 4
      c: index
    });

    if (worksheet[cellRef]) {
      worksheet[cellRef].s = {
        font: {
          bold: true,
          sz: 10,
          fontName: 'Arial',
            color: { rgb: 'FFFFFF' }
        },
        fill: {
          fgColor: { rgb: '037F8C' },
        },
        alignment: {
          horizontal: 'left',
          vertical: 'center'
        },
        border: {
          top: {
            style: 'thin',
            color: { rgb: '000000' }
          },
          bottom: {
            style: 'thin',
            color: { rgb: '000000' }
          },
          left: {
            style: 'thin',
            color: { rgb: '000000' }
          },
          right: {
            style: 'thin',
            color: { rgb: '000000' }
          }
        }
      };
    }
  });
  
  // Datos desde fila 5 (Arial 8 + detección de tipos)
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');

  for (let row = 4; row <= range.e.r; row++) {
    for (let col = 0; col <= range.e.c; col++) {
      const cellRef = XLSX.utils.encode_cell({
        r: row,
        c: col
      });

      const cell = worksheet[cellRef];

      if (!cell) continue;

      const value = cell.v;

      // Detectar números
      if (
        typeof value === 'string' &&
        value.trim() !== '' &&
        !isNaN(Number(value))
      ) {
        cell.v = Number(value);
        cell.t = 'n';
        cell.z = '#,##0.00';
      }

      // Detectar fechas
      else if (typeof value === 'string') {
        const parsedDate = parseDate(value);

        if (parsedDate) {
          const date = new Date(parsedDate);
          cell.v = date;
          cell.t = 'd';
          cell.z = 'dd/mm/yyyy';
        }
      }

      // Estilo Arial 8
      cell.s = {
        ...(cell.s || {}),
        font: {
          ...(cell.s?.font || {}),
          fontName: 'Arial',
          sz: 8
        }
      };
    }
  }

  // Crear workbook
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    'SingularityReports'
  );

  // Descargar
  XLSX.writeFile(
    workbook,
    `${title || 'Reporte'}.xlsx`
  );
};

const printPdf = useReactToPrint({
    contentRef:  componentPDF,
  })

 if (loading) {
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
          <p className={styles.subtitle}>
            {t('report.subtitle')}
          </p>                  
        </div>        
        <div className={styles.searchBar}>
          {/* Search */}         
            <Search size={20} />
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
         
      <div className={isOpen ? styles.headercard : styles.headercardhover}>
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
        <div className={styles.headerActions}>
          <span className={styles.headerActionsLabel}>
            {t('report.show')}:
          </span>

          <select
            value={pageSizeTop}
            onChange={(e) =>
              handlePageSizeTopChange(Number(e.target.value))
            }
            className={styles.customselect}
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
                <th key={`${h}-${index}`} className={styles.thheader}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={styles.tbody}>
            {paginatedTopData?.map(r => (
              <tr key={r.id_report}  className={`${styles.trbody} ${
                r.selected ? styles.trbodySelected : styles.trbodyHover}`} onClick={() => toggleSelected(r.id_report)}>
                <td className= {styles.tdid}>{r.id_report}</td>
                <td className={styles.tdcategory}>
                  <span
                    className={styles.spancategory}
                  >{r.category}</span>
                </td>
                <td className={styles.tdreport}>{r.name_report}</td>
                <td className={styles.tddescription}>{r.description}</td>            
                <td className={styles.tddescription}>{new Date(r.creation).toLocaleDateString()}</td>              
              </tr>
            ))}
          </tbody>
        </table>
        <div className={styles.divMostrar}>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('report.show')} {Math.min(currentPageTop * pageSizeTop, filteredItems.length)} {t('report.show4')} {filteredItems.length} {t('report.show2')}
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

            {Array.from({ length: totalPagesTop }, (_, i) => i + 1)
              .filter(p =>
                p === 1 ||
                p === totalPagesTop ||
                Math.abs(p - currentPageTop) <= 1
              )
              .map((p, idx, arr) => (
                <React.Fragment key={p}> 
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="text-gray-400 text-xs">...</span>
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
                </React.Fragment>
              ))
            }

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
          <div className={styles.parameterContent}>
            <h3 className={styles.h3parameter}>{t('report.titleparameter')}</h3>
            <p className={styles.subtitleParameter}>{t('report.subtitleparameter')}</p>
          </div>
          <button onClick={() => setIsOpenParam(!isOpenParam)} className={styles.iconbutonlucide2}>
              {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>                   
        </div>
        <div
          ref={contentParam}
          style={{
            maxHeight: isOpenParam
            ? contentParam.current?.scrollHeight + "px"
              : "0px",
              overflow: "hidden",
              transition: "max-height 0.3s ease",
          }}
        >
          <div className={styles.divParameter2}>
            {idSelected && renderParameter(idSelected)}
          </div>
          <div className={styles.divbuttonparameter}>
            <button className="bg-[#00685d] text-white px-8 py-3.5 rounded-lg font-bold text-sm shadow-xl hover:shadow-[#00685d]/20 transition-all flex items-center gap-2" onClick={() => {
                  handlecreate();                 
                }}>
              <span className="material-symbols-outlined text-lg"><BarChart2 size={20} /></span> {t('report.button')}
            </button>
          </div>
        </div>
      </section>

      <section className={styles.seccionResult} hidden={!isviewResult}>
        <div className="flex items-center justify-end gap-2">
          
        </div>
      <div className="px-8 py-6 flex items-center justify-between">
      <h3 className={styles.h3parameter}>{t('report.titleresult')}</h3>
      <div className="flex gap-2">
        
      <button className="bg-[#d3e2f5] text-[#3c5d8a] px-5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:brightness-95 transition-all" onClick={exportToExcel}>
      <span className="material-symbols-outlined text-lg"><Table size={20} /></span> Excel
                              </button>
      {/*<button className="bg-[#5c6c84] text-white px-5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:brightness-95 transition-all" onClick={printPdf}>
      <span className="material-symbols-outlined text-lg"><FileText size={20} /></span> PDF
      </button>*/}
      <span className={styles.headerActionsLabel2}>
              {t('report.show')}:
        </span>

          <select
            value={pageSize}
            onChange={(e) =>
              handlePageSizeChange(Number(e.target.value))
            }
            className={styles.customselect}            
          >
            {[10, 50, 100].map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
      </div>
      </div>
      <div className={styles.searchBar2}>
          {/* Search */}         
            <Search size={20} />
            <input
              type="text"              
              className="searchInput"
               onChange={(e) => setsearchReport(e.target.value)}
            />                        
        </div>    
      <div className={styles.tableResultWrapper}>
        {reportResult.length > 0 && (() => {
          const headers = Object.keys(reportResult[0])
            .filter(h => h !== '_id');

          return (            
            <table ref={componentPDF} className={styles.tableResult}>
              <thead className={styles.tableResultHead}>
                <tr className={styles.trheader}>
                  {headers.map(h => (
                    <th key={h} className={styles.thheader}>
                      {headerMapping[h] || h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedData.map((row, i) => (
                  <tr key={i} className={styles.trbody}>
                    {headers.map(h => (
                      <td key={h} className={styles.tdResult} title={String(row[h] ?? '')}>
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
      <div className={styles.divMostrar}>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('report.show')} {Math.min(currentPage * pageSize, reportResult.length)} {t('report.show4')} {reportResult.length} {t('report.show3')}
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
              <React.Fragment key={p}>  {/* ← key en el Fragment externo */}
                {idx > 0 && arr[idx - 1] !== p - 1 && (
                  <span className="text-gray-400 text-xs">...</span>
                  // ↑ ya no necesita key propio, lo hereda del Fragment
                )}
                <button
                  onClick={() => setCurrentPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    currentPage === p
                      ? 'bg-teal-700 text-white shadow-md'
                      : 'text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {p}
                </button>
              </React.Fragment>
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