#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
import re

travel_dir = r"e:\html-tools\tools\travel"

files_meta = {
    "baggage-limit.html": {
        "title": "航空公司行李限制查询 - WebUtils",
        "desc": "查询全球主要航空公司行李尺寸和重量限制，包含手提行李和托运行李规定，涵盖中国国航、东方航空、南方航空、美国航空、英国航空、阿联酋航空等20+航空公司详细数据",
        "keywords": "行李限制 baggage limit 航空公司 手提行李 托运行李 重量限制 尺寸限制",
        "tool_name": "行李限制查询",
        "slug": "baggage-limit"
    },
    "baggage-tracker.html": {
        "title": "行李追踪器 - WebUtils",
        "desc": "在线记录和追踪您的行李状态，支持多件行李管理，随时了解行李位置和状态，防止行李丢失",
        "keywords": "baggage tracker 行李追踪 托运行李 行李状态 旅行行李管理",
        "tool_name": "行李追踪器",
        "slug": "baggage-tracker"
    },
    "currency-exchange.html": {
        "title": "实时货币汇率转换器 - WebUtils",
        "desc": "免费在线货币汇率转换工具，支持20+主要货币实时换算，包括人民币、美元、欧元、日元、英镑等，帮助出境旅行快速计算换汇金额",
        "keywords": "货币转换 currency converter 汇率 exchange rate 人民币 美元 欧元",
        "tool_name": "货币转换",
        "slug": "currency-exchange"
    },
    "currency-tips.html": {
        "title": "出境换汇指南 - 各国货币支付方式与小费习惯 - WebUtils",
        "desc": "全面的出境换汇指南，包括各国货币换汇建议、ATM取款技巧、信用卡使用注意事项、小费文化习惯，帮助旅行者避免高额手续费，轻松应对境外支付",
        "keywords": "换汇 货币 外汇 出境 currency exchange tips 手续费 ATM 小费",
        "tool_name": "出境换汇指南",
        "slug": "currency-tips"
    },
    "distance-calculator.html": {
        "title": "两地直线距离计算器 - WebUtils",
        "desc": "在线计算全球任意两地之间的直线距离，支持城市名称搜索和经纬度坐标输入，使用哈弗辛公式精确计算地球表面距离，单位支持公里和英里切换",
        "keywords": "距离计算 distance calculator 两地距离 直线距离 haversine 经纬度",
        "tool_name": "距离计算器",
        "slug": "distance-calculator"
    },
    "driving-side.html": {
        "title": "各国驾驶方向查询 - 靠左还是靠右行驶 - WebUtils",
        "desc": "查询全球各国靠左还是靠右行驶，为租车旅行提供必备信息。涵盖全球180+国家和地区的驾驶规则，包含历史沿革和实用驾驶注意事项",
        "keywords": "驾驶方向 driving side left right 靠左行驶 靠右行驶 租车 旅行驾驶",
        "tool_name": "驾驶方向查询",
        "slug": "driving-side"
    },
    "emergency-contacts.html": {
        "title": "各国紧急求助电话查询 - 警察急救消防 - WebUtils",
        "desc": "查询全球各国紧急求助电话号码，包括警察（报警）、急救（120）、消防，以及中国驻外大使馆联系方式。出行前必备，紧急情况快速求助",
        "keywords": "紧急电话 emergency numbers 报警 急救 消防 大使馆 旅行安全",
        "tool_name": "紧急电话查询",
        "slug": "emergency-contacts"
    },
    "flight-time.html": {
        "title": "飞行时间估算工具 - WebUtils",
        "desc": "根据出发地和目的地估算飞行时间，包含起飞降落时间、航班中转时长，支持多个主要城市间的飞行时间查询，帮助您合理规划旅行行程",
        "keywords": "飞行时间 flight time 航班时间 估算 航程 国际航班 旅行规划",
        "tool_name": "飞行时间估算",
        "slug": "flight-time"
    },
    "fuel-cost.html": {
        "title": "自驾油费计算器 - WebUtils",
        "desc": "精准计算自驾出行油费，支持多种车型油耗预设，根据行驶距离、百公里油耗和当前油价计算总费用，帮助制定自驾游预算",
        "keywords": "油费计算 fuel cost 自驾 油耗 加油费 高速 公路旅行 汽车旅行",
        "tool_name": "油费计算器",
        "slug": "fuel-cost"
    },
    "hotel-cost.html": {
        "title": "酒店住宿费用计算器 - WebUtils",
        "desc": "快速计算酒店住宿总费用，支持含税费和服务费的精确计算，多间房型对比，帮助旅行者控制住宿预算，提前规划住宿开销",
        "keywords": "酒店费用 住宿计算 hotel cost 旅行预算 住宿价格 含税价格",
        "tool_name": "酒店费用计算器",
        "slug": "hotel-cost"
    },
    "itinerary-planner.html": {
        "title": "旅行行程规划器 - WebUtils",
        "desc": "在线创建和管理旅行行程，支持多天活动安排、时间轴展示、地点记录、费用追踪，支持打印和本地保存。一站式旅行规划工具",
        "keywords": "行程规划 itinerary planner 旅行计划 多天行程 行程安排 旅行日程",
        "tool_name": "行程规划器",
        "slug": "itinerary-planner"
    },
    "jet-lag-calc.html": {
        "title": "时差计算器 - 时差调整建议 - WebUtils",
        "desc": "计算出发地和目的地之间的时差，根据航班时间和停留天数生成个性化时差调整方案，帮助旅行者克服时差反应，更快适应新时区",
        "keywords": "时差计算 jet lag 时区 飞行 旅行时差 时差调整 circadian rhythm",
        "tool_name": "时差计算器",
        "slug": "jet-lag-calc"
    },
    "luggage-calculator.html": {
        "title": "行李限额重量计算器 - WebUtils",
        "desc": "航班行李重量计算器，支持多航空公司限额设置，可添加物品清单并实时计算总重量，直观显示是否超重，帮助您高效打包行李",
        "keywords": "行李重量 luggage calculator 行李限额 超重行李 托运 打包清单",
        "tool_name": "行李限额计算",
        "slug": "luggage-calculator"
    },
    "packing-list.html": {
        "title": "旅行行李清单生成器 - WebUtils",
        "desc": "根据旅行目的地、天数和旅行类型智能生成个性化行李清单，支持自定义添加物品、勾选进度记录和导出打印，确保出行不遗漏重要物品",
        "keywords": "行李清单 packing list 旅行打包 travel checklist 出行准备",
        "tool_name": "行李清单生成器",
        "slug": "packing-list"
    },
    "passport-photo.html": {
        "title": "各国护照签证照片要求查询 - WebUtils",
        "desc": "查询全球各国护照、签证、居留证等证件照片的尺寸、背景颜色、分辨率等要求，避免因照片不符合标准导致申请失败",
        "keywords": "护照照片 passport photo 证件照 签证照片 照片要求 尺寸规格",
        "tool_name": "护照照片要求",
        "slug": "passport-photo"
    },
    "phrase-book.html": {
        "title": "旅行常用语速查手册 - 多语言 - WebUtils",
        "desc": "旅行必备多语言常用短语速查，涵盖日语、韩语、法语、西班牙语、德语、泰语等主要旅游目的地语言，包括问候、问路、点餐、购物、紧急求助等场景",
        "keywords": "旅行常用语 phrase book 多语言 旅行翻译 常用短语 旅游语言",
        "tool_name": "旅行常用语",
        "slug": "phrase-book"
    },
    "power-adapter.html": {
        "title": "各国电源插座与电压指南 - WebUtils",
        "desc": "查询全球各国电源插座类型、电压规格和频率，了解是否需要携带转换插头和变压器，保护您的电子设备安全使用",
        "keywords": "电源插座 power adapter 插头类型 电压 转换器 旅行插头 海外用电",
        "tool_name": "电源插座指南",
        "slug": "power-adapter"
    },
    "season-guide.html": {
        "title": "各目的地最佳旅行季节指南 - WebUtils",
        "desc": "查询全球热门旅游目的地的最佳旅行时间，了解各月份气候特点、节假日、旺季淡季价格差异，帮助您选择最合适的出行时机",
        "keywords": "最佳旅行时间 best time to visit 旅行季节 天气 旅游旺季 淡季",
        "tool_name": "最佳旅行季节",
        "slug": "season-guide"
    },
    "sim-card-guide.html": {
        "title": "海外旅行SIM卡与流量套餐指南 - WebUtils",
        "desc": "各国旅行SIM卡推荐、流量套餐价格对比、当地运营商信息，帮助旅行者以最低成本解决海外上网问题，告别高额国际漫游费",
        "keywords": "SIM卡 海外流量 国际漫游 旅行电话卡 流量套餐 海外上网",
        "tool_name": "SIM卡指南",
        "slug": "sim-card-guide"
    },
    "size-converter.html": {
        "title": "国际服装鞋码尺码转换器 - WebUtils",
        "desc": "国际服装和鞋码转换工具，支持中国、美国、英国、欧洲、日本等多个地区尺码互转，购物出行不再为尺码困惑，包含男女童装和鞋类全覆盖",
        "keywords": "尺码转换 size converter 服装尺码 鞋码 CN US UK EU JP 国际尺码",
        "tool_name": "尺码转换器",
        "slug": "size-converter"
    },
    "time-difference.html": {
        "title": "两地时差查询工具 - WebUtils",
        "desc": "快速查询全球任意两个城市或时区之间的时差，支持夏令时自动计算，帮助安排跨国商务会议、联系海外亲友和规划国际旅行",
        "keywords": "时差查询 time difference 时区转换 timezone converter 世界时间",
        "tool_name": "时差查询",
        "slug": "time-difference"
    },
    "timezone-converter.html": {
        "title": "全球时区转换器 - WebUtils",
        "desc": "全球时区时间互相转换工具，支持100+城市时区，自动处理夏令时，实时显示当前时间对应的各时区时间，方便跨时区沟通协作",
        "keywords": "时区转换 timezone converter 世界时间 夏令时 全球时区 时间换算",
        "tool_name": "时区转换器",
        "slug": "timezone-converter"
    },
    "tip-guide.html": {
        "title": "各国小费指南与小费计算器 - WebUtils",
        "desc": "了解全球各国小费文化习惯，内置小费计算器，帮助旅行者了解在餐厅、酒店、出租车等场合应该给多少小费，避免文化失礼",
        "keywords": "小费指南 tipping guide 小费计算 tip calculator 餐厅小费 文化礼仪",
        "tool_name": "小费指南",
        "slug": "tip-guide"
    },
    "toll-calculator.html": {
        "title": "高速公路过路费计算器 - WebUtils",
        "desc": "中国高速公路过路费估算工具，支持小型轿车、SUV、货车等多种车型，根据行驶距离计算大概过路费，帮助自驾游合理规划出行成本",
        "keywords": "过路费计算 toll calculator 高速收费 ETC 自驾 公路费用",
        "tool_name": "过路费计算",
        "slug": "toll-calculator"
    },
    "travel-budget.html": {
        "title": "旅行预算计划工具 - WebUtils",
        "desc": "智能旅行预算规划工具，按交通、住宿、餐饮、景点门票、购物等类别估算出行费用，支持多货币，帮助旅行者提前制定合理预算",
        "keywords": "旅行预算 travel budget 出行费用 旅游费用估算 预算规划",
        "tool_name": "旅行预算计划",
        "slug": "travel-budget"
    },
    "travel-checklist.html": {
        "title": "出行准备清单 - 旅行必备物品检查 - WebUtils",
        "desc": "全面的旅行出行准备清单，涵盖证件、电子设备、衣物、洗漱用品、药品急救等各类物品，支持自定义添加和勾选进度保存，出行前一键确认",
        "keywords": "旅行清单 travel checklist 出行准备 打包清单 旅行物品 出发前检查",
        "tool_name": "旅行清单",
        "slug": "travel-checklist"
    },
    "travel-insurance.html": {
        "title": "旅行保险清单与保障指南 - WebUtils",
        "desc": "旅行保险全面指南，帮助了解医疗险、行程取消险、行李险等保险类型的区别，估算所需保障金额，提供购买要点检查清单，避免出行无保障",
        "keywords": "旅行保险 travel insurance 医疗险 行程取消 行李险 海外保险",
        "tool_name": "旅行保险清单",
        "slug": "travel-insurance"
    },
    "trip-budget.html": {
        "title": "旅行消费预算管理 - WebUtils",
        "desc": "旅行期间消费追踪和预算管理工具，按类别记录支出，实时显示预算使用情况，支持本地存储，帮助旅行者控制总花费，防止超支",
        "keywords": "旅行预算 trip budget 消费追踪 支出管理 旅行花费 记账",
        "tool_name": "旅行预算管理",
        "slug": "trip-budget"
    },
    "trip-cost-splitter.html": {
        "title": "多人旅行费用分摊计算器 - WebUtils",
        "desc": "多人旅行AA制费用分摊计算工具，自动计算每人应付金额和最优结算方案，减少转账次数，告别繁琐手工计算，让团队旅行更轻松",
        "keywords": "费用分摊 trip cost splitter AA制 旅行账单 多人旅游 均摊费用",
        "tool_name": "旅行费用分摊",
        "slug": "trip-cost-splitter"
    },
    "vaccine-checker.html": {
        "title": "旅行目的地疫苗要求查询 - WebUtils",
        "desc": "查询出行目的地的疫苗接种要求，了解各国必需和推荐的旅行疫苗，包括黄热病、伤寒、甲肝、狂犬病等，提前做好健康防护准备",
        "keywords": "旅行疫苗 vaccine requirements 黄热病 健康证明 疫苗接种 出行健康",
        "tool_name": "疫苗要求查询",
        "slug": "vaccine-checker"
    },
    "visa-checker.html": {
        "title": "中国护照签证要求查询 - 免签落地签电子签 - WebUtils",
        "desc": "查询中国护照前往全球各国的签证要求，包含免签、落地签、电子签证详细信息，以及停留天数、费用和注意事项，出行前一键确认签证状态",
        "keywords": "签证查询 visa checker 中国护照 免签 落地签 电子签证 出境旅游",
        "tool_name": "签证查询",
        "slug": "visa-checker"
    },
    "visa-requirements.html": {
        "title": "各国签证要求入境政策查询 - WebUtils",
        "desc": "查询前往不同国家的签证要求和入境政策，了解所需材料、费用和申请流程，帮助旅行者提前规划签证申请，顺利出行",
        "keywords": "签证要求 visa requirements 入境政策 护照 旅游签证 签证材料",
        "tool_name": "签证要求查询",
        "slug": "visa-requirements"
    },
    "weather-planner.html": {
        "title": "旅行目的地天气规划工具 - WebUtils",
        "desc": "查询全球热门旅游目的地各月份的平均气温、降水量、天气特点，了解最佳旅行时间和需要携带的衣物，提前做好出行天气准备",
        "keywords": "旅行天气 weather planner 目的地气候 气温 降水量 最佳旅行时间",
        "tool_name": "目的地天气规划",
        "slug": "weather-planner"
    },
    "world-clock.html": {
        "title": "世界时钟 - 全球城市当前时间 - WebUtils",
        "desc": "查看全球各城市和时区的实时时间，支持添加多个城市对比，自动更新显示，帮助安排跨国沟通、了解世界各地当前时间",
        "keywords": "世界时钟 world clock 全球时间 时区 城市时间 当前时间",
        "tool_name": "世界时钟",
        "slug": "world-clock"
    },
}

