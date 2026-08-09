---
title: JWT 生成完全指南：签发、HS256 签名、密钥与联调闭环
description: 讲清如何构造 JWT 三段、用 HS256 生成签名、管理密钥与过期声明，配合 WebUtils HMAC 生成器与 JWT 解码器完成「签发—验签—排错」闭环。
keywords: JWT生成,JWT签发,HS256,Token签名,JWT密钥,JSON Web Token
tag: 开发工具
type: howto
slug: jwt-generator-guide
datePublished: "2026-08-09"
dateModified: "2026-08-09"
readingMinutes: 14
primaryTool: /tools/dev/hmac-generator
relatedTools:
  - /tools/dev/jwt-decoder
  - /tools/dev/base64
  - /tools/dev/json-formatter
  - /tools/dev/hash-generator
relatedGuides:
  - jwt-decoder-guide
toolCta: HMAC 生成 — 本地计算 HS256 签名材料
sideBtn: 打开 HMAC 生成器
shortCrumb: JWT 生成完全指南
lead: >
  写登录、做 API 联调、或要造一枚可控的测试 Token 时，你真正缺的往往不是「再抄一段 jsonwebtoken 示例」，而是把 **Header / Payload 怎么编码、签名输入串是什么、密钥该怎么管、签发后如何自检** 一次理顺。本指南从签发视角讲 JWT 生成：字段怎么选、HS256 签名怎么算、在 WebUtils 上如何用 HMAC 生成器与解码器闭环验证，并给出密钥、过期与算法混淆等安全边界——不是把解码指南换皮重写。
---

## 核心一句话 {#tldr}

**生成 JWT = 写清楚声明 + 用正确算法对「header.payload」签名；签名防篡改，不负责保密。**

主链路：用 [HMAC 生成器](/tools/dev/hmac-generator) 理解并计算 HMAC-SHA256 签名材料，用 [JWT 解码器](/tools/dev/jwt-decoder) 回读 Header/Payload 并做 HS256 验签。业务系统里正式签发仍应走服务端库；本指南解决的是「你知道自己在签什么、怎么验、哪里会翻车」。

## 1. 签发视角：三段各自写什么 {#structure}

紧凑序列化仍是：

```text
base64url(header).base64url(payload).base64url(signature)
```

与「只解码」不同，生成时你必须主动决定每一段的内容。

### Header：算法契约，不是装饰

常见最小 Header：

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

| 字段 | 签发时怎么定 | 生成后后果 |
| --- | --- | --- |
| `alg` | 与密钥类型、验签方配置一致 | 写 `HS256` 却用 RSA 私钥、或写 `RS256` 却用对称密钥，对方直接拒 |
| `typ` | 多数场景固定 `JWT` | 少数网关会校验；别随手写成 `token` |
| `kid` | 密钥轮换时标识密钥版本 | 验签方按 `kid` 选密钥；缺了会落到默认密钥或失败 |

**切勿**在客户端「为了方便」把 `alg` 改成 `none` 或允许调用方指定算法。算法混淆攻击的根因往往是：验签端信任了 Token 里自报的 `alg`，却用了错误类型的密钥去验。

### Payload：只放「可公开 + 可过期」的声明

```json
{
  "sub": "u_1024",
  "iss": "https://auth.example.com",
  "aud": "api.example.com",
  "iat": 1723180800,
  "exp": 1723184400,
  "scope": "read:orders",
  "role": "ops"
}
```

签发清单（按优先级）：

1. **`exp`**：几乎所有生产 Token 都应有；联调用短过期（5～15 分钟）比「一年不过期」安全得多。
2. **`iat` / `nbf`**：需要排查时钟与「预发 Token」时加上；`nbf` 大于当前时间会表现为「尚未生效」。
3. **`sub`**：稳定的主体标识；不要塞邮箱明文当唯一依据，除非产品明确要求且可接受泄露。
4. **`iss` / `aud`**：多服务、多客户端时必须写清，避免 Token 被串用到别的 API。
5. **业务 claim**：`scope`、`tenant_id`、`role` 等；类型要稳定（字符串 vs 数字、单值 vs 数组）。

**禁止写入：** 密码、刷新令牌本体、完整银行卡、长期 API Secret、可直接提权的永久标志位。Payload 可被任意持有者 Base64URL 解码——这是格式设计，不是实现疏忽。

### Signature：对前两段的「带密钥指纹」

对 HS256，规范含义是：

```text
HMAC-SHA256(
  base64url(header) + "." + base64url(payload),
  secret
)
```

再把二进制结果做 Base64URL，得到第三段。生成时最容易错的三件事：

- 签名输入少了中间的 **点号**，或对整段 JWT 再签一次；
- 对 Header/Payload 做了普通 Base64（含 `+` `/` 与 `=`），而不是 Base64URL；
- 密钥多了换行、UTF-8/UTF-16 混用，或把「示例密钥」和「环境变量真实密钥」搞混。

