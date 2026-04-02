import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://kukatonon.app';
const SESSION_KEY = 'kukatonon_admin_session';

interface AdminSession {
  token: string;
  email: string;
  role: string;
  full_name: string | null;
}

interface AuthContextValue {
  isAdmin: boolean;
  session: AdminSession | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  isAdmin: false,
  session: null,
  loading: true,
  login: async () => ({}),
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(SESSION_KEY).then((val) => {
      if (val) {
        try {
          setSession(JSON.parse(val));
        } catch {}
      }
      setLoading(false);
    });
  }, []);

  async function login(email: string, password: string): Promise<{ error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/api/mobile/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { error: data.error || 'Login failed' };
      }

      const s: AdminSession = {
        token: data.token,
        email: data.email,
        role: data.role,
        full_name: data.full_name,
      };

      setSession(s);
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(s));
      return {};
    } catch {
      return { error: 'Connection failed' };
    }
  }

  async function logout() {
    setSession(null);
    await AsyncStorage.removeItem(SESSION_KEY);
  }

  return (
    <AuthContext.Provider value={{ isAdmin: !!session, session, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
