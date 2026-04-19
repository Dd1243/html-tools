#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Add AdSense placeholders and SEO article content to all travel HTML files."""

import os
import re

travel_dir = r"e:\html-tools\tools\travel"

# AdSense placeholder CSS to add to each file
adsense_css = """
      /* ---- Google AdSense Placeholder ---- */
      .adsense-wrap {
        margin: 24px 0;
        text-align: center;
      }
      .adsbygoogle {
        display: block;
        min-height: 90px;
        background: var(--bg-surface);
        border: 1px dashed var(--border-subtle);
        border-radius: var(--radius-md);
      }
      /* ---- End AdSense ---- */"""

# AdSense top banner HTML
adsense_top = """
      <!-- Google AdSense - Top Banner -->
      <div class="adsense-wrap">
        <ins class="adsbygoogle"
             style="display:block"
             data-ad-client="ca-pub-XXXXXXXXXX"
             data-ad-slot="XXXXXXXXXX"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
      </div>"""

# AdSense bottom rectangle HTML
adsense_bottom = """
      <!-- Google AdSense - Bottom Rectangle -->
      <div class="adsense-wrap">
        <ins class="adsbygoogle"
             style="display:block"
             data-ad-client="ca-pub-XXXXXXXXXX"
             data-ad-slot="XXXXXXXXXX"
             data-ad-format="rectangle"
             data-full-width-responsive="true"></ins>
        <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
      </div>"""

