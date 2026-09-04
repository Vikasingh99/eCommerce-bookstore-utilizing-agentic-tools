'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const ACCESS_TOKEN_KEY = 'bookstore_access_token';
const REFRESH_TOKEN_COOKIE = 'bookstore_refresh_token';

// ── Token helpers (safe to call on client only) ───────────────────────────────

export function getAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function removeAccessToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + REFRESH_TOKEN_COOKIE + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setRefreshToken(token) {
  if (typeof document === 'undefined') return;
  const maxAge = 7 * 24 * 60 * 60; // 7 days
  document.cookie = `${REFRESH_TOKEN_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Strict`;
}

export function removeRefreshToken() {
  if (typeof document === 'undefined') return;
  document.cookie = `${REFRESH_TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Strict`;
}

// ── Decode a non-expired JWT payload → user object, or null ──────────────────

function decodeUser(token) {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 > Date.now()) {
      return { id: payload.userId, name: payload.name, email: payload.email };
    }
    return null;
  } catch {
    return null;
  }
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  // Start as loading=true so we never flash the logged-out navbar on refresh
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // After hydration: read token from localStorage and resolve user
  useEffect(() => {
    const token = getAccessToken();
    const resolved = decodeUser(token);
    if (!resolved) {
      // Token missing or expired — clean up storage
      removeAccessToken();
      removeRefreshToken();
    }
    setUser(resolved);
    setLoading(false);
  }, []);

  const login = useCallback((data) => {
    setAccessToken(data.accessToken);
    if (data.refreshToken) setRefreshToken(data.refreshToken);
    const resolved = decodeUser(data.accessToken) || data.user || null;
    setUser(resolved);
  }, []);

  const logout = useCallback(() => {
    removeAccessToken();
    removeRefreshToken();
    setUser(null);
  }, []);

  const updateUser = useCallback((userData) => {
    setUser(userData);
  }, []);

  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
