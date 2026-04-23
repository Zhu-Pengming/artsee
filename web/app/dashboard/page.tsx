"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface HomeContent {
  id: string;
  section_type: "hero_banner" | "hot_hall" | "recent_exhibition";
  title: string;
  subtitle: string | null;
  image_url: string | null;
  link_url: string | null;
  link_text: string | null;
  badge: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const SECTION_LABELS: Record<string, string> = {
  hero_banner: "主视觉 Banner",
  hot_hall: "热门展厅",
  recent_exhibition: "近期展会",
};

const EMPTY_FORM: Omit<HomeContent, "id" | "created_at" | "updated_at"> = {
  section_type: "hot_hall",
  title: "",
  subtitle: "",
  image_url: "",
  link_url: "",
  link_text: "",
  badge: "",
  display_order: 0,
  is_active: true,
};

const menuItems = [
  { icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", label: "首页", href: "/dashboard" },
  { icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z", label: "作品集", href: "#" },
  { icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", label: "艺术家", href: "#" },
  { icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10", label: "收藏", href: "#" },
  { icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z", label: "设置", href: "#" },
];

export default function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 首页内容管理状态
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [items, setItems] = useState<HomeContent[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<HomeContent>>({ ...EMPTY_FORM });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user?.email) {
        setLoading(false);
        return;
      }
      setEmail(user.email);
      setToken(session?.access_token || null);
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      if (cancelled) return;
      setIsAdmin(profile?.role === "admin");
      if (profile?.role === "admin") {
        await loadItems();
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function loadItems() {
    try {
      setFetchError(null);
      const res = await fetch("/api/v1/home-contents?limit=100&include_inactive=true");
      const json = await res.json();
      if (!json.success) {
        setFetchError(json.error || "加载失败");
        return;
      }
      setItems(json.data || []);
    } catch (e: unknown) {
      setFetchError(e instanceof Error ? e.message : String(e));
    }
  }

  async function apiRequest(method: string, path: string, body?: unknown) {
    if (!token) throw new Error("未获取到 access_token，请重新登录");
    const res = await fetch(path, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || "请求失败");
    }
    return json;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setSaveError(null);
    try {
      const payload = {
        section_type: form.section_type,
        title: form.title || "",
        subtitle: form.subtitle || null,
        image_url: form.image_url || null,
        link_url: form.link_url || null,
        link_text: form.link_text || null,
        badge: form.badge || null,
        display_order: Number(form.display_order ?? 0),
        is_active: form.is_active ?? true,
      };
      if (editingId) {
        await apiRequest("PATCH", `/api/v1/home-contents/${editingId}`, payload);
      } else {
        await apiRequest("POST", "/api/v1/home-contents", payload);
      }
      setForm({ ...EMPTY_FORM });
      setEditingId(null);
      await loadItems();
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("确定删除这条内容吗？此操作不可撤销。")) return;
    if (!token) return;
    try {
      await apiRequest("DELETE", `/api/v1/home-contents/${id}`);
      await loadItems();
    } catch (e: unknown) {
      alert("删除失败：" + (e instanceof Error ? e.message : String(e)));
    }
  }

  function startEdit(item: HomeContent) {
    setForm({ ...item });
    setEditingId(item.id);
    setSaveError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setSaveError(null);
  }

  const grouped = items.reduce<Record<string, HomeContent[]>>((acc, item) => {
    const key = item.section_type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  // 未登录提示
  if (!loading && !email) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-6 px-6">
        <h1 className="text-2xl font-bold text-on-surface">Dashboard</h1>
        <p className="text-on-surface-variant text-center max-w-md">请先使用管理员账号登录后再访问。</p>
        <Link
          href="/auth/login?redirect=/dashboard"
          className="px-6 py-2.5 rounded-full bg-[#003399] text-white text-sm font-semibold"
        >
          去登录
        </Link>
      </div>
    );
  }

  // 非管理员提示
  if (!loading && !isAdmin) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4 px-6">
        <h1 className="text-2xl font-bold text-on-surface">Dashboard</h1>
        <p className="text-on-surface-variant text-center max-w-lg">
          当前账号 <span className="font-mono">{email}</span> 不是管理员，无法访问管理后台。
        </p>
        <Link href="/" className="text-al-cobalt text-sm underline">
          返回首页
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex">
      {/* 侧边栏 */}
      <aside
        className={`bg-porcelain-blue-dark text-porcelain-white flex flex-col transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Logo 区域 */}
        <div className="h-16 flex items-center px-4 border-b border-porcelain-white/10">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-porcelain-blue-pale to-porcelain-white flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-porcelain-blue-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <span
              className={`text-lg font-bold tracking-wide whitespace-nowrap transition-all duration-300 ${
                sidebarCollapsed ? "opacity-0 w-0" : "opacity-100"
              }`}
            >
              艺见心
            </span>
          </div>
        </div>

        {/* 菜单项 */}
        <nav className="flex-1 py-4">
          {menuItems.map((item, index) => {
            const isActive = item.href === "/dashboard";
            return (
              <Link
                key={index}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 group ${
                  isActive
                    ? "bg-surface/10 text-porcelain-white"
                    : "text-porcelain-white/80 hover:text-porcelain-white hover:bg-surface/10"
                }`}
                title={sidebarCollapsed ? item.label : ""}
              >
                <svg
                  className="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                </svg>
                <span
                  className={`whitespace-nowrap transition-all duration-300 ${
                    sidebarCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* 收起/展开按钮 */}
        <div className="p-4 border-t border-porcelain-white/10">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-surface/10 hover:bg-surface/20 transition-all duration-200 group"
            title={sidebarCollapsed ? "展开" : "收起"}
          >
            <svg
              className={`w-5 h-5 transition-transform duration-300 ${
                sidebarCollapsed ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            <span
              className={`text-sm whitespace-nowrap transition-all duration-300 ${
                sidebarCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
              }`}
            >
              收起侧边栏
            </span>
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        <main className="flex-1 p-6">
          {/* 页面标题 */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-on-surface">首页内容管理</h1>
            <p className="text-on-surface-variant text-sm mt-1">
              管理 App 首页的主视觉 Banner、热门展厅、近期展会等内容。
            </p>
          </div>

          {/* 编辑表单 */}
          <section className="mb-10 rounded-2xl border border-outline-variant/10 bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">
              {editingId ? "编辑内容" : "新建内容"}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">板块类型</label>
                  <select
                    className="w-full rounded-lg border border-outline-variant/30 bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-al-cobalt"
                    value={form.section_type || "hot_hall"}
                    onChange={(e) => setForm({ ...form, section_type: e.target.value as any })}
                  >
                    <option value="hero_banner">主视觉 Banner</option>
                    <option value="hot_hall">热门展厅</option>
                    <option value="recent_exhibition">近期展会</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">排序权重</label>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-outline-variant/30 bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-al-cobalt"
                    value={form.display_order ?? 0}
                    onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">标题 *</label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-lg border border-outline-variant/30 bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-al-cobalt"
                    value={form.title || ""}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder={form.section_type === "hero_banner" ? "灵感碎片的万合\n青花新境" : "展览标题"}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">副标题 / 标签</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-outline-variant/30 bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-al-cobalt"
                    value={form.subtitle || ""}
                    onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                    placeholder={form.section_type === "hero_banner" ? "SPECIAL / 陶瓷重构专场" : "副标题（可选）"}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">图片 URL</label>
                  <input
                    type="url"
                    className="w-full rounded-lg border border-outline-variant/30 bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-al-cobalt"
                    value={form.image_url || ""}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">链接 URL</label>
                  <input
                    type="url"
                    className="w-full rounded-lg border border-outline-variant/30 bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-al-cobalt"
                    value={form.link_url || ""}
                    onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">链接文字</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-outline-variant/30 bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-al-cobalt"
                    value={form.link_text || ""}
                    onChange={(e) => setForm({ ...form, link_text: e.target.value })}
                    placeholder={form.section_type === "hero_banner" ? "立即观展 (Virtual Access)" : "按钮文字"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">角标文字</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-outline-variant/30 bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-al-cobalt"
                    value={form.badge || ""}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    placeholder="如：LIVE NOW"
                  />
                </div>
                <div className="flex items-center gap-2 h-full pt-6">
                  <input
                    id="is_active"
                    type="checkbox"
                    className="h-4 w-4 rounded border-outline-variant/30 text-al-cobalt focus:ring-al-cobalt"
                    checked={form.is_active ?? true}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  />
                  <label htmlFor="is_active" className="text-sm">
                    启用展示
                  </label>
                </div>
              </div>
              {saveError && (
                <p className="text-sm text-red-600 dark:text-red-400">{saveError}</p>
              )}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-[#003399] text-white text-sm font-semibold disabled:opacity-50"
                >
                  {saving ? "保存中…" : editingId ? "更新内容" : "创建内容"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-5 py-2 rounded-lg border border-outline-variant/30 text-sm"
                  >
                    取消编辑
                  </button>
                )}
              </div>
            </form>
          </section>

          {/* 内容列表 */}
          {fetchError && (
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">加载失败：{fetchError}</p>
          )}

          {Object.entries(grouped).map(([sectionType, sectionItems]) => (
            <section key={sectionType} className="mb-8">
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-al-cobalt" />
                {SECTION_LABELS[sectionType] || sectionType}
                <span className="text-xs font-normal text-on-surface-variant">({sectionItems.length} 条)</span>
              </h3>
              <div className="space-y-3">
                {sectionItems.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-xl border p-4 flex gap-4 items-start ${
                      item.is_active
                        ? "border-outline-variant/10 bg-card"
                        : "border-outline-variant/5 bg-surface opacity-60"
                    }`}
                  >
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-semibold truncate">{item.title}</h4>
                        {item.badge && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-al-cobalt/10 text-al-cobalt font-medium">
                            {item.badge}
                          </span>
                        )}
                        {!item.is_active && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant">
                            已停用
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <p className="text-xs text-on-surface-variant mt-0.5 truncate">{item.subtitle}</p>
                      )}
                      {item.image_url && (
                        <p className="text-[11px] text-on-surface-variant/60 mt-0.5 truncate">{item.image_url}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          onClick={() => startEdit(item)}
                          className="text-xs text-al-cobalt underline"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-xs text-red-600 dark:text-red-400 underline"
                        >
                          删除
                        </button>
                        <span className="text-[11px] text-on-surface-variant/50">
                          排序: {item.display_order}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

          {items.length === 0 && !fetchError && (
            <p className="text-sm text-on-surface-variant text-center py-10">暂无内容，请在上方创建。</p>
          )}
        </main>
      </div>
    </div>
  );
}
