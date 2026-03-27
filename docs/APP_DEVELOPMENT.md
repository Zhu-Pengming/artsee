# APP 开发环境搭建指南

本文档详细记录 Flutter APP 开发环境的搭建步骤，包括各平台的调试方案。

> 💡 **开发建议**：采用 **"桌面端优先 + 真机调试"** 的混合策略，90% 的 UI 和逻辑开发应在桌面端进行，避免模拟器的性能瓶颈。

## 目录

- [开发策略建议](#开发策略建议)
- [环境要求](#环境要求)
- [基础工具安装](#基础工具安装)
- [桌面端开发（推荐）](#桌面端开发推荐)
- [Android 模拟器安装](#android-模拟器安装)
- [iOS 模拟器安装](#ios-模拟器安装)
- [运行 APP](#运行-app)
- [常见问题](#常见问题)

---

## 开发策略建议

### 桌面端优先 + 真机调试

作为追求高效迭代的开发者，**"一定需要模拟器"是一个常见的误区**。推荐采用以下混合策略：

| 阶段 | 推荐平台 | 理由 |
|------|----------|------|
| **原型/UI 搭建** | **Desktop (macOS/Windows)** | 响应式测试最快，窗口可随意拉伸，热重载几乎瞬时 |
| **业务逻辑开发** | **Desktop + Unit Test** | 配合 Dart DevTools 调试内存和执行效率 |
| **移动端特性测试** | **真机 (Physical Device)** | 涉及系统级 API（通知、相机、传感器）时，真机是唯一可靠环境 |
| **上线前验收** | **iOS Simulator / 真机** | 检查平台特有的渲染差异 |

### 为什么不推荐模拟器？

模拟器处于"比上不足比下有余"的尴尬位置：

- **性能不如 Desktop**：即便有硬件加速，模拟器的帧率和启动速度依然慢于原生桌面程序
- **资源占用高**：Android 模拟器是出了名的内存和 CPU 黑洞
- **真实度不如真机**：无法真实模拟手势边界、物理返回键逻辑、内存回收情况

### Desktop vs Web vs 模拟器

| 对比项 | Desktop (推荐) | Web | Android 模拟器 |
|--------|----------------|-----|----------------|
| Hot Reload 速度 | ⚡ 瞬时 | 🚀 快 | 🐢 慢 |
| 资源占用 | 💚 低 | 💚 低 | 🔴 高 |
| 响应式测试 | ✅ 窗口可拉伸 | ✅ 浏览器可调 | ❌ 固定尺寸 |
| 移动端 API | ⚠️ 部分可用 | ❌ 大部分不可用 | ✅ 可用 |
| 渲染一致性 | ✅ 与移动端一致 | ⚠️ CanvasKit 与 Impeller 有差异 | ✅ 接近真机 |

> 💡 **建议**：90% 的开发工作在 Desktop 完成，真机仅用于系统级功能验证。


---

## 环境要求

| 工具 | 版本要求 | 说明 |
|------|----------|------|
| Flutter SDK | ^3.11.3 | Dart 跨平台框架 |
| Dart SDK | ^3.11.0 | 编程语言 |
| Android Studio | 最新版 | Android SDK 和模拟器 |
| Xcode | 15.0+ | iOS 开发 (仅限 macOS) |
| Java JDK | 17 | Android 构建需要 |

---

## 基础工具安装

### 1. 安装 Flutter SDK

```bash
# 使用 Homebrew 安装
brew install flutter

# 验证安装
flutter doctor
```

### 2. 配置环境变量

```bash
# 编辑 ~/.zshrc 或 ~/.bash_profile
export FLUTTER_HOME="/opt/homebrew/opt/flutter"
export PATH="$FLUTTER_HOME/bin:$PATH"

# 使配置生效
source ~/.zshrc
```

### 3. 安装 Java JDK (Android 构建需要)

如果仅使用桌面端开发，可跳过此步骤。


```bash
# 安装 OpenJDK 17
brew install openjdk@17

# 配置 Java 环境变量
echo 'export JAVA_HOME="/opt/homebrew/opt/openjdk@17"' >> ~/.zshrc
echo 'export PATH="$JAVA_HOME/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# 验证
java -version
```

---

## 桌面端开发（推荐）

Flutter 支持 Windows、macOS 和 Linux 桌面平台。桌面端开发具有热重载快、资源占用低、窗口可拉伸调试响应式布局等优势。

### macOS 桌面端

#### 前提条件

- macOS 10.14 或更高版本
- Xcode 15.0+（用于构建 macOS 应用）

#### 安装 Xcode

```bash
# 方式一：从 App Store 安装（推荐，约 10GB）
# 打开 App Store 搜索 "Xcode" 并安装

# 方式二：使用 xcode-select 安装命令行工具（最小化安装）
xcode-select --install

# 配置 Xcode 路径
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer

# 接受许可协议
sudo xcodebuild -license accept
```

#### 运行 macOS 桌面应用

```bash
cd app

# 首次运行需要生成 macOS 项目文件
flutter create --platforms=macos . 2>/dev/null || true

# 运行桌面应用
flutter run -d macos

# 或构建 release 版本
flutter build macos
```

### Windows 桌面端

#### 前提条件

- Windows 10 或更高版本
- Visual Studio 2022（包含 "Desktop development with C++" 工作负载）

#### 运行 Windows 桌面应用

```bash
cd app

# 首次运行需要生成 Windows 项目文件
flutter create --platforms=windows . 2>/dev/null || true

# 运行桌面应用
flutter run -d windows

# 或构建 release 版本
flutter build windows
```

### Linux 桌面端

```bash
# 安装依赖
sudo apt-get install clang cmake ninja-build pkg-config libgtk-3-dev liblzma-dev

# 运行
cd app
flutter create --platforms=linux . 2>/dev/null || true
flutter run -d linux
```

---

## Android 模拟器安装

### 方法一：使用 Homebrew 安装 Android Studio（推荐）

```bash
# 安装 Android Studio
brew install --cask android-studio
```

### 方法二：手动安装 Android SDK

如果不想安装完整的 Android Studio，可以只安装命令行工具：

```bash
# 1. 创建 SDK 目录
mkdir -p ~/Library/Android/sdk

# 2. 下载命令行工具
cd /tmp
curl -L -o cmdline-tools.zip \
  "https://dl.google.com/android/repository/commandlinetools-mac-11076708_latest.zip"

# 3. 解压到 SDK 目录
unzip -q -o cmdline-tools.zip -d ~/Library/Android/sdk/cmdline-tools/
mv ~/Library/Android/sdk/cmdline-tools/cmdline-tools \
   ~/Library/Android/sdk/cmdline-tools/latest

# 4. 清理
rm -f cmdline-tools.zip
```

### 配置 Android 环境变量

```bash
# 编辑 ~/.zshrc
echo '
# Android SDK 环境变量
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$PATH:$ANDROID_HOME/cmdline-tools/latest/bin"
export PATH="$PATH:$ANDROID_HOME/platform-tools"
export PATH="$PATH:$ANDROID_HOME/emulator"
' >> ~/.zshrc

source ~/.zshrc
```

### 安装必要的 SDK 组件

```bash
# 1. 接受许可协议
yes | sdkmanager --licenses

# 2. 安装必要组件
sdkmanager "platform-tools" "platforms;android-34" "emulator"

# 3. 安装系统镜像（用于创建模拟器）
sdkmanager "system-images;android-34;google_apis;arm64-v8a"
```

### 创建 Android 模拟器

```bash
# 使用 avdmanager 创建模拟器
avdmanager create avd \
  -n "Pixel_6_API_34" \
  -d "pixel_6" \
  -k "system-images;android-34;google_apis;arm64-v8a" \
  --force

# 查看可用模拟器
flutter emulators

# 输出示例：
# 1 available emulator:
# Id             • Name           • Manufacturer • Platform
# Pixel_6_API_34 • Pixel 6 API 34 • Google       • android
```

### 启动模拟器

```bash
# 方式一：使用 Flutter 命令
flutter emulators --launch Pixel_6_API_34

# 方式二：使用 emulator 命令
emulator -avd Pixel_6_API_34 -netdelay none -netspeed full

# 方式三：使用 Android Studio 图形界面
# 打开 Android Studio → Device Manager → 启动模拟器
```

---

## iOS 模拟器安装

iOS 模拟器需要 Xcode，只能在 macOS 上运行。

### 安装 Xcode

```bash
# 从 App Store 安装 Xcode
# 或使用命令行安装
xcode-select --install
```

### 配置 Xcode 命令行工具

```bash
# 同意许可协议
sudo xcodebuild -license accept

# 安装 iOS 模拟器
xcrun simctl list devices available
```

### 创建 iOS 模拟器

```bash
# 列出可用的 iOS 模拟器类型
xcrun simctl list devicetypes

# 创建新的 iOS 模拟器
xcrun simctl create "iPhone 15 Pro" \
  com.apple.CoreSimulator.SimDeviceType.iPhone-15-Pro \
  com.apple.CoreSimulator.SimRuntime.iOS-17-0

# 启动 iOS 模拟器
open -a Simulator
```

---

## 运行 APP

### 方案一：桌面端（推荐日常开发使用）

```bash
cd /path/to/artsee/app

# macOS
flutter run -d macos

# Windows
flutter run -d windows

# Linux
flutter run -d linux
```

桌面端支持窗口自由拉伸，方便测试响应式布局。

### 方案二：Web 端（快速预览）

```bash
cd /path/to/artsee/app

flutter run -d chrome
```

> ⚠️ 注意：Flutter Web 使用 CanvasKit 渲染，与移动端 Impeller 引擎有细微差异。

### 方案三：移动端（真机或模拟器）

#### 1. 进入项目目录

```bash
cd /path/to/artsee/app
```

### 2. 安装依赖

```bash
flutter pub get
```

### 3. 连接设备或启动模拟器

```bash
# 查看可用设备
flutter devices

# 示例输出：
# 3 connected devices:
# iPhone 15 Pro (mobile) • iOS 17.0
# Pixel 6 API 34 (android) • emulator-5554
# Chrome (web)            • web-javascript
```

### 4. 运行 APP

```bash
# 在 Android 模拟器上运行
flutter run -d emulator-5554

# 在 iOS 模拟器上运行
flutter run -d ios

# 在 Chrome 上运行（Web 调试）
flutter run -d chrome

# 热重载模式（推荐开发使用）
flutter run --hot
```

### 5. 调试命令

运行后，在终端中可以使用以下命令：

| 按键 | 功能 |
|------|------|
| `r` | 热重载 (Hot reload) |
| `R` | 热重启 (Hot restart) |
| `q` | 退出应用 |
| `h` | 显示帮助 |
| `d` | 断开连接（保持应用运行）|

---

## 常见问题

### Q1: 找不到 Android SDK

**错误信息：**
```
Unable to locate Android SDK.
```

**解决方案：**
```bash
# 配置 Flutter 使用正确的 SDK 路径
flutter config --android-sdk "$HOME/Library/Android/sdk"

# 验证配置
flutter doctor
```

### Q2: NDK 下载失败或损坏

**错误信息：**
```
[CXX1101] NDK at ... did not have a source.properties file
```

**解决方案：**
```bash
# 删除损坏的 NDK
rm -rf "$HOME/Library/Android/sdk/ndk/28.2.13676358"

# 重新运行构建，会自动重新下载
flutter run
```

### Q3: Java 版本不兼容

**错误信息：**
```
The operation couldn't be completed. Unable to locate a Java Runtime.
```

**解决方案：**
```bash
# 安装 OpenJDK 17
brew install openjdk@17

# 配置环境变量
export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
export PATH="$JAVA_HOME/bin:$PATH"
```

### Q4: 模拟器启动失败

**错误信息：**
```
emulator: ERROR: x86_64 emulation currently requires hardware acceleration!
```

**解决方案：**
1. 确保已安装 Android Emulator Hypervisor Driver (AEHD) 或 HAXM
2. 在 macOS 上，Apple Silicon (M1/M2/M3) 芯片不需要额外配置
3. 检查 BIOS 中是否启用了虚拟化（Intel 芯片）

### Q5: Gradle 构建失败

**错误信息：**
```
Gradle task assembleDebug failed
```

**解决方案：**
```bash
# 清理构建缓存
cd android
./gradlew clean
cd ..

# 重新构建
flutter clean
flutter pub get
flutter run
```

### Q6: iOS 构建失败

**错误信息：**
```
xcrun: error: unable to find utility "xcodebuild"
```

**解决方案：**
```bash
# 选择 Xcode 路径
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer

# 验证
xcodebuild -version
```

---

## 参考链接

- [Flutter 官方文档](https://docs.flutter.dev/)
- [Android Studio 下载](https://developer.android.com/studio)
- [Xcode 下载](https://apps.apple.com/us/app/xcode/id497799835)
- [Flutter 设备调试指南](https://docs.flutter.dev/tools/devices)

---

## 更新记录

| 日期 | 版本 | 说明 |
|------|------|------|
| 2026-03-24 | 1.0 | 初始版本，记录 Android/iOS 模拟器完整安装流程 |
