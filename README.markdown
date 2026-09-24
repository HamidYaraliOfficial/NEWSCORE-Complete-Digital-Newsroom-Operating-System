# NEWSCORE — Complete Digital Newsroom Operating System

---

# English

## Overview

NEWSCORE is a modular, API-first digital newsroom platform designed around a public multilingual news website and an internal editorial operating system. The repository contains a Next.js + React + TypeScript + Tailwind CSS frontend, a NestJS + TypeScript backend, PostgreSQL/PostGIS data modeling, Redis infrastructure, OpenSearch-compatible search, S3-compatible media storage, background queues, real-time SSE, audit logging, workflow transitions, scheduling, analytics, and role-aware administration.

## Main Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui-compatible component architecture.
- Backend: NestJS, TypeScript, REST API, OpenAPI/Swagger.
- Database: PostgreSQL with PostGIS-ready datasource.
- Cache and queues: Redis + BullMQ.
- Search: OpenSearch-compatible engine with database fallback.
- Media: S3-compatible object storage with presigned upload.
- Real-time: Server-Sent Events for breaking news, publication and newsroom activity.
- Authentication: JWT access/refresh tokens, Argon2 password hashing, session persistence.
- Observability foundations: structured audit records, request metadata fields, health endpoints.

## Included Product Areas

The source tree includes the core newsroom domain for users, roles, permissions, desks, sections, categories, tags, topics, entities, locations, stories, articles, revisions, structured blocks, assignments, pitches, workflow states, reviews, fact checks, corrections, schedules, breaking news, live blogs, media, sources, comments, notifications, saved stories, reading history, search events, analytics events, newsletters, subscriptions, advertising, audit logs, webhooks, API keys, feature flags, translations, templates, policies, special coverage, tips, press releases, interviews, transcripts, research notes, availability rules and background jobs.

## Content Workflow

`DRAFT → SUBMITTED → IN_REVIEW → FACT_CHECK/COPY_EDIT → APPROVED → SCHEDULED → PUBLISHED → UPDATED/CORRECTED → ARCHIVED`

Workflow transitions are validated by the backend. Article revisions are persisted and the publication service applies a publication guard for required content.

## Structured News Blocks

Article body data is stored as structured blocks. Supported block types in the shared contract include paragraph, heading, image, gallery, video, audio, quote, pull quote, infobox, timeline, table, embed, map, source card, related story, poll, chart, key facts, warning and interactive.

## Internationalization

Three locales are provided:

- `fa` — Persian, RTL.
- `en` — English, LTR.
- `zh` — Chinese, LTR.

Public and dashboard navigation use locale-aware routes. Date/time formatting is locale-aware. RTL/LTR direction is assigned at the locale layout level.

## Theme System

The UI provides:

- System — follows the operating-system preference.
- Light.
- Dark.
- Red.
- Blue.

Theme presets are stored through `next-themes` and custom CSS variables.

## Operating Hours, Time Zone and Next Opening

Each newsroom user can store weekly availability rules with:

- day of week;
- opening time;
- closing time;
- enabled/disabled state;
- IANA time zone.

The backend calculates the current state, current window, seconds until closing, next opening timestamp and seconds until the next opening. Time-zone calculations use Luxon so DST-aware scheduling can be implemented with IANA zone names.

The API endpoints are:

```text
GET  /api/schedule/availability
POST /api/schedule/availability
```

Example request:

```json
{
  "timezone": "Asia/Baku",
  "rules": [
    {"day":1,"open":"09:00","close":"17:00","enabled":true},
    {"day":2,"open":"09:00","close":"17:00","enabled":true},
    {"day":3,"open":"09:00","close":"17:00","enabled":true},
    {"day":4,"open":"09:00","close":"17:00","enabled":true},
    {"day":5,"open":"09:00","close":"17:00","enabled":true},
    {"day":6,"open":"10:00","close":"14:00","enabled":false},
    {"day":0,"open":"10:00","close":"14:00","enabled":false}
  ]
}
```

## Requirements

- Node.js 22+
- npm 10+
- Docker Desktop or Docker Engine with Compose
- PostgreSQL is provided by Compose.
- Redis is provided by Compose.
- OpenSearch is provided by Compose.
- MinIO is provided as S3-compatible development object storage.

## Installation

### 1. Environment

```bash
cp .env.example .env
```

Update secrets and service URLs before production use.

### 2. Start infrastructure

```bash
docker compose up -d
```

### 3. Install packages

```bash
npm install
```

### 4. Generate Prisma Client

```bash
npm run db:generate
```

