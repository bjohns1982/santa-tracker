import React, { createContext, useContext, useState, useEffect } from 'react';

interface TourGuide {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface AuthContextType {
  tourGuide: TourGuide | null;
  token: string | null;
  login: (tourGuide: TourGuide, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [tourGuide, setTourGuide] = useState<TourGuide | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Load from localStorage on mount
    const savedTourGuide = localStorage.getItem('tourGuide');
    const savedToken = localStorage.getItem('token');
    if (savedTourGuide && savedToken) {
      setTourGuide(JSON.parse(savedTourGuide));
      setToken(savedToken);
    }
  }, []);

  const login = (newTourGuide: TourGuide, newToken: string) => {
    setTourGuide(newTourGuide);
    setToken(newToken);
    localStorage.setItem('tourGuide', JSON.stringify(newTourGuide));
    localStorage.setItem('token', newToken);
  };

  const logout = () => {
    setTourGuide(null);
    setToken(null);
    localStorage.removeItem('tourGuide');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider
      value={{
        tourGuide,
        token,
        login,
        logout,
        isAuthenticated: !!tourGuide && !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

