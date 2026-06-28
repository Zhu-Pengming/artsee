"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldOff,
  UserCog,
  UsersRound,
} from "lucide-react";

type UserStatus = "active" | "banned" | "disabled" | "pending";
type SystemRole = "user" | "admin" | "creator" | "mentor" | "institution";

type AdminUser = {
  id: string;
  nickname?: string | null;
  avatar_url?: string | null;
  role?: SystemRole | string | null;
  status?: UserStatus | string | null;
  is_verified?: boolean | null;
  user_type?: string | null;
  user_role?: string | null;
  creator_level?: string | null;
  content_count?: number | null;
  creator_score?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  last_login_at?: string | null;
  banned_at?: string | null;
  banned_by_user_id?: string | null;
  banned_reason?: string | null;
  admin_note?: string | null;
};

type ApiListResponse = {
  success: boolean;
  data: AdminUser[];
  count?: number;
  error?: string;
};

const STATUS_OPTIONS: Array<{ value: "all" | UserStatus; label: string }> = [
  { value: "all", label: "全部状态" },
  { value: "active", label: "正常" },
  { value: "banned", label: "已封禁" },
  { value: "disabled", label: "已禁用" },
  { value: "pending", label: "待处理" },
];

const ROLE_OPTIONS: Array<{ value: "all" | SystemRole; label: string }> = [
  { value: "all", label: "全部角色" },
  { value: "user", label: "用户" },
  { value: "creator", label: "创作者" },
  { value: "mentor", label: "导师" },
  { value: "institution", label: "机构" },
  { value: "admin", label: "管理员" },
];