### 5. Run database migrations

```bash
npm run db:migrate
```

### 6. Seed development data

```bash
npm run db:seed
```

Development seed credentials:

```text
admin@newscore.local / ChangeMe!123456
editor@newscore.local / ChangeMe!123456
reporter@newscore.local / ChangeMe!123456
```

Change all seeded credentials before using a shared or production environment.

### 7. Run the platform

```bash
npm run dev
```

Public website:

```text
http://localhost:3000/fa
http://localhost:3000/en
http://localhost:3000/zh
```

Dashboard:

```text
http://localhost:3000/fa/dashboard
```

API:

```text
http://localhost:4000/api
```

Swagger/OpenAPI:

```text
http://localhost:4000/docs
```

Health:

```text
http://localhost:4000/api/health
```

MinIO console:

```text
http://localhost:9001
```

OpenSearch:

```text
http://localhost:9200
```

## Production Build

```bash
npm run build
```

Start the API and worker independently:

```bash
npm --workspace apps/api run start
npm --workspace apps/api run worker:dev
```

Start the web application:

```bash
npm --workspace apps/web run start
```

## Database and Persistence

The Prisma schema is located at:

```text
apps/api/prisma/schema.prisma
```

The datasource is PostgreSQL and is configured for PostGIS compatibility. Flexible editorial metadata uses PostgreSQL JSON/JSONB-compatible Prisma fields. Revision, audit and workflow records are separate persisted records rather than destructive overwrites.

## Search

OpenSearch is used when available. The search service supports full-text fields, language filtering, section filtering, date filtering and fuzzy matching. When the OpenSearch service is temporarily unavailable, the public search endpoint falls back to PostgreSQL title/summary/lead matching.

## Media

Media uploads use a presigned S3-compatible flow:

1. `POST /api/media/presign`
2. Upload the returned URL with `PUT`.
3. The media asset remains in the database with processing state metadata.
4. A production worker can extend the processing state into image/video/audio pipelines.

## Real-Time Events

The backend exposes:

```text
GET /api/realtime/stream
```

SSE events are emitted for important newsroom activity including article publication, article updates, breaking news and live-blog updates.

## API Groups

```text
/auth
/articles
/assignments
/breaking
/live
/media
/search
/notifications
/schedule
/analytics
/admin
/health
/realtime
```

## Architecture Notes

The repository is organized as an npm workspace monorepo:

```text
NEWSCORE/
├── apps/
│   ├── api/
│   │   ├── prisma/
│   │   └── src/
│   └── web/
├── packages/
│   └── shared/
├── infra/
├── docker-compose.yml
├── .env.example
└── README (1).markdown
```

## Security Baseline

Production deployment should replace development secrets, terminate TLS at the edge, use a managed secret store, restrict object-storage credentials, enforce least privilege, configure a production CSP, enable strict rate limits, validate all remote-media URLs, and run malware scanning before making uploaded assets reusable.

## Editorial Safety

AI-assisted features should remain a draft-only assistance layer. Human review is required before publication. Source and evidence records should remain permission-aware, and sensitive contact metadata should not be exposed through public APIs.

## Testing Commands

```bash
npm run test
npm run lint
```

Recommended production CI stages:

```text
install → typecheck → lint → unit tests → integration tests → API contract tests → e2e → build → migration validation → deploy
```

## Environment Variables

The main variables are documented in `.env.example`:

```text
DATABASE_URL
REDIS_URL
SEARCH_URL
SEARCH_INDEX
S3_ENDPOINT
S3_REGION
S3_BUCKET
S3_ACCESS_KEY
S3_SECRET_KEY
JWT_SECRET
JWT_REFRESH_SECRET
WEB_URL
NEXT_PUBLIC_API_URL
```

## License

This repository is prepared as a NEWSCORE application codebase. Add the license required by your organization before distributing production deployments.

---

# فارسی

## معرفی

NEWSCORE یک سامانه یکپارچه و ماژولار برای اداره خبرگزاری دیجیتال است که وب‌سایت عمومی چندزبانه را با هسته تحریریه، CMS، مدیریت خبر، گردش‌کار، داشبورد سردبیر و خبرنگار، جست‌وجو، رسانه، زمان‌بندی، اعلان، آمار، ثبت رویداد و مدیریت تنظیمات در یک معماری واحد قرار می‌دهد.

## فناوری‌ها

