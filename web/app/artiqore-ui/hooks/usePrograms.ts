// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { programsApi } from '../services/apiClient';

export function usePrograms(params?: { limit?: number; offset?: number; keyword?: string }) {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPrograms();
  }, [params?.keyword]);

  async function loadPrograms() {
    try {
      setLoading(true);
      setError(null);
      const data = await programsApi.list(params);
      setPrograms(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || '加载专业失败');
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  }

  return {
    programs,
    loading,
    error,
    refresh: loadPrograms,
  };
}

export function useProgramDetail(id: string | null) {
  const [program, setProgram] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setProgram(null);
      return;
    }
    loadProgram(id);
  }, [id]);

  async function loadProgram(programId: string) {
    try {
      setLoading(true);
      setError(null);
      const data = await programsApi.getDetail(programId);
      setProgram(data);
    } catch (err: any) {
      setError(err?.message || '加载专业详情失败');
      setProgram(null);
    } finally {
      setLoading(false);
    }
  }

  return {
    program,
    loading,
    error,
    refresh: () => id && loadProgram(id),
  };
}
