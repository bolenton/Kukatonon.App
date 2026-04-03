import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://kukatonon.app';
const SESSION_KEY = 'kukatonon_admin_session';

// Refresh 5 minutes before expiry
const REFRESH_BUFFER_MS = 5 * 60 * 1000;

interface AdminSession {
  token: string;
  refresh_token: string;
  expires_at: number; // unix seconds
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
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Persist session changes
  async function saveSession(s: AdminSession | null) {
    setSession(s);
    if (s) {
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(s));
    } else {
      await AsyncStorage.removeItem(SESSION_KEY);
    }
  }

  // Schedule a refresh before the token expires
  function scheduleRefresh(s: AdminSession) {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);

    const expiresMs = s.expires_at * 1000;
    const now = Date.now();
    const delay = Math.max(expiresMs - now - REFRESH_BUFFER_MS, 0);

    refreshTimerRef.current = setTimeout(() => refreshSession(s.refresh_token), delay);
  }

  async function refreshSession(refreshToken: string) {
    try {
      const res = await fetch(`${API_BASE}/api/mobile/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!res.ok) {
        // Refresh failed — session is dead, log out
        await saveSession(null);
        return;
      }

      const data = await res.json();
      const newSession: AdminSession = {
        token: data.token,
        refresh_token: data.refresh_token,
        expires_at: data.expires_at,
        email: data.email,
        role: data.role,
        full_name: data.full_name,
      };

      await saveSession(newSession);
      scheduleRefresh(newSession);
    } catch {
      // Network error — try again in 30 seconds
      refreshTimerRef.current = setTimeout(() => refreshSession(refreshToken), 30_000);
    }
  }

  // Load session on mount
  useEffect(() => {
    AsyncStorage.getItem(SESSION_KEY).then(async (val) => {
      if (val) {
        try {
          const s: AdminSession = JSON.parse(val);
          const now = Date.now();
          const expiresMs = s.expires_at * 1000;

          if (expiresMs - now > REFRESH_BUFFER_MS) {
            // Token still valid — use it and schedule refresh
            setSession(s);
            scheduleRefresh(s);
          } else if (s.refresh_token) {
            // Token expired or about to — refresh immediately
            await refreshSession(s.refresh_token);
          } else {
            // No refresh token, clear stale session
            await AsyncStorage.removeItem(SESSION_KEY);
          }
        } catch {
          await AsyncStorage.removeItem(SESSION_KEY);
        }
      }
      setLoading(false);
    });

    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
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
        refresh_token: data.refresh_token,
        expires_at: data.expires_at,
        email: data.email,
        role: data.role,
        full_name: data.full_name,
      };

      await saveSession(s);
      scheduleRefresh(s);
      return {};
    } catch {
      return { error: 'Connection failed' };
    }
  }

  async function logout() {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    await saveSession(null);
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
