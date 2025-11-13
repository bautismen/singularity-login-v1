import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  es: {
    'app.title': 'Singularity',
    'nav.dashboard': 'Panel',
    'nav.quotations': 'Cotizaciones',
    'nav.shipments': 'Envíos',
    'nav.customers': 'Clientes',
    'nav.operations': 'Operaciones',
    'nav.documents': 'Documentos',
    'nav.analytics': 'Análisis',
    'nav.settings': 'Configuración',
    'auth.login': 'Iniciar sesión',
    'auth.signup': 'Registro',
    'auth.email': 'Correo electrónico',
    'auth.password': 'Contraseña',
    'auth.confirmPassword': 'Confirmar contraseña',
    'auth.loginButton': 'Inicia sesión',
    'auth.signupButton': 'Crear cuenta',
    'auth.noAccount': '¿No tienes cuenta?',
    'auth.haveAccount': '¿Ya tienes cuenta?',
    'auth.forgotPassword': '¿Olvidaste tu contraseña?',
    'header.search': 'Buscar solicitud',
    'header.logout': 'Cerrar sesión',
    'header.profile': 'Perfil',
    'quote.title': 'Nueva Solicitud de Cotización',
    'quote.save': 'Guardar',
    'quote.send': 'Enviar',
    'quote.generalData': 'Datos Generales',
    'quote.client': 'Cliente',
    'quote.isProspect': 'Es prospecto',
    'quote.isPriority': 'Es prioritaria',
    'quote.isQuote': 'Es licitación',
    'quote.requestType': 'Tipo de solicitud',
    'quote.applicant': 'Solicitante',
    'quote.created': 'Creado',
    'quote.responseDeadline': 'Límite de respuesta',
    'quote.services': 'Servicios',
    'quote.service': 'Servicio',
    'quote.operation': 'Operación',
    'quote.incoterm': 'Incoterm',
    'quote.expectedDeparture': 'Salida esperada',
    'quote.origin': 'Origen',
    'quote.destination': 'Destino',
    'quote.destinationZip': 'Código postal de destino',
    'quote.shippingType': 'Tipo de envío',
    'quote.portToPort': 'Puerto a',
    'quote.associatedServices': 'Servicios Asociados',
    'quote.custody': 'Custodia',
    'quote.insurance': 'Seguro',
    'quote.inspection': 'Inspección',
    'quote.customsClearance': 'Despacho aduanal',
    'quote.comments': 'Comentarios',
    'quote.frequency': 'Frecuencia',
    'quote.quantity': 'Cantidad',
    'quote.unit': 'Medida',
    'quote.frequencyPeriod': 'Frecuencia',
    'quote.merchandise': 'Mercancía',
    'quote.search': 'Buscar',
    'quote.actions': 'Acciones',
  },
  en: {
    'app.title': 'Singularity',
    'nav.dashboard': 'Dashboard',
    'nav.quotations': 'Quotations',
    'nav.shipments': 'Shipments',
    'nav.customers': 'Customers',
    'nav.operations': 'Operations',
    'nav.documents': 'Documents',
    'nav.analytics': 'Analytics',
    'nav.settings': 'Settings',
    'auth.login': 'Sign In',
    'auth.signup': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.loginButton': 'Sign In',
    'auth.signupButton': 'Create Account',
    'auth.noAccount': "Don't have an account?",
    'auth.haveAccount': 'Already have an account?',
    'auth.forgotPassword': 'Forgot your password?',
    'header.search': 'Search request',
    'header.logout': 'Sign Out',
    'header.profile': 'Profile',
    'quote.title': 'New Quotation Request',
    'quote.save': 'Save',
    'quote.send': 'Send',
    'quote.generalData': 'General Data',
    'quote.client': 'Client',
    'quote.isProspect': 'Is prospect',
    'quote.isPriority': 'Is priority',
    'quote.isQuote': 'Is tender',
    'quote.requestType': 'Request type',
    'quote.applicant': 'Applicant',
    'quote.created': 'Created',
    'quote.responseDeadline': 'Response deadline',
    'quote.services': 'Services',
    'quote.service': 'Service',
    'quote.operation': 'Operation',
    'quote.incoterm': 'Incoterm',
    'quote.expectedDeparture': 'Expected departure',
    'quote.origin': 'Origin',
    'quote.destination': 'Destination',
    'quote.destinationZip': 'Destination zip code',
    'quote.shippingType': 'Shipping type',
    'quote.portToPort': 'Port to',
    'quote.associatedServices': 'Associated Services',
    'quote.custody': 'Custody',
    'quote.insurance': 'Insurance',
    'quote.inspection': 'Inspection',
    'quote.customsClearance': 'Customs clearance',
    'quote.comments': 'Comments',
    'quote.frequency': 'Frequency',
    'quote.quantity': 'Quantity',
    'quote.unit': 'Unit',
    'quote.frequencyPeriod': 'Frequency',
    'quote.merchandise': 'Merchandise',
    'quote.search': 'Search',
    'quote.actions': 'Actions',
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('es');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('language') as Language | null;
    if (stored) {
      setLanguage(stored);
    }
    setMounted(true);
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['es']] || key;
  };

  if (!mounted) return <>{children}</>;

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
