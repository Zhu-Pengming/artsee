"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Landmark,
  Loader2,
  PackageCheck,
  RefreshCw,
  ShieldAlert,
  TimerReset,
  XCircle,
} from "lucide-react";

type PayoutBatchStatus = "draft" | "processing" | "paid" | "failed" | "canceled";

type PayoutBatch = {
  id: string;
  batch_no: string;
  status: PayoutBatchStatus;
  currency: string;
  total_amount: number;
  item_count: number;
  provider?: string | null;
  provider_batch_id?: string | null;
  notes?: string | null;
  created_at?: string | null;
  processed_at?: string | null;
};

type ApiListResponse = {
  success: boolean;
  data: PayoutBatch[];
  count?: number;
  error?: string;
};

const STATUS_OPTIONS: Array<{ value: "all" | PayoutBatchStatus; label: string }> = [
  { value: "draft", label: "草稿" },
  { value: "processing", label: "处理中" },
  { value: "paid", label: "已打款" },
  { value: "failed", label: "失败" },
  { value: "canceled", label: "已取消" },
  { value: "all", label: "全部" },
];

const STATUS_META: Record<PayoutBatchStatus, { label: string; className: string }> = {
  draft: {
    label: "草稿",
    className: "bg-zinc-100 text-zinc-600 ring-zinc-200",
  },
  processing: {
    label: "处理中",
    className: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  },
  paid: {
    label: "已打款",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  failed: {
    label: "失败",
    className: "bg-rose-50 text-rose-700 ring-rose-200",
  },
  canceled: {
    label: "已取消",
    className: "bg-zinc-100 text-zinc-600 ring-zinc-200",
  },
};

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
  return `${id.slice(0, 8)}…${id.slice(-4)}`;
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

function parseIds(value: string) {
  return Array.from(
    new Set(
      value
        .split(/[\s,，]+/)
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
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

export default function AdminPayoutBatchesPage() {
  const [rows, setRows] = useState<PayoutBatch[]>([]);
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState<"all" | PayoutBatchStatus>("draft");
  const [withdrawalIds, setWithdrawalIds] = useState("");
  const [notes, setNotes] = useState("");
  const [providerBatchId, setProviderBatchId] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [actingId, setActingId] = useState("");
  const [error, setError] = useState("");

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        acc.total += row.total_amount;
        acc[row.status] = (acc[row.status] ?? 0) + row.total_amount;
        return acc;
      },
      {
        total: 0,
        draft: 0,
        processing: 0,
        paid: 0,
        failed: 0,
        canceled: 0,
      } as Record<PayoutBatchStatus | "total", number>
    );
  }, [rows]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ limit: "80", offset: "0" });
      if (status !== "all") params.set("status", status);
      const body = await apiFetch<ApiListResponse>(`/api/v1/admin/payout-batches?${params.toString()}`);
      setRows(body.data ?? []);
      setCount(body.count ?? body.data?.length ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function createBatch() {
    const ids = parseIds(withdrawalIds);
    if (ids.length === 0 || creating) return;
    setCreating(true);
    setError("");
    try {
      await apiFetch("/api/v1/admin/payout-batches", {
        method: "POST",
        body: JSON.stringify({
          withdrawal_ids: ids,
          notes: notes.trim() || undefined,
        }),
      });
      setWithdrawalIds("");
      setNotes("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setCreating(false);
    }
  }

  async function processBatch(row: PayoutBatch, nextStatus: PayoutBatchStatus) {
    setActingId(`${row.id}:${nextStatus}`);
    setError("");
    try {
      await apiFetch(`/api/v1/admin/payout-batches/${row.id}/process`, {
        method: "POST",
        body: JSON.stringify({
          status: nextStatus,
          provider_batch_id: providerBatchId.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });
      setProviderBatchId("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setActingId("");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

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
                <Landmark size={20} />
              </span>
              <div>
                <h1 className="text-2xl font-black tracking-normal">打款批次</h1>
                <p className="mt-1 text-sm font-medium text-black/52">
                  将已通过的导师提现申请打包处理，统一追踪批次状态和 provider batch id。
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

        <section className="grid gap-3 md:grid-cols-4">
          <Metric label="当前列表金额" value={price(totals.total)} />
          <Metric label="草稿" value={price(totals.draft)} />
          <Metric label="处理中" value={price(totals.processing)} />
          <Metric label="已打款" value={price(totals.paid)} />
        </section>

        <section className="rounded-lg border border-black/10 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setStatus(option.value)}
                className={`h-9 rounded-lg px-3 text-sm font-bold ring-1 transition ${
                  status === option.value
                    ? "bg-[#003399] text-white ring-[#003399]"
                    : "bg-white text-black/58 ring-black/10 hover:text-[#003399]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="mt-3 grid gap-2 lg:grid-cols-[1fr_1fr_260px]">
            <textarea
              value={withdrawalIds}
              onChange={(event) => setWithdrawalIds(event.target.value)}
              placeholder="粘贴已通过的提现申请 ID，支持换行或逗号分隔"
              className="min-h-20 w-full resize-y rounded-lg border border-black/10 bg-[#f7f5ef] px-3 py-2 text-sm font-medium outline-none focus:border-[#003399]/40"
            />
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="批次备注，可选。处理批次时也会作为通知内容。"
              className="min-h-20 w-full resize-y rounded-lg border border-black/10 bg-[#f7f5ef] px-3 py-2 text-sm font-medium outline-none focus:border-[#003399]/40"
            />
            <div className="flex flex-col gap-2">
              <input
                value={providerBatchId}
                onChange={(event) => setProviderBatchId(event.target.value)}
                placeholder="provider_batch_id，可选"
                className="h-10 w-full rounded-lg border border-black/10 bg-[#f7f5ef] px-3 text-sm font-semibold outline-none focus:border-[#003399]/40"
              />
              <button
                onClick={createBatch}
                disabled={creating || parseIds(withdrawalIds).length === 0}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#003399] px-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating ? <Loader2 size={15} className="animate-spin" /> : <PackageCheck size={15} />}
                创建批次
              </button>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-black/10 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-black/8 px-4 py-3">
            <p className="text-sm font-black">打款批次</p>
            <p className="text-xs font-bold text-black/42">共 {count} 条</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] border-collapse text-left text-sm">
              <thead className="bg-[#f7f5ef] text-xs font-black text-black/48">
                <tr>
                  <th className="px-4 py-3">批次</th>
                  <th className="px-4 py-3">金额</th>
                  <th className="px-4 py-3">项目数</th>
                  <th className="px-4 py-3">状态</th>
                  <th className="px-4 py-3">时间</th>
                  <th className="px-4 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm font-bold text-black/46">
                      <Loader2 size={18} className="mx-auto mb-2 animate-spin text-[#003399]" />
                      正在加载打款批次
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm font-bold text-black/46">
                      当前筛选下暂无打款批次
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id} className="border-t border-black/6 align-middle">
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs font-bold text-black/74">
                          {row.batch_no || compactId(row.id)}
                        </div>
                        <div className="mt-1 max-w-[300px] truncate text-xs font-semibold text-black/42">
                          {row.provider_batch_id || row.notes || compactId(row.id)}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-black text-[#003399]">
                        {price(row.total_amount, row.currency)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-black/58">{row.item_count}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-black/54">
                        <div>创建 {dateText(row.created_at)}</div>
                        <div>处理 {dateText(row.processed_at)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <ActionButton
                            label="处理中"
                            icon={<TimerReset size={14} />}
                            disabled={row.status !== "draft"}
                            loading={actingId === `${row.id}:processing`}
                            onClick={() => processBatch(row, "processing")}
                          />
                          <ActionButton
                            label="已打款"
                            icon={<CheckCircle2 size={14} />}
                            disabled={!["draft", "processing"].includes(row.status)}
                            loading={actingId === `${row.id}:paid`}
                            onClick={() => processBatch(row, "paid")}
                          />
                          <ActionButton
                            label="失败"
                            icon={<XCircle size={14} />}
                            danger
                            disabled={row.status === "paid"}
                            loading={actingId === `${row.id}:failed`}
                            onClick={() => processBatch(row, "failed")}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-black/10 bg-white p-4 shadow-sm">
      <p className="text-xs font-black text-black/38">{label}</p>
      <p className="mt-2 text-xl font-black text-[#1a1a1a]">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: PayoutBatchStatus }) {
  const meta = STATUS_META[status] ?? STATUS_META.draft;
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ring-1 ${meta.className}`}>
      {meta.label}
    </span>
  );
}

function ActionButton({
  label,
  icon,
  disabled,
  loading,
  danger,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-40 ${
        danger
          ? "border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300"
          : "border-black/10 bg-white text-black/68 hover:border-[#003399]/30 hover:text-[#003399]"
      }`}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : icon}
      {label}
    </button>
  );
}
