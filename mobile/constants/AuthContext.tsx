import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerTokenRefresh } from '../lib/adminApi';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://kukatonon.app';
const SESSION_KEY = 'kukatonon_admin_session';

// Refresh 5 minutes before expiry
const REFRESH_BUFFER_MS = 5 * 60 * 1000;

interface AdminSession {
  token: string;
  refresh_token?: string;
  expires_at?: number; // unix seconds — missing on legacy sessions
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
  /** Attempt to refresh the token. Returns the new token or null if refresh failed. */
  refreshAndGetToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue>({
  isAdmin: false,
  session: null,
  loading: true,
  login: async () => ({}),
  logout: async () => {},
  refreshAndGetToken: async () => null,
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
    if (!s.expires_at || !s.refresh_token) return;
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);

    const expiresMs = s.expires_at * 1000;
    const now = Date.now();
    const delay = Math.max(expiresMs - now - REFRESH_BUFFER_MS, 0);

    refreshTimerRef.current = setTimeout(() => {
      tryRefresh(s.refresh_token!);
    }, delay);
  }

  // Attempt a token refresh. Returns true if successful.
  // `silent` means don't log out on failure (used during boot).
  async function tryRefresh(refreshToken: string, silent = false): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/api/mobile/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!res.ok) {
        // 401/403 = refresh token is dead
        if (!silent) await saveSession(null);
        return false;
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
      return true;
    } catch {
      // Network error — don't log out, retry later
      refreshTimerRef.current = setTimeout(() => tryRefresh(refreshToken, silent), 30_000);
      return false;
    }
  }

  // Load session on mount
  useEffect(() => {
    AsyncStorage.getItem(SESSION_KEY).then(async (val) => {
      if (val) {
        try {
          const s: AdminSession = JSON.parse(val);

          // Always restore the session first so admin tab shows immediately
          setSession(s);

          // If we have refresh capability, try to refresh if near/past expiry
          if (s.expires_at && s.refresh_token) {
            const now = Date.now();
            const expiresMs = s.expires_at * 1000;

            if (expiresMs - now > REFRESH_BUFFER_MS) {
              // Still valid — just schedule the future refresh
              scheduleRefresh(s);
            } else {
              // Expired or about to — try refresh silently (don't log out on failure)
              tryRefresh(s.refresh_token, true);
            }
          }
          // Legacy sessions without refresh fields just keep working as before
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

  async function refreshAndGetToken(): Promise<string | null> {
    const current = session;
    if (!current?.refresh_token) return current?.token || null;

    try {
      const res = await fetch(`${API_BASE}/api/mobile/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: current.refresh_token }),
      });
      if (!res.ok) {
        await saveSession(null);
        return null;
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
      return newSession.token;
    } catch {
      return current.token;
    }
  }

  // Register the refresh function so adminFetch can use it on 401
  useEffect(() => {
    registerTokenRefresh(refreshAndGetToken);
  }, [session]);

  return (
    <AuthContext.Provider value={{ isAdmin: !!session, session, loading, login, logout, refreshAndGetToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