# SEO article content per file
seo_articles = {
    "baggage-limit.html": """
      <!-- SEO Article Content -->
      <section class="seo-article" style="margin-top:32px;padding:24px;background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);">
        <h2 style="font-family:var(--font-mono);font-size:1.1rem;font-weight:600;margin-bottom:16px;color:var(--accent-cyan);">✈️ 如何避免行李超重？完整攻略</h2>
        <div style="color:var(--text-secondary);font-size:0.9rem;line-height:1.8;">
          <p style="margin-bottom:12px;">行李限制是每位旅行者出发前最需要了解的信息之一。不同航空公司、不同舱位、不同航线对手提行李和托运行李的重量、尺寸、数量规定各不相同，稍有不慎就可能面临高额超重行李费。</p>
          <h3 style="font-size:0.95rem;font-weight:600;margin:16px 0 8px;color:var(--text-primary);">国际航班托运行李规定详解</h3>
          <p style="margin-bottom:12px;">大多数国际长途航班采用<strong>计件制</strong>（Piece Concept）：经济舱一般允许携带1-2件行李，每件不超过23-32公斤，三边之和通常不超过158厘米。商务舱和头等舱则享有更宽松的行李政策，单件重量可达32公斤，件数也更多。</p>
          <p style="margin-bottom:12px;">中国三大航空公司（国航、东航、南航）在国内航线实行<strong>重量制</strong>，经济舱免费行李额为20公斤；国际航线则切换为计件制，每件限重23公斤。</p>
          <h3 style="font-size:0.95rem;font-weight:600;margin:16px 0 8px;color:var(--text-primary);">手提行李尺寸限制</h3>
          <p style="margin-bottom:12px;">手提行李（Carry-on）的尺寸限制因航司而异，但大多数航空公司允许的最大尺寸约为55×40×20厘米（长×宽×高）。阿联酋航空、卡塔尔航空等中东航空公司手提行李重量限制较为严格，通常为7公斤；而日本航空、全日空则相对宽松，允许10公斤。</p>
          <h3 style="font-size:0.95rem;font-weight:600;margin:16px 0 8px;color:var(--text-primary);">实用省钱技巧</h3>
          <ul style="padding-left:20px;margin-bottom:12px;">
            <li style="margin-bottom:6px;">购票时提前购买行李额，通常比在机场购买便宜30-50%</li>
            <li style="margin-bottom:6px;">出发前用行李秤称重，避免到机场才发现超重</li>
            <li style="margin-bottom:6px;">穿上较重的外套和鞋子登机，减少行李重量</li>
            <li style="margin-bottom:6px;">使用压缩袋减少衣物体积，有效利用行李空间</li>
            <li style="margin-bottom:6px;">了解航空公司的液体规定：手提行李中液体每瓶不超过100ml</li>
          </ul>
          <p style="color:var(--text-muted);font-size:0.8rem;margin-top:16px;">💡 提示：行李政策随时可能变更，出发前请务必在航空公司官网确认最新规定。</p>
        </div>
      </section>""",

    "baggage-tracker.html": """
      <!-- SEO Article Content -->
      <section class="seo-article" style="margin-top:32px;padding:24px;background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);">
        <h2 style="font-family:var(--font-mono);font-size:1.1rem;font-weight:600;margin-bottom:16px;color:var(--accent-cyan);">🧳 行李丢失怎么办？完整处理指南</h2>
        <div style="color:var(--text-secondary);font-size:0.9rem;line-height:1.8;">
          <p style="margin-bottom:12px;">托运行李丢失或延误是每个旅行者最担心的事情之一。据统计，全球每年有数百万件行李发生延误、丢失或损坏。了解如何追踪和处理行李问题，可以帮助您最大限度地减少损失。</p>
          <h3 style="font-size:0.95rem;font-weight:600;margin:16px 0 8px;color:var(--text-primary);">行李丢失后的处理步骤</h3>
          <ol style="padding-left:20px;margin-bottom:12px;">
            <li style="margin-bottom:8px;"><strong>立即报告：</strong>到达目的地后发现行李未到，第一步是在<strong>不离开机场</strong>的情况下，前往航空公司行李服务柜台（Baggage Services / Lost & Found）报告，索取"财产不规则报告"（PIR）</li>
            <li style="margin-bottom:8px;"><strong>保留凭证：</strong>保存行李牌（Baggage Tag）、登机牌和PIR报告，这些是后续索赔的重要证明</li>
            <li style="margin-bottom:8px;"><strong>追踪状态：</strong>大多数航空公司提供在线行李追踪系统，可通过PIR编号查询行李当前位置</li>
            <li style="margin-bottom:8px;"><strong>申请赔偿：</strong>行李延误超过24小时，可向航空公司申请临时生活必需品费用补偿（通常50-150美元）</li>
          </ol>
          <h3 style="font-size:0.95rem;font-weight:600;margin:16px 0 8px;color:var(--text-primary);">如何减少行李丢失风险</h3>
          <ul style="padding-left:20px;margin-bottom:12px;">
            <li style="margin-bottom:6px;">在行李箱内外都放置写有姓名、手机号的标签</li>
            <li style="margin-bottom:6px;">使用AirTag或Tile等行李追踪器</li>
            <li style="margin-bottom:6px;">购买旅行保险，确保涵盖行李丢失赔偿</li>
            <li style="margin-bottom:6px;">中转时间尽量预留2小时以上，避免行李来不及转运</li>
            <li style="margin-bottom:6px;">避免在行李中放置贵重物品，随身携带证件和现金</li>
          </ul>
        </div>
      </section>""",

    "currency-exchange.html": """
      <!-- SEO Article Content -->
      <section class="seo-article" style="margin-top:32px;padding:24px;background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);">
        <h2 style="font-family:var(--font-mono);font-size:1.1rem;font-weight:600;margin-bottom:16px;color:var(--accent-cyan);">💱 出境旅行汇率兑换完全指南</h2>
        <div style="color:var(--text-secondary);font-size:0.9rem;line-height:1.8;">
          <p style="margin-bottom:12px;">出境旅行时，如何以最优惠的汇率换到外币，是每位旅行者必须掌握的技能。不同的换汇渠道、手续费差异巨大，选择不当可能多花5%-10%的费用。</p>
          <h3 style="font-size:0.95rem;font-weight:600;margin:16px 0 8px;color:var(--text-primary);">各换汇渠道对比</h3>
          <ul style="padding-left:20px;margin-bottom:12px;">
            <li style="margin-bottom:8px;"><strong>银行换汇（推荐）：</strong>汇率最接近中间价，手续费较低。建议出发前在中国银行、工商银行等提前预约兑换，或使用外汇额度网上购汇</li>
            <li style="margin-bottom:8px;"><strong>境外ATM取款：</strong>汇率通常较好，但注意手续费（约每笔15-35元人民币）。推荐使用Visa/Mastercard国际借记卡，避免信用卡取现的高额利息</li>
            <li style="margin-bottom:8px;"><strong>机场换汇：</strong>汇率通常比银行差5%-8%，适合小额应急换汇</li>
            <li style="margin-bottom:8px;"><strong>当地银行/换汇所：</strong>部分旅游目的地（如泰国、土耳其）当地银行汇率优于国内，可少量在当地兑换</li>
            <li style="margin-bottom:8px;"><strong>避免：</strong>酒店换汇、黑市换汇，汇率损失最大且存在安全风险</li>
          </ul>
          <h3 style="font-size:0.95rem;font-weight:600;margin:16px 0 8px;color:var(--text-primary);">主要货币换算参考</h3>
          <p style="margin-bottom:12px;">人民币（CNY）是中国的法定货币，目前约等于0.138美元（USD）或0.126欧元（EUR）。1美元约等于149日元（JPY）或7.24人民币。请注意汇率每天波动，出行前请以实时汇率为准。</p>
          <p style="color:var(--text-muted);font-size:0.8rem;margin-top:16px;">💡 提示：每人每年有5万美元等值外汇购汇额度，出境旅游换汇不超过等值1万美元无需申报。</p>
        </div>
      </section>""",

    "currency-tips.html": """
      <!-- SEO Article Content -->
      <section class="seo-article" style="margin-top:32px;padding:24px;background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);">
        <h2 style="font-family:var(--font-mono);font-size:1.1rem;font-weight:600;margin-bottom:16px;color:var(--accent-cyan);">💰 出境旅游换汇与支付完全指南</h2>
        <div style="color:var(--text-secondary);font-size:0.9rem;line-height:1.8;">
          <p style="margin-bottom:12px;">出境旅游时，掌握当地的货币政策、支付习惯和小费文化，不仅能节省金钱，还能避免不必要的尴尬和麻烦。不同国家对现金和刷卡的态度截然不同，了解目的地的支付生态至关重要。</p>
          <h3 style="font-size:0.95rem;font-weight:600;margin:16px 0 8px;color:var(--text-primary);">主要旅游目的地支付方式</h3>
          <ul style="padding-left:20px;margin-bottom:12px;">
            <li style="margin-bottom:8px;"><strong>日本：</strong>现金为王的国度。大量餐厅和小店只收现金，建议到达后立即在机场或银行ATM取款。信用卡在大型商场、便利店可用，但小店和神社等地务必备现金</li>
            <li style="margin-bottom:8px;"><strong>欧洲：</strong>信用卡普及度高，Visa/Mastercard基本通行。但小城市和市集仍需现金。注意：欧洲POS机会询问以本地货币还是人民币结算，<strong>务必选择本地货币</strong>，DCC（动态货币转换）汇率很差</li>
            <li style="margin-bottom:8px;"><strong>美国：</strong>信用卡高度普及，小费文化盛行。餐厅通常在账单上留出小费栏，习惯给账单金额15%-20%的小费</li>
            <li style="margin-bottom:8px;"><strong>泰国：</strong>现金为主，当地换汇所汇率通常优于机场。曼谷现代化商场可刷卡，但小吃街、寺庙等地需现金</li>
            <li style="margin-bottom:8px;"><strong>东南亚其他：</strong>越南、柬埔寨等国通行美元，可持美元现金旅行。当地货币找零时会混合使用</li>
          </ul>
          <h3 style="font-size:0.95rem;font-weight:600;margin:16px 0 8px;color:var(--text-primary);">各国小费文化速查</h3>
          <ul style="padding-left:20px;margin-bottom:12px;">
            <li style="margin-bottom:6px;"><strong>必须给小费：</strong>美国、加拿大（餐厅15-20%，酒店每天1-5美元）</li>
            <li style="margin-bottom:6px;"><strong>习惯给小费：</strong>英国、澳大利亚（10%-12%），中东酒店（1-2美元/天）</li>
            <li style="margin-bottom:6px;"><strong>不需要小费：</strong>日本、韩国、中国（小费可能被视为冒犯）</li>
            <li style="margin-bottom:6px;"><strong>自愿给小费：</strong>欧洲大部分国家（圆整零头即可）</li>
          </ul>
        </div>
      </section>""",

    "distance-calculator.html": """
      <!-- SEO Article Content -->
      <section class="seo-article" style="margin-top:32px;padding:24px;background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);">
        <h2 style="font-family:var(--font-mono);font-size:1.1rem;font-weight:600;margin-bottom:16px;color:var(--accent-cyan);">📏 如何计算两地距离？地理距离完全解析</h2>
        <div style="color:var(--text-secondary);font-size:0.9rem;line-height:1.8;">
          <p style="margin-bottom:12px;">了解两地之间的距离，对于规划旅行路线、估算交通时间和选择合适的交通方式至关重要。本工具使用<strong>哈弗辛公式</strong>（Haversine Formula）计算地球表面的球面距离，结果高度精确。</p>
          <h3 style="font-size:0.95rem;font-weight:600;margin:16px 0 8px;color:var(--text-primary);">直线距离 vs 实际交通距离</h3>
          <p style="margin-bottom:12px;">需要注意的是，两地直线距离（也称"大圆距离"）与实际交通距离有显著差异。一般来说：公路驾驶距离约为直线距离的1.3-1.5倍；高速铁路距离通常为直线距离的1.2-1.3倍；航空飞行路线虽然走弧线，但基本接近大圆距离。</p>
          <h3 style="font-size:0.95rem;font-weight:600;margin:16px 0 8px;color:var(--text-primary);">热门城市间距离参考</h3>
          <ul style="padding-left:20px;margin-bottom:12px;">
            <li style="margin-bottom:6px;">北京 → 上海：约1,068公里（高铁约4.5小时）</li>
            <li style="margin-bottom:6px;">北京 → 东京：约2,100公里（飞行约3.5小时）</li>
            <li style="margin-bottom:6px;">上海 → 曼谷：约2,840公里（飞行约5小时）</li>
            <li style="margin-bottom:6px;">北京 → 巴黎：约8,200公里（飞行约11小时）</li>
            <li style="margin-bottom:6px;">上海 → 悉尼：约8,000公里（飞行约11小时）</li>
            <li style="margin-bottom:6px;">北京 → 纽约：约10,900公里（飞行约13-14小时）</li>
          </ul>
          <p style="color:var(--text-muted);font-size:0.8rem;margin-top:16px;">💡 提示：实际飞行时间还需考虑气流方向，顺风时间短，逆风时间较长。</p>
        </div>
      </section>""",

    "driving-side.html": """
      <!-- SEO Article Content -->
      <section class="seo-article" style="margin-top:32px;padding:24px;background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);">
        <h2 style="font-family:var(--font-mono);font-size:1.1rem;font-weight:600;margin-bottom:16px;color:var(--accent-cyan);">🚗 海外自驾租车注意事项完全指南</h2>
        <div style="color:var(--text-secondary);font-size:0.9rem;line-height:1.8;">
          <p style="margin-bottom:12px;">全球有约163个国家靠右行驶，76个国家靠左行驶。靠左行驶的国家主要分布在英联邦成员国，包括英国、澳大利亚、新西兰、日本、印度、泰国、南非等。对于习惯靠右行驶的中国旅行者，在这些国家租车时需要特别注意。</p>
          <h3 style="font-size:0.95rem;font-weight:600;margin:16px 0 8px;color:var(--text-primary);">海外驾驶适应技巧</h3>
          <ul style="padding-left:20px;margin-bottom:12px;">
            <li style="margin-bottom:8px;"><strong>方向盘位置：</strong>靠左行驶国家的汽车方向盘在右侧，视野盲区不同，需重新适应</li>
            <li style="margin-bottom:8px;"><strong>转向灯和雨刷器：</strong>右舵车上两者通常对调，初期容易混淆</li>
            <li style="margin-bottom:8px;"><strong>转弯习惯：</strong>靠左行驶时，进圆环要逆时针；转弯时，大弯（U形）变成向左转</li>
            <li style="margin-bottom:8px;"><strong>停车场和道路：</strong>靠左行驶国家的停车场设计和道路标志与国内相反，需仔细观察</li>
          </ul>
          <h3 style="font-size:0.95rem;font-weight:600;margin:16px 0 8px;color:var(--text-primary);">国际驾照申请</h3>
          <p style="margin-bottom:12px;">大多数国家承认<strong>国际驾驶执照</strong>（International Driving Permit, IDP）。中国驾照持有者可在出发前到当地车管所申请IDP，通常即办即取，费用约50元。需要注意的是，IDP必须与国内原版驾照同时使用，单独使用IDP无效。</p>
          <p style="color:var(--text-muted);font-size:0.8rem;margin-top:16px;">💡 提示：部分国家（如澳大利亚）允许持有效中国驾照直接驾驶，但强烈建议同时携带IDP。</p>
        </div>
      </section>""",

    "emergency-contacts.html": """
      <!-- SEO Article Content -->
      <section class="seo-article" style="margin-top:32px;padding:24px;background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);">
        <h2 style="font-family:var(--font-mono);font-size:1.1rem;font-weight:600;margin-bottom:16px;color:var(--accent-red);">🆘 海外旅行紧急情况处理指南</h2>
        <div style="color:var(--text-secondary);font-size:0.9rem;line-height:1.8;">
          <p style="margin-bottom:12px;">出境旅行遭遇紧急情况时，快速获取帮助至关重要。不同国家的紧急电话不同，提前了解目的地的报警电话（110/999/911）、急救电话（120/999/911）和中国使领馆电话，可能在关键时刻救命。</p>
          <h3 style="font-size:0.95rem;font-weight:600;margin:16px 0 8px;color:var(--text-primary);">各国通用紧急电话</h3>
          <ul style="padding-left:20px;margin-bottom:12px;">
            <li style="margin-bottom:6px;"><strong>欧盟国家：</strong>112（通用欧盟紧急号码，适用于所有欧盟成员国）</li>
            <li style="margin-bottom:6px;"><strong>美国/加拿大：</strong>911（警察+急救+消防）</li>
            <li style="margin-bottom:6px;"><strong>英国/澳大利亚/新西兰：</strong>999/000（警察+急救+消防）</li>
            <li style="margin-bottom:6px;"><strong>日本：</strong>110（警察）/ 119（急救+消防）</li>
            <li style="margin-bottom:6px;"><strong>韩国：</strong>112（警察）/ 119（急救+消防）</li>
            <li style="margin-bottom:6px;"><strong>泰国：</strong>191（警察）/ 1669（急救）/ 199（消防）</li>
          </ul>
          <h3 style="font-size:0.95rem;font-weight:600;margin:16px 0 8px;color:var(--text-primary);">护照丢失处理流程</h3>
          <ol style="padding-left:20px;margin-bottom:12px;">
            <li style="margin-bottom:8px;">立即向当地警察局报案，取得"报案证明"（Police Report）</li>
            <li style="margin-bottom:8px;">联系中国驻当地使领馆申请"旅行证件"，带上报案证明、照片和身份证明</li>
            <li style="margin-bottom:8px;">使馆24小时领事保护热线：+86-10-12308 或 +86-10-59913991</li>
            <li style="margin-bottom:8px;">通知保险公司启动旅行保险护照丢失赔偿</li>
          </ol>
          <p style="color:var(--text-muted);font-size:0.8rem;margin-top:16px;">💡 建议：出发前将护照信息页拍照发到邮箱，并在国内留一份复印件。</p>
        </div>
      </section>""",

    "jet-lag-calc.html": """
      <!-- SEO Article Content -->
      <section class="seo-article" style="margin-top:32px;padding:24px;background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);">
        <h2 style="font-family:var(--font-mono);font-size:1.1rem;font-weight:600;margin-bottom:16px;color:var(--accent-yellow);">😴 科学克服时差反应完整指南</h2>
        <div style="color:var(--text-secondary);font-size:0.9rem;line-height:1.8;">
          <p style="margin-bottom:12px;">时差反应（Jet Lag）是由于跨越多个时区导致身体生物钟与目的地时间不同步而引起的疲劳、失眠、注意力不集中等症状。一般每跨越1个小时时区，需要约1天时间完全适应。</p>
          <h3 style="font-size:0.95rem;font-weight:600;margin:16px 0 8px;color:var(--text-primary);">出发前调整策略</h3>
          <ul style="padding-left:20px;margin-bottom:12px;">
            <li style="margin-bottom:6px;">出发前2-3天开始逐渐调整作息：前往东方（如中国飞欧洲），提前早睡早起；前往西方（如飞美国），推迟入睡时间</li>
            <li style="margin-bottom:6px;">订购夜间出发航班，可在飞机上睡觉，到达时正好是目的地白天</li>
            <li style="margin-bottom:6px;">出发前充分休息，保证睡眠充足</li>
          </ul>
          <h3 style="font-size:0.95rem;font-weight:600;margin:16px 0 8px;color:var(--text-primary);">飞行途中</h3>
          <ul style="padding-left:20px;margin-bottom:12px;">
            <li style="margin-bottom:6px;">登机后立即将手表调整到目的地时区</li>
            <li style="margin-bottom:6px;">多喝水，避免酒精和咖啡（会加重脱水和打乱生物钟）</li>
            <li style="margin-bottom:6px;">按照目的地时间决定是否睡觉：如果目的地是白天，尽量在飞机上保持清醒</li>
          </ul>
          <h3 style="font-size:0.95rem;font-weight:600;margin:16px 0 8px;color:var(--text-primary);">到达后恢复</h3>
          <ul style="padding-left:20px;margin-bottom:12px;">
            <li style="margin-bottom:6px;">不管多累，坚持到当地晚上10点后才睡觉</li>
            <li style="margin-bottom:6px;">白天多在户外接受自然光照射，帮助生物钟重置</li>
            <li style="margin-bottom:6px;">必要时可使用褪黑素（3-5mg），在目的地睡觉时间前1小时服用</li>
          </ul>
        </div>
      </section>""",

    "packing-list.html": """
      <!-- SEO Article Content -->
      <section class="seo-article" style="margin-top:32px;padding:24px;background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);">
        <h2 style="font-family:var(--font-mono);font-size:1.1rem;font-weight:600;margin-bottom:16px;color:var(--accent-cyan);">🎒 旅行打包终极指南 - 一次打包不遗漏</h2>
        <div style="color:var(--text-secondary);font-size:0.9rem;line-height:1.8;">
          <p style="margin-bottom:12px;">科学打包不仅能确保不遗漏重要物品，还能减轻行李重量，让旅行更轻松。无论是短途周末游还是长途跨国旅行，有一份完整的打包清单都非常重要。</p>
          <h3 style="font-size:0.95rem;font-weight:600;margin:16px 0 8px;color:var(--text-primary);">必带证件类（最重要）</h3>
          <ul style="padding-left:20px;margin-bottom:12px;">
            <li style="margin-bottom:4px;">护照（有效期需超过6个月）及复印件</li>
            <li style="margin-bottom:4px;">签证（如需）及申请材料</li>
            <li style="margin-bottom:4px;">机票/火车票（电子票截图）</li>
            <li style="margin-bottom:4px;">酒店预订确认单</li>
            <li style="margin-bottom:4px;">旅行保险单及保险公司急救电话</li>
            <li style="margin-bottom:4px;">国际驾照（自驾游必备）</li>
          </ul>
          <h3 style="font-size:0.95rem;font-weight:600;margin:16px 0 8px;color:var(--text-primary);">电子设备类</h3>
          <ul style="padding-left:20px;margin-bottom:12px;">
            <li style="margin-bottom:4px;">手机+充电线+充电头（注意目标国插座类型）</li>
            <li style="margin-bottom:4px;">万能转换插头</li>
            <li style="margin-bottom:4px;">移动电源（≤100Wh可带上飞机）</li>
            <li style="margin-bottom:4px;">相机及备用电池/储存卡</li>
          </ul>
          <h3 style="font-size:0.95rem;font-weight:600;margin:16px 0 8px;color:var(--text-primary);">药品急救类</h3>
          <ul style="padding-left:20px;margin-bottom:12px;">
            <li style="margin-bottom:4px;">常用感冒退烧药（泰诺、布洛芬）</li>
            <li style="margin-bottom:4px;">止泻药（蒙脱石散、黄连素）</li>
            <li style="margin-bottom:4px;">晕车/晕船药（出发前30分钟服用）</li>
            <li style="margin-bottom:4px;">创可贴和消毒棉片</li>
            <li style="margin-bottom:4px;">处方药（带够数量并附医生证明）</li>
          </ul>
        </div>
      </section>""",

    "travel-budget.html": """
      <!-- SEO Article Content -->
      <section class="seo-article" style="margin-top:32px;padding:24px;background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);">
        <h2 style="font-family:var(--font-mono);font-size:1.1rem;font-weight:600;margin-bottom:16px;color:var(--accent-green);">💼 2024年主要旅游目的地每日费用参考</h2>
        <div style="color:var(--text-secondary);font-size:0.9rem;line-height:1.8;">
          <p style="margin-bottom:12px;">制定旅行预算是出行前的重要环节。以下是主要旅游目的地每日人均费用参考（含住宿、餐饮、交通、景点），实际费用因个人消费习惯而异。</p>
          <h3 style="font-size:0.95rem;font-weight:600;margin:16px 0 8px;color:var(--text-primary);">亚洲目的地（经济实惠）</h3>
          <ul style="padding-left:20px;margin-bottom:12px;">
            <li style="margin-bottom:6px;"><strong>泰国曼谷：</strong>经济游约200-350元/天，舒适游约500-800元/天</li>
            <li style="margin-bottom:6px;"><strong>越南河内/胡志明市：</strong>经济游约150-250元/天</li>
            <li style="margin-bottom:6px;"><strong>印度尼西亚巴厘岛：</strong>经济游约250-400元/天</li>
            <li style="margin-bottom:6px;"><strong>马来西亚吉隆坡：</strong>经济游约250-400元/天</li>
          </ul>
          <h3 style="font-size:0.95rem;font-weight:600;margin:16px 0 8px;color:var(--text-primary);">东北亚目的地（中等消费）</h3>
          <ul style="padding-left:20px;margin-bottom:12px;">
            <li style="margin-bottom:6px;"><strong>日本东京/大阪：</strong>经济游约600-800元/天，2024年日元贬值期间性价比较高</li>
            <li style="margin-bottom:6px;"><strong>韩国首尔：</strong>经济游约400-600元/天</li>
          </ul>
          <h3 style="font-size:0.95rem;font-weight:600;margin:16px 0 8px;color:var(--text-primary);">欧洲目的地（消费较高）</h3>
          <ul style="padding-left:20px;margin-bottom:12px;">
            <li style="margin-bottom:6px;"><strong>法国巴黎：</strong>约1000-1500元/天（不含机票）</li>
            <li style="margin-bottom:6px;"><strong>意大利罗马/佛罗伦萨：</strong>约800-1200元/天</li>
            <li style="margin-bottom:6px;"><strong>东欧（捷克、匈牙利）：</strong>相对实惠，约500-800元/天</li>
          </ul>
          <p style="color:var(--text-muted);font-size:0.8rem;margin-top:16px;">💡 以上价格为人民币估算，实际以出行时汇率为准。</p>
        </div>
      </section>""",

    "visa-checker.html": """
      <!-- SEO Article Content -->
      <section class="seo-article" style="margin-top:32px;padding:24px;background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);">
        <h2 style="font-family:var(--font-mono);font-size:1.1rem;font-weight:600;margin-bottom:16px;color:var(--accent-cyan);">🛂 中国护照出行签证申请完全指南</h2>
        <div style="color:var(--text-secondary);font-size:0.9rem;line-height:1.8;">
          <p style="margin-bottom:12px;">近年来，中国护照的免签实力持续增强。截至2024年底，中国护照持有人可免签或落地签前往约80个国家和地区，其中包括多个热门旅游目的地如日本、韩国、新加坡、泰国等，为旅行者带来极大便利。</p>
          <h3 style="font-size:0.95rem;font-weight:600;margin:16px 0 8px;color:var(--text-primary);">2024年新增免签国家</h3>
          <ul style="padding-left:20px;margin-bottom:12px;">
            <li style="margin-bottom:6px;"><strong>日本（2024年11月）：</strong>试行单次免签30天，持有效护照可直接入境，需有返程机票</li>
            <li style="margin-bottom:6px;"><strong>韩国（2024年11月）：</strong>对华试行15天免签，含首尔、釜山等主要目的地</li>
            <li style="margin-bottom:6px;"><strong>哈萨克斯坦（2024年）：</strong>互免签证协议生效，可停留30天</li>
          </ul>
          <h3 style="font-size:0.95rem;font-weight:600;margin:16px 0 8px;color:var(--text-primary);">申根签证申请要点</h3>
          <p style="margin-bottom:12px;">申根区包含26个欧洲国家，申请一国签证可在所有申根国家通行，每180天内可停留90天。申请时需提交：有效护照（有效期需超过预计离境日期3个月）、往返机票证明、酒店预订、银行流水（通常要求每天300欧元）、旅行保险等材料。建议提前2-3个月申请。</p>
          <h3 style="font-size:0.95rem;font-weight:600;margin:16px 0 8px;color:var(--text-primary);">美国签证B1/B2申请技巧</h3>
          <p style="margin-bottom:12px;">美签面签等待时间因城市而异，通常需要提前1-3个月预约。面签时重点展示强烈的"回国意愿"，包括稳定工作、房产、家庭关系等。提供清晰的行程规划和足够的资金证明，可提高通过率。</p>
        </div>
      </section>""",

    "world-clock.html": """
      <!-- SEO Article Content -->
      <section class="seo-article" style="margin-top:32px;padding:24px;background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);">
        <h2 style="font-family:var(--font-mono);font-size:1.1rem;font-weight:600;margin-bottom:16px;color:var(--accent-blue);">🌍 全球时区与夏令时完全解析</h2>
        <div style="color:var(--text-secondary);font-size:0.9rem;line-height:1.8;">
          <p style="margin-bottom:12px;">全球共有24个标准时区，每个时区跨越15度经度，相邻时区相差1小时。但实际上，许多国家为了政治或经济原因，采用了非整点偏移的时区，如印度（UTC+5:30）、尼泊尔（UTC+5:45）等。</p>
          <h3 style="font-size:0.95rem;font-weight:600;margin:16px 0 8px;color:var(--text-primary);">主要城市时区快查</h3>
          <ul style="padding-left:20px;margin-bottom:12px;">
            <li style="margin-bottom:4px;"><strong>UTC+8（北京/上海/香港/台北/新加坡）：</strong>亚洲经济核心带</li>
            <li style="margin-bottom:4px;"><strong>UTC+9（东京/首尔）：</strong>比北京早1小时</li>
            <li style="margin-bottom:4px;"><strong>UTC+1（巴黎/柏林/罗马）：</strong>比北京晚7小时（夏令时晚6小时）</li>
            <li style="margin-bottom:4px;"><strong>UTC+0（伦敦）：</strong>比北京晚8小时（夏令时晚7小时）</li>
            <li style="margin-bottom:4px;"><strong>UTC-5（纽约）：</strong>比北京晚13小时（夏令时晚12小时）</li>
            <li style="margin-bottom:4px;"><strong>UTC-8（洛杉矶）：</strong>比北京晚16小时（夏令时晚15小时）</li>
          </ul>
          <h3 style="font-size:0.95rem;font-weight:600;margin:16px 0 8px;color:var(--text-primary);">夏令时（DST）说明</h3>
          <p style="margin-bottom:12px;">欧洲和北美大部分地区实行夏令时，通常在3月最后一个周日拨快1小时，11月第一个周日拨回。夏令时期间，欧洲与北京的时差会减少1小时。中国从1992年起已废除夏令时，全国统一使用UTC+8。</p>
        </div>
      </section>""",
}

