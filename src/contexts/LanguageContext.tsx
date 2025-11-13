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
  },
  en: {
    'app.title': 'Singularity',
    'nav.dashboard': 'Dashboard',
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