## 2. 生成前先选型：HS256 还是非对称 {#choose}

| 需求 | 更合适的选择 | 原因 |
| --- | --- | --- |
| 单体后端、密钥只在服务端 | HS256 / HS384 / HS512 | 实现简单；验签与签发共用密钥 |
| 多微服务都要验、只有认证中心能签 | RS256 / ES256 等 | 公钥可分发，私钥不出签发方 |
| 浏览器/移动端自己「签发」给自家 API | 通常 **不该** | 密钥一旦进客户端就等于公开 |
| 只想本地看懂别人发的 Token | 解码即可，不必生成 | 见 [JWT 解码指南](/guides/jwt-decoder-guide) |
| Webhook / 原始报文完整性 | HMAC 本身，不一定是 JWT | 用 [HMAC 生成器](/tools/dev/hmac-generator) 更直接 |

本站可落地的生成向练习以 **HS256** 为主：HMAC 生成器负责「带密钥的摘要」，JWT 解码器负责「拆段 + 可选 HS256 验签」。RS256 的私钥运算不在浏览器小工具的安全模型里硬撑全流程——生产请用成熟库。

密钥长度经验（对称）：

- HS256：密钥熵不要低于 256 bit（32 字节随机），别用 `secret`、`123456`、项目名当密钥；
- 轮换：新密钥上线时靠 `kid` 区分；旧 Token 在 `exp` 内仍可用旧密钥验，过期后自然淘汰；
- 存放：环境变量 / 密钥托管，不进 Git、不进前端包、不进指南截图。

## 3. Base64URL 与「可签名字符串」 {#base64url}

生成失败有一半出在编码，而不是密码学。

| 步骤 | 正确做法 | 常见错法 |
| --- | --- | --- |
| JSON 序列化 | 键序固定、无多余空格（或与双方约定同一 canonical） | 这边美化缩进、那边压缩，导致签名输入不一致 |
| 编码 | Base64URL，去掉 `=` 填充 | 普通 Base64，或手动只替换部分字符 |
| 拼接 | `encodedHeader + "." + encodedPayload` | 用逗号、空格，或对 JSON 原文直接 HMAC |
| 签名输出 | 二进制 → Base64URL | 输出 hex 却当 JWT 第三段用 |

可用 [Base64 工具](/tools/dev/base64) 理解编码差异，但 **整枚 JWT 的拆解与 HS256 验签** 仍应回到 [JWT 解码器](/tools/dev/jwt-decoder)。Payload 很大时，先用 [JSON 格式化](/tools/dev/json-formatter) 校对字段，再编码进 Token。

最小手搓示例（仅说明结构，密钥为演示用）：

```text
header  = {"alg":"HS256","typ":"JWT"}
payload = {"sub":"demo","exp":1893456000}
signing_input = base64url(header) + "." + base64url(payload)
signature     = base64url( HMAC_SHA256(signing_input, "demo-only-secret") )
jwt           = signing_input + "." + signature
```

把得到的 `jwt` 贴进解码器：应能看到 `sub`/`exp`；在验签框填同一 `demo-only-secret` 且算法为 HS256 时，应显示签名有效。任一字节被改，验签应失败——这才是「生成成功」的定义，而不是「字符串看起来像三段」。

## 4. 在 WebUtils 上走通「生成材料 → 自检」 {#steps}

仓库当前没有单独的「一键填表出 JWT」页面；生成向练习由 **HMAC 生成器 + JWT 解码器（及 Base64/JSON）** 组成。按下面顺序做，比在聊天里互相贴半截 Token 高效。

### A. 准备声明（建议先 JSON 工具）

1. 打开 [JSON 格式化](/tools/dev/json-formatter)，分别写好 Header 与 Payload，确认是合法 JSON。
2. 把 `exp` 写成 **秒** 级 Unix 时间；可用短过期方便观察「未过期 / 已过期」两种状态。
3. 业务字段只保留联调需要的最小集，避免一次塞十几个无用 claim。

### B. 得到 signing input

1. 将 Header、Payload 分别做 Base64URL（无填充）。
2. 用英文点号拼接成 `signing_input`。
3. 这一步的字符串必须与最终 JWT 的前两段 **逐字符相同**，否则后面 HMAC 再正确也会对不上。

### C. 用 HMAC 生成器算签名材料

1. 打开 [HMAC 生成器](/tools/dev/hmac-generator)。
2. 算法选与 Header `alg` 对应的 HMAC-SHA256（或你文档约定的 SHA 变体）。
3. **Key** 填共享密钥；**Data** 填完整的 `signing_input`（两段 + 中间点），不要只贴 Payload。
4. 生成后确认输出编码：JWT 第三段需要 **Base64URL** 形态。若工具默认 hex/普通 Base64，按你使用的库文档转换，或在支持 JWT 的服务端库里完成最终组装。
5. 组装：`jwt = signing_input + "." + signature_base64url`。

