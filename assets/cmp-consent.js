/* ============================================================
 * CMP Cookie / 个性化广告同意管理（GDPR EEA/UK + CCPA 兼容）
 * 站点：essays4u.net
 * 存储：localStorage.ess_cmp_v1 = 'a' （接受全部，个性化广告）
 *                         | 'n' （仅必要，NPA 非个性化广告）
 * 重要：此脚本需 defer 加载；同步 applyConsent 已由 HTML 内联代码在
 *       adsbygoogle 脚本之前执行，此处负责 UI 弹框与用户交互。
 * 注意：仅使用 ES5 语法（无 const/let/箭头/模板/class），兼容老浏览器。
 * ============================================================ */
(function () {
  'use strict';

  var STORAGE_KEY = 'ess_cmp_v1';
  var STATE_ACCEPT_ALL = 'a';
  var STATE_NECESSARY = 'n';

  /* ---------- 工具函数 ---------- */

  /** 安全读取 localStorage，失败返回 null */
  function safeGet() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  /** 安全写入 localStorage，失败返回 false */
  function safeSet(val) {
    try {
      localStorage.setItem(STORAGE_KEY, val);
      window.__cmpConsent = val;
      return true;
    } catch (e) {
      return false;
    }
  }

  /** EEA+UK 语言白名单（前 2 位或完整 locale） */
  var EEA_LANGS = {
    de: 1, fr: 1, it: 1, es: 1, nl: 1, pl: 1, sv: 1, da: 1, fi: 1,
    no: 1, pt: 1, el: 1, hu: 1, cs: 1, sk: 1, sl: 1, bg: 1, ro: 1,
    hr: 1, ga: 1, lt: 1, lv: 1, et: 1, mt: 1, cy: 1, is: 1, li: 1
  };
  var EEA_FULL_LOCALES = { 'en-GB': 1 };

  /** 判断是否为欧洲时区（Europe/* 或 Atlantic/Reykjavik） */
  function isEuropeTimeZone(tz) {
    if (!tz) return false;
    if (tz.indexOf('Europe/') === 0) return true;
    if (tz === 'Atlantic/Reykjavik') return true;
    return false;
  }

  /** 判断是否为美国时区（CCPA 加州等） */
  function isUSTimeZone(tz) {
    if (!tz) return false;
    return tz.indexOf('America/') === 0;
  }

  /** 检测是否需要弹 CMP 框 */
  function shouldShowBanner() {
    var lang = (navigator.language || navigator.userLanguage || 'en') + '';
    var lang2 = lang.toLowerCase().slice(0, 2);
    var tz = null;
    try {
      if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
        var ro = Intl.DateTimeFormat().resolvedOptions();
        tz = ro.timeZone || null;
      }
    } catch (e) { /* ignore */ }

    // a) 语言匹配 EEA
    if (EEA_LANGS[lang2]) return true;
    if (EEA_FULL_LOCALES[lang.toLowerCase()]) return true;

    // b) 时区匹配欧洲
    if (isEuropeTimeZone(tz)) return true;

    // c) CCPA：美国时区也展示（简化为同样流程）
    if (isUSTimeZone(tz)) return true;

    return false;
  }

  /* ---------- applyConsent：内联 bootstrap 已做首次同步；此处做切换补充 ---------- */

  function applyConsent(state) {
    // 无论如何都确保 window.__cmpConsent 最新
    window.__cmpConsent = state;

    // 确保 adsbygoogle 队列存在
    window.adsbygoogle = window.adsbygoogle || [];

    if (state === STATE_NECESSARY) {
      // 非个性化广告：push 标记（去重：已有则不重复 push）
      var found = false;
      for (var i = 0; i < window.adsbygoogle.length; i++) {
        var item = window.adsbygoogle[i];
        if (item && typeof item === 'object' && item.requestNonPersonalizedAds === true) {
          found = true;
          break;
        }
      }
      if (!found) {
        window.adsbygoogle.push({ requestNonPersonalizedAds: true });
      }
    } else if (state === STATE_ACCEPT_ALL) {
      // 接受：默认正常个性化广告即可；不 push NPA 标记
      // 注意：无法从 adsbygoogle 数组移除已 push 的 NPA（adsbygoogle 规范），
      // 如果用户刚从 'n' 切到 'a'，调用方应触发 reload。
    }
  }

  /* ---------- DOM 渲染弹框 ---------- */

  /** 创建并插入 CMP 横幅 */
  function renderBanner(currentState) {
    if (document.getElementById('cmp-banner')) return; // 防重复

    // 如果必要的 DOM API 不存在，直接放弃（极老浏览器）
    if (!document.createElement || !document.body) return;

    var banner = document.createElement('div');
    banner.id = 'cmp-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', 'Cookie and Privacy Consent');

    banner.innerHTML =
      '<button type="button" class="cmp-close" aria-label="Close">&times;</button>' +
      '<h2 class="cmp-title">隐私 & Cookie 选择</h2>' +
      '<p class="cmp-desc">' +
      '我们使用 Cookie 来优化您的浏览体验、分析站点流量，并提供个性化广告。' +
      '您可以选择接受全部，或仅允许必要的 Cookie。' +
      '更多信息请查阅我们的 <a href="/privacy-policy.html" target="_blank" rel="noopener">隐私政策</a> 和 ' +
      '<a href="/terms.html" target="_blank" rel="noopener">服务条款</a>。' +
      '</p>' +
      '<div class="cmp-actions">' +
      '<button type="button" class="cmp-btn cmp-btn-accept">全部同意</button>' +
      '<button type="button" class="cmp-btn cmp-btn-necessary">仅必要 Cookie</button>' +
      '<button type="button" class="cmp-btn cmp-btn-manage">管理选项</button>' +
      '</div>' +
      '<div class="cmp-manage" aria-hidden="true">' +
      '<div class="cmp-manage-grid">' +
      '<div class="cmp-manage-item">' +
      '<div class="cmp-manage-label">必要 Cookie' +
      '<label class="cmp-switch">' +
      '<input type="checkbox" class="cmp-toggle" data-type="necessary" checked disabled>' +
      '<span class="cmp-switch-slider"></span></label></div>' +
      '<div class="cmp-manage-desc">站点基本功能所需，无法关闭。</div>' +
      '</div>' +
      '<div class="cmp-manage-item">' +
      '<div class="cmp-manage-label">分析 Cookie' +
      '<label class="cmp-switch">' +
      '<input type="checkbox" class="cmp-toggle" data-type="analytics"' +
      (currentState === STATE_ACCEPT_ALL ? ' checked' : '') + '>' +
      '<span class="cmp-switch-slider"></span></label></div>' +
      '<div class="cmp-manage-desc">帮助我们统计访问者与页面表现。</div>' +
      '</div>' +
      '<div class="cmp-manage-item">' +
      '<div class="cmp-manage-label">广告 Cookie' +
      '<label class="cmp-switch">' +
      '<input type="checkbox" class="cmp-toggle" data-type="ads"' +
      (currentState === STATE_ACCEPT_ALL ? ' checked' : '') + '>' +
      '<span class="cmp-switch-slider"></span></label></div>' +
      '<div class="cmp-manage-desc">用于投放与您更相关的个性化广告。</div>' +
      '</div>' +
      '</div>' +
      '<div class="cmp-manage-actions">' +
      '<button type="button" class="cmp-btn cmp-btn-save">保存选择</button>' +
      '</div>' +
      '</div>';

    document.body.appendChild(banner);

    // 下一帧添加 cmp-show 触发滑入动画
    setTimeout(function () { banner.className += ' cmp-show'; }, 16);

    bindBannerEvents(banner);
  }

  /** 绑定横幅按钮事件 */
  function bindBannerEvents(banner) {
    var btnAccept = banner.querySelector('.cmp-btn-accept');
    var btnNecessary = banner.querySelector('.cmp-btn-necessary');
    var btnManage = banner.querySelector('.cmp-btn-manage');
    var btnSave = banner.querySelector('.cmp-btn-save');
    var btnClose = banner.querySelector('.cmp-close');

    function hideBanner() {
      banner.classList.add('cmp-hide');
      setTimeout(function () {
        if (banner.parentNode) banner.parentNode.removeChild(banner);
      }, 260);
    }

    function acceptAll() {
      var prev = safeGet();
      safeSet(STATE_ACCEPT_ALL);
      applyConsent(STATE_ACCEPT_ALL);
      // 若用户刚从「仅必要」切换为接受 → reload 以从头加载个性化广告
      if (prev && prev !== STATE_ACCEPT_ALL) {
        try { location.reload(); } catch (e) { /* ignore */ }
        return;
      }
      hideBanner();
    }

    function necessaryOnly() {
      safeSet(STATE_NECESSARY);
      applyConsent(STATE_NECESSARY);
      hideBanner();
    }

    if (btnAccept && btnAccept.addEventListener) {
      btnAccept.addEventListener('click', acceptAll);
    }
    if (btnNecessary && btnNecessary.addEventListener) {
      btnNecessary.addEventListener('click', necessaryOnly);
    }
    // 右上角 X：视为与「仅必要」等效的拒绝路径（GDPR 允许辅助拒绝）
    if (btnClose && btnClose.addEventListener) {
      btnClose.addEventListener('click', necessaryOnly);
    }

    // 管理选项：展开/收起
    if (btnManage && btnManage.addEventListener) {
      btnManage.addEventListener('click', function () {
        var open = banner.classList.contains('cmp-manage-open');
        var manageBox = banner.querySelector('.cmp-manage');
        if (open) {
          banner.classList.remove('cmp-manage-open');
          if (manageBox) manageBox.setAttribute('aria-hidden', 'true');
        } else {
          banner.classList.add('cmp-manage-open');
          if (manageBox) manageBox.setAttribute('aria-hidden', 'false');
        }
      });
    }

    // 保存按钮：以「广告 Cookie」开关为主（off -> n, on -> a）
    if (btnSave && btnSave.addEventListener) {
      btnSave.addEventListener('click', function () {
        var adsToggle = banner.querySelector('.cmp-toggle[data-type="ads"]');
        var selected = adsToggle && adsToggle.checked ? STATE_ACCEPT_ALL : STATE_NECESSARY;
        var prev = safeGet();
        safeSet(selected);
        applyConsent(selected);
        if (selected === STATE_ACCEPT_ALL && prev && prev !== STATE_ACCEPT_ALL) {
          try { location.reload(); } catch (e) { /* ignore */ }
          return;
        }
        hideBanner();
      });
    }
  }

  /* ---------- 主入口 ---------- */

  function main() {
    try {
      var existing = safeGet();

      // 1. 已设置同意：仅补一次 applyConsent 以防刷新后状态丢失，不弹框
      if (existing === STATE_ACCEPT_ALL || existing === STATE_NECESSARY) {
        applyConsent(existing);
        return;
      }

      // 2. 未设置，判断是否需要弹框
      if (shouldShowBanner()) {
        // 等待 DOM 就绪再插入
        function doRender() {
          try {
            renderBanner(null); // 未选择：默认开关状态为 necessary on, analytics/ads off
          } catch (e) { /* ignore */ }
        }
        if (document.body) {
          doRender();
        } else if (document.addEventListener) {
          document.addEventListener('DOMContentLoaded', doRender);
        }
      } else {
        // 非 EEA/US 用户：默认自动接受，不打扰
        safeSet(STATE_ACCEPT_ALL);
        applyConsent(STATE_ACCEPT_ALL);
      }
    } catch (e) {
      // 未定义异常：降级，不弹框，保守使用 NPA（合规兜底）
      try {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({ requestNonPersonalizedAds: true });
      } catch (e2) { /* ignore */ }
    }
  }

  // 立即执行 main（脚本是 defer，DOM 通常已就绪）
  main();
})();
