# 腾讯云部署指南

本文档说明如何将 Artsee Web 项目部署到腾讯云服务器。

## 前置要求

### 1. 腾讯云服务器

- **操作系统**：Ubuntu 20.04+ / CentOS 7+
- **配置建议**：2核4G 或以上
- **安全组**：开放以下端口
  - 22（SSH）
  - 80（HTTP）
  - 443（HTTPS）
  - 3000（Next.js，可选，用于测试）

### 2. 本地环境

- Node.js 18+
- npm 或 pnpm
- SSH 密钥文件：`tom.pem`

### 3. 服务器环境准备

SSH 登录到腾讯云服务器后，执行以下命令：

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y  # Ubuntu/Debian
# 或
sudo yum update -y  # CentOS

# 安装 Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs  # Ubuntu/Debian
# 或
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs  # CentOS

# 验证安装
node --version
npm --version

# 安装 PM2（进程管理器）
sudo npm install -g pm2

# 创建部署目录
mkdir -p ~/website/artsee

# 配置 PM2 开机自启
pm2 startup
# 按照输出的命令执行
```

## 部署步骤

### 1. 配置腾讯云服务器信息

编辑项目根目录的 `.env.tencent` 文件：

```bash
# 腾讯云服务器 IP 地址（必需）
export TENCENT_HOST=123.456.789.0  # 替换为你的服务器 IP

# SSH 配置
export TENCENT_USER=ubuntu  # 或 root，取决于你的服务器
export TENCENT_KEY=~/tom.pem  # SSH 密钥文件路径

# 远程部署目录
export TENCENT_DIR=~/website/artsee
```

### 2. 确保 SSH 密钥权限正确

```bash
chmod 600 ~/tom.pem
```

### 3. 配置环境变量

在服务器上创建 `.env.production` 文件：

```bash
ssh -i ~/tom.pem ubuntu@your-server-ip
cd ~/website/artsee
nano .env.production
```

添加以下内容（根据实际情况修改）：

```env
NODE_ENV=production

# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI 配置
DEEPSEEK_API_KEY=your-deepseek-key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat

# 或使用 OpenAI
OPENAI_API_KEY=your-openai-key
AI_MODEL=gpt-4o-mini

# Embedding 配置（如果使用）
EMBEDDING_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_API_KEY=dummy
EMBEDDING_MODEL=bge-m3
EMBEDDING_DIMENSIONS=1024
```

保存后退出（Ctrl+X，然后 Y，然后 Enter）。

### 4. 执行部署

在本地项目根目录执行：

```bash
# 加载腾讯云配置
source .env.tencent

# 执行部署
npm run deploy:tencent
```

或者一行命令：

```bash
TENCENT_HOST=123.456.789.0 npm run deploy:tencent
```

### 5. 验证部署

```bash
# SSH 登录到服务器
ssh -i ~/tom.pem ubuntu@your-server-ip

# 查看 PM2 状态
pm2 status

# 查看日志
pm2 logs artsee-web

# 测试访问
curl http://localhost:3000
```

## 配置 Nginx 反向代理（推荐）

### 1. 安装 Nginx

```bash
sudo apt install -y nginx  # Ubuntu/Debian
# 或
sudo yum install -y nginx  # CentOS
```

### 2. 配置 Nginx

创建配置文件：

```bash
sudo nano /etc/nginx/sites-available/artsee
```

添加以下内容：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名或 IP

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/artsee /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3. 配置 HTTPS（可选但推荐）

使用 Let's Encrypt 免费证书：

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx  # Ubuntu/Debian
# 或
sudo yum install -y certbot python3-certbot-nginx  # CentOS

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

## 常用命令

### 部署相关

```bash
# 完整部署（构建 + 上传）
npm run deploy:tencent

# 跳过构建，仅上传
SKIP_BUILD=1 npm run deploy:tencent

# 不保留远程 .env 文件
PRESERVE_REMOTE_ENV=0 npm run deploy:tencent
```

### 服务器管理

```bash
# SSH 登录
ssh -i ~/tom.pem ubuntu@your-server-ip

# 查看 PM2 状态
pm2 status

# 查看日志
pm2 logs artsee-web

