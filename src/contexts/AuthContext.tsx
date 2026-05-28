import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  _id: string;
  email: string;
  name?: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth`;

const API_CATALOGS = import.meta.env.VITE_API_CATALOGS2;
const API_TOKENSL = import.meta.env.VITE_TOKENSL;
const API_KEYSL = import.meta.env.VITE_APIKEYSL;


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const response = await fetch(`${API_CATALOGS}/v1/kl/catalog/autoken/${token}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${API_TOKENSL}`,
              'Content-Type': 'application/json',
              'x-api-key': API_KEYSL,
            },          
          });

          if (response.ok) {
             const data = await response.json();
            const currentUser = data.data;
              setUser({
                _id: currentUser._id,
                email: currentUser.email,
                name: currentUser.name,
                roles: currentUser.roles,
              });            
          } else {
            localStorage.removeItem('authToken');
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem('authToken');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const signUp = async (email: string, password: string, name?: string) => {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear la cuenta');
    }

    const result = await response.json();
    setUser({
      _id: result._id,
      email: result.email,
      name: result.name,
      roles: result.roles,
    });
  };

  /*const signIn = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Credenciales inválidas');
    }

    const { user: authUser, token } = await response.json();
    localStorage.setItem('authToken', token);
    setUser({
      _id: authUser._id,
      email: authUser.email,
      name: authUser.name,
      roles: authUser.roles,
    });
  };*/

  const signIn = async (email: string, password: string) => {   
    const response = await fetch(`${API_CATALOGS}/v1/kl/catalog/signin`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${API_TOKENSL}`,
            'Content-Type': 'application/json',
            'x-api-key': API_KEYSL,
        },
         body: JSON.stringify({
            user: email,
            password: password
          }),
        });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Credenciales inválidas');
    }
    const data = await response.json();

    localStorage.setItem('authToken', data.data.token);
    setUser({
      _id: data.data._id,
      email: data.data.email,
      name: data.data.name,
      roles: data.data.roles,
    });
  };

  /*const signOut = async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/signout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });
      } catch (error) {
        console.error('Error signing out:', error);
      }
      localStorage.removeItem('authToken');
    }
    setUser(null);
  };*/

   const signOut = async () => {
    const token = localStorage.getItem('authToken');
    if (token) {      
      localStorage.removeItem('authToken');
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
