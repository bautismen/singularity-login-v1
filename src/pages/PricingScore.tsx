import { useEffect, useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { useLanguage } from '../contexts/LanguageContext';
import { fetchScorePricing } from '../services/dashboardService';
import { getExecutivesByDepartment} from '../services/executiveService';
import { ScorePricing } from '../types/scorePricing';
import { User, Hourglass, Check, Printer} from 'lucide-react';
import { ProgressCircle } from '../components/ProgressCircleChart';
import  styles  from './Quotations.module.css';


export function PricingScore() {
  const { t } = useLanguage();    
  const componentRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [yearSelected, setYearSelected] = useState<number>(new Date().getFullYear());
  const [monthSelected, setMonthSelected] = useState<number>(new Date().getMonth() + 1);
  const [scorePricingGeneralData, setScorePricingGeneralData] = useState<ScorePricing[]>([]);
  const [executivesPricing, setExecutivesPricing] = useState<any[]>([]);
  const [executiveScore, setExecutiveScore] = useState<{
    idUser: string;
    nameExecutive: string;
    emailExecutive: string;
    scoreIndividual?: ScorePricing;
  }>({
    idUser: 'NA',
    nameExecutive: '',
    emailExecutive: ''
  });
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(0, i).toLocaleString(navigator.language, { month: "long" }),
    }));

  const calculatePercent = (value = 0, total= 0) => total > 0 ? (value/total) * 100 : 0;

  useEffect(() => {
    loadScorePricingGeneralData();   
    loadScoreIndividual('NA', '', '')
  }, []);

  useEffect(() => {
    if (!monthSelected || !yearSelected) return;

    /*const fetchData = async () => {
        const response = await fetchScorePricing(
        yearSelected,
        monthSelected,
        executiveScore.idUser
        );
        setScorePricingGeneralData(response);
    };

    fetchData();*/
    loadScorePricingGeneralData();
    loadScoreIndividual(executiveScore.idUser, executiveScore.nameExecutive, executiveScore.emailExecutive)
   }, [monthSelected, yearSelected]);

  useEffect(() => {
    loadScoreIndividual(executiveScore.idUser, executiveScore.nameExecutive, executiveScore.emailExecutive)
  }, [executiveScore.idUser])

  const loadScorePricingGeneralData = async () => {    
    try {
        setLoading(true)
        const responseScore = await fetchScorePricing(yearSelected, monthSelected, 'NA');
        setScorePricingGeneralData(responseScore);

        const responseExecutivesPricing = await getExecutivesByDepartment('Pricing');
        setExecutivesPricing(responseExecutivesPricing);
        
        
    }catch(error) {
        console.error('Error details:', error);   
    }finally{
        setLoading(false);
       console.log('exe',executivesPricing);
    }
  };

  const loadScoreIndividual = async (idUser : string, nameExecutive: string, emailExecutive: string ) => {
    try{ 
        if(idUser === "NA") nameExecutive='';     

        const responseScoreIndividual = await fetchScorePricing(yearSelected, monthSelected, idUser);

        setExecutiveScore({
            idUser: idUser,
            nameExecutive: nameExecutive,
            emailExecutive: emailExecutive,
            scoreIndividual: responseScoreIndividual
        })        

    }catch(error){
        console.error('Error details:', error);   
    }
  }

  const printPdf = useReactToPrint({
    contentRef:  componentRef,
  })

  return (
    <div ref={componentRef} className="p-8 max-w-[1440px] mx-auto">
      <div className="flex justify-between items-start mb-10">
        <div className="mb-8">          
          <h1 className={styles.title} > {/*className="text-2xl font-semibold text-gray-900 mb-3 dark:text-white"*/}
            {t('score.scoreQuotations')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
           {t('score.scoreQuotationsResume')} 
          </p>
        </div>
        <div className="flex items-end gap-3">
          <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
           value={monthSelected}
           onChange={(e) => {
            setMonthSelected(parseInt(e.target.value))
          }}>
            {months.map(month => (
                <option key={month.value} value={month.value} >{month.label}</option>
            ))}                        
          </select> 

          <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"          
          >
            <option>{yearSelected}</option>                      
          </select> 

          <button className="bg-teal-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-secondary transition-colors shadow-sm"
            onClick={printPdf}>
            <Printer className="size-4" />
            {t('score.print')} 
        </button>         
        </div>
      </div>

    {loading ? (
        <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
        </div>
        ) : (
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-8 bg-white border-gray-200 shadow-2xl rounded-[2.5rem] p-10 relative overflow-hidden h-[420px] flex flex-col justify-between dark:bg-gray-800 dark:text-white">
          <div className="relative z-10">
            <h2 className={styles.label}> {/* text-gray-600 text-sm font-semibold mb-8*/}
               {t('score.totalQuotations')} 
            </h2>
            <div className="text-[5.5rem] font-extrabold leading-none tracking-tighter">
               {loading ? '...' : scorePricingGeneralData[0]?.total_general || 0}
            </div>
            <p className={styles.label} style={{ marginTop: "1.5rem" }} > {/*"text-xs mt-8 font-medium"*/}
              {t('score.totalQuotationsResume')} 
            </p>
          </div>
          <div className="relative z-10 flex gap-20 border-t border-gray-50 pt-8">
            <div>
              <p className={styles.label} > {/**"text-[0.6rem] font-bold uppercase tracking-widest mb-1" */}
                 {t('score.ofMonth')} 
              </p>
              <div className="flex items-center gap-3">
                <div className="w-1 h-10 bg-teal-500 rounded-full"></div>
                <span className="text-3xl font-headline font-extrabold text-on-surface">
                  {loading ? '...' : scorePricingGeneralData[0]?.total_mes || 0}
                </span>
              </div>
            </div>
            <div>
              <p className={styles.label}> {/**"text-[0.6rem] font-bold uppercase tracking-widest mb-1"*/}
                {t('score.pendients')} 
              </p>
              <div className="flex items-center gap-3">
                <div className="w-1 h-10 bg-red-500 rounded-full"></div>
                <span className="text-3xl font-headline font-extrabold text-on-surface">
                  {loading ? '...' : scorePricingGeneralData[0]?.pendientes || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-[#F4F7F6] rounded-full flex items-center justify-center dark:bg-gray-600">
            <div className="bg-white p-2 rounded-full shadow-sm dark:bg-gray-500" >
                {/*<DollarSign className="size-8 text-yellow-500 " /> */}
                <img  style={{ width: "220px", height: "220px" }} className="rounded-full" src="./krom_log.png" />
            </div>                        
          </div>
        </div>

        <div className="col-span-4 bg-white border-gray-200 shadow-2xl rounded-[2.5rem] p-10 custom-shadow flex flex-col items-center dark:bg-gray-800 dark:text-white">
          <h3 className={`${styles.label} w-full mb-8`}> {/**"text-sm font-semibold w-full mb-8" */}           
            {t('score.quotationsAcceptedMonth')} 
          </h3>
          <div className="relative w-56 h-56 mt-10 ">
            <ProgressCircle
            percentage={calculatePercent((scorePricingGeneralData[0]?.aceptadas) / scorePricingGeneralData[0]?.total_mes) } 
            size={200} 
            strokeWidth={15} 
            color="#14b8a6" 
            backgroundColor="#D1D5DB" 
            />            
          </div>
          <div className="flex items-center gap-2 mt-auto">
            <div className="w-2.5 h-2.5 bg-teal-500 rounded-full"></div>
            <span className={styles.label} > {/**"text-xs font-semibold " */}
              {t('score.Accepted')} : {loading ? '...' : scorePricingGeneralData[0]?.aceptadas || 0}
            </span>
          </div>
        </div>

        <div className="col-span-12 mt-4 mb-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-primary rounded-full"></div>
            <h4 className={styles.sectionTitle}  > {/**"text-xl font-bold text-gray-900 dark:text-white" */}
              {t('score.individualMetrics')} 
            </h4>
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
           onChange={(e) => {
            loadScoreIndividual(e.target.value,  e.target.options[e.target.selectedIndex].text, e.target.selectedOptions[0].dataset.emailExecutive || '')}
           }>
           <option value="NA">{t('quote.selectExecutive')}</option>
           {executivesPricing.map((executive) => (
                <option value={executive._Iduser} data-email-executive={executive.email || ''} >
                    {executive.nombre} {executive.apellido_paterno} {executive.apellido_materno}
                </option> 
           ))}                       
          </select>
        </div>

        <div className="col-span-4 bg-white border-gray-200 shadow-2xl rounded-[2.5rem] p-8 custom-shadow dark:bg-gray-800 dark:text-white">
          <div className="flex items-center gap-4 mb-10">
            <User className="size-8"/>
            <div>
              <h5 className={styles.modalTitle}> {/**"text-xl font-extrabold " */}
                {loading ? '...' : executiveScore.nameExecutive || ''}
              </h5>
              <p className={styles.label}> {/**"text-[0.7rem] font-bold " */}
                {loading ? '...' : executiveScore.emailExecutive || ''}
              </p>
            </div>
          </div>
          <div className="bg-[#F4F7F6] rounded-3xl p-6 dark:bg-gray-600">
            <p className={styles.label} > {/**text-[0.6rem] font-bold uppercase tracking-widest mb-1 */}
              {t('score.quotations')} 
            </p>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-headline font-extrabold tracking-tighter">
                {executiveScore.scoreIndividual?.[0]?.total_general ? executiveScore.scoreIndividual?.[0].total_general :  0}
              </span>              
            </div>
          </div>
        </div>

        <div className="col-span-4 bg-white border-gray-200 shadow-2xl rounded-[2.5rem] p-8 custom-shadow flex flex-col dark:bg-gray-800 dark:text-white">
          <div className="flex justify-between items-start mb-4">
            <div>
              {/*<p className= {`${styles.label} mb-1`} > {/*text-[0.6rem] font-bold uppercase tracking-widest mb-1*/}
              {/*}  {t('score.efficiency')} 
              </p>*/}
              <h5 className={`${styles.label} `} > {/**text-lg font-extrabold leading-tight */}
                {t('score.quotations')}  
                {t('score.pendients')}
              </h5>
            </div>            
            <Hourglass className="size-6" />           
          </div>
          <div className="flex-col flex items-center justify-center py-4">
            <div className="relative w-40 h-40 ">
              <ProgressCircle 
               percentage={(((executiveScore.scoreIndividual?.[0]?.pendientes || 0) / (executiveScore.scoreIndividual?.[0]?.total_mes || 0 )) * 100 ) || 0} 
               size={130} 
               strokeWidth={15} 
               color="#A0AEC0" 
               backgroundColor="#e5e7eb " 
              />                 
            </div>
            <div className="flex items-center gap-2 ">
                <div className="w-2.5 h-2.5 bg-gray-600 rounded-full"/>
                <span className={`${styles.label} `}> {/**"text-xs font-semibold " */}
                    {t('score.pendients')}: {executiveScore.scoreIndividual?.[0]?.pendientes ? executiveScore.scoreIndividual?.[0].pendientes : 0}
                </span>
            </div>           
        </div>
            
        </div>

        <div className="col-span-4 bg-white border-gray-200 shadow-2xl rounded-[2.5rem] p-8 custom-shadow flex flex-col dark:bg-gray-800 dark:text-white">
          <div className="flex justify-between items-start mb-4">
            <div>
              {/*<p className={styles.subsectionTitle}> {/**"text-[0.6rem] font-bold uppercase tracking-widest mb-1" */}
              {/*  Conversion
              </p>*/}
              <h5 className={styles.label}> {/**"text-lg font-headline font-extrabold leading-tight" */}
                {t('score.quotations')}                
                {t('score.Accepted')}
              </h5>
            </div>
            <div className="w-6 h-6 bg-teal-300 rounded-full flex items-center justify-center">
              <Check className="size-4 text-white" />
            </div>
          </div>
          <div className="flex-col flex items-center justify-center py-4">
            <div className="relative w-40 h-40">
              <ProgressCircle
                percentage={(((executiveScore.scoreIndividual?.[0]?.aceptadas || 0) / (executiveScore.scoreIndividual?.[0]?.total_mes || 0)) * 100 ) || 0} 
                size={130} 
                strokeWidth={15} 
                color="#14b8a6" 
                backgroundColor="#D1D5DB" />                 
            </div>
            <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-teal-500 rounded-full"/>
                <span className={styles.label}> {/**"text-xs font-semibold " */}
                     {t('score.Accepted')}: {executiveScore.scoreIndividual?.[0]?.aceptadas ? executiveScore.scoreIndividual?.[0].aceptadas : 0}
                </span>
            </div>        
          </div>
        </div>
      </div>
    )}
    </div>
  );
}