# Default SEO article for files not individually specified
default_articles = {
    "flight-time.html": "飞行时间 flight time",
    "fuel-cost.html": "油费计算 fuel cost",
    "hotel-cost.html": "酒店费用 hotel cost",
    "itinerary-planner.html": "行程规划 itinerary",
    "luggage-calculator.html": "行李重量 luggage",
    "passport-photo.html": "护照照片 passport photo",
    "phrase-book.html": "旅行常用语 phrase book",
    "power-adapter.html": "电源插座 power adapter",
    "season-guide.html": "旅行季节 travel season",
    "sim-card-guide.html": "SIM卡 海外流量",
    "size-converter.html": "尺码转换 size converter",
    "time-difference.html": "时差 time difference",
    "timezone-converter.html": "时区转换 timezone",
    "tip-guide.html": "小费指南 tipping",
    "toll-calculator.html": "过路费 toll",
    "travel-checklist.html": "旅行清单 checklist",
    "travel-insurance.html": "旅行保险 insurance",
    "trip-budget.html": "旅行预算 budget",
    "trip-cost-splitter.html": "费用分摊 cost splitter",
    "vaccine-checker.html": "疫苗要求 vaccine",
    "visa-requirements.html": "签证要求 visa",
    "weather-planner.html": "旅行天气 weather",
}


