import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../contexts/NotificationContext';
import { Moon, Sun, Globe } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="absolute top-6 right-6 flex gap-3">
        <button
          onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
          className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-gray-700 dark:text-white"
        >
          <Globe size={18} />
          <span className="text-sm font-medium">{language.toUpperCase()}</span>
        </button>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all text-gray-700 dark:text-white"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>

      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          <div className="flex justify-center mb-8">
            <img src="/logo_png_small 1.png" alt="Singularity" className="h-16 w-auto object-contain" />
          </div>

          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
            Singularity
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('auth.email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('auth.password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 transition-all"
              />
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('auth.confirmPassword')}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 transition-all"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-gradient-to-r from-teal-600 to-cyan-500 hover:from-teal-700 hover:to-cyan-600 disabled:opacity-50 text-white font-medium rounded-lg transition-all"
            >
              {loading ? '...' : (isSignUp ? t('auth.signupButton') : t('auth.loginButton'))}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 text-sm font-medium"
            >
              {isSignUp ? t('auth.haveAccount') : t('auth.noAccount')}
            </button>
          </div>

          {!isSignUp && (
            <div className="mt-4 text-center">
              <button
                type="button"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
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