- فرانت‌اند: Next.js، React، TypeScript، Tailwind CSS و معماری سازگار با shadcn/ui.
- بک‌اند: NestJS و TypeScript با REST API و OpenAPI/Swagger.
- دیتابیس: PostgreSQL با آمادگی PostGIS.
- کش و صف: Redis و BullMQ.
- جست‌وجو: OpenSearch با Fallback به PostgreSQL.
- ذخیره رسانه: S3-compatible و MinIO برای محیط توسعه.
- ارتباط لحظه‌ای: SSE برای Breaking News و Activityهای تحریریه.
- احراز هویت: JWT، Refresh Token، Session و Argon2.

## زبان‌ها

- فارسی: `fa` و RTL.
- انگلیسی: `en` و LTR.
- چینی: `zh` و LTR.

تمام صفحات در Routeهای Localized قرار دارند و جهت نمایش بر اساس زبان تعیین می‌شود.

## پوسته‌ها

سامانه دارای پنج حالت اصلی پوسته است:

- System: هماهنگ با تنظیمات سیستم‌عامل.
- Light: روشن.
- Dark: تاریک.
- Red: قرمز.
- Blue: آبی.

تم‌ها از CSS Variables و `next-themes` استفاده می‌کنند.

## ساعت فعالیت و محاسبه زمان تا نوبت بعدی

هر کاربر می‌تواند برنامه هفتگی خود را با روز، ساعت باز شدن، ساعت بسته شدن، فعال یا غیرفعال بودن و Time Zone ذخیره کند.

سیستم به شکل واقعی موارد زیر را محاسبه می‌کند:

- وضعیت فعلی باز یا بسته بودن؛
- بازه فعال فعلی؛
- تعداد ثانیه باقی‌مانده تا بسته شدن؛
- زمان دقیق باز شدن بعدی؛
- تعداد ثانیه باقی‌مانده تا باز شدن بعدی؛
- Time Zone انتخاب‌شده.

برای Time Zone از نام‌های استاندارد IANA مانند `Asia/Baku`، `Asia/Tehran`، `UTC` یا `Asia/Shanghai` استفاده کنید.

Endpointها:

```text
GET  /api/schedule/availability
POST /api/schedule/availability
```

نمونه:

```json
{
  "timezone": "Asia/Baku",
  "rules": [
    {"day":1,"open":"09:00","close":"17:00","enabled":true},
    {"day":2,"open":"09:00","close":"17:00","enabled":true},
    {"day":3,"open":"09:00","close":"17:00","enabled":true},
    {"day":4,"open":"09:00","close":"17:00","enabled":true},
    {"day":5,"open":"09:00","close":"17:00","enabled":true},
    {"day":6,"open":"10:00","close":"14:00","enabled":false},
    {"day":0,"open":"10:00","close":"14:00","enabled":false}
  ]
}
```

محاسبه با Luxon انجام می‌شود تا امکان مدیریت Time Zone و DST وجود داشته باشد.

## پیش‌نیازها

```text
Node.js 22+
npm 10+
Docker + Docker Compose
```

## نصب

### ۱. ساخت فایل محیطی

```bash
cp .env.example .env
```

برای محیط واقعی Secretها و URL سرویس‌ها را تغییر دهید.

### ۲. اجرای زیرساخت

```bash
docker compose up -d
```

### ۳. نصب کتابخانه‌ها

```bash
npm install
```

### ۴. ساخت Prisma Client

```bash
npm run db:generate
```

### ۵. اجرای Migration

```bash
npm run db:migrate
```

### ۶. ایجاد داده توسعه

```bash
npm run db:seed
```

حساب‌های Seed:

```text
admin@newscore.local / ChangeMe!123456
editor@newscore.local / ChangeMe!123456
reporter@newscore.local / ChangeMe!123456
```

قبل از استفاده جدی رمزها را تغییر دهید.

### ۷. اجرای سیستم

```bash
npm run dev
```

وب‌سایت:

```text
http://localhost:3000/fa
http://localhost:3000/en
http://localhost:3000/zh
```

داشبورد:

```text
http://localhost:3000/fa/dashboard
```

API:

```text
http://localhost:4000/api
```

Swagger:

```text
http://localhost:4000/docs
```

Health:

```text
http://localhost:4000/api/health
```

## ساختار دیتابیس

Schema در مسیر زیر قرار دارد:

```text
apps/api/prisma/schema.prisma
```

مدل‌ها شامل User، Role، Permission، Team، Desk، Section، Category، Tag، Topic، Entity، Location، Event، Story، Article، Revision، Block، Assignment، Pitch، Review، Fact Check، Correction، Publication Schedule، Breaking News، Live Blog، Media، Source، Comment، Notification، Analytics، Newsletter، Subscription، Advertisement، Audit، Webhook، API Key، Feature Flag، Translation، Template، Policy، Special Coverage، News Tip، Press Release، Interview، Transcript، Research Note، Availability و Job هستند.

