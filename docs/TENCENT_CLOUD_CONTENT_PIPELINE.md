# 腾讯云内容上传与审核接入

本文档覆盖当前第一阶段链路：

`客户端选择文件 -> BFF 生成 COS 直传签名 -> 客户端 PUT 到 COS -> BFF 记录 upload_files -> 发帖 -> 腾讯云内容安全审核 -> community_posts 状态落库`

## 1. 环境变量

在 `web/.env.local`、生产服务器 `.env.production` 或托管平台环境变量中配置：

```env
TENCENT_CLOUD_SECRET_ID=
TENCENT_CLOUD_SECRET_KEY=
TENCENT_CLOUD_REGION=ap-guangzhou

# Bucket 名必须包含 appid，例如 artsee-1250000000
TENCENT_COS_BUCKET=
TENCENT_COS_REGION=ap-guangzhou

# 可选：如果前面有 CDN 或自定义域名
# TENCENT_COS_PUBLIC_BASE_URL=https://assets.artiqore.com
TENCENT_COS_SIGN_EXPIRES_SECONDS=900

# 可选：腾讯云内容安全策略
# TENCENT_CONTENT_SAFETY_TEXT_BIZ_TYPE=
# TENCENT_CONTENT_SAFETY_IMAGE_BIZ_TYPE=
```

这些变量只允许存在服务端。不要写入 Flutter、浏览器可见配置或 Git。

## 2. Supabase migration

先执行：

```sql
supabase/migrations/20260618090000_content_audit_and_cos_metadata.sql
```

它会给：

- `community_posts` 增加 `reviewing/rejected` 状态和审核元数据字段。
- `upload_files` 增加 `provider/bucket/object_key` 和审核元数据字段。

## 3. COS CORS

腾讯云 COS Bucket 需要允许浏览器或 Flutter Web 直传。

建议 CORS 规则：

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:9090",
      "http://localhost:3003",
      "https://artiqore.com",
      "https://www.artiqore.com"
    ],
    "AllowedMethods": ["PUT", "OPTIONS"],
    "AllowedHeaders": [
      "Authorization",
      "Content-Type",
      "x-cos-security-token"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 600
  }
]
```

如果使用新的本地端口，请把实际端口加入 `AllowedOrigins`。

## 4. BFF 接口

### 生成 COS 上传签名

```http
POST /api/v1/uploads/cos/sign
Authorization: Bearer <access_token>
Content-Type: application/json
```

```json
{
  "file_name": "portfolio.png",
  "content_type": "image/png",
  "size": 1024,
  "scene": "community"
}
```

返回 `upload_url`、`headers`、`public_url`、`key`。客户端使用 `PUT` 把文件直传到 `upload_url`。

### 记录上传完成

```http
POST /api/v1/uploads/cos/complete
Authorization: Bearer <access_token>
Content-Type: application/json
```

```json
{
  "key": "uploads/<user-id>/community/xxx.png",
  "url": "https://assets.artiqore.com/uploads/<user-id>/community/xxx.png",
  "bucket": "artsee-1250000000",
  "file_type": "image/png",
  "scene": "community",
  "size": 1024
}
```

### 内容安全审核

```http
POST /api/v1/content/audit
Authorization: Bearer <access_token>
Content-Type: application/json
```

```json
{
  "text": "作品集进度分享",
  "image_urls": ["https://assets.artiqore.com/uploads/<user-id>/community/xxx.png"],
  "scene": "community_post"
}
```

## 5. 发帖状态

`POST /api/v1/community/posts` 现在由腾讯云审核结果决定状态：

| 审核结果 | community_posts.status | 前台行为 |
| --- | --- | --- |
| `approved` | `published` | 公开展示，计入创作者成长 |
| `reviewing` | `reviewing` | 不进公开列表，等待后台人工处理 |
| `rejected` | `rejected` | 不进公开列表，客户端提示调整内容 |

腾讯云配置缺失时接口返回 `503`，不会绕过审核直接发布。

## 6. 本地验证

```bash
cd web
npm test -- --run tests/api/tencent-integrations.test.ts tests/api/community-post-audit.test.ts tests/api/upload.test.ts
npx eslint app/api/v1/community/posts/route.ts app/api/v1/uploads/cos/sign/route.ts app/api/v1/uploads/cos/complete/route.ts app/api/v1/content/audit/route.ts lib/api/tencent-cloud.ts lib/api/tencent-cos.ts lib/api/content-safety.ts tests/api/tencent-integrations.test.ts tests/api/community-post-audit.test.ts
```

Flutter service 层验证：

```bash
flutter analyze app/lib/services/backend_api_service.dart app/lib/services/storage_service.dart app/lib/models/models.dart app/test/backend_api_parse_test.dart
```
