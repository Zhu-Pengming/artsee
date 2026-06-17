"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpenCheck,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
} from "lucide-react";

type LedgerEntry = {
  id: string;
  entry_type: string;
  account: string;
  source_type: string;
  source_id: string;
  order_id?: string | null;
  user_id?: string | null;
  mentor_id?: string | null;
  amount: number;
  currency: string;
  occurred_at?: string | null;
  created_at?: string | null;
};

type ApiListResponse = {
  success: boolean;
  data: LedgerEntry[];
  count?: number;
  error?: string;
};

const ACCOUNT_OPTIONS = [
  { value: "all", label: "全部科目" },
  { value: "cash", label: "现金入账" },
  { value: "platform_fee_revenue", label: "平台服务费" },
  { value: "mentor_payable", label: "导师应付" },
  { value: "refunds", label: "退款" },
  { value: "payouts", label: "打款" },
];

const ENTRY_OPTIONS = [
  { value: "all", label: "全部类型" },
  { value: "order_payment_gross", label: "订单支付" },
  { value: "platform_fee_accrual", label: "平台服务费确认" },
  { value: "mentor_earning_accrual", label: "导师收益确认" },
  { value: "order_refund_gross", label: "订单退款" },
  { value: "mentor_earning_reversal", label: "导师收益冲销" },
  { value: "payout_paid", label: "导师打款" },
];

function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("artiqore_access_token") || localStorage.getItem("access_token") || "";
}

function price(amount: number, currency = "cny") {
  const symbol = currency.toLowerCase() === "cny" ? "¥" : `${currency.toUpperCase()} `;
  return `${symbol}${(amount / 100).toLocaleString("zh-CN", {
    minimumFractionDigits: amount % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function compactId(id?: string | null) {
  if (!id) return "-";
  return id.length > 18 ? `${id.slice(0, 8)}…${id.slice(-6)}` : id;
}

function dateText(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  const body = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok || body.error) {
    throw new Error(body.error || `请求失败 ${res.status}`);
  }
  return body as T;
}

export default function AdminLedgerPage() {
  const [rows, setRows] = useState<LedgerEntry[]>([]);
  const [count, setCount] = useState(0);
  const [account, setAccount] = useState("all");
  const [entryType, setEntryType] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const filteredRows = useMemo(() => {
    const word = keyword.trim().toLowerCase();
    if (!word) return rows;
    return rows.filter((row) => {
      return (
        row.entry_type.toLowerCase().includes(word) ||
        row.account.toLowerCase().includes(word) ||
        row.source_type.toLowerCase().includes(word) ||
        row.source_id.toLowerCase().includes(word) ||
        (row.order_id ?? "").toLowerCase().includes(word) ||
        (row.mentor_id ?? "").toLowerCase().includes(word)
      );
    });
  }, [keyword, rows]);

  const totalAmount = useMemo(() => {
    return filteredRows.reduce((sum, row) => sum + row.amount, 0);
  }, [filteredRows]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ limit: "100", offset: "0" });
      if (account !== "all") params.set("account", account);
      if (entryType !== "all") params.set("entry_type", entryType);
      const body = await apiFetch<ApiListResponse>(`/api/v1/admin/ledger?${params.toString()}`);
      setRows(body.data ?? []);
      setCount(body.count ?? body.data?.length ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, entryType]);

  return (
    <div className="min-h-screen bg-[#f7f5ef] px-4 py-5 text-[#1a1a1a] md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <header className="flex flex-col gap-4 border-b border-black/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/admin"
              className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-black/48 hover:text-[#003399]"
            >
              <ArrowLeft size={16} />
              运营后台
            </Link>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#003399]/8 text-[#003399]">
                <BookOpenCheck size={20} />
              </span>
              <div>
                <h1 className="text-2xl font-black tracking-normal">资金流水</h1>
                <p className="mt-1 text-sm font-medium text-black/52">
                  查看订单支付、平台服务费、导师收益、退款和打款的科目级流水。
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={load}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#003399] px-4 text-sm font-bold text-white shadow-sm disabled:opacity-60"
            disabled={loading}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            刷新
          </button>
        </header>

        {error ? (
          <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
            <ShieldAlert size={16} />
            {error}
          </div>
        ) : null}

        <section className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-black/10 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold text-black/44">当前列表</p>
            <p className="mt-2 text-2xl font-black text-[#003399]">{filteredRows.length}</p>
          </div>
          <div className="rounded-lg border border-black/10 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold text-black/44">金额合计</p>
            <p className="mt-2 text-2xl font-black text-[#003399]">{price(totalAmount)}</p>
          </div>
          <div className="rounded-lg border border-black/10 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold text-black/44">总记录</p>
            <p className="mt-2 text-2xl font-black text-[#003399]">{count}</p>
          </div>
        </section>

        <section className="grid gap-3 rounded-lg border border-black/10 bg-white p-4 shadow-sm lg:grid-cols-[220px_240px_1fr]">
          <select
            value={account}
            onChange={(event) => setAccount(event.target.value)}
            className="h-10 rounded-lg border border-black/10 px-3 text-sm font-bold outline-none focus:border-[#003399]"
          >
            {ACCOUNT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={entryType}
            onChange={(event) => setEntryType(event.target.value)}
            className="h-10 rounded-lg border border-black/10 px-3 text-sm font-bold outline-none focus:border-[#003399]"
          >
            {ENTRY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <label className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/34"
            />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              className="h-10 w-full rounded-lg border border-black/10 pl-9 pr-3 text-sm font-semibold outline-none focus:border-[#003399]"
              placeholder="搜索订单、导师、来源或科目"
            />
          </label>
        </section>

        <section className="overflow-hidden rounded-lg border border-black/10 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-black/[0.03] text-xs font-black text-black/48">
                <tr>
                  <th className="px-4 py-3">时间</th>
                  <th className="px-4 py-3">科目</th>
                  <th className="px-4 py-3">类型</th>
                  <th className="px-4 py-3">金额</th>
                  <th className="px-4 py-3">来源</th>
                  <th className="px-4 py-3">订单</th>
                  <th className="px-4 py-3">导师</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/8">
                {filteredRows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3 text-black/56">{dateText(row.occurred_at ?? row.created_at)}</td>
                    <td className="px-4 py-3 font-bold">{row.account}</td>
                    <td className="px-4 py-3 font-mono text-xs text-black/58">{row.entry_type}</td>
                    <td className="px-4 py-3 font-black">{price(row.amount, row.currency)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-black/48">
                      {row.source_type} · {compactId(row.source_id)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-black/48">{compactId(row.order_id)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-black/48">{compactId(row.mentor_id)}</td>
                  </tr>
                ))}
                {filteredRows.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm font-bold text-black/36">
                      暂无资金流水
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