### D. 立刻用解码器闭环

1. 打开 [JWT 解码器](/tools/dev/jwt-decoder)。
2. 只粘贴 Token 本体，不要带 `Bearer `。
3. 核对 Header 的 `alg`、Payload 的 `exp` 本地时间与业务字段。
4. 在「验证签名」中填入 **同一密钥**（仅 HS256 路径）：通过则本轮生成成立；失败则回到 B/C 查编码与密钥，而不是先改业务接口。
5. 需要对比两次签发差异时，把两段 Payload 复制到 JSON 工具做结构化对比。

### 工具边界（避免预期错位）

- **HMAC 生成器：** 通用消息认证码；帮你理解并计算「密钥 + 报文 → 摘要」，也可服务 Webhook 签名等非 JWT 场景。
- **JWT 解码器：** 三段解析、`exp`/`iat` 可读化、可选 **HS256** 验签；不负责 RSA 私钥签发。
- **Hash 生成器：** 无密钥摘要，用于文件/文本指纹；**不能**代替 JWT 签名（见 [Hash 指南](/guides/hash-generator-guide)）。
- **正式签发：** Node / Java / Go 等生态的 JWT 库（处理编码、时间、密钥与抗混淆配置）；浏览器小工具用于教学、联调与排错，不是 IdP。

## 5. 签发后常见翻车与对照 {#errors}

| 现象 | 更可能的生成侧原因 | 处理 |
| --- | --- | --- |
| 解码成功但验签失败 | 密钥不一致、signing input 少了点、Base64 变体错误、密钥首尾空格 | 固定一份「密钥 + signing input」对照；用解码器 HS256 验签定位 |
| 服务端 401「signature invalid」 | 环境用了另一套 Secret；或 Header `alg` 与库配置不一致 | 对签发与验签环境打印密钥指纹（哈希）而非明文；核对 `alg` |
| 刚签出就过期 | `exp` 用了毫秒、或服务器 UTC/本地时区理解错误 | 统一秒级；解码器看本地可读时间；容器做 NTP |
| `nbf` 导致偶发失败 | 预发 Token 或时钟回拨 | 签发时留几秒 clock skew，或文档写明允许的偏移 |
| 前端「改了 role 仍是旧权限」 | 改的是本地解码结果，没有用持钥方重新签名 | 必须重签整枚 Token；若改 Payload 不重签仍能通，说明服务端没验签 |
| 网关收、业务拒 | `aud`/`iss`/自定义 claim 类型不对 | 生成时把 claim 契约写成表；用 JSON 工具看类型 |
| 算法是 RS256，本地 HS 验签提示不支持 | 非对称 Token | 解码仍可看声明；验签走公钥与服务端日志 |
| Token 带换行/空格 | 从日志或邮件复制时折行 | 生成与粘贴都保持单行三段 |

## 6. 真实工作场景 {#scenarios}

### 场景 A：后端还没好，前端要先接「带权限」的假登录

 造一枚短过期、`role`/`scope` 齐全的 HS256 Token，写入本地开发网关或 mock。用解码器确认字段后，再让前端走真实 `Authorization` 头。**密钥只放本地 `.env`，禁止推进共享前端仓库。** 假 Token 的 `iss` 建议带 `dev-` 前缀，避免误打到预发。

### 场景 B：两个环境 Secret 不同，联调「同一用户」却一边过一边不过

不要先对业务代码。用同一 Payload 在两边各签一枚，解码对比 Header 是否都是 HS256，再分别用各自环境密钥在解码器验签。若 A 密钥能验 A 票、不能验 B 票，说明问题在密钥分发，不在用户表。

### 场景 C：迁移 Session → JWT，要规定「最小 claim 集」

生成阶段就把表定死：`sub`、`exp`、`iat`、`sid`（会话版本）、`auth_time`。每次示例 Token 都按表签发，用解码器当验收工具：缺字段的生成脚本直接判失败。比上线后靠 403 日志反推字段更省时间。

### 场景 D：怀疑有人伪造 Token

取一枚线上（或审计）Token，解码看 `alg` 与 `kid`。若 `alg` 为 `none` 或与文档不符，按事故处理。用当前密钥做 HS256 验签：失败说明不是本密钥体系签发；成功则进一步查 `exp` 与权限 claim 是否被业务误用。生成侧的防护是：**私钥/密钥不出签发服务、拒绝 alg 由调用方决定。**

## 7. 安全与密钥：生成时就要写进流程 {#security}

