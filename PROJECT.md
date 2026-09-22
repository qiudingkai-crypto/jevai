# Jev Verdict — 项目文档

## 项目概述

**Jev Verdict** 是一个基于 TypeSafe System One (Jev) 模型的 AI 决策工具网站。用户粘贴文本，选择问题类型（Yes/No、Choice、Score），Jev 返回结构化的概率/分数结果，而不是自由文本。

- **线上地址**: https://jev-ai.xyz
- **GitHub**: https://github.com/qiudingkai-crypto/jevai.git
- **技术栈**: Next.js 15 (App Router) + Prisma + Neon Postgres + Auth.js v5 + Waffo Pancake 支付
- **部署平台**: Vercel
- **品牌名**: Jev Verdict

---

## 核心功能

### 三个场景（Playground）
1. **Upwork 提案** — 判断是否该提交某个 Upwork 项目提案
2. **Upwork 候选人** — 评估候选人简历匹配度
3. **Chat 消息** — 消息意图分类与紧急度判断

### 三种问题类型
- **Yes/No (noul)**: 二元判断，返回概率
- **Choice**: 从固定选项中选择，返回各选项概率分布
- **Score**: 打分（如 0-5 分），返回分数与置信度

### 计费系统
- **免费额度**: 注册即送 5 次
- **7天签到奖励**: Day1+1, Day2+1, Day3+2, Day4+2, Day5+2, Day6+3, Day7+3（共14积分，只送一次不循环）
- **积分包（一次性购买）**:
  - Starter Pack: $4.9 = 500 积分
  - Pro Pack: $9.9 = 1000 积分
- **无月订阅、无年付、无 API 转售**
- **计费优先级**: pro_monthly → credits → free

### 其他页面
- `/pricing` — 积分包购买页
- `/terms` — 服务条款（含退款/取消政策、自动续费说明）
- `/privacy` — 隐私政策
- 首页 footer 含 Terms / Privacy / Contact 链接

---

## 技术架构

### 前端
- Next.js 15 App Router（"use client" 组件为主）
- 浅色主题（深色已被否）
- 首页布局: 左文右动画（HeroAnimation），下方接 Playground
- TopBar: 🎁 签到按钮 + 积分显示 + 头像下拉（Account & Billing / Sign out）

### 后端 API
| 端点 | 方法 | 功能 |
|------|------|------|
| `/api/systemone` | POST | 调用 Jev 模型，扣减对应额度 |
| `/api/usage` | GET | 返回 freeRemaining / credits / totalRemaining |
| `/api/checkin` | GET/POST | 签到状态查询与签到领积分 |
| `/api/checkout` | POST | 创建 Waffo 支付订单 |
| `/api/webhooks/waffo` | POST | 支付成功回调，加积分 |

### 数据库 (Neon Postgres + Prisma v6)
**User 模型字段**:
- `id`, `name`, `email`, `emailVerified`, `image`
- `plan` (默认 "free")
- `credits` (默认 0)
- `monthlyRunsUsed` (默认 0)
- `monthlyResetAt`
- `subscriptionEndsAt`
- `lastCheckInAt`
- `checkInStreak` (默认 0)
- `createdAt`

**UsageRun 模型**: 记录每次调用（userId, scenario, stateLen, inputTokens, outputTokens）

### 认证
- Auth.js v5 + Google OAuth
- JWT session 策略
- 用户 dingkai005@gmail.com 为管理员

---

## 第三方服务

### Jev 模型 API (TypeSafe)
- **Endpoint**: `POST https://api.typesafe.ai/v1/systemone`
- **认证**: Bearer token
- **模型**: `jev-latest`
- **定价**: 输入 $0.042/百万 token，输出免费
- **字符限制**: 50,000 字符（约 12,500 token）
- **1000 次最大输入成本**: ~$0.525

### Waffo Pancake 支付
- **Merchant ID**: `MER_2lznjVAoxL3f8j4h085kLy`（注意是小写 L，不是数字 1）
- **Store ID**: `STO_61cLx5mGw3ueCoEHLHwy3o`
- **产品映射**:
  - Starter Pack ($4.9 = 500 credits): `PROD_4FPBGerWxwmKRtC7G4fICu`
  - Pro Pack ($9.9 = 1000 credits): `PROD_4kF76T5Y1jfdvehOHJ8OuW`
- **Webhook**: `https://jev-ai.xyz/api/webhooks/waffo`

### 环境变量 (.env.local / Vercel)
```
AUTH_SECRET=...
AUTH_GOOGLE_ID=199501651513-11rs7qq2tl0i9cu04qmv3fcesnorg2hh.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=...
DATABASE_URL=postgresql://neondb_owner:...@ep-wandering-wave-aw97xg5u-pooler.c-12.us-east-1.aws.neon.tech/neondb
JEV_AI_API_KEY=apikey_...
WAFFO_MERCHANT_ID=MER_2lznjVAoxL3f8j4h085kLy
WAFFO_PRIVATE_KEY=...
```

---

## 本地开发

```bash
# 安装依赖（Windows 需要 --legacy-peer-deps）
npm install --legacy-peer-deps

# 本地开发
npm run dev

# 构建
npx next build

# 部署（push 到 main 自动触发 Vercel 部署）
git push origin main
```

- 本地代理: Clash `http://127.0.0.1:7890`
- 本地端口: 3000

---

## 已知问题与注意事项

1. **Waffo Merchant ID 容易打错**: 是 `MER_2lzn...`（小写 L），不是 `MER_21zn...`（数字 1）
2. **createPortal SSR 问题**: 弹窗用 portal 渲染到 body 时，必须加 `if (!mounted) return null` 防止服务端报错
3. **事件监听器闭包陷阱**: useEffect 空依赖数组会捕获旧闭包，需要把依赖变量加入 deps
4. **plan 字段**: 测试时不要把用户设为 "pro"，否则会走 pro 月额度而不是 credits
5. **usageRun 计数**: 每次成功调用都会创建 usageRun 记录，包括 credit 调用，所以 freeRemaining 会随总调用次数递减
6. **客服邮箱**: dingkai005@gmail.com（不是 support@jev-ai.xyz）

---

## 项目结构

```
app/
  api/
    systemone/route.ts      # Jev 模型调用 + 计费
    usage/route.ts          # 用量查询
    checkin/route.ts        # 签到
    checkout/route.ts       # Waffo 支付创建
    webhooks/waffo/route.ts # 支付回调
  components/
    Playground.tsx          # 主 playground 组件
    HeroAnimation.tsx       # 首屏动画
  page.tsx                  # 首页（含 TopBar、签到弹窗）
  pricing/page.tsx          # 定价页
  terms/page.tsx            # 服务条款
  privacy/page.tsx          # 隐私政策
  success/page.tsx          # 支付成功页
prisma/
  schema.prisma             # 数据库模型
lib/
  scenarios.ts              # 场景定义
  prisma.ts                 # Prisma client
auth.ts                     # Auth.js 配置
```
