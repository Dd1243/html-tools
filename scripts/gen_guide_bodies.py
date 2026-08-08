# -*- coding: utf-8 -*-
"""Unique long-form guide bodies for batch generation. Import GUIDES_DATA."""
from __future__ import annotations
from _guide_body_lib import p, sec, ul, ol, table, code, callout, key, checklist, tools

def _expand(blocks):
    return "".join(blocks)

# -------- builders return body html --------

def body_base64():
    return _expand([
        key("核心一句话", "Base64 是编码不是加密；任何人都能解码，它只解决二进制如何安全走文本通道。",
            "先分清标准、URL-safe 与 Data URL，再谈复制到接口或文档。"),
        sec("what", "它解决什么、不解决什么",
            p("邮件、部分 HTTP 头、JSON 字符串字段和配置文件更擅长承载可打印文本。图片字节、证书 DER、随机密钥一旦直接塞进这些通道，常被截断或误解析。Base64 把任意字节映射到 64 个字符，使二进制能像普通文本一样复制与存储。",
              "它不提供机密性与完整性：看到编码串的人通常能还原原文。若目标是保密，应使用加密；若目标是校验未被篡改，应使用哈希或签名。把密码只做 Base64 就当成「加密存储」，是常见且危险的误解。",
              "WebUtils 的 Base64 工具在浏览器本地处理，适合中小文本与样例排查，避免把附件随手上到来路不明的网站。")),
        sec("mech", "3 字节到 4 字符与填充",
            p("算法每次取 3 字节共 24 bit，切成 4 段 6 bit，查表得到 A–Z、a–z、0–9、+、/。输入长度不是 3 的倍数时，用 = 填充，使输出长度永远是 4 的倍数。",
              "解码先处理填充再拼回字节。少写、多写或在错误位置插入 =，都会导致失败。传输过程中若网关自动折行，解码前需要去掉换行与空格。"),
            code("输入长度 mod 3 = 1 → 常见两个 =\n输入长度 mod 3 = 2 → 常见一个 =\n输入长度 mod 3 = 0 → 无填充"),
            p("中文等非 ASCII 必须先按约定（通常 UTF-8）得到字节，再 Base64。对错误字符集的字节编码，只会把乱码包装得更「合法」。")),
        sec("variants", "标准、URL-safe、Data URL",
            table(["变体", "差异", "场景"], [
                ["标准 Base64", "+ / 与可选 =", "邮件、通用 API、多数库默认"],
                ["URL-safe", "+→- /→_，常无 =", "JWT 片段、查询参数"],
                ["Data URL", "data:mime;base64,载荷", "HTML/CSS 内联小资源"],
            ]),
            p("JWT 使用 Base64URL。把 JWT 段直接丢进标准解码器而不替换字符，容易失败。Data URL 必须保留前缀；只把逗号后载荷当纯 Base64 才与「纯编码」工具对齐。",
              "同一系统内应固定一种变体并写进接口文档，避免前端用标准、网关按 URL 规则改写 + 号。"),
            callout("<p><strong>选型：</strong>通道是 URL/Token → URL-safe；邮件与通用字段 → 标准；页面内联 → Data URL。</p>")),
        sec("steps", "在 WebUtils 中的操作",
            ol([
                "打开 <a href=\"/tools/dev/base64\">Base64 工具</a>。",
                "选择编码或解码；图片场景分清「原始文件字节」与「已是 Data URL」。",
                "粘贴前脱敏密钥与隐私。",
                "执行转换，检查是否多出意外空白。",
                "若结果进入 URL，确认是否还要 URL 编码或改用 URL-safe。",
                "对明文样例做一次反向转换，确认可逆。",
            ]),
            p("浏览器内存有限，超大文件更适合本地 CLI 或服务端流式处理；在线工具擅长样例与联调。")),
        sec("scenes", "场景化用法",
            p("<strong>文档内联小图：</strong>转 Data URL 可免图床，但体积约增 33%，大图会拖慢页面。",
              "<strong>配置中的二进制材料：</strong>写清是单层还是双重 Base64，以及字符集。",
              "<strong>联调报「非法 Base64」：</strong>先清空白与中文引号，再查 + 是否变空格，最后核对变体。",
              "<strong>前端本地预览：</strong>FileReader 出 Data URL 适合预览；正式上传优先 multipart 二进制，避免巨大 JSON。")),
        sec("errors", "错误对照",
            table(["现象", "原因", "处理"], [
                ["非法字符", "空白、换行、中文标点", "只保留字母表与 ="],
                ["填充错误", "= 数量或位置不对", "按 4 倍长度检查"],
                ["JWT 解失败", "标准/URL-safe 混用", "替换 -_ 并补填充"],
                ["中文乱码", "字符集不一致", "统一 UTF-8"],
                ["+ 变空格", "查询串规则", "用 %2B 或 URL-safe"],
            ])),
        checklist("checklist", "检查清单", [
            "确认需求是编码而非加密",
            "变体与通道一致并写进约定",
            "字符集或 MIME 已明确",
            "传输未破坏 + / =",
            "敏感数据本地处理",
            "关键样例做过往返验证",
        ]),
        tools("related", "相关工具怎么选", [
            ("/tools/dev/base64", "Base64", "本篇主工具"),
            ("/tools/dev/url-codec", "URL 编解码", "查询参数再编码"),
            ("/tools/dev/hash-generator", "哈希", "完整性校验"),
            ("/tools/media/image-to-base64", "图片转 Base64", "Data URL 专用"),
        ]),
        sec("team", "团队约定",
            p("接口文档应写明字段是 raw Base64 还是 Data URL 全串。代码评审应拒绝「Base64 当加密」。日志打印编码串时要截断脱敏，因为 Base64 几乎等于明文可见。")),
    ])