const STATUS_META: Record<UserStatus, { label: string; className: string }> = {
  active: {
    label: "正常",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  banned: {
    label: "已封禁",
    className: "bg-rose-50 text-rose-700 ring-rose-200",
  },
  disabled: {
    label: "已禁用",
    className: "bg-zinc-100 text-zinc-600 ring-zinc-200",
  },
  pending: {
    label: "待处理",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
  },
};

function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("artiqore_access_token") || localStorage.getItem("access_token") || "";
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

export default function AdminUsersPage() {
  const [rows, setRows] = useState<AdminUser[]>([]);
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState<"all" | UserStatus>("all");
  const [role, setRole] = useState<"all" | SystemRole>("all");
  const [keyword, setKeyword] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [bannedReason, setBannedReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState("");
  const [error, setError] = useState("");

  const filteredRows = useMemo(() => {
    const word = keyword.trim().toLowerCase();
    if (!word) return rows;
    return rows.filter((row) => {
      return (
        row.id.toLowerCase().includes(word) ||
        (row.nickname ?? "").toLowerCase().includes(word) ||
        (row.user_role ?? "").toLowerCase().includes(word)
      );
    });
  }, [keyword, rows]);

  const metrics = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        acc.total += 1;
        const currentStatus = (row.status || "active") as UserStatus;
        if (currentStatus in acc) acc[currentStatus] += 1;
        return acc;
      },
      { total: 0, active: 0, banned: 0, disabled: 0, pending: 0 } as Record<
        UserStatus | "total",
        number
      >
    );
  }, [rows]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ limit: "80", offset: "0" });
      if (status !== "all") params.set("status", status);
      if (role !== "all") params.set("role", role);
      if (keyword.trim()) params.set("keyword", keyword.trim());
      const body = await apiFetch<ApiListResponse>(`/api/v1/admin/users?${params.toString()}`);
      setRows(body.data ?? []);
      setCount(body.count ?? body.data?.length ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function patchUser(row: AdminUser, patch: Record<string, unknown>, actionKey: string) {
    setActingId(`${row.id}:${actionKey}`);
    setError("");
    try {
      await apiFetch(`/api/v1/admin/users/${row.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...patch,
          admin_note: adminNote.trim() || undefined,
          banned_reason: bannedReason.trim() || undefined,
        }),
      });
      await load();
      setAdminNote("");
      setBannedReason("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setActingId("");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, role]);

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
                <UsersRound size={20} />
              </span>
              <div>
                <h1 className="text-2xl font-black tracking-normal">用户管理</h1>
                <p className="mt-1 text-sm font-medium text-black/52">
                  查看用户画像、系统角色和运营状态。封禁状态会被新版授权层拦截。
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

        <section className="grid gap-3 md:grid-cols-5">
          <Metric label="当前列表" value={`${metrics.total}`} />
          <Metric label="正常" value={`${metrics.active}`} />
          <Metric label="已封禁" value={`${metrics.banned}`} />
          <Metric label="已禁用" value={`${metrics.disabled}`} />
          <Metric label="待处理" value={`${metrics.pending}`} />
        </section>

        <section className="rounded-lg border border-black/10 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
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
            <div className="flex flex-wrap gap-2">
              {ROLE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setRole(option.value)}
                  className={`h-9 rounded-lg px-3 text-sm font-bold ring-1 transition ${
                    role === option.value
                      ? "bg-[#003399] text-white ring-[#003399]"
                      : "bg-white text-black/58 ring-black/10 hover:text-[#003399]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 grid gap-2 lg:grid-cols-[280px_1fr_1fr_auto]">
            <label className="relative">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/34"
              />
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="搜索昵称、ID、画像角色"
                className="h-10 w-full rounded-lg border border-black/10 bg-[#f7f5ef] pl-9 pr-3 text-sm font-semibold outline-none focus:border-[#003399]/40"
              />
            </label>
            <input
              value={bannedReason}
              onChange={(event) => setBannedReason(event.target.value)}
              placeholder="封禁/禁用原因"
              className="h-10 w-full rounded-lg border border-black/10 bg-[#f7f5ef] px-3 text-sm font-semibold outline-none focus:border-[#003399]/40"
            />
            <input
              value={adminNote}
              onChange={(event) => setAdminNote(event.target.value)}
              placeholder="内部备注"
              className="h-10 w-full rounded-lg border border-black/10 bg-[#f7f5ef] px-3 text-sm font-semibold outline-none focus:border-[#003399]/40"
            />
            <button
              onClick={load}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-black/10 bg-white px-3 text-sm font-bold text-black/68 hover:border-[#003399]/30 hover:text-[#003399]"
            >
              <Search size={15} />
              查询
            </button>
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-black/10 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-black/8 px-4 py-3">
            <p className="text-sm font-black">用户列表</p>
            <p className="text-xs font-bold text-black/42">
              API 共 {count} 条，当前显示 {filteredRows.length} 条
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] border-collapse text-left text-sm">
              <thead className="bg-[#f7f5ef] text-xs font-black text-black/48">
                <tr>
                  <th className="px-4 py-3">用户</th>
                  <th className="px-4 py-3">角色</th>
                  <th className="px-4 py-3">画像</th>
                  <th className="px-4 py-3">状态</th>
                  <th className="px-4 py-3">最近登录</th>
                  <th className="px-4 py-3">备注</th>
                  <th className="px-4 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm font-bold text-black/46">
                      <Loader2 size={18} className="mx-auto mb-2 animate-spin text-[#003399]" />
                      正在加载用户
                    </td>
                  </tr>
                ) : filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm font-bold text-black/46">
                      当前筛选下暂无用户
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => (
                    <tr key={row.id} className="border-t border-black/6 align-middle">
                      <td className="px-4 py-3">
                        <div className="font-black text-black/82">{row.nickname || "未命名用户"}</div>
                        <div className="mt-1 font-mono text-[11px] font-semibold text-black/36">
                          {compactId(row.id)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-black/66">{row.role || "user"}</div>
                        <div className="mt-1 text-xs font-semibold text-black/40">
                          {row.is_verified ? "已认证" : "未认证"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-black/62">{row.user_type || "-"}</div>
                        <div className="mt-1 text-xs font-semibold text-black/40">{row.user_role || "-"}</div>
                        <div className="mt-1 text-xs font-semibold text-[#003399]/70">
                          {row.creator_level || "none"} · {row.content_count ?? 0} 篇
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={(row.status || "active") as UserStatus} />
                      </td>
                      <td className="px-4 py-3 font-semibold text-black/54">
                        {dateText(row.last_login_at ?? row.updated_at ?? row.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="max-w-[220px] truncate text-xs font-semibold text-black/46">
                          {row.banned_reason || row.admin_note || "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <ActionButton
                            label="设为管理员"
                            icon={<UserCog size={14} />}
                            disabled={row.role === "admin" || row.role === "super_admin"}
                            loading={actingId === `${row.id}:admin`}
                            onClick={() => patchUser(row, { role: "admin" }, "admin")}
                          />
                          <ActionButton
                            label="设为用户"
                            icon={<UserCog size={14} />}
                            disabled={row.role === "user"}
                            loading={actingId === `${row.id}:user`}
                            onClick={() => patchUser(row, { role: "user" }, "user")}
                          />
                          <ActionButton
                            label="解封"
                            icon={<CheckCircle2 size={14} />}
                            disabled={row.status === "active" || !row.status}
                            loading={actingId === `${row.id}:active`}
                            onClick={() => patchUser(row, { status: "active" }, "active")}
                          />
                          <ActionButton
                            label="封禁"
                            icon={<ShieldOff size={14} />}
                            danger
                            disabled={row.status === "banned"}
                            loading={actingId === `${row.id}:banned`}
                            onClick={() => patchUser(row, { status: "banned" }, "banned")}
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

function StatusBadge({ status }: { status: UserStatus }) {
  const meta = STATUS_META[status] ?? STATUS_META.active;
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
