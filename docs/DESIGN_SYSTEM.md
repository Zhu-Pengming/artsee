# ArtSee 青花配色 - 浅色霁风 设计系统

> 灵感来源：中国传统青花瓷"浅色霁风"配色，融合山水画意境

---

## 设计灵感

本设计系统以中国传统**青花瓷"浅色霁风"**为灵感，融合山水画意境，打造出清新淡雅、富有东方美学韵味的视觉体验。

**核心意象**：
- 雨后初霁，远山如黛
- 青花淡雅，水墨意境
- 留白艺术，呼吸感强

---

## 🎨 色彩方案

### 青花配色主色系列

| 名称 | 色值 | 用途 |
|------|------|------|
| **珠明料** | `#183b90` | 最深强调、hover状态、深色模式主色 |
| **元子** | `#425691` | 深色强调、次级按钮、渐变起点 |
| **平等青** | `#4074b1` | 主色调、主要按钮、链接、图标 |
| **浅平等青** | `#5A8FC9` | hover状态、高亮 |
| **霁蓝** | `#A8C4E0` | 装饰元素、分隔线、背景装饰、浅色强调 |
| **极浅蓝** | `#D4E4F0` | 极淡背景、hover背景 |

### 青花配色背景系列（高白泥）

| 名称 | 色值 | 用途 |
|------|------|------|
| **高白泥** | `#f2f0e9` | 主背景色、页面底色（米白色） |
| **浅白泥** | `#E8E6DF` | 次要背景、输入框背景 |
| **奶油白** | `#DEDCD5` | 装饰色、分隔线、边框 |
| **纯白** | `#FFFFFF` | 卡片背景、弹窗 |

### 青花配色文字系列

| 名称 | 色值 | 用途 |
|------|------|------|
| **墨黑** | `#1A2332` | 主标题、重要文字 |
| **灰黑** | `#3A4A5C` | 次要文字、描述 |
| **浅灰** | `#6A7A8C` | 提示文字、placeholder |
| **更浅灰** | `#9AA8B8` | 禁用状态、最淡文字 |

### 辅助色

| 名称 | 色值 | 用途 |
|------|------|------|
| **边框灰** | `#D4D2CB` | 边框、分割线 |
| **危险红** | `#B85C5C` | 错误提示、删除操作 |
| **成功绿** | `#5C8B7A` | 成功提示 |
| **警告橙** | `#B89A5C` | 警告提示 |

---

## 🔤 字体系统

### 中文字体

采用**清雅宋体**风格字体栈：

```css
font-family: 
  "Noto Sans SC",      /* Google 思源黑体 - 主字体 */
  "Source Han Sans SC", /* Adobe 思源黑体 */
  "PingFang SC",       /* 苹果苹方 */
  "Microsoft YaHei",   /* 微软雅黑 */
  "Hiragino Sans GB",  /* 冬青黑体 */
  sans-serif;
```

### 字体规格

| 层级 | 大小 | 字重 | 行高 | 字间距 | 用途 |
|------|------|------|------|--------|------|
| Display L | 56px | 600 | 1.15 | -0.02em | 超大标题 |
| Display M | 44px | 600 | 1.2 | 0 | 大标题 |
| Display S | 36px | 600 | 1.25 | 0 | 中标题 |
| Headline L | 32px | 600 | 1.3 | 0.01em | 页面标题 |
| Headline M | 28px | 600 | 1.35 | 0.01em | 区块标题 |
| Headline S | 24px | 600 | 1.4 | 0.01em | 小标题 |
| Title L | 20px | 500 | 1.4 | 0.01em | 卡片标题 |
| Title M | 16px | 500 | 1.5 | 0.01em | 列表标题 |
| Title S | 14px | 500 | 1.45 | 0.01em | 小标签 |
| Body L | 16px | 400 | 1.6 | 0.01em | 正文 |
| Body M | 14px | 400 | 1.55 | 0.01em | 次要正文 |
| Body S | 12px | 400 | 1.5 | 0.01em | 注释 |

---

## 🧩 组件样式

### 按钮

**主要按钮 (Primary Button)**
- 背景：`#4074b1`（平等青）
- 文字：`#FFFFFF`
- 圆角：12px
- 内边距：14px 28px
- 阴影：`0 4px 20px rgba(64, 116, 177, 0.10)`
- 悬停：背景变亮至 `#5A8FC9`

**深色按钮 (Dark Button)**
- 背景：`#425691`（元子）
- 文字：`#FFFFFF`
- 圆角：12px
- 悬停：背景变深至 `#183b90`

**描边按钮 (Outlined Button)**
- 边框：1.5px solid `#4074b1`
- 文字：`#4074b1`
- 背景：透明
- 悬停：背景添加 `#D4E4F0`

**幽灵按钮 (Ghost Button)**
- 背景：透明
- 文字：`#4074b1`
- 悬停：背景 `#D4E4F0`

### 卡片

**标准卡片**
- 背景：`#FFFFFF`
- 圆角：16px
- 阴影：`0 4px 20px rgba(64, 116, 177, 0.10)`
- 内边距：24px
- 边框：无（或 1px `#DEDCD5`）

**渐变卡片**
- 背景：渐变从 `#183b90` 到 `#4074b1`
- 文字：`#FFFFFF`
- 圆角：16px
- 阴影：`0 8px 40px rgba(64, 116, 177, 0.14)`

**玻璃卡片**
- 背景：`rgba(255, 255, 255, 0.75)`
- 背景模糊：16px
- 边框：1px `rgba(255, 255, 255, 0.6)`
- 圆角：16px