## گردش‌کار خبر

```text
DRAFT → SUBMITTED → IN_REVIEW → FACT_CHECK/COPY_EDIT → APPROVED → SCHEDULED → PUBLISHED → UPDATED/CORRECTED → ARCHIVED
```

Transitionها در Backend کنترل می‌شوند و Revisionها به صورت جداگانه ذخیره می‌شوند.

## جست‌وجو

OpenSearch برای Full-Text Search، Fuzzy Search، Language Filter، Section Filter و Date Filter استفاده می‌شود. هنگام قطعی Search Engine، API به جست‌وجوی محدود PostgreSQL برمی‌گردد.

## مدیریت فایل

آپلود رسانه به صورت Presigned URL انجام می‌شود:

```text
POST /api/media/presign
```

پس از دریافت URL، فایل به صورت مستقیم با PUT به Object Storage ارسال می‌شود.

## Real-Time

مسیر زیر رویدادهای لحظه‌ای را ارائه می‌کند:

```text
GET /api/realtime/stream
```

برای Breaking News، Publish، Update و Live Blog Update استفاده می‌شود.

## دستورات Build

```bash
npm run build
npm run test
npm run lint
```

## متغیرهای محیطی

متغیرهای اصلی در `.env.example` آمده‌اند:

```text
DATABASE_URL
REDIS_URL
SEARCH_URL
SEARCH_INDEX
S3_ENDPOINT
S3_REGION
S3_BUCKET
S3_ACCESS_KEY
S3_SECRET_KEY
JWT_SECRET
JWT_REFRESH_SECRET
WEB_URL
NEXT_PUBLIC_API_URL
```

## نکات استقرار واقعی

برای Production باید Secretهای توسعه تعویض شوند، TLS فعال باشد، Secret Manager استفاده شود، دسترسی Object Storage محدود شود، CSP و Rate Limit واقعی اعمال شوند و فایل‌های آپلودی قبل از استفاده عمومی اسکن امنیتی شوند.

## لایه AI

قابلیت‌های AI در معماری به عنوان لایه کمکی طراحی شده‌اند. خروجی AI نباید بدون Review خبرنگار یا سردبیر منتشر شود و Source-grounded workflows باید از Sourceهای موجود در سیستم استفاده کنند.

---

# 中文

## 项目简介

NEWSCORE 是一个面向现代数字新闻机构的模块化新闻编辑部操作系统。它把多语言公共新闻网站、CMS、编辑流程、记者工作台、主编控制台、实时突发新闻、直播博客、媒体库、全文搜索、排程发布、通知、数据分析、审计、权限和后台管理整合在统一的 API-first 架构中。

## 技术栈

- 前端：Next.js、React、TypeScript、Tailwind CSS、兼容 shadcn/ui 的组件结构。
- 后端：NestJS、TypeScript、REST API、OpenAPI/Swagger。
- 数据库：PostgreSQL，支持 PostGIS 架构准备。
- 缓存与队列：Redis、BullMQ。
- 搜索：OpenSearch，支持 PostgreSQL fallback。
- 媒体：S3-compatible Object Storage，开发环境使用 MinIO。
- 实时通信：SSE，用于突发新闻、发布事件、直播博客和编辑部活动。
- 身份认证：JWT、Refresh Token、Session、Argon2。

## 语言与方向

- فارسی `fa`：RTL。
- English `en`：LTR。
- 中文 `zh`：LTR。

所有语言都有独立的 Localized Route，并根据语言自动设置方向。

## 主题

系统提供以下主题模式：

- System：跟随 Windows/macOS/Linux 操作系统设置。
- Light：浅色。
- Dark：深色。
- Red：红色主题。
- Blue：蓝色主题。

主题通过 `next-themes` 和 CSS Variables 实现。

## 营业时间、时区与下一个开放时间

用户可以配置自己的每周活动时间：

- 星期几；
- 开始时间；
- 结束时间；
- 是否启用；
- IANA 时区。

系统根据真实当前时间计算：

- 当前是否开放；
- 当前活动时间窗口；
- 距离关闭还剩多少秒；
- 下一次开放的时间戳；
- 距离下一次开放还剩多少秒；
- 当前使用的时区。

推荐使用标准 IANA Time Zone，例如：

```text
Asia/Baku
Asia/Tehran
Asia/Shanghai
UTC
```

API：

