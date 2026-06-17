"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  ReceiptText,
  Upload,
} from "lucide-react";

type ReconciliationKind = "orders" | "refunds" | "payouts";

type ReconciliationItem = {
  id?: string;
  run_id?: string;
  provider?: string;
  kind?: ReconciliationKind;
  external_id?: string | null;
  matched_entity_type?: string | null;
  matched_entity_id?: string | null;
  status: "matched" | "unmatched" | "mismatch" | "auto_applied";
  resolution_status?: "open" | "resolved" | "ignored";
  resolution_note?: string | null;
  amount?: number | null;
  expected_amount?: number | null;
  currency?: string | null;
  external_status?: string | null;
  error_message?: string | null;
};

type ReconciliationRun = {
  id: string;
  provider: string;
  kind: ReconciliationKind;
  row_count: number;
  matched_count: number;
  unmatched_count: number;
  mismatch_count: number;
  source_name?: string | null;
  created_at?: string | null;
  items?: ReconciliationItem[];
};

type ImportResponse = {
  success: boolean;
  data: ReconciliationRun;
  items: ReconciliationItem[];
  error?: string;
};

type RunListResponse = {
  success: boolean;
  data: ReconciliationRun[];
  count?: number;
  error?: string;
};

type ItemListResponse = {
  success: boolean;
  data: ReconciliationItem[];
  count?: number;
  error?: string;
};

const KIND_OPTIONS: Array<{ value: ReconciliationKind; label: string }> = [
  { value: "orders", label: "订单支付" },
  { value: "refunds", label: "退款" },
  { value: "payouts", label: "导师打款" },
];

const STATUS_META: Record<ReconciliationItem["status"], { label: string; className: string }> = {
  matched: {
    label: "已匹配",
    className: "bg-blue-50 text-blue-700 ring-blue-200",
  },
  auto_applied: {
    label: "已自动核销",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  mismatch: {
    label: "金额不一致",
    className: "bg-rose-50 text-rose-700 ring-rose-200",
  },
  unmatched: {
    label: "未匹配",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
  },
};

function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("artiqore_access_token") || localStorage.getItem("access_token") || "";
}

function price(amount?: number | null, currency = "cny") {
  if (amount == null) return "-";
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

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
}

function parseRows(input: string) {
  const raw = input.trim();
  if (!raw) return [];
  if (raw.startsWith("[") || raw.startsWith("{")) {
    const parsed = JSON.parse(raw) as unknown;
    const rows = Array.isArray(parsed)
      ? parsed
      : typeof parsed === "object" && parsed && Array.isArray((parsed as { rows?: unknown }).rows)
        ? (parsed as { rows: unknown[] }).rows
        : [];
    return rows.filter((row): row is Record<string, unknown> => {
      return Boolean(row) && typeof row === "object" && !Array.isArray(row);
    });
  }

  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]).map((header) => header.trim());
  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    return headers.reduce<Record<string, unknown>>((acc, header, index) => {
      const value = cells[index] ?? "";
      const numeric = Number(value);
      acc[header] = value !== "" && Number.isFinite(numeric) && /^-?\d+$/.test(value) ? numeric : value;
      return acc;
    }, {});
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