def meta_base64(body):
    return {
        "slug": "base64-guide",
        "title": "Base64 编解码完全指南：标准、URL-safe 与 Data URL",
        "description": "讲清 Base64 与加密的区别，覆盖填充、URL-safe、Data URL、步骤、场景与排错，配套 WebUtils 本地工具。",
        "keywords": "Base64,Base64编码,Base64解码,Data URL,URL-safe,在线Base64",
        "tag": "开发工具",
        "tool_path": "/tools/dev/base64",
        "tool_name": "Base64 编解码",
        "tool_cta": "浏览器本地编码/解码，便于样例与联调",
        "lead": "需要把二进制放进只适合文本的通道时，Base64 是默认选项——但它不是加密。本指南说明标准与 URL-safe 差异、Data URL、WebUtils 步骤与高频错误。",
        "toc": [("tldr","核心一句话"),("what","解决什么问题"),("mech","编码机制"),("variants","三种变体"),("steps","在线步骤"),("scenes","真实场景"),("errors","常见错误"),("checklist","检查清单"),("related","相关工具"),("team","团队约定")],
        "body": body,
        "faqs": [
            ("Base64 是加密吗？", "不是。它可逆且不保密。需要机密性请用加密并管理密钥。"),
            ("为什么总是解码失败？", "空白换行、填充错误、标准与 URL-safe 混用、把 Data URL 整段当纯 Base64，都是高频原因。"),
            ("和哈希有何不同？", "哈希不可逆，用于摘要；Base64 可逆，用于形态转换。"),
            ("大文件能在线转吗？", "中小样例可以；超大文件占内存，建议本地或服务端处理。"),
            ("JWT 为啥解不开？", "JWT 用 Base64URL，需按 URL-safe 规则处理并理解常无填充。"),
        ],
        "howto_steps": [
            ("打开工具", "打开 WebUtils Base64 页面。"),
            ("选择方向", "编码或解码，并确认文本/变体需求。"),
            ("转换并检查", "去掉意外空白，必要时改 URL-safe。"),
            ("往返验证", "对样例做反向转换确认可逆。"),
        ],
        "primary_tool_file": "tools/dev/base64.html",
        "related_tools": ["tools/dev/url-codec.html", "tools/dev/hash-generator.html", "tools/media/image-to-base64.html"],
        "card_desc": "标准/URL-safe/Data URL、步骤与排错，配套 Base64 工具。",
        "llms_title": "Base64 编解码完全指南",
        "llms_blurb": "编码非加密；填充、URL-safe、Data URL 与排错",
        "short_crumb": "Base64 编解码完全指南",
        "card_tool_label": "打开 Base64",
        "howto_name": "如何在线进行 Base64 编解码",
        "howto_desc": "使用 WebUtils Base64 工具完成编码、解码与变体处理。",
    }

GUIDES_DATA = [meta_base64(body_base64())]