```text
GET  /api/schedule/availability
POST /api/schedule/availability
```

示例：

```json
{
  "timezone": "Asia/Shanghai",
  "rules": [
    {"day":1,"open":"09:00","close":"17:00","enabled":true},
    {"day":2,"open":"09:00","close":"17:00","enabled":true},
    {"day":3,"open":"09:00","close":"17:00","enabled":true},
    {"day":4,"open":"09:00","close":"17:00","enabled":true},
    {"day":5,"open":"09:00","close":"17:00","enabled":true},
    {"day":6,"open":"10:00","close":"14:00","enabled":false},
    {"day":0,"open":"10:00","close":"14:00","enabled":false}
  ]
}
```

时间计算使用 Luxon，可扩展到带 DST 的时区排程。

## 环境要求

```text
Node.js 22+
npm 10+
Docker + Docker Compose
```

## 安装步骤

### 1. 创建环境文件

```bash
cp .env.example .env
```

生产环境请更换所有开发环境 Secret。

### 2. 启动基础设施

```bash
docker compose up -d
```

### 3. 安装依赖

```bash
npm install
```

### 4. 生成 Prisma Client

```bash
npm run db:generate
```

### 5. 执行数据库迁移

```bash
npm run db:migrate
```

### 6. 创建开发数据

```bash
npm run db:seed
```

开发账户：

```text
admin@newscore.local / ChangeMe!123456
editor@newscore.local / ChangeMe!123456
reporter@newscore.local / ChangeMe!123456
```

生产环境不要继续使用这些密码。

### 7. 启动项目

```bash
npm run dev
```

公共网站：

```text
http://localhost:3000/fa
http://localhost:3000/en
http://localhost:3000/zh
```

后台：

```text
http://localhost:3000/fa/dashboard
```

API：

```text
http://localhost:4000/api
```

Swagger：

```text
http://localhost:4000/docs
```

Health：

```text
http://localhost:4000/api/health
```

## 数据模型

主要 Prisma Schema 位于：

```text
apps/api/prisma/schema.prisma
```

包含用户、角色、权限、团队、编辑部、频道、分类、标签、主题、实体、地点、事件、Story、Article、Revision、Structured Blocks、Assignment、Pitch、Review、Fact Check、Correction、Publication Schedule、Breaking News、Live Blog、Media、Source、Comment、Notification、Analytics、Newsletter、Subscription、Advertisement、Audit、Webhook、API Key、Feature Flag、Translation、Template、Policy、Special Coverage、Tip、Press Release、Interview、Transcript、Research Note、Availability 和 Jobs 等核心领域模型。

## 编辑流程

```text
DRAFT → SUBMITTED → IN_REVIEW → FACT_CHECK/COPY_EDIT → APPROVED → SCHEDULED → PUBLISHED → UPDATED/CORRECTED → ARCHIVED
```

后端负责验证状态转换，并把 Revision 与 Audit 记录持久化保存。

## 搜索

OpenSearch 用于全文检索、模糊搜索、语言过滤、频道过滤和日期过滤。当 OpenSearch 暂时不可用时，API 会回退到 PostgreSQL 的标题、摘要和导语匹配。

## 媒体上传

媒体使用 Presigned Upload：

```text
POST /api/media/presign
```

得到签名 URL 后，浏览器可以直接把文件 PUT 到 S3-compatible Storage。

## 实时事件

SSE 地址：

```text
GET /api/realtime/stream
```

用于突发新闻、Article 发布、Article 更新和 Live Blog Update 等实时事件。

## 构建与测试

```bash
npm run build
npm run test
npm run lint
```

## 环境变量

主要环境变量：

```text
DATABASE_URL
REDIS_URL
SEARCH_URL
SEARCH_INDEX
S3_ENDPOINT
S3_REGION
S3_BUCKET
S3_ACCESS_KEY
S3_SECRET_KEY
JWT_SECRET
JWT_REFRESH_SECRET
WEB_URL
NEXT_PUBLIC_API_URL
```

## 生产部署基线

生产部署时应替换开发 Secret，启用 TLS，使用 Secret Manager，限制 Object Storage 权限，启用 CSP 和严格 Rate Limit，对远程媒体 URL 执行 SSRF 防护，并在资产进入公共媒体库前接入病毒/恶意软件扫描。

## AI 编辑辅助

AI 只应作为编辑辅助层使用，例如标题建议、摘要草稿、标签建议、实体提取、SEO 草稿、相似稿件检测和转写清理。任何 AI 输出都必须保持 Draft/Review 状态，最终发布需要人工审核。