def fix_file(filepath, meta):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # 1. Fix title (更丰富的SEO标题)
    old_title_match = re.search(r'<title>([^<]+)</title>', content)
    if old_title_match:
        old_title = old_title_match.group(1)
        if old_title != meta['title']:
            content = re.sub(r'<title>[^<]+</title>', f'<title>{meta["title"]}</title>', content)
    
    # 2. Fix description (更丰富的描述)
    content = re.sub(r'<meta\s+name="description"\s+content="[^"]*"\s*/>', 
                     f'<meta name="description" content="{meta["desc"]}" />', content)
    
    # 3. Fix og:title
    content = re.sub(r'<meta\s+property="og:title"\s+content="[^"]*"\s*/>', 
                     f'<meta property="og:title" content="{meta["title"]}" />', content)
    
    # 4. Fix og:description
    content = re.sub(r'<meta\s+property="og:description"\s+content="[^"]*"\s*/>', 
                     f'<meta property="og:description" content="{meta["desc"]}" />', content)
    
    # 5. Add robots if missing
    if 'meta name="robots"' not in content:
        content = re.sub(r'(<link rel="canonical"[^>]+/>)', 
                        r'\1\n    <meta name="robots" content="index, follow" />', content)
    
    # 6. Add og:image:width/height/type if missing
    if 'og:image:width' not in content:
        if 'og:image"' in content:
            content = re.sub(r'(<meta property="og:image" content="[^"]+"\s*/>)',
                           r'\1\n    <meta property="og:image:width" content="1280" />\n    <meta property="og:image:height" content="640" />\n    <meta property="og:image:type" content="image/png" />', content)
        else:
            # Add og:image block after og:locale
            content = re.sub(r'(<meta property="og:locale"[^>]+/>)',
                           r'\1\n    <meta property="og:image" content="https://essays4u.net/social-preview.png" />\n    <meta property="og:image:width" content="1280" />\n    <meta property="og:image:height" content="640" />\n    <meta property="og:image:type" content="image/png" />', content)
    
    # 7. Add twitter:image if missing
    if 'twitter:image' not in content:
        content = re.sub(r'(<meta name="twitter:description"[^>]+/>)',
                        r'\1\n    <meta name="twitter:image" content="https://essays4u.net/social-preview.png" />', content)
    
    # 8. Add complete Twitter card if missing
    if 'twitter:card' not in content:
        twitter_block = f'''    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="{meta['title']}" />
    <meta name="twitter:description" content="{meta['desc']}" />
    <meta name="twitter:image" content="https://essays4u.net/social-preview.png" />'''
        
        # Insert before JSON-LD or before font preconnect
        if '<!-- JSON-LD' in content:
            content = content.replace('<!-- JSON-LD', twitter_block + '\n\n    <!-- JSON-LD', 1)
        elif 'application/ld+json' in content:
            content = re.sub(r'(<script type="application/ld\+json">)',
                           twitter_block + r'\n\n    \1', content, count=1)
        else:
            content = re.sub(r'(<link rel="preconnect")',
                           twitter_block + r'\n\n    \1', content, count=1)
    
    # 9. Fix twitter:title and twitter:description
    content = re.sub(r'<meta\s+name="twitter:title"\s+content="[^"]*"\s*/>', 
                     f'<meta name="twitter:title" content="{meta["title"]}" />', content)
    content = re.sub(r'<meta\s+name="twitter:description"\s+content="[^"]*"\s*/>', 
                     f'<meta name="twitter:description" content="{meta["desc"]}" />', content)
    
    # 10. Add JSON-LD if missing
    if 'application/ld+json' not in content:
        json_ld = f'''    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json">
      {{
        "@context": "https://schema.org",
        "@graph": [
          {{
            "@type": "BreadcrumbList",
            "itemListElement": [
              {{
                "@type": "ListItem",
                "position": 1,
                "name": "首页",
                "item": "https://essays4u.net/"
              }},
              {{
                "@type": "ListItem",
                "position": 2,
                "name": "旅行工具",
                "item": "https://essays4u.net/#travel"
              }},
              {{
                "@type": "ListItem",
                "position": 3,
                "name": "{meta['tool_name']}",
                "item": "https://essays4u.net/tools/travel/{meta['slug']}.html"
              }}
            ]
          }},
          {{
            "@type": "WebApplication",
            "name": "{meta['title']}",
            "description": "{meta['desc']}",
            "url": "https://essays4u.net/tools/travel/{meta['slug']}",
            "applicationCategory": "TravelApplication",
            "operatingSystem": "Web",
            "offers": {{
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "CNY"
            }}
          }}
        ]
      }}
    </script>'''
        content = re.sub(r'(<link rel="preconnect")',
                        json_ld + r'\n\n    \1', content, count=1)
    else:
        # Update existing JSON-LD to include WebApplication schema if only BreadcrumbList
        if '"WebApplication"' not in content and '"@graph"' not in content:
            web_app_addition = f''',
          {{
            "@type": "WebApplication",
            "name": "{meta['title']}",
            "description": "{meta['desc']}",
            "url": "https://essays4u.net/tools/travel/{meta['slug']}",
            "applicationCategory": "TravelApplication",
            "operatingSystem": "Web",
            "offers": {{
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "CNY"
            }}
          }}'''
            # Wrap existing BreadcrumbList in @graph
            # Find the JSON-LD block
            ld_match = re.search(r'(<script type="application/ld\+json">\s*)(.*?)(\s*</script>)', content, re.DOTALL)
            if ld_match:
                old_json = ld_match.group(2).strip()
                new_json = f'''{ld_match.group(1)}
      {{
        "@context": "https://schema.org",
        "@graph": [
          {old_json.replace('"@context": "https://schema.org",', '').replace('"@context": "https://schema.org"', '').strip()}
          {web_app_addition}
        ]
      }}
    {ld_match.group(3)}'''
                # Simpler: just add WebApplication after BreadcrumbList itemListElement closes
                # Instead, add a second script block
                new_web_app_script = f'''
    <!-- WebApplication Schema -->
    <script type="application/ld+json">
      {{
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "{meta['title']}",
        "description": "{meta['desc']}",
        "url": "https://essays4u.net/tools/travel/{meta['slug']}",
        "applicationCategory": "TravelApplication",
        "operatingSystem": "Web",
        "offers": {{
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "CNY"
        }}
      }}
    </script>'''
                content = re.sub(r'(</script>\s*\n\s*\n\s*<link rel="preconnect")',
                               new_web_app_script + r'\n\n    <link rel="preconnect"', content, count=1)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {os.path.basename(filepath)}")
    else:
        print(f"No changes: {os.path.basename(filepath)}")

for filename, meta in files_meta.items():
    filepath = os.path.join(travel_dir, filename)
    if os.path.exists(filepath):
        fix_file(filepath, meta)
    else:
        print(f"Not found: {filename}")

print("\nDone!")
