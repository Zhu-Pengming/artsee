# Embedding 模型切换指南

## 概述

本项目支持多种 embedding 模型提供商：
- **GLM**（智谱，在线，1024 维）
- **Xinference**（本地，推荐 `bge-small-zh-v1.5`，512 维）
- **Ollama**（本地，512 维）
- **OpenAI**（在线，1536 维）

## 切换到本地 bge-small-zh-v1.5

### 1. 安装并启动 Xinference

```bash
# 安装
pip install xinference

# 启动服务（默认端口 9997）
xinference-local --host 0.0.0.0 --port 9997
```

### 2. 部署 bge-small-zh-v1.5 模型

访问 Xinference Web UI：`http://localhost:9997`

或使用命令行：

```bash
# 部署模型
xinference launch --model-name bge-small-zh-v1.5 --model-type embedding
```

### 3. 更新 .env.local

```bash
# Embedding 配置
EMBEDDING_PROVIDER=xinference
XINFERENCE_BASE_URL=http://localhost:9997/v1
XINFERENCE_API_KEY=dummy
EMBEDDING_MODEL=bge-small-zh-v1.5
EMBEDDING_DIMENSIONS=512
EMBEDDING_BATCH_SIZE=32
```

### 4. 更新 Supabase 数据库

**⚠️ 重要：维度不兼容，需要清空现有数据**

在 Supabase SQL Editor 中依次执行：

1. `docs/migrations/007-vector-512-step1-backup.sql` - 备份数据（可选）
2. `docs/migrations/007-vector-512-step2-clear.sql` - 清空 embeddings
3. `docs/migrations/007-vector-512-step3-alter.sql` - 修改列类型为 vector(512)
4. `docs/migrations/007-vector-512-step4-index.sql` - 重建索引

### 5. 重新 ingest 所有学校数据

```bash
npm run reingest-all
```

## 使用 Ollama（替代方案）

### 1. 安装 Ollama

从 [ollama.com](https://ollama.com) 下载安装。

### 2. 拉取模型

```bash
ollama pull qllama/bge-small-zh-v1.5
```

### 3. 启动 Ollama 服务

Ollama 默认在 `http://localhost:11434` 运行。

### 4. 更新 .env.local

```bash
EMBEDDING_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_API_KEY=dummy
EMBEDDING_MODEL=bge-small-zh-v1.5
EMBEDDING_DIMENSIONS=512
EMBEDDING_BATCH_SIZE=32
```

## 模型对比

| 提供商 | 模型 | 维度 | 优点 | 缺点 |
|--------|------|------|------|------|
| GLM | embedding-2 | 1024 | 在线服务，稳定 | 需要付费，有额度限制 |
| Xinference | bge-small-zh-v1.5 | 512 | 本地免费，中文优化 | 需要本地部署 |
| Ollama | bge-small-zh-v1.5 | 512 | 安装简单，本地免费 | 性能略低于 Xinference |
| OpenAI | text-embedding-3-small | 1536 | 高质量，多语言 | 需要付费，较贵 |

## 性能要求

### bge-small-zh-v1.5

- **模型大小**：约 50-100 MB
- **推荐内存**：4GB+（舒适运行 8GB+）
- **批量处理**：batch_size=32 较为稳定

### 系统要求

```
4GB 内存：可以跑，但可能较慢
8GB 内存：推荐配置
16GB 内存：完全没压力
```

## 故障排查

### Xinference 连接失败

```bash
# 检查服务是否运行
curl http://localhost:9997/v1/models

# 查看已部署的模型
xinference list
```

### Embedding 维度不匹配

如果看到警告：
```
⚠️  Expected 512 dimensions, got 1024
```

检查：
1. `.env.local` 中的 `EMBEDDING_DIMENSIONS` 是否正确
2. Supabase 表的 vector 维度是否匹配
3. 是否执行了数据库迁移脚本

### 内存不足

降低 batch size：
```bash
EMBEDDING_BATCH_SIZE=16  # 或更小
```

## 测试 Embedding 生成

```bash
# 测试单个学校
npm run ingest -- --school royal-college-art

# 查看日志，确认使用的 provider 和维度
```

## 回滚到 GLM

如果需要回滚：

1. 更新 `.env.local`：
```bash
EMBEDDING_PROVIDER=glm
GLM_API_KEY=your_key
EMBEDDING_MODEL=embedding-2
EMBEDDING_DIMENSIONS=1024
EMBEDDING_BATCH_SIZE=50
```

2. 执行数据库迁移（1024 维）
3. 重新 ingest 数据