def get_seo_article(filename):
    if filename in seo_articles:
        return seo_articles[filename]
    return None


def add_adsense_and_article(filepath):
    filename = os.path.basename(filepath)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # 1. Add AdSense CSS if missing
    if 'adsbygoogle' not in content:
        # Add CSS before </style>
        content = re.sub(r'(</style>)', adsense_css + r'\n    \1', content, count=1)
        
        # Add top banner after <main> opening or after first container div
        # Try to find the main content area opening
        if '<main' in content:
            content = re.sub(r'(<main[^>]*>)', r'\1\n' + adsense_top, content, count=1)
        elif 'class="container"' in content or "class='container'" in content:
            content = re.sub(r'(<div[^>]+class="container"[^>]*>)', r'\1\n' + adsense_top, content, count=1)
        
        # Add bottom ad before </body>
        content = re.sub(r'(\s*</body>)', '\n' + adsense_bottom + r'\n\1', content, count=1)
    
    # 2. Add SEO article content if missing
    article = get_seo_article(filename)
    if article and 'seo-article' not in content:
        # Insert before </body> or after toast div
        if 'id="toast"' in content:
            content = re.sub(r'(<div[^>]+id="toast"[^>]*/?>)', r'\1\n' + article, content, count=1)
        else:
            content = re.sub(r'(\s*</body>)', '\n' + article + r'\n\1', content, count=1)
    
    # 3. Add font preconnect if missing
    if 'fonts.googleapis.com' in content and 'rel="preconnect" href="https://fonts.googleapis.com"' not in content:
        content = re.sub(r'(<link\s+href="https://fonts\.googleapis\.com)',
                        '<link rel="preconnect" href="https://fonts.googleapis.com" />\n    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n    \1', content, count=1)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Enhanced: {filename}")
    else:
        print(f"No changes: {filename}")


for filename in os.listdir(travel_dir):
    if filename.endswith('.html'):
        filepath = os.path.join(travel_dir, filename)
        add_adsense_and_article(filepath)

print("\nAdSense & article enhancement complete!")