- **密钥当密码管：** 长度与随机性够；轮换有 `kid`；泄露即轮换并视情况吊销未过期票。
- **短过期 + 刷新令牌：** 访问 Token 分钟～小时级；刷新 Token 存服务端可吊销存储，不要只靠超长 `exp`。
- **生成环境隔离：** 开发 / 预发 / 生产密钥分离；禁止生产密钥出现在演示文稿。
- **传输：** 只走 HTTPS；不要把完整 Token 当 URL 长期查询参数（日志与 Referer 会泄露）。
- **日志：** 只打 `jti` 或 Token 前后几位；完整 JWT 进日志等于会话外泄。
- **库配置：** 验签端写死允许的算法列表；关闭 `none`；HS 与 RS 不要混用同一「万能验签」函数。
- **浏览器工具：** WebUtils 本地处理，仍不要把高权限生产票贴到共享大屏或录制演示里。

## 8. 相关工具怎么选 {#related}

| 你的目标 | 用谁 | 不要误用成 |
| --- | --- | --- |
| 计算 HMAC、理解签名输入 | [HMAC 生成器](/tools/dev/hmac-generator) | 当成完整 IdP |
| 回读并 HS256 验签自检 | [JWT 解码器](/tools/dev/jwt-decoder) | 只解码就断言「线上一定接受」 |
| 校对 claim JSON | [JSON 格式化](/tools/dev/json-formatter) | 代替 Base64URL |
| 搞清编码字符集 | [Base64](/tools/dev/base64) | 整枚 JWT 当普通 Base64 硬解 |
| 无密钥指纹 / 文件校验 | [Hash 生成器](/tools/dev/hash-generator) | 当 JWT 第三段 |

口诀：**声明用 JSON 校对 → 编码拼 signing input → HMAC 出签名 → 解码器验签闭环 → 业务库做生产签发。**

更偏「读懂别人发的票」时，读 [JWT 解码完全指南](/guides/jwt-decoder-guide)；本文专注 **你怎么把票签对、签安全**。

## 常见问题 {#faq}

### 没有单独的「JWT 生成器」页面，还能练习生成吗？

可以。生成的本质是编码 + HMAC（对称）或私钥签名（非对称）。WebUtils 用 HMAC 生成器覆盖对称签名材料，用 JWT 解码器做结果验收。生产环境请改用服务端 JWT 库一次性完成编码与签名，避免手搓出错。

### 签名是不是加密？签完是不是只有服务器能看 Payload？

不是。签名证明「持有密钥的人认可以上内容且内容未被改」；Header 与 Payload 仍是可解码的。保密靠 HTTPS 与「不要把机密放进 Payload」，不靠 JWT 外观混乱。

### HS256 的密钥可以写在前端吗？

不可以。前端能拿到的密钥等于公开密钥，任何人都能自签「管理员」Token。浏览器只应持有已经由服务端签发的 Token（或通过安全的 BFF 模式）。

### 为什么我用在线工具签的票，官方库验不过？

逐项对齐：`alg`、密钥字节、Base64URL 是否去填充、signing input 是否含点号、时间 claim 是否为秒、库是否拒绝你用的算法。用本站解码器做中间态：先保证「自签自验」通过，再对接官方库。

### `exp` 应该设多长？

按暴露面：高敏感 API 用更短的访问 Token，配合刷新；纯内部只读可略长，但仍应可轮换。联调示例用 5～15 分钟，便于演示过期，也避免测试票长期有效被误用。

### 能否用 MD5 或裸 SHA256 当 JWT 签名？

不能当标准 JWT 签名。JWT 的 HS* 是 **HMAC** 族；裸哈希没有密钥，防不了伪造。需要无密钥指纹时用 Hash 工具，需要带密钥完整性时用 HMAC 或完整 JWT 库。

### 生成时要不要每次都改 `jti`？

若你做重放检测、一次性票或服务端黑名单，需要唯一 `jti`。若仅无状态短过期访问票，可以不强制，但审计场景下 `jti` 很有用。

### 手搓 JWT 和生产库 generate 有什么本质差别？

手搓帮助理解字节级约定；生产库处理算法安全默认值、时钟、密钥格式与抗混淆。上线路径应以库为准，工具链用于教学与故障定位。

## 继续浏览 {#next}

先用演示密钥在本地完成一次「拼段 → HMAC → 解码验签」；确认自洽后，再把同一套 claim 契约写进服务端签发代码。排错时优先固定密钥与 signing input，而不是同时改业务与网关。

- [打开 HMAC 生成器](/tools/dev/hmac-generator)
- [打开 JWT 解码器](/tools/dev/jwt-decoder)
- [JWT 解码完全指南](/guides/jwt-decoder-guide)
- [返回指南列表](/guides/)
- [全部工具](/tools-directory)