### 输入框

- 背景：`#E8E6DF`（浅白泥）
- 边框：无（或聚焦时 2px `#4074b1`）
- 圆角：12px
- 聚焦边框：`#4074b1` (2px)
- 内边距：14px 18px
- placeholder颜色：`#6A7A8C`

### 导航栏

- 背景：`#f2f0e9`（高白泥）/ 白色
- 文字：`#1A2332`
- 高度：64px
- 选中项：`#4074b1`
- 未选中项：`#6A7A8C`

---

## ✨ 特效与渐变

### 青花主渐变

```css
background: linear-gradient(135deg, #183b90 0%, #425691 25%, #4074b1 100%);
```

### 柔和渐变

```css
background: linear-gradient(135deg, #4074b1 0%, #A8C4E0 100%);
```

### 山水意境渐变（雾气效果）

```css
background: linear-gradient(180deg, rgba(64, 116, 177, 0.08) 0%, transparent 100%);
```

### 高白泥渐变

```css
background: linear-gradient(180deg, #FFFFFF 0%, #f2f0e9 50%, #E8E6DF 100%);
```

### 光泽效果

```css
background: linear-gradient(
  135deg,
  rgba(255, 255, 255, 0.5) 0%,
  rgba(255, 255, 255, 0.2) 50%,
  rgba(255, 255, 255, 0) 100%
);
```

### 阴影

- **小阴影**：`0 4px 20px rgba(64, 116, 177, 0.10)`
- **中阴影**：`0 8px 40px rgba(64, 116, 177, 0.14)`
- **大阴影**：`0 12px 60px rgba(64, 116, 177, 0.18)`
- **内阴影**：`inset 0 2px 8px rgba(64, 116, 177, 0.06)`

---

## 📱 响应式断点

| 断点 | 宽度 | 设备 |
|------|------|------|
| sm | 640px | 手机横屏 |
| md | 768px | 平板竖屏 |
| lg | 1024px | 平板横屏/小笔记本 |
| xl | 1280px | 笔记本 |
| 2xl | 1536px | 桌面显示器 |

---

## 🌓 深色模式

深色模式采用**夜山青**概念：

| 变量 | 色值 | 说明 |
|------|------|------|
| 背景 | `#0F1520` | 夜山黑 |
| 卡片 | `#1A2332` | 深海蓝 |
| 主色 | `#5A8FC9` | 亮平等青 |
| 文字 | `#E8EEF4` | 月白 |
| 次要文字 | `#8A9AA8` | 星灰 |

---

## 📝 使用示例

### Web (Tailwind CSS)

```html
<!-- 青花主渐变按钮 -->
<button class="bg-gradient-to-br from-porcelain-deep via-porcelain-dark to-porcelain text-white px-7 py-3.5 rounded-xl shadow-porcelain hover:shadow-porcelain-lg transition-all">
  探索更多
</button>

<!-- 高白泥背景卡片 -->
<div class="bg-white rounded-2xl shadow-porcelain p-6">
  <h2 class="text-xl font-semibold text-ink-black">标题</h2>
  <p class="text-ink-gray">描述文字</p>
</div>

<!-- 玻璃效果卡片 -->
<div class="glass-porcelain rounded-2xl p-6">
  <p class="text-ink-black">玻璃质感内容</p>
</div>

<!-- 文字渐变 -->
<h1 class="text-gradient-porcelain text-4xl font-bold">艺见心</h1>

<!-- 悬浮效果 -->
<div class="hover-lift bg-white rounded-xl p-6">
  悬浮会轻微上浮并增强阴影
</div>
```

### Flutter

```dart
// 使用主题颜色
Container(
  color: PorcelainColors.porcelain,
  child: Text(
    '标题',
    style: TextStyle(
      color: PorcelainColors.inkBlack,
      fontSize: 20,
      fontWeight: FontWeight.w600,
    ),
  ),
)

// 青花主渐变
Container(
  decoration: BoxDecoration(
    gradient: LinearGradient(
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
      colors: [
        PorcelainColors.porcelainDeep,
        PorcelainColors.porcelainDark,
        PorcelainColors.porcelain,
      ],
    ),
    borderRadius: BorderRadius.circular(12),
  ),
)

// 玻璃效果
Container(
  decoration: BoxDecoration(
    color: Colors.white.withOpacity(0.75),
    borderRadius: BorderRadius.circular(16),
    border: Border.all(
      color: Colors.white.withOpacity(0.6),
    ),
  ),
  child: ClipRRect(
    borderRadius: BorderRadius.circular(16),
    child: BackdropFilter(
      filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
      child: Padding(...),
    ),
  ),
)
```

---

## 🎯 设计原则

1. **淡雅清新** - 青花瓷般的淡雅色调，不刺眼
2. **山水意境** - 运用留白和渐变营造山水画意境
3. **层次清晰** - 通过色深和阴影建立柔和层次
4. **现代东方** - 传统青花美学与现代极简设计融合
5. **舒适阅读** - 米白背景减少眼部疲劳，适合长时间浏览

---

## 📚 配色来源

本设计系统配色参考：
- **青花配色 - 浅色霁风**：中国传统青花瓷釉色
- **珠明料、元子、平等青**：清代青花瓷典型釉料名称
- **高白泥**：景德镇优质瓷土

---

*设计系统版本：v2.0 - 青花配色·浅色霁风*
*最后更新：2026-03-22*
