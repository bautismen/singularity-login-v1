import { useState, useEffect } from "react";
import { fetchDashboardStatsNew, type DashboardStats } from "../services/dashboardService";
import { DonutChart } from "../components/DonutChart";
import { useLanguage } from "../contexts/LanguageContext";
import { EyeIcon } from "lucide-react";


interface DashboardStatsProps {
  onNavigate?: (route: string) => void;
}

type QuotationRequestItem = {
  _id: string;
  customer_name: string;
  customer_category: number;
  reference_request: string;
  date: Date | string;
  extra?: string;
  idExtra?: number | null;
  type: "urgent" | "recent";
};

const STATUS_STYLES: Record<number, string> = {
  1: 'bg-teal-500/20 text-teal-600 dark:bg-teal-500/40 dark:text-teal-400',
  2: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
  3: 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
  4: 'bg-amber-400/40 text-amber-600 dark:text-amber-400',
  5: 'bg-green-500/20 text-green-600 dark:text-green-400',
  6: 'bg-red-500/20 text-red-600 dark:text-red-400',
  7: 'bg-gray-500/20 text-gray-600 dark:text-gray-400',
  8: 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400',
};

const DEFAULT_STYLE = 'bg-gray-400/20 text-gray-600 dark:text-gray-400';

export function DashboardStats({ onNavigate }: DashboardStatsProps) {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<"urgent" | "recent">("urgent");
  const [currentPageUrgent, setCurrentPageUrgent] = useState(1);
  const [currentPageRecent, setCurrentPageRecent] = useState(1);
  const [pageSize, setPageSize] = useState(3);
  const nameMonth = new Date().toLocaleDateString(
                language === "es" ? "es-ES" : "en-US",
                { month: "long", year: "numeric" },
              )


  const getPagesToDisplay = (totalPages: number, currentPage: number) => {
    if (totalPages <= 5)
      return Array.from({ length: totalPages }, (_, i) => i + 1);

    const pages: Array<number | string> = [];
    pages.push(1);
    const left = Math.max(2, currentPage - 1);
    const right = Math.min(totalPages - 1, currentPage + 1);

    if (left > 2) pages.push("...");

    for (let i = left; i <= right; i++) pages.push(i);

    if (right < totalPages - 1) pages.push("...");
    pages.push(totalPages);

    // remove duplicates and keep order
    return pages.filter((v, idx, arr) => arr.indexOf(v) === idx);
  };

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const stats = await fetchDashboardStatsNew();
        setData(stats);
        setError(null);
      } catch (err) {
        //console.error("Error loading dashboard stats:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-teal-200 dark:border-teal-800 border-t-teal-600 dark:border-t-teal-400 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">
            Error al cargar estadísticas: {error}
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="p-8 dark:bg-gray-900">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          {t("dash.title")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{t("dash.subtitle")}</p>
      </div>

      <div id="CustomerCategorization" className="mb-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-l-4 border-teal-500 pl-3">
            {t("dash.CustomerCategorization")}
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {t("dash.CustomerCategorization.total", {
              values: { count: data.stats.total } , 
              upper: true
            }) + " " + new Date().getFullYear() }
            
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4">
              <img
                src="/gold.png"
                alt="Gold Medal"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center mb-2 uppercase tracking-wide">
              Categoría Oro
            </p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white text-center mb-3">
              {data.stats.gold.toLocaleString()}
            </p>
            <div className="flex items-center justify-center text-sm">
              <span className="text-teal-500 font-medium">
                {data.percentages.gold}% del total
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4">
              <img
                src="/silver.png"
                alt="Silver Medal"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center mb-2 uppercase tracking-wide">
              Categoría Plata
            </p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white text-center mb-3">
              {data.stats.silver.toLocaleString()}
            </p>
            <div className="flex items-center justify-center text-sm">
              <span className="text-gray-500 font-medium">
                {data.percentages.silver}% del total
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4">
              <img
                src="/bronze.png"
                alt="Bronze Medal"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center mb-2 uppercase tracking-wide">
              Categoría Bronce
            </p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white text-center mb-3">
              {data.stats.bronze.toLocaleString()}
            </p>
            <div className="flex items-center justify-center text-sm">
              <span className="text-amber-600 font-medium">
                {data.percentages.bronze}% del total
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mb-5 ">
        <button
          id="btnCotizacion"
         onClick={() => {
                          sessionStorage.setItem(
                                "quotationViewMode",
                                'create',
                              );
                          onNavigate?.("quotations");
                        }}
          className="px-4 py-2 bg-[#038C7F] hover:bg-[#03738C] text-white font-medium rounded-lg transition-colors"
        >
          + {t("dash.quotationrequest")}
        </button>
      </div>


      <div
        id="StatementofContributions"
        className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8"
      >
        <div
          id="divDonutChart"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("dash.statementofContributions")}
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {nameMonth}
            </span>
          </div>
          {data.quotations?.statusPercentageCurrentMonth &&
          data.quotations.statusPercentageCurrentMonth.length > 0 ? (
            <DonutChart
              data={data.quotations.statusPercentageCurrentMonth}
              total={data.quotations.totalQuotationsCurrentMonth || 0}
            />
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              No hay datos disponibles
            </div>
          )}
        </div>

        <div
          id="divQuotesAll"
          className="col-span-1 lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700"
        >
          <div
            id="divHeaderTabsAndPageSize"
            className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200 dark:border-slate-700 mb-6 gap-4"
          >
            <div id="tabsButtons" className="flex overflow-x-auto">
              <button
                onClick={() => {
                  setActiveTab("urgent");
                  setCurrentPageUrgent(1);
                }}
                className={`px-4 py-3 text-sm font-medium ${activeTab === "urgent" ? "border-b-2 border-teal-600 text-teal-600" : "text-gray-500 dark:text-gray-400 hover:text-teal-600"}`}
              >
                {t("dash.quotes.urgent")}
              </button>
              <button
                onClick={() => {
                  setActiveTab("recent");
                  setCurrentPageRecent(1);
                }}
                className={`px-4 py-3 text-sm font-medium ${activeTab === "recent" ? "border-b-2 border-teal-600 text-teal-600" : "text-gray-500 dark:text-gray-400 hover:text-teal-600"}`}
              >
                {t("dash.quotes.recent")}
              </button>
            </div>

            <div
              id="divPageSize"
              className="flex jus items-center gap-2 pb-3 md:pb-0"
            >
              <label
                htmlFor="per_page"
                className="text-xs font-medium text-gray-500 dark:text-slate-400"
              >
                {language === "es" ? "Mostrar" : "Records"}
              </label>
              <select
                id="per_page"
                value={pageSize}
                onChange={(e) => {
                  const size = Number(e.target.value) || 3;
                  setPageSize(size);
                  if (activeTab === "urgent") setCurrentPageUrgent(1);
                  else setCurrentPageRecent(1);
                }}
                className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 text-xs rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-1.5 outline-none transition-all cursor-pointer"
              >
                <option value={3}>3</option>
                <option value={6}>6</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>

          <div
            id="divTableQuotes"
            className="bg-white dark:bg-slate-950 rounded-xl shadow-sm overflow-hidden"
          >
            <table className="w-full border-collapse table-fixed">
              <thead className="bg-gray-50 dark:bg-slate-950 border-b border-b-gray-100 dark:border-b-slate-700">
                <tr>
                  <th className="px-6 py-4 md:w-[45%] text-xs text-left font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    {t("dash.table.col.client")}
                  </th>
                  <th className="sm:table-cell px-6 py-4 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    {t("dash.table.col.type")}
                  </th>
                  <th className="sm:table-cell px-6 py-4 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    { activeTab === "urgent" ? t("dash.table.col.expiration") : t("dash.table.col.status")}
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider text-right">
                    {t("dash.table.col.actions")}
                  </th>
                </tr>
              </thead>

              {(() => {
                const urgentList: QuotationRequestItem[] =
                  data.quotations?.upcomingDeadlines?.map((d) => ({
                    _id: String(d._id),
                    customer_name: d.customer.customer_name,
                    customer_category: d.customer.customer_category,
                    reference_request: d.reference_request,
                    date: d.deadlineDate.$date,
                    extra: `${d.daysRemaining} d`,
                    type: "urgent",
                  })) ?? [];
                const recentList: QuotationRequestItem[] =
                  data.quotations?.newRequestsCurrentMonth?.map((r) => ({
                    _id: String(r._id),
                    customer_name: r.customer.customer_name,
                    customer_category: r.customer.customer_category,
                    reference_request: r.reference_request,
                    date: r.createdAt.$date,
                    extra: r.statusName,
                    idExtra: r.statusId,
                    type: "recent",
                  })) ?? [];

                const currentList = activeTab === "urgent" ? urgentList : recentList;
                const currentPage = activeTab === "urgent"
                                                  ? currentPageUrgent
                                                  : currentPageRecent;
                const total = currentList.length;
                const totalPages = Math.max(1, Math.ceil(total / pageSize));
                const paginated = currentList.slice( (currentPage - 1) * pageSize,
                                                      currentPage * pageSize,
                                                    );
                const totalPaginated = paginated.length;

                if (!currentList || currentList.length === 0) {
                  return (
                    <tbody>
                      <tr>
                        <td colSpan={4}>
                          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                            {activeTab === "urgent"
                              ? "No hay cotizaciones urgentes"
                              : "No hay cotizaciones recientes"}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  );
                }

                return (
                  <>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                      {paginated.map(
                        (deadline: QuotationRequestItem, index: number) => {
                          const isOverdue =
                            deadline.extra?.startsWith("-") ||
                            deadline.extra?.startsWith("0");
                          const medalIcon =
                            deadline.customer_category === 1
                              ? "/gold.png"
                              : deadline.customer_category === 2
                                ? "/silver.png"
                                : "/bronze.png";
                          const colorStatus =  STATUS_STYLES[deadline.idExtra ?? -1 ] ??
                                               DEFAULT_STYLE;

                          return (
                            <tr
                              key={index + (activeTab === "recent" ? 1000 : 0)}
                              className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                            >
                              <td className="px-6 py-4 text-left">
                                <div className="flex items-center gap-3 overflow-hidden min-w-0">
                                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold ring-2 ring-white dark:ring-slate-800">
                                    {deadline.customer_name?.slice(0, 2) ?? "?"}
                                  </div>
                                  <span className="text-sm truncate lg:text-xs text-gray-900 dark:text-slate-200 ">
                                    {deadline.customer_name}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span
                                  className="inline-block bg-yellow-100 dark:bg-yellow-900/30 rounded text-yellow-600"
                                  title="Premium"
                                >
                                  <img
                                    className="w-8 h-8 object-contain"
                                    alt="Category"
                                    src={medalIcon}
                                  />
                                </span>
                              </td>

                              <td className="px-6 py-4">
                                <div className="flex items-center justify-center gap-2">
                                  { (deadline.type === "urgent")  ?
                                  
                                  <span
                                    className={`text-sm ${isOverdue ? "text-red-500 font-semibold" : "text-gray-700 dark:text-gray-300"}`}
                                  >
                                    {`${isOverdue ? "+ " : ""}  ${deadline.extra?.replace(/^-/, "")} `}
                                  </span> 
                                    : 
                                  <span
                                      className={`
                                        inline-flex items-center
                                        text-xs font-medium
                                        px-1.5 py-0.5
                                        rounded-full
                                        ${colorStatus}
                                      `}
                                    >
                                       {deadline.extra}
                                    </span>
                                    }
                                </div>
                              </td>

                              <td className="px-6 py-4 text-right relative group">
                                <button 
                                   onClick={() => {
                                try {
                                  if (deadline?._id) {
                                    sessionStorage.setItem('quotationViewMode','view');
                                    sessionStorage.setItem(
                                      "quotationToId",
                                      String(deadline._id),
                                    );
                                  }
                                } catch {
                                  // Ignorado intencionalmente: este error no afecta la UI
                                }
                                onNavigate?.("quotations");
                              }}
                                className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:bg-teal-900/20 px-3 py-1.5 rounded-lg transition-colors text-sm font-semibold inline-flex items-center gap-1.5 focus:outline-none">
                                  <EyeIcon size={24} />
                                  <span className="hidden sm:inline">
                                    {" "}
                                    {t("dash.table.viewDetail")}
                                  </span>
                                </button>
                                <span 
                                className="absolute left-1/2 -translate-x-1/2 -top-1
                                            whitespace-nowrap
                                          bg-gray-900 text-white text-xs 
                                            rounded py-1 px-2
                                            opacity-0 group-hover:opacity-100
                                            transition-opacity
                                            pointer-events-none
                                            z-50
                                            ">
                                    {deadline.reference_request}
                                </span>
                              </td>
                            </tr>
                          );
                        },
                      )}
                    </tbody>

                    <tfoot>
                      <tr>
                        <td colSpan={4} className="px-3 py-3" >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {t("dash.quotes.records", {
                                  values: {
                                    record: totalPaginated,
                                    records: total,
                                  },
                                })}
                              </span>
                            </div>

                            {total > pageSize && (
                              <div className="flex items-center gap-2">
                                <button
                                  className="w-8 h-8 flex items-center justify-center rounded bg-[#038C7F] hover:bg-[#03738C] text-white"
                                  onClick={() => {
                                    const prev = Math.max(1, currentPage - 1);
                                    if (activeTab === "urgent")
                                      setCurrentPageUrgent(prev);
                                    else setCurrentPageRecent(prev);
                                  }}
                                  disabled={currentPage === 1}
                                >
                                  ◀
                                </button>

                                {getPagesToDisplay(totalPages, currentPage).map(
                                  (p) => {
                                    if (p === "...")
                                      return (
                                        <span
                                          key={`dot-${Math.random()}`}
                                          className="px-2 text-gray-500"
                                        >
                                          …
                                        </span>
                                      );
                                    const page = Number(p);
                                    const isActive = page === currentPage;
                                    return (
                                      <button
                                        key={`page-${page}-${activeTab}`}
                                        onClick={() => {
                                          if (activeTab === "urgent")
                                            setCurrentPageUrgent(page);
                                          else setCurrentPageRecent(page);
                                        }}
                                        className={`w-8 h-8 flex items-center justify-center rounded ${isActive ? "bg-[#038C7F] text-white" : "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                                      >
                                        {page}
                                      </button>
                                    );
                                  },
                                )}

                                <button
                                  className="w-8 h-8 flex items-center justify-center rounded text-white bg-[#038C7F] hover:bg-[#03738C]"
                                  onClick={() => {
                                    const next = Math.min(
                                      totalPages,
                                      currentPage + 1,
                                    );
                                    if (activeTab === "urgent")
                                      setCurrentPageUrgent(next);
                                    else setCurrentPageRecent(next);
                                  }}
                                  disabled={currentPage === totalPages}
                                >
                                  ▶
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    </tfoot>
                  </>
                );
              })()}
            </table>
          </div>
        </div>
      </div>

      <div id="Performanceperchannel" className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-l-4 border-teal-500 pl-3">
            {t("dash.performanceperchannel.title")}
          </h2>
          <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
            <option value={2026}>Año 2026</option>
          </select>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              {t("dash.performanceperchannel.adress")}
            </span>
            <span className="text-sm font-medium text-teal-600 dark:text-teal-400 uppercase tracking-wide">
              {t("dash.performanceperchannel.subtitle")}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {data.quotations?.acceptedByChannel &&
            data.quotations.acceptedByChannel.length > 0 ? (
              data.quotations.acceptedByChannel.map((channel) => (
                <div key={channel.requestTypeId}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {channel.requestTypeName}
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {channel.totalAccepted}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-teal-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min((channel.totalAccepted / 300) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-8">
                No hay datos de canales disponibles
              </div>
            )}
          </div>
        </div>
      </div>

    
    </div>
  );
}
