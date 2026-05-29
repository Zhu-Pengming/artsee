// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { authApi, UserProfile } from '../services/apiClient';

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      setLoading(true);
      const profile = await authApi.getProfile();
      setUser(profile);
      setError(null);
    } catch (err: any) {
      if (err?.code !== 401) {
        setError(err?.message || '加载用户信息失败');
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    try {
      setLoading(true);
      setError(null);
      const result = await authApi.login({ email, password });
      setUser(result.user);
      return result;
    } catch (err: any) {
      const message = err?.message || '登录失败';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }

  async function signup(email: string, password: string, nickname: string) {
    try {
      setLoading(true);
      setError(null);
      const result = await authApi.signup({ email, password, nickname });
      setUser(result.user);
      return result;
    } catch (err: any) {
      const message = err?.message || '注册失败';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }

  async function devLogin() {
    try {
      setLoading(true);
      setError(null);
      const result = await authApi.devLogin();
      setUser(result.user);
      return result;
    } catch (err: any) {
      const message = err?.message || '开发者登录失败';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile(data: Partial<UserProfile>) {
    try {
      setLoading(true);
      setError(null);
      const updated = await authApi.updateProfile(data);
      setUser(updated);
      return updated;
    } catch (err: any) {
      const message = err?.message || '更新资料失败';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    authApi.logout();
    setUser(null);
    setError(null);
  }

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    signup,
    devLogin,
    updateProfile,
    logout,
    refresh: loadUser,
  };
}
