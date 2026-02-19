import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../contexts/NotificationContext';
import { Moon, Sun, Globe, Mail, Key, LoaderIcon,  Eye, EyeOff } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const { signIn, signUp } = useAuth();
  const { showSuccess } = useNotification();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          throw new Error('Las contraseñas no coinciden / Passwords do not match');
        }
        if (password.length < 6) {
          throw new Error('La contraseña debe tener al menos 6 caracteres / Password must be at least 6 characters');
        }
        await signUp(email, password);
        showSuccess('Cuenta creada exitosamente. Ya puedes iniciar sesión. / Account created successfully. You can now sign in.');
        setIsSignUp(false);
        setPassword('');
        setConfirmPassword('');
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      console.error('Auth error:', err);
      let errorMessage = 'Error de autenticación / Authentication failed';

      if (err instanceof Error) {
        if (err.message.includes('fetch')) {
          errorMessage = 'Error de conexión. Verifica tu conexión a internet. / Connection error. Check your internet connection.';
        } else if (err.message.includes('Invalid login credentials')) {
          errorMessage = 'Email o contraseña incorrectos / Invalid email or password';
        } else if (err.message.includes('User already registered')) {
          errorMessage = 'Este email ya está registrado. Intenta iniciar sesión. / This email is already registered. Try signing in.';
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Video SOLO desktop */}
      <div className="hidden md:block">
          <video
          autoPlay
          muted
          loop
          className="fixed right-0 bottom-0 min-w-full min-h-full object-cover -z-20"> 
              <source type="video/mp4" src="/videos/video02.mp4" />
          </video>
      </div>

      {/* Gradiente overlay */}
      <div className="fixed inset-0 z-0 bg-gradient-to-tr
       from-[#03738c]/60  dark:from-slate-600/70 
       via-[#037f8c]/60 dark:via-slate-600/70
       to-[#03a678]/60 dark:to-slate-600/80" />

      {/* Iconos lenguaje y tema */}
      <div className="absolute top-6 right-6 flex gap-3">
        <button
          onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
          className="p-2 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-white  bg-slate-700/50"
        >
          <Globe size={18} />
          <span className="text-sm font-medium">{language.toUpperCase()}</span>
        </button>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg shadow-md hover:shadow-lg transition-all text-white  bg-slate-700/50"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>

      <div className="w-full max-w-md">
        <div className="w-full max-w-md rounded-2xl bg-white/10 dark:bg-slate-800/40 backdrop-blur-xl dark:backdrop-blur-2xl border border-white/20 dark:border-slate-300/20 shadow-2xl p-8 ">
          <div className="flex justify-center mb-2">
            <img src="/logo_png_small_1.png" alt="Singularity" className="h-16 w-auto object-contain" />
          </div>

          <p className="text-center text-white mb-8">
            {isSignUp ? t('auth.createAccount') : t('auth.welcome')}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-200 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-white">
            <div>
              <label className="block text-sm/6 font-medium mb-2" >
                {t('auth.email')}
              </label>
              <div className='flex items-center border-b border-white/40 focus-within:border-teal-400'>
                <Mail className='w-5 h-5 mr-2 opacity-80' />
                <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder= {t('auth.email')}
                autoComplete="email"
                className="block w-full px-3 py-2 bg-transparent outline-none focus:outline-none transition-all input-login-autofill"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm/6 font-medium mb-2">
                {t('auth.password')}
              </label>
              <div className='flex items-center border-b border-white/40 focus-within:border-teal-400'>
                <Key className='w-5 h-5 mr-2 opacity-80' />
                <input
                type={showPwd ? 'text' : "password" }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder={t('auth.password')}
                autoComplete="current-password"
                className="block w-full px-3 py-2 bg-transparent outline-none focus:outline-none transition-all input-login-autofill"
                />
                <button type='button'
                  onClick={() => setShowPwd(!showPwd)}
                  className='absolute right-10'
                >
                  {showPwd ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm/6 font-medium mb-2">
                  {t('auth.confirmPassword')}
                </label>
                <div className='flex items-center border-b border-white/40 focus-within:border-teal-400'>
                  <Key className='w-5 h-5 mr-2 opacity-80' />
                  <input
                  type={showPwd ? 'text' : "password" }
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder= {t('auth.confirmPassword')}
                  className="block w-full px-3 py-2 bg-transparent outline-none focus:outline-none transition-all input-login-autofill"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-gradient-to-r from-teal-600 to-cyan-500 hover:from-teal-700 hover:to-cyan-600 disabled:opacity-50 text-white font-medium rounded-lg transition-all flex items-center justify-center"
            >
              {loading ? <LoaderIcon className="animate-spin h-5 w-5 font-bold" />  : (isSignUp ? t('auth.signupButton') : t('auth.loginButton'))}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-white hover:text-cyan-200 dark:hover:text-cyan-400 text-sm font-medium"
            >
              {isSignUp ? t('auth.haveAccount') : t('auth.noAccount')}
            </button>
          </div>

          {!isSignUp && (
            <div className="mt-4 text-center">
              <button
                type="button"
                className="text-white hover:text-cyan-300 dark:hover:text-cyan-400 text-sm"
              >
                {t('auth.forgotPassword')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