export default function AdminReconciliationPage() {
  const [provider, setProvider] = useState("stripe");
  const [kind, setKind] = useState<ReconciliationKind>("orders");
  const [sourceName, setSourceName] = useState("");
  const [payload, setPayload] = useState(
    "provider_payment_intent_id,amount,currency,status\npi_xxx,50000,cny,paid"
  );
  const [submitting, setSubmitting] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [discrepancyLoading, setDiscrepancyLoading] = useState(false);
  const [history, setHistory] = useState<ReconciliationRun[]>([]);
  const [discrepancies, setDiscrepancies] = useState<ReconciliationItem[]>([]);
  const [resolutionNotes, setResolutionNotes] = useState<Record<string, string>>({});
  const [actingDiscrepancyId, setActingDiscrepancyId] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<ImportResponse | null>(null);

  const previewRows = useMemo(() => {
    try {
      return parseRows(payload);
    } catch {
      return [];
    }
  }, [payload]);

  const totals = useMemo(() => {
    const items = result?.items ?? [];
    return items.reduce(
      (acc, item) => {
        acc[item.status] += 1;
        return acc;
      },
      { matched: 0, auto_applied: 0, mismatch: 0, unmatched: 0 } as Record<
        ReconciliationItem["status"],
        number
      >
    );
  }, [result]);

  async function submit() {
    setSubmitting(true);
    setError("");
    try {
      const rows = parseRows(payload);
      if (rows.length === 0) {
        throw new Error("请粘贴至少一行有效数据");
      }
      const body = await apiFetch<ImportResponse>("/api/v1/admin/reconciliation/import", {
        method: "POST",
        body: JSON.stringify({
          provider: provider.trim(),
          kind,
          source_name: sourceName.trim() || undefined,
          rows,
        }),
      });
      setResult(body);
      await loadHistory();
      await loadDiscrepancies();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  }

  async function loadHistory() {
    setHistoryLoading(true);
    try {
      const body = await apiFetch<RunListResponse>(
        "/api/v1/admin/reconciliation/runs?limit=12&include_items=true"
      );
      setHistory(body.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setHistoryLoading(false);
    }
  }

  async function loadDiscrepancies() {
    setDiscrepancyLoading(true);
    try {
      const body = await apiFetch<ItemListResponse>(
        "/api/v1/admin/reconciliation/items?resolution_status=open&status=all&limit=30"
      );
      setDiscrepancies(body.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setDiscrepancyLoading(false);
    }
  }

  async function resolveDiscrepancy(
    item: ReconciliationItem,
    resolutionStatus: "resolved" | "ignored"
  ) {
    if (!item.id) return;
    setActingDiscrepancyId(item.id);
    setError("");
    try {
      await apiFetch<{ success: boolean; data: ReconciliationItem }>(
        `/api/v1/admin/reconciliation/items/${item.id}/resolve`,
        {
          method: "POST",
          body: JSON.stringify({
            resolution_status: resolutionStatus,
            resolution_note: resolutionNotes[item.id] || undefined,
          }),
        }
      );
      setResolutionNotes((current) => {
        const next = { ...current };
        delete next[item.id as string];
        return next;
      });
      await loadDiscrepancies();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setActingDiscrepancyId("");
    }
  }

  useEffect(() => {
    loadHistory();
    loadDiscrepancies();
  }, []);

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
                <ReceiptText size={20} />
              </span>
              <div>
                <h1 className="text-2xl font-black tracking-normal">支付对账</h1>
                <p className="mt-1 text-sm font-medium text-black/52">
                  导入 provider 结算行，匹配订单、退款或打款批次，并自动核销安全匹配项。
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={submit}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#003399] px-4 text-sm font-bold text-white shadow-sm disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            导入对账
          </button>
        </header>

        {error ? (
          <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
            <AlertTriangle size={16} />
            {error}
          </div>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-[380px_1fr]">
          <aside className="rounded-lg border border-black/10 bg-white p-4 shadow-sm">
            <div className="grid gap-3">
              <label className="grid gap-1 text-sm font-bold text-black/70">
                Provider
                <input
                  value={provider}
                  onChange={(event) => setProvider(event.target.value)}
                  className="h-10 rounded-lg border border-black/10 px-3 text-sm font-semibold outline-none focus:border-[#003399]"
                  placeholder="stripe / wechat / bank"
                />
              </label>
              <label className="grid gap-1 text-sm font-bold text-black/70">
                对账类型
                <select
                  value={kind}
                  onChange={(event) => setKind(event.target.value as ReconciliationKind)}
                  className="h-10 rounded-lg border border-black/10 px-3 text-sm font-semibold outline-none focus:border-[#003399]"
                >
                  {KIND_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm font-bold text-black/70">
                来源文件名
                <input
                  value={sourceName}
                  onChange={(event) => setSourceName(event.target.value)}
                  className="h-10 rounded-lg border border-black/10 px-3 text-sm font-semibold outline-none focus:border-[#003399]"
                  placeholder="settlement-2026-06-13.csv"
                />
              </label>
            </div>

            <div className="mt-4 rounded-lg bg-[#f7f5ef] p-3 text-xs font-semibold leading-5 text-black/52">
              订单可用字段：order_id、order_no、provider_payment_intent_id、provider_checkout_session_id。
              退款可用字段：refund_request_id、provider_refund_id。打款可用字段：payout_batch_id、
              provider_batch_id、batch_no。
            </div>
          </aside>

          <main className="rounded-lg border border-black/10 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-base font-black">导入数据</h2>
              <span className="rounded-full bg-black/[0.04] px-3 py-1 text-xs font-bold text-black/48">
                预览 {previewRows.length} 行
              </span>
            </div>
            <textarea
              value={payload}
              onChange={(event) => setPayload(event.target.value)}
              className="min-h-[260px] w-full resize-y rounded-lg border border-black/10 bg-[#fbfaf7] p-3 font-mono text-xs leading-5 outline-none focus:border-[#003399]"
              spellCheck={false}
            />
          </main>
        </section>

        {result ? (
          <section className="flex flex-col gap-4">
            <div className="grid gap-3 md:grid-cols-4">
              {[
                ["已自动核销", totals.auto_applied, "text-emerald-700"],
                ["已匹配", totals.matched, "text-blue-700"],
                ["金额不一致", totals.mismatch, "text-rose-700"],
                ["未匹配", totals.unmatched, "text-amber-700"],
              ].map(([label, value, color]) => (
                <div key={label} className="rounded-lg border border-black/10 bg-white p-4 shadow-sm">
                  <p className="text-xs font-bold text-black/44">{label}</p>
                  <p className={`mt-2 text-2xl font-black ${color}`}>{value}</p>
                </div>
              ))}
            </div>

            <div className="overflow-hidden rounded-lg border border-black/10 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-black/8 px-4 py-3">
                <CheckCircle2 size={17} className="text-[#003399]" />
                <h2 className="text-base font-black">
                  导入结果 · {result.data.row_count} 行 · {compactId(result.data.id)}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-black/[0.03] text-xs font-black text-black/48">
                    <tr>
                      <th className="px-4 py-3">状态</th>
                      <th className="px-4 py-3">外部 ID</th>
                      <th className="px-4 py-3">匹配对象</th>
                      <th className="px-4 py-3">金额</th>
                      <th className="px-4 py-3">预期金额</th>
                      <th className="px-4 py-3">外部状态</th>
                      <th className="px-4 py-3">备注</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/8">
                    {result.items.map((item, index) => {
                      const meta = STATUS_META[item.status];
                      return (
                        <tr key={item.id ?? `${item.external_id ?? "row"}-${index}`}>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2 py-1 text-xs font-black ring-1 ${meta.className}`}>
                              {meta.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-black/62">
                            {compactId(item.external_id)}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-black/62">
                            {item.matched_entity_type ?? "-"} · {compactId(item.matched_entity_id)}
                          </td>
                          <td className="px-4 py-3 font-bold">
                            {price(item.amount, item.currency ?? "cny")}
                          </td>
                          <td className="px-4 py-3 font-bold">
                            {price(item.expected_amount, item.currency ?? "cny")}
                          </td>
                          <td className="px-4 py-3 text-black/56">{item.external_status || "-"}</td>
                          <td className="px-4 py-3 text-black/56">{item.error_message || "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ) : null}

        <section className="rounded-lg border border-black/10 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-black/8 px-4 py-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-base font-black">待处理差异</h2>
              <p className="mt-1 text-xs font-semibold text-black/44">
                金额不一致或未匹配的对账行需要人工核实后标记，处理记录会进入操作审计。
              </p>
            </div>
            <button
              onClick={loadDiscrepancies}
              className="inline-flex h-8 items-center justify-center rounded-lg border border-black/10 px-3 text-xs font-bold text-black/56 hover:border-[#003399]/30 hover:text-[#003399]"
              disabled={discrepancyLoading}
            >
              {discrepancyLoading ? "刷新中" : "刷新差异"}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] text-left text-sm">
              <thead className="bg-black/[0.03] text-xs font-black text-black/48">
                <tr>
                  <th className="px-4 py-3">状态</th>
                  <th className="px-4 py-3">Provider / 类型</th>
                  <th className="px-4 py-3">外部 ID</th>
                  <th className="px-4 py-3">匹配对象</th>
                  <th className="px-4 py-3">金额</th>
                  <th className="px-4 py-3">预期金额</th>
                  <th className="px-4 py-3">备注</th>
                  <th className="px-4 py-3">处理说明</th>
                  <th className="px-4 py-3">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/8">
                {discrepancies.map((item) => {
                  const meta = STATUS_META[item.status];
                  const itemId = item.id ?? "";
                  const acting = actingDiscrepancyId === itemId;
                  return (
                    <tr key={itemId || `${item.external_id}-${item.status}`}>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-black ring-1 ${meta.className}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold">{item.provider || "-"}</div>
                        <div className="mt-1 text-xs font-semibold text-black/44">
                          {KIND_OPTIONS.find((option) => option.value === item.kind)?.label ?? item.kind ?? "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-black/62">
                        {compactId(item.external_id)}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-black/62">
                        {item.matched_entity_type ?? "-"} · {compactId(item.matched_entity_id)}
                      </td>
                      <td className="px-4 py-3 font-bold">
                        {price(item.amount, item.currency ?? "cny")}
                      </td>
                      <td className="px-4 py-3 font-bold">
                        {price(item.expected_amount, item.currency ?? "cny")}
                      </td>
                      <td className="px-4 py-3 text-black/56">{item.error_message || "-"}</td>
                      <td className="px-4 py-3">
                        <input
                          value={resolutionNotes[itemId] ?? ""}
                          onChange={(event) =>
                            setResolutionNotes((current) => ({
                              ...current,
                              [itemId]: event.target.value,
                            }))
                          }
                          className="h-9 w-56 rounded-lg border border-black/10 px-3 text-xs font-semibold outline-none focus:border-[#003399]"
                          placeholder="补充核实结果"
                          disabled={!itemId || acting}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => resolveDiscrepancy(item, "resolved")}
                            className="inline-flex h-8 items-center justify-center rounded-lg bg-[#003399] px-3 text-xs font-bold text-white disabled:opacity-50"
                            disabled={!itemId || acting}
                          >
                            {acting ? "处理中" : "已解决"}
                          </button>
                          <button
                            onClick={() => resolveDiscrepancy(item, "ignored")}
                            className="inline-flex h-8 items-center justify-center rounded-lg border border-black/10 px-3 text-xs font-bold text-black/56 hover:border-black/20 disabled:opacity-50"
                            disabled={!itemId || acting}
                          >
                            忽略
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {discrepancies.length === 0 && !discrepancyLoading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-sm font-bold text-black/36">
                      暂无待处理差异
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-lg border border-black/10 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-black/8 px-4 py-3">
            <h2 className="text-base font-black">最近导入</h2>
            <button
              onClick={loadHistory}
              className="inline-flex h-8 items-center justify-center rounded-lg border border-black/10 px-3 text-xs font-bold text-black/56 hover:border-[#003399]/30 hover:text-[#003399]"
              disabled={historyLoading}
            >
              {historyLoading ? "刷新中" : "刷新"}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-black/[0.03] text-xs font-black text-black/48">
                <tr>
                  <th className="px-4 py-3">时间</th>
                  <th className="px-4 py-3">Provider</th>
                  <th className="px-4 py-3">类型</th>
                  <th className="px-4 py-3">来源</th>
                  <th className="px-4 py-3">行数</th>
                  <th className="px-4 py-3">已匹配</th>
                  <th className="px-4 py-3">差异</th>
                  <th className="px-4 py-3">未匹配</th>
                  <th className="px-4 py-3">ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/8">
                {history.map((run) => (
                  <tr key={run.id}>
                    <td className="px-4 py-3 text-black/56">{dateText(run.created_at)}</td>
                    <td className="px-4 py-3 font-bold">{run.provider}</td>
                    <td className="px-4 py-3 text-black/56">
                      {KIND_OPTIONS.find((option) => option.value === run.kind)?.label ?? run.kind}
                    </td>
                    <td className="px-4 py-3 text-black/56">{run.source_name || "-"}</td>
                    <td className="px-4 py-3 font-bold">{run.row_count}</td>
                    <td className="px-4 py-3 font-bold text-blue-700">{run.matched_count}</td>
                    <td className="px-4 py-3 font-bold text-rose-700">{run.mismatch_count}</td>
                    <td className="px-4 py-3 font-bold text-amber-700">{run.unmatched_count}</td>
                    <td className="px-4 py-3 font-mono text-xs text-black/48">{compactId(run.id)}</td>
                  </tr>
                ))}
                {history.length === 0 && !historyLoading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-sm font-bold text-black/36">
                      暂无导入记录
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