# 重启服务
pm2 restart artsee-web

# 停止服务
pm2 stop artsee-web

# 查看资源使用
pm2 monit

# 清理日志
pm2 flush
```

### 日志查看

```bash
# 实时日志
pm2 logs artsee-web --lines 100

# 错误日志
pm2 logs artsee-web --err

# 输出日志
pm2 logs artsee-web --out
```

## 故障排查

### 1. 部署失败

**问题**：SSH 连接失败

```bash
# 检查安全组是否开放 22 端口
# 检查密钥文件权限
chmod 600 ~/tom.pem

# 测试 SSH 连接
ssh -i ~/tom.pem ubuntu@your-server-ip "echo 'success'"
```

**问题**：构建失败

```bash
# 检查 Node.js 版本
node --version  # 需要 18+

# 清理缓存重新构建
cd web
rm -rf .next node_modules
npm install
npm run build
```

### 2. 服务无法启动

**问题**：端口被占用

```bash
# 查看端口占用
sudo lsof -i :3000
# 或
sudo netstat -tulpn | grep 3000

# 杀死占用进程
sudo fuser -k 3000/tcp
```

**问题**：PM2 进程异常

```bash
# 删除所有 PM2 进程
pm2 delete all

# 重新部署
npm run deploy:tencent
```

### 3. 性能问题

**问题**：内存不足

```bash
# 增加 PM2 内存限制
# 编辑 web/ecosystem.tencent.config.js
max_memory_restart: '2G',  # 根据服务器配置调整

# 重新部署
npm run deploy:tencent
```

**问题**：响应慢

```bash
# 启用 Nginx 缓存
# 在 Nginx 配置中添加：
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;

location / {
    proxy_cache my_cache;
    proxy_cache_valid 200 60m;
    # ... 其他配置
}
```

## 更新部署

### 代码更新

```bash
# 本地拉取最新代码
git pull origin main

# 重新部署
npm run deploy:tencent
```

### 环境变量更新

```bash
# SSH 登录到服务器
ssh -i ~/tom.pem ubuntu@your-server-ip

# 编辑 .env.production
cd ~/website/artsee
nano .env.production

# 重启服务
pm2 restart artsee-web
```

## 备份与恢复

### 备份

```bash
# 备份整个部署目录
ssh -i ~/tom.pem ubuntu@your-server-ip "tar czf ~/artsee-backup-$(date +%Y%m%d).tar.gz -C ~/website artsee"

# 下载备份到本地
scp -i ~/tom.pem ubuntu@your-server-ip:~/artsee-backup-*.tar.gz ./backups/
```

### 恢复

```bash
# 上传备份到服务器
scp -i ~/tom.pem ./backups/artsee-backup-20260607.tar.gz ubuntu@your-server-ip:~/

# SSH 登录并恢复
ssh -i ~/tom.pem ubuntu@your-server-ip
pm2 stop artsee-web
rm -rf ~/website/artsee
mkdir -p ~/website
tar xzf ~/artsee-backup-20260607.tar.gz -C ~/website
pm2 start ~/website/artsee/ecosystem.config.js
```

## 监控与告警

### 配置 PM2 监控

```bash
# 安装 PM2 Plus（可选）
pm2 link your-secret-key your-public-key

# 或使用开源监控
pm2 install pm2-server-monit
```

### 日志轮转

```bash
# 安装 PM2 日志轮转模块
pm2 install pm2-logrotate

# 配置
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

## 安全建议

1. **防火墙配置**：只开放必要端口
2. **SSH 密钥**：禁用密码登录，只使用密钥
3. **定期更新**：保持系统和依赖包最新
4. **环境变量**：敏感信息只存在 `.env` 文件中，不提交到代码库
5. **HTTPS**：生产环境必须使用 HTTPS
6. **备份**：定期备份数据和配置

## 相关文档

- [AGENTS.md](../AGENTS.md) - 项目总览
- [web/AGENTS.md](../web/AGENTS.md) - Next.js 详细说明
- [ADMIN_SETUP.md](./ADMIN_SETUP.md) - 管理员配置
- [部署脚本](../scripts/deploy-tencent.sh)
- [PM2 配置](../web/ecosystem.tencent.config.js)
