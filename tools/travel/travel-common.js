(function () {
  "use strict";

  const SITE_ORIGIN = "https://essays4u.net";
  const PREVIEW_IMAGE = `${SITE_ORIGIN}/social-preview.png`;
  const head = document.head;
  const body = document.body;

  if (!head || !body) {
    return;
  }

  const docTitle = (document.title || "旅行工具 - WebUtils").trim();
  const pageTitle = docTitle.replace(/\s*-\s*WebUtils.*$/i, "").trim() || docTitle;
  const pathname = window.location.pathname || "";
  const fileName = (pathname.split("/").pop() || "travel-tool.html").replace(/\.html?$/i, "");
  const metaDescription =
    (head.querySelector('meta[name="description"]')?.getAttribute("content") || "").trim() ||
    `${pageTitle}：为旅行者准备的在线实用工具，帮助你在预算、行程、时差、签证、行李和落地使用场景中快速做出判断。`;
  const canonicalLink = getCanonicalLink();
  const context = detectContext(fileName, pageTitle);

  body.classList.add("travel-enhanced");

  function getCanonicalLink() {
    const existing = head.querySelector('link[rel="canonical"]')?.getAttribute("href");
    if (existing && /^https?:\/\//i.test(existing)) {
      return existing;
    }

    const cleanPath = pathname
      ? pathname.startsWith("/")
        ? pathname.replace(/\.html$/i, "")
        : `/${pathname.replace(/\.html$/i, "")}`
      : `/tools/travel/${fileName}`;

    return `${SITE_ORIGIN}${cleanPath}`;
  }

  function detectContext(slug, title) {
    const rules = [
      {
        match: /visa|passport|vaccine/,
        eyebrow: "入境准备与证件核对",
        problem:
          "很多出行风险并不是不会申请，而是把免签、落地签、电子签、过境条件、证件有效期和健康要求混在一起，导致材料顺序错、时间线错，最后在值机或入境时被拦下。",
        scenarios: [
          "出发前需要快速确认签证、护照照片、疫苗或附加材料是否齐全。",
          "要同时比较多个目的地或中转地的要求，避免只看第一程信息。",
          "需要给家人、同事或客户一个更容易执行的材料准备清单。"
        ],
        mistakes: [
          "只看旧攻略，不看使领馆、航空公司和边检的最新说明。",
          "忽略护照剩余有效期、空白页、回程证明、酒店订单等辅助材料。",
          "把“可以入境”和“适合当前行程结构入境”混为一谈。"
        ],
        primaryInputs: "国籍、目的地、停留时长和证件信息",
        secondaryInputs: "中转条件、照片规格、疫苗或附加文件",
        officialCheck:
          "涉及签证、健康和证件有效性的判断，应当再与使领馆、航空公司和值机柜台说明交叉核对。"
      },
      {
        match: /budget|cost|currency|tip|fuel|hotel|toll|splitter/,
        eyebrow: "预算与费用决策",
        problem:
          "旅行花费最容易失控的地方，通常不是大项本身，而是税费、汇率、小费、油费、过路费、多人分摊和临时增项叠加在一起后超出预期。",
        scenarios: [
          "订机酒前先判断总预算是否可控，避免到了目的地才发现现金流紧张。",
          "多人同行时，希望把分摊规则说清楚，减少反复对账的尴尬。",
          "需要对比不同出行方式、不同住宿档位或不同支付方式的成本差异。"
        ],
        mistakes: [
          "只按裸价做预算，没有把税费、小费、停车费、押金和服务费算进去。",
          "把汇率当固定值，不给波动和应急支出留缓冲。",
          "多人记账口径不一致，导致最后结算时来回返工。"
        ],
        primaryInputs: "预算总额、人数、天数和核心消费项目",
        secondaryInputs: "货币、税费、小费、燃油和分摊方式",
        officialCheck:
          "涉及实际付款时，请以商户账单、银行汇率、平台税费页面和当地收费规则为准。"
      },
      {
        match: /time|timezone|clock|jet-lag|flight-time/,
        eyebrow: "时间安排与跨时区协同",
        problem:
          "跨城市和跨时区出行最常见的问题，是把本地时间、目的地时间、航班时间和身体适应节奏混成一个概念，结果不是算错，就是安排错。",
        scenarios: [
          "要和海外同事、酒店、接送机司机或家人约定一个双方都不出错的时间。",
          "要评估转机、入住、会面或活动时间是否现实，避免“纸面可行、现场来不及”。",
          "希望提前安排作息调整，降低夜航和大时差带来的疲劳感。"
        ],
        mistakes: [
          "忽略夏令时、日期跨越和“次日到达”这种最容易漏掉的信息。",
          "把时差结果当作唯一依据，没有结合身体状态和落地后交通时间判断。",
          "只看起飞降落时刻，不看值机、安检、转机和入境实际缓冲。"
        ],
        primaryInputs: "出发地、目的地、日期时间和停留安排",
        secondaryInputs: "航班时刻、作息窗口和换时区计划",
        officialCheck:
          "涉及航司时刻表、机场运营和夏令时变更时，请再核对航空公司或机场公告。"
      },
      {
        match: /baggage|luggage|packing/,
        eyebrow: "行李准备与托运判断",
        problem:
          "很多人并不是不会打包，而是不知道哪些东西该先带、哪些重量该提前控制、哪些行李信息该留痕，导致超重、漏带或丢失后无法快速说明。",
        scenarios: [
          "出发前想知道托运行李是否会超限，避免现场拆箱和额外付费。",
          "需要根据天气、行程类型和时长生成更像“能执行”的打包清单。",
          "一旦发生延误或丢失，希望能第一时间拿出行李牌号和关键描述。"
        ],
        mistakes: [
          "按经验装箱，不按重量、尺寸和类别做优先级管理。",
          "行李牌、航班号、箱体特征没有记录，出问题时难以说明。",
          "把当天必需品全塞进托运行李，没有给延误风险留缓冲。"
        ],
        primaryInputs: "行程天数、目的地环境、重量尺寸或行李状态",
        secondaryInputs: "特殊物品、托运限制和自定义清单",
        officialCheck:
          "涉及航空公司尺寸重量标准、危险品或特殊行李规则时，请以承运航司说明为准。"
      },
      {
        match: /emergency/,
        eyebrow: "安全与紧急应对",
        problem:
          "真正遇到突发情况时，最宝贵的不是多知道几个号码，而是能在几秒内找到正确联系人、判断优先级并把必要信息讲清楚。",
        scenarios: [
          "落地后需要提前存好报警、急救、火警、大使馆和保险协助联系方式。",
          "担心手机丢失、网络不稳或语言障碍，想准备离线可查的应急信息。",
          "希望把应急联络方式发给同行家人，减少突发时的沟通成本。"
        ],
        mistakes: [
          "只记住一个报警电话，没有区分急救、医疗、使馆和保险协助渠道。",
          "平时不保存联系人，真正需要时还要重新搜索。",
          "只准备号码，不准备护照号、酒店地址、航班信息等上下文。"
        ],
        primaryInputs: "国家地区、紧急场景和联系方式",
        secondaryInputs: "使馆、保险、住址和同行人信息",
        officialCheck:
          "涉及报警、医疗和领事求助时，请以当地官方机构和中国驻外使领馆最新公布渠道为准。"
      },
      {
        match: /adapter|sim|driving|phrase|size/,
        eyebrow: "落地使用与现场决策",
        problem:
          "很多旅行阻碍并不大，但很碎：能不能插电、能不能上网、靠左还是靠右开、单位尺寸怎么换算、最基本的沟通能不能快速说出来。",
        scenarios: [
          "落地后马上要解决充电、联网、租车或沟通问题，不想临时手忙脚乱。",
          "要为家庭、团队或商务出行提前统一一套执行标准。",
          "希望在机场、前台、门店或路上快速做出判断，不再到处翻攻略。"
        ],
        mistakes: [
          "只知道国家名，不知道当地使用标准和落地后的实际限制。",
          "把国内习惯直接带到海外场景，忽略驾驶方向、插头、电压或尺码口径差异。",
          "没有准备离线表达方式或备用方案，一旦没网就会卡住。"
        ],
        primaryInputs: "国家地区、使用标准和现场需求",
        secondaryInputs: "网络、电压、规格、语言或租车条件",
        officialCheck:
          "涉及租车法规、运营商套餐、设备兼容和当地安全提示时，请结合官方说明继续核实。"
      },
      {
        match: /itinerary|checklist|season|weather/,
        eyebrow: "行前规划与执行安排",
        problem:
          "大多数行程不是做不出来，而是排得太满、顺序不合理、天气季节没纳入判断，或者待办事项没有落实到真正会执行的清单里。",
        scenarios: [
          "希望把路线、活动、待办和天气季节因素统一在一个可操作页面里判断。",
          "需要在手机上边走边改计划，同时让同伴也能快速理解安排。",
          "想把“想去的地方”整理成“真的来得及、花得起、带得走”的方案。"
        ],
        mistakes: [
          "只按景点愿望清单排，不按交通、开门时间、体力和天气做取舍。",
          "有计划但没有待办闭环，护照、保险、交通、设备等常常漏掉。",
          "忽略旺季、淡季、降雨、节假日和现场排队时间。"
        ],
        primaryInputs: "目的地、日期、活动安排和出发前待办",
        secondaryInputs: "天气、季节、预算缓冲和执行优先级",
        officialCheck:
          "涉及开放时间、天气预报、交通时刻和景区政策时，请再以官方数据或实时公告确认。"
      }
    ];

    const selected =
      rules.find((item) => item.match.test(slug) || item.match.test(title.toLowerCase())) || rules[rules.length - 1];

    return {
      ...selected,
      relatedSummary: `${selected.eyebrow}、${selected.primaryInputs}与${selected.secondaryInputs}`
    };
  }

  function upsertMeta(selector, attrs, options) {
    const config = options || {};
    let node = head.querySelector(selector);

    if (!node) {
      node = document.createElement("meta");
      Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
      head.appendChild(node);
      return node;
    }

    Object.entries(attrs).forEach(([key, value]) => {
      const current = node.getAttribute(key);
      if (!current || (config.forceContent && key === "content")) {
        node.setAttribute(key, value);
      }
    });

    return node;
  }

  function upsertLink(rel, href) {
    let link = head.querySelector(`link[rel="${rel}"]`);
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", rel);
      head.appendChild(link);
    }

    if (!link.getAttribute("href") || rel === "canonical") {
      link.setAttribute("href", href);
    }

    return link;
  }

  function ensureSocialMeta() {
    upsertMeta('meta[http-equiv="X-UA-Compatible"]', {
      "http-equiv": "X-UA-Compatible",
      content: "IE=edge"
    });
    upsertMeta('meta[name="referrer"]', {
      name: "referrer",
      content: "strict-origin-when-cross-origin"
    });
    upsertMeta('meta[name="color-scheme"]', {
      name: "color-scheme",
      content: "dark light"
    });
    upsertMeta('meta[name="theme-color"]', {
      name: "theme-color",
      content: "#0a0a0f"
    });
    upsertMeta('meta[name="format-detection"]', {
      name: "format-detection",
      content: "telephone=no,email=no,address=no"
    });
    upsertMeta('meta[name="application-name"]', {
      name: "application-name",
      content: "WebUtils"
    });
    upsertMeta('meta[name="apple-mobile-web-app-capable"]', {
      name: "apple-mobile-web-app-capable",
      content: "yes"
    });
    upsertMeta('meta[name="apple-mobile-web-app-title"]', {
      name: "apple-mobile-web-app-title",
      content: pageTitle
    });
    upsertMeta('meta[name="apple-mobile-web-app-status-bar-style"]', {
      name: "apple-mobile-web-app-status-bar-style",
      content: "black-translucent"
    });
    upsertMeta('meta[name="mobile-web-app-capable"]', {
      name: "mobile-web-app-capable",
      content: "yes"
    });
    upsertMeta('meta[name="robots"]', {
      name: "robots",
      content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
    });

    upsertLink("canonical", canonicalLink);

    upsertMeta('meta[property="og:title"]', {
      property: "og:title",
      content: docTitle
    });
    upsertMeta('meta[property="og:description"]', {
      property: "og:description",
      content: metaDescription
    });
    upsertMeta('meta[property="og:type"]', {
      property: "og:type",
      content: "website"
    });
    upsertMeta('meta[property="og:url"]', {
      property: "og:url",
      content: canonicalLink
    });
    upsertMeta('meta[property="og:site_name"]', {
      property: "og:site_name",
      content: "WebUtils"
    });
    upsertMeta('meta[property="og:locale"]', {
      property: "og:locale",
      content: "zh_CN"
    });
    upsertMeta('meta[property="og:image"]', {
      property: "og:image",
      content: PREVIEW_IMAGE
    });
    upsertMeta('meta[property="og:image:width"]', {
      property: "og:image:width",
      content: "1280"
    });
    upsertMeta('meta[property="og:image:height"]', {
      property: "og:image:height",
      content: "640"
    });
    upsertMeta('meta[property="og:image:type"]', {
      property: "og:image:type",
      content: "image/png"
    });
    upsertMeta('meta[property="og:image:alt"]', {
      property: "og:image:alt",
      content: `${pageTitle} 页面预览图`
    });

    upsertMeta('meta[name="twitter:card"]', {
      name: "twitter:card",
      content: "summary_large_image"
    });
    upsertMeta('meta[name="twitter:title"]', {
      name: "twitter:title",
      content: docTitle
    });
    upsertMeta('meta[name="twitter:description"]', {
      name: "twitter:description",
      content: metaDescription
    });
    upsertMeta('meta[name="twitter:image"]', {
      name: "twitter:image",
      content: PREVIEW_IMAGE
    });
    upsertMeta('meta[name="twitter:image:alt"]', {
      name: "twitter:image:alt",
      content: `${pageTitle} 页面预览图`
    });
    upsertMeta('meta[name="twitter:url"]', {
      name: "twitter:url",
      content: canonicalLink
    });
  }

  function parseJsonLdScripts() {
    return Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
      .map((script) => {
        try {
          return JSON.parse(script.textContent || "{}");
        } catch (error) {
          return null;
        }
      })
      .filter(Boolean);
  }

  function hasJsonLdType(type) {
    return parseJsonLdScripts().some((payload) => {
      if (Array.isArray(payload)) {
        return payload.some((item) => item && item["@type"] === type);
      }

      if (Array.isArray(payload["@graph"])) {
        return payload["@graph"].some((item) => item && item["@type"] === type);
      }

      return payload["@type"] === type;
    });
  }

  function appendJsonLd(payload) {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(payload);
    head.appendChild(script);
  }

  function ensureStructuredData(faqItems, howToSteps) {
    if (!hasJsonLdType("BreadcrumbList")) {
      appendJsonLd({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "首页", item: `${SITE_ORIGIN}/` },
          { "@type": "ListItem", position: 2, name: "旅行工具", item: `${SITE_ORIGIN}/#travel` },
          {
            "@type": "ListItem",
            position: 3,
            name: pageTitle,
            item: canonicalLink.endsWith(".html") ? canonicalLink : `${canonicalLink}.html`
          }
        ]
      });
    }

    if (!hasJsonLdType("WebApplication")) {
      appendJsonLd({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: docTitle,
        description: metaDescription,
        url: canonicalLink,
        applicationCategory: "TravelApplication",
        operatingSystem: "Web",
        inLanguage: "zh-CN",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "CNY"
        },
        isAccessibleForFree: true
      });
    }

    if (!hasJsonLdType("FAQPage")) {
      appendJsonLd({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer
          }
        }))
      });
    }

    if (!hasJsonLdType("HowTo")) {
      appendJsonLd({
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: `${pageTitle} 使用步骤`,
        description: `如何使用${pageTitle}快速解决旅行中的实际问题。`,
        totalTime: "PT5M",
        step: howToSteps.map((text, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          name: `步骤 ${index + 1}`,
          text
        }))
      });
    }
  }

  function insertStyles() {
    if (document.getElementById("travel-common-style")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "travel-common-style";
    style.textContent = `
      .travel-enhanced {
        text-rendering: optimizeLegibility;
      }
      .travel-enhanced :where(img, svg, canvas, video) {
        max-width: 100%;
      }
      .travel-enhanced :where(.card, .tool-card, .panel, .result-card, .tool-section, .timezone-card, .location-box, .summary-item, .stat-card) {
        box-shadow: 0 18px 40px rgba(0, 0, 0, 0.18);
      }
      .travel-enhanced :where(button, .btn, .preset-btn, .primary, .secondary) {
        transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
      }
      .travel-enhanced :where(button:hover, .btn:hover, .preset-btn:hover, .primary:hover, .secondary:hover) {
        transform: translateY(-1px);
        box-shadow: 0 10px 22px rgba(0, 0, 0, 0.18);
      }
      .travel-enhanced-block {
        width: 100%;
        margin: 0 0 20px;
      }
      .travel-enhanced-anchor {
        scroll-margin-top: 96px;
      }
      .travel-hero {
        position: relative;
        overflow: hidden;
        border: 1px solid #dbe4ea;
        border-radius: 24px;
        padding: 28px;
        background: linear-gradient(180deg, #ffffff, #f7fafc);
        box-shadow: 0 22px 48px rgba(15, 23, 42, 0.1);
      }
      .travel-hero::after {
        content: "";
        position: absolute;
        inset: auto -40px -40px auto;
        width: 180px;
        height: 180px;
        border-radius: 999px;
        background: rgba(37, 99, 235, 0.08);
        filter: blur(10px);
        pointer-events: none;
      }
      .travel-hero__eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        border-radius: 999px;
        border: 1px solid rgba(37, 99, 235, 0.16);
        background: rgba(37, 99, 235, 0.08);
        color: #1d4ed8;
        font-size: 0.82rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }
      .travel-hero__title {
        margin: 16px 0 12px;
        font-size: clamp(1.8rem, 4vw, 2.6rem);
        line-height: 1.12;
        font-weight: 800;
        color: #0f172a;
      }
      .travel-hero__lead,
      .travel-hero__note {
        max-width: 76ch;
        color: #334155;
        line-height: 1.8;
        font-size: 1rem;
      }
      .travel-hero__note {
        margin-top: 18px;
        padding-left: 14px;
        border-left: 3px solid rgba(37, 99, 235, 0.28);
      }
      .travel-hero__chips {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin: 18px 0 20px;
      }
      .travel-hero__chip {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 14px;
        border-radius: 999px;
        border: 1px solid #d8e2ea;
        background: #f8fafc;
        color: #0f172a;
        font-size: 0.92rem;
        line-height: 1.3;
      }
      .travel-hero__chip::before {
        content: "•";
        color: #e11d48;
      }
      .travel-hero__actions {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 6px;
      }
      .travel-hero__action,
      .travel-hero__ghost {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 44px;
        padding: 0 18px;
        border-radius: 12px;
        border: 1px solid transparent;
        font-weight: 700;
        text-decoration: none;
        cursor: pointer;
      }
      .travel-hero__action {
        background: linear-gradient(135deg, #0f172a, #1e293b);
        color: #ffffff;
      }
      .travel-hero__ghost {
        background: #ffffff;
        border-color: #cbd5e1;
        color: #0f172a;
      }
      .travel-ad-slot {
        border: 1px dashed #cbd5e1;
        border-radius: 20px;
        padding: 18px 20px;
        background: #ffffff;
        color: #475569;
        box-shadow: 0 14px 30px rgba(15, 23, 42, 0.06);
      }
      .travel-ad-slot__label {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 0.9rem;
        font-weight: 800;
        color: #0f172a;
      }
      .travel-ad-slot__label::before {
        content: "AD";
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 30px;
        height: 22px;
        border-radius: 999px;
        background: rgba(37, 99, 235, 0.1);
        color: #1d4ed8;
        font-size: 0.74rem;
        font-weight: 900;
      }
      .travel-ad-slot__text {
        margin-top: 10px;
        line-height: 1.75;
      }
      .travel-ad-slot__meta {
        margin-top: 10px;
        font-size: 0.82rem;
        color: #64748b;
      }
      .travel-article {
        border: 1px solid #dbe4ea;
        border-radius: 24px;
        padding: 28px;
        background: linear-gradient(180deg, #ffffff, #f8fafc);
        box-shadow: 0 22px 48px rgba(15, 23, 42, 0.08);
      }
      .travel-article__title {
        margin-bottom: 12px;
        font-size: clamp(1.35rem, 3vw, 1.9rem);
        line-height: 1.25;
        font-weight: 800;
        color: #0f172a;
      }
      .travel-article__intro,
      .travel-article__paragraph {
        color: #334155;
        line-height: 1.88;
        margin-bottom: 14px;
      }
      .travel-article__grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 18px;
        margin: 22px 0;
      }
      .travel-article__panel {
        border: 1px solid #e2e8f0;
        border-radius: 18px;
        padding: 18px;
        background: #f8fafc;
      }
      .travel-article__panel h3 {
        margin-bottom: 10px;
        font-size: 1rem;
        font-weight: 800;
        color: #0f172a;
      }
      .travel-article__panel ul,
      .travel-article__steps,
      .travel-article__mistakes {
        margin: 0;
        padding-left: 18px;
        color: #475569;
        line-height: 1.8;
      }
      .travel-article__steps li,
      .travel-article__mistakes li,
      .travel-article__panel li {
        margin-bottom: 8px;
      }
      .travel-article__section-title {
        margin: 24px 0 12px;
        font-size: 1.08rem;
        font-weight: 800;
        color: #0f172a;
      }
      .travel-article__notice {
        margin-top: 18px;
        padding: 16px 18px;
        border-radius: 16px;
        border: 1px solid rgba(37, 99, 235, 0.16);
        background: #eff6ff;
        color: #1e3a8a;
        line-height: 1.8;
      }
      .travel-faq {
        margin-top: 24px;
      }
      .travel-faq details {
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        background: #f8fafc;
        padding: 0 16px;
      }
      .travel-faq details + details {
        margin-top: 12px;
      }
      .travel-faq summary {
        cursor: pointer;
        list-style: none;
        padding: 16px 0;
        font-weight: 700;
        color: #0f172a;
      }
      .travel-faq summary::-webkit-details-marker {
        display: none;
      }
      .travel-faq__answer {
        padding: 0 0 16px;
        color: #475569;
        line-height: 1.8;
      }
      @media (max-width: 900px) {
        .travel-article__grid {
          grid-template-columns: 1fr;
        }
      }
      @media (max-width: 640px) {
        .travel-hero,
        .travel-article,
        .travel-ad-slot {
          border-radius: 20px;
          padding: 20px 18px;
        }
        .travel-hero__actions {
          flex-direction: column;
        }
        .travel-hero__action,
        .travel-hero__ghost {
          width: 100%;
        }
        .travel-hero__chip {
          width: 100%;
          justify-content: flex-start;
        }
      }
      @media print {
        .travel-enhanced-block {
          display: none !important;
        }
      }
    `;

    head.appendChild(style);
  }

  function findDirectChild(parent, selectors) {
    if (!parent || !parent.children) {
      return null;
    }

    const list = Array.isArray(selectors) ? selectors : selectors.split(",");
    return Array.from(parent.children).find((child) => list.some((selector) => child.matches(selector.trim()))) || null;
  }

  function getSurface() {
    const mainContent = document.querySelector(".main-content");
    const container = document.querySelector(".container");

    if (mainContent) {
      const innerContainer = findDirectChild(mainContent, [".container"]);
      if (innerContainer) {
        return innerContainer;
      }

      return mainContent;
    }

    if (container) {
      return container;
    }

    return body;
  }

  function findTopReference(surface) {
    if (!surface || surface === body) {
      return body.firstChild;
    }

    if (surface.classList.contains("container")) {
      const header = findDirectChild(surface, [".header"]);
      if (header) {
        return header.nextSibling;
      }

      const subtitle = findDirectChild(surface, [".subtitle"]);
      if (subtitle) {
        return subtitle.nextSibling;
      }

      const firstTitle = findDirectChild(surface, ["h1"]);
      if (firstTitle) {
        return firstTitle.nextSibling;
      }
    }

    return surface.firstChild;
  }

  function findBottomReference(surface) {
    if (!surface || surface === body) {
      return null;
    }

    const footer = findDirectChild(surface, ["footer"]);
    return footer || null;
  }

  function insertBefore(parent, node, reference) {
    if (!parent || !node) {
      return;
    }

    if (reference) {
      parent.insertBefore(node, reference);
    } else {
      parent.appendChild(node);
    }
  }

  function markToolStart(surface) {
    const candidates = [
      document.querySelector(".main-content"),
      surface?.querySelector?.(".tool-card, .card, .panel, .timezone-card, .tool-section, .search-box, .form-grid, .grid-2, main"),
      surface
    ].filter(Boolean);

    const target = candidates[0];
    if (target && !target.id) {
      target.id = "travel-tool-start";
    }
    if (target) {
      target.classList.add("travel-enhanced-anchor");
    }
    return target;
  }

  function normalizeText(text) {
    return (text || "")
      .replace(/\s+/g, " ")
      .replace(/^[\-–—•·|：:]+/g, "")
      .trim();
  }

  function collectFeatureLabels(surface) {
    const root = surface || document;
    const nodes = root.querySelectorAll("label, .card-title, .section-title, .selector-label, .tool-info h1, .title-section h1");
    const stopWords = new Set([
      "首页",
      "切换主题",
      "返回首页",
      pageTitle,
      docTitle,
      "GitHub"
    ]);
    const labels = [];

    Array.from(nodes).forEach((node) => {
      const text = normalizeText(node.textContent);
      if (!text || text.length < 2 || text.length > 22 || stopWords.has(text)) {
        return;
      }
      if (!labels.includes(text)) {
        labels.push(text);
      }
    });

    return labels.slice(0, 6);
  }

  function buildHowToSteps(featureLabels) {
    const headLabels = featureLabels.slice(0, 4);
    const firstPair = headLabels.slice(0, 2).join("、") || context.primaryInputs;
    const secondPair = headLabels.slice(2, 4).join("、") || context.secondaryInputs;

    return [
      `先确认${firstPair}这些核心条件，避免用模糊数据直接开始计算、查询或生成结果。`,
      `再结合${secondPair}逐项细化页面设置，边改边看结果变化，把现场决策提前搬到出发前完成。`,
      `把页面结果与订单、政策、酒店、同行安排或证件材料再做一次交叉核对，确认是否需要额外缓冲。`,
      `真正出发前或付款前最后复核一次，因为天气、汇率、政策、库存、航班和路况都可能在临近出行时变化。`
    ];
  }

  function buildFaqItems(featureLabels) {
    const featureText = featureLabels.length
      ? `优先从页面里的 ${featureLabels.slice(0, 4).join("、")} 这些字段开始填写，先锁定核心条件，再补充细节。`
      : `优先填写核心输入项，再根据页面提示逐步完善细节，结果会更稳定也更接近真实场景。`;

    return [
      {
        question: `${pageTitle}最适合在什么阶段使用？`,
        answer: `最建议在订票或成行意向确认后立即使用一次，出发前 1 到 3 天再复核一次；如果属于现场决策型工具，到达机场、酒店、车站或边检前再看一遍会更稳。`
      },
      {
        question: `页面里的数据应该怎么填才更准确？`,
        answer: `${featureText} 如果拿不准，优先使用订单、航司通知、酒店确认单、官方政策页或银行卡账单里的原始数据，不要完全依赖记忆。`
      },
      {
        question: `${pageTitle}的结果能直接当最终决定吗？`,
        answer: `${pageTitle}非常适合做快速判断、预估和出发前复核，但涉及证件、入境、健康、收费规则、平台条款或航空公司限制时，仍建议与官方渠道交叉确认。`
      },
      {
        question: `手机和电脑使用体验有什么区别？`,
        answer: `这个页面已经按移动端和桌面端做了统一增强，手机上适合快速输入、临时查询和现场复核；电脑端更适合长时间编辑、对比结果和整理行程资料。`
      }
    ];
  }

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function buildHero(featureLabels) {
    if (document.querySelector('[data-travel-enhance-root="hero"]')) {
      return null;
    }

    const chips = [
      context.eyebrow,
      "手机 / 电脑自适应",
      "本地处理更省心",
      ...featureLabels.slice(0, 3)
    ]
      .filter(Boolean)
      .slice(0, 6);

    const hero = document.createElement("section");
    hero.className = "travel-enhanced-block travel-hero";
    hero.setAttribute("data-travel-enhance-root", "hero");
    hero.setAttribute("aria-label", `${pageTitle} 工具介绍`);
    hero.innerHTML = `
      <div class="travel-hero__eyebrow">${escapeHtml(context.eyebrow)}</div>
      <h2 class="travel-hero__title">${escapeHtml(pageTitle)}</h2>
      <p class="travel-hero__lead">${escapeHtml(metaDescription)} 这类工具最适合拿来处理旅行中最容易被忽略、却最影响执行体验的细碎问题：先把变量理清，再做判断，能明显减少现场返工。</p>
      <div class="travel-hero__chips">
        ${chips.map((chip) => `<span class="travel-hero__chip">${escapeHtml(chip)}</span>`).join("")}
      </div>
      <div class="travel-hero__actions">
        <a class="travel-hero__action" href="#travel-tool-start">直达工具区</a>
        <button type="button" class="travel-hero__ghost" data-copy-page-link>复制页面链接</button>
      </div>
      <p class="travel-hero__note">建议把本页当成“旅行决策前的最后一层复核”：先得到结果，再对照订单、证件、同行安排和现场限制核一遍，出错概率会低很多。</p>
    `;

    const copyButton = hero.querySelector("[data-copy-page-link]");
    if (copyButton) {
      copyButton.addEventListener("click", async function () {
        const originalText = copyButton.textContent;
        try {
          await navigator.clipboard.writeText(window.location.href);
          copyButton.textContent = "链接已复制";
        } catch (error) {
          copyButton.textContent = "请手动复制地址栏";
        }
        window.setTimeout(function () {
          copyButton.textContent = originalText;
        }, 1600);
      });
    }

    return hero;
  }

  function buildAdSlot(position, summary) {
    const key = `ad-${position}`;
    if (document.querySelector(`[data-travel-enhance-root="${key}"]`)) {
      return null;
    }

    const slot = document.createElement("aside");
    slot.className = "travel-enhanced-block travel-ad-slot";
    slot.setAttribute("data-travel-enhance-root", key);
    slot.setAttribute("aria-label", "Google AdSense 预留广告位");
    slot.innerHTML = `
      <div class="travel-ad-slot__label">Google AdSense 预留位</div>
      <div class="travel-ad-slot__text">${escapeHtml(summary)}</div>
      <div class="travel-ad-slot__meta">建议部署时替换为响应式广告代码，优先保留当前块级尺寸与自适应宽度，以兼顾桌面和手机展示。</div>
    `;
    return slot;
  }

  function buildArticle(featureLabels, faqItems, howToSteps) {
    if (document.querySelector('[data-travel-enhance-root="article"]')) {
      return null;
    }

    const featuresSummary = featureLabels.length
      ? `页面里已经整理了 ${featureLabels.join("、")} 等关键模块，你不需要再在多个攻略、群聊和订单页面之间反复切换。`
      : `页面已经把旅行中最常见的判断变量集中在一个地方，适合快速完成出发前复核和现场二次确认。`;

    const article = document.createElement("section");
    article.className = "travel-enhanced-block travel-article";
    article.setAttribute("data-travel-enhance-root", "article");
    article.setAttribute("aria-label", `${pageTitle} 实用指南`);
    article.innerHTML = `
      <h2 class="travel-article__title">${escapeHtml(pageTitle)}：不是“能不能用”，而是“能不能帮你少走弯路”</h2>
      <p class="travel-article__intro">${escapeHtml(metaDescription)} 对多数旅行者来说，真正麻烦的不是信息完全找不到，而是信息太散、口径不一、临近出发又来不及慢慢比对。${escapeHtml(pageTitle)} 的价值就在于：把你最关心的判断条件压缩到一个页面里，尽量让每次输入都能直接换来可执行的结论。</p>
      <p class="travel-article__paragraph">${escapeHtml(context.problem)} 这也是为什么很多人明明做了准备，实际执行时还是会出错：不是不用功，而是没有把“关键变量”和“最终决策”正确对应起来。${escapeHtml(featuresSummary)}</p>
      <p class="travel-article__paragraph">如果你把这个工具只当作一次性查询页面，它的价值会被低估；更好的用法是把它放进你的出发前流程：订票后核对一次、下单前核对一次、出发前最后核对一次。这样做的目的不是重复，而是把那些最容易在不同阶段变化的信息——比如政策、天气、汇率、费用、库存、班次、材料要求——逐步锁定下来。</p>
      <div class="travel-article__grid">
        <div class="travel-article__panel">
          <h3>这个页面最适合解决的具体问题</h3>
          <ul>
            ${context.scenarios.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        </div>
        <div class="travel-article__panel">
          <h3>很多人会忽略的风险点</h3>
          <ul>
            ${context.mistakes.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        </div>
      </div>
      <h3 class="travel-article__section-title">推荐的使用顺序</h3>
      <ol class="travel-article__steps">
        ${howToSteps.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ol>
      <h3 class="travel-article__section-title">为什么建议你不要只看结果数值</h3>
      <p class="travel-article__paragraph">旅行场景里最常见的误区，是看到一个“看起来对”的结果就直接执行，例如预算刚好压线、时差看起来能赶上、行李看起来差一点点不超、签证看起来问题不大。真正稳妥的做法，是在结果之外，再问自己两个问题：这个结论是否覆盖了现场变量？如果临时出现延误、涨价、排队、政策调整、设备不兼容，我还有没有余量？</p>
      <p class="travel-article__paragraph">因此，本页更适合用来做“带缓冲的决策”。例如金额类工具可以多预留 10% 到 20% 的机动空间；时间类工具尽量给转机、通勤和排队多留窗口；证件类工具尽量把材料准备提前到最后期限之前；行李类工具则建议把最关键的当天用品留在随身包里。这样做的本质，是把旅行中的不确定性前置处理。</p>
      <div class="travel-article__notice">专业提醒：${escapeHtml(context.officialCheck)} 即便页面结果已经很明确，也建议保留订单截图、票据、证件复印件和关键联系方式，确保在网络不稳定、语言沟通困难或现场压力较大的情况下，仍然能快速做出正确动作。</div>
      <div class="travel-faq">
        <h3 class="travel-article__section-title">常见问题</h3>
        ${faqItems
          .map(
            (item) => `
              <details>
                <summary>${escapeHtml(item.question)}</summary>
                <div class="travel-faq__answer">${escapeHtml(item.answer)}</div>
              </details>
            `
          )
          .join("")}
      </div>
    `;

    return article;
  }

  function run() {
    try {
      insertStyles();
      ensureSocialMeta();

      const surface = getSurface();
      const featureLabels = collectFeatureLabels(surface);
      const howToSteps = buildHowToSteps(featureLabels);
      const faqItems = buildFaqItems(featureLabels);

      ensureStructuredData(faqItems, howToSteps);
      markToolStart(surface);

      const bottomReference = findBottomReference(surface);

      const hero = buildHero(featureLabels);
      const topAd = buildAdSlot(
        "top",
        `${pageTitle} 页面顶部广告位已放到工具区之后，适合放置响应式横幅广告，既保留广告位，也不遮挡用户先使用工具。`
      );
      const article = buildArticle(featureLabels, faqItems, howToSteps);
      const bottomAd = buildAdSlot(
        "bottom",
        `${pageTitle} 页面底部广告位，适合放置信息流或内容型广告，靠近长文说明区域但不干扰实际工具操作。`
      );

      [hero, topAd, article, bottomAd].forEach((node) => {
        if (node) {
          insertBefore(surface, node, bottomReference);
        }
      });
    } catch (error) {
      console.error("travel-common enhance error", error);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
})();
