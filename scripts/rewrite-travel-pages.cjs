const fs = require('fs');
const path = require('path');

const travelDir = path.join('e:/html-tools', 'tools', 'travel');
const siteOrigin = 'https://essays4u.net';
const previewImage = `${siteOrigin}/social-preview.png`;

const pages = {
  'baggage-limit.html': {
    name: '航空公司行李限制查询',
    summary: '出发前快速核对不同航空公司的随身与托运行李限制，避免到了值机柜台才发现尺寸、件数或重量不符合要求。',
    pain: '很多超重和超尺寸问题不是因为旅客完全没准备，而是把不同航司、不同舱位、不同航线的规则混在一起，最后以“上一次没事”来替代这一次的真实标准。',
    audience: ['跨航司比价后准备订票的人', '已经出票，想确认免费额度和付费风险的人', '帮家人或客户做行李说明的人'],
    steps: ['先筛出本次真正承运航司与舱位，再看手提、托运和额外件数规则。', '把箱体尺寸、重量、特殊物品与本页结果逐项对应，别只看一个总公斤数。', '若有婴儿票、联程航班、代码共享或会员权益，临出发前再去航司官网复核一次。'],
    mistakes: ['只记得重量，不核对三边尺寸与件数。', '忽略廉航手提规则和国际/国内航线差异。', '联程中只看第一程，没看后续承运方。'],
    faqs: [
      ['为什么同一家航空公司不同航线额度不一样？', '因为不同区域、票价舱位、会员等级和合作航班政策可能不同，真正执行时应以票面对应规则为准。'],
      ['超过一点点通常能通融吗？', '不能当作固定预期。值机现场是否放行取决于柜台、机场和当时执法尺度，预算上最好提前把超限风险当作会发生来处理。'],
      ['特殊行李要不要单独确认？', '要。婴儿车、运动器材、乐器、电池设备等通常有独立条款，本页适合先做总览，最终仍要看航司专项说明。']
    ]
  },
  'baggage-tracker.html': {
    name: '行李追踪器',
    summary: '把行李牌号、航班号、描述和当前状态集中记录，适合在中转、延误或到达后找不到箱子时快速拿出关键信息。',
    pain: '真正丢行李时最耽误时间的，往往不是找不到柜台，而是讲不清行李牌号、外观描述、最后出现地点和当前航班信息。',
    audience: ['中转较多、担心错送行李的人', '一家人同行、需要统一记录多件行李的人', '希望把行李信息同步给同伴的人'],
    steps: ['托运完成后先把行李牌号、航班号和箱体描述录入。', '每次中转或落地后更新状态，确保自己知道最后确认节点。', '一旦延误或丢失，直接拿着页面记录去找航司行李服务柜台。'],
    mistakes: ['只拍行李票，不记箱体颜色和特征。', '多件行李混在一起，没有逐件记录。', '发现异常后仍靠记忆描述，导致登记效率很低。'],
    faqs: [
      ['为什么要写行李描述？', '因为柜台和系统信息并不总是足够，颜色、品牌、贴纸、绑带等特征能明显提高定位效率。'],
      ['这个页面能直接查询航司系统吗？', '不能，它更适合做个人追踪记录与信息整理，真正系统状态仍以航司或机场反馈为准。'],
      ['手机上使用有什么优势？', '现场排队时可以立刻出示记录，不用翻相册、短信和邮件，尤其适合网络不稳定时做离线参考。']
    ]
  },
  'currency-exchange.html': {
    name: '实时货币汇率转换器',
    summary: '在换汇、做预算、看当地价格或核对账单时，快速判断不同货币之间的大致成本差，减少“看着便宜、实际不便宜”的错觉。',
    pain: '旅行中的汇率误判通常不是不会乘除，而是心里没有一个即时参照值，导致付款前对总价缺乏直觉，最后在吃饭、购物和交通上持续超支。',
    audience: ['准备换汇或比较刷卡与现金成本的人', '海外购物时想把标价迅速换回熟悉货币的人', '做团队行程预算的人'],
    steps: ['先确定你真正要比较的是现金兑换价、银行卡结算价还是平台显示价。', '输入金额并切换源货币与目标货币，看整体成本而不是只看单价。', '如要做付款决策，再给汇率波动与手续费预留一点缓冲。'],
    mistakes: ['把中间价当作最终到手价。', '忽略发卡行加价、ATM 手续费或商户 DCC 转换。', '只换算商品价格，不换算税费和附加费。'],
    faqs: [
      ['为什么页面结果和银行入账不完全一样？', '因为实际记账会受到发卡行汇率、清算时间、手续费和商户结算方式影响，本页更适合做快速预估。'],
      ['旅行预算应该按什么汇率留余量？', '如果没有更精确数据，建议在当前换算结果基础上多预留 3% 到 8% 的波动缓冲。'],
      ['什么时候最适合用这个工具？', '出发前做总预算、到店前做价格判断、付款前二次确认，这三个节点最实用。']
    ]
  },
  'currency-tips.html': {
    name: '出境换汇指南',
    summary: '把目的地货币、支付方式、换汇建议和小费习惯放在一个页面里，适合在出发前快速决定要不要换现金、换多少、怎么付更稳。',
    pain: '很多人不是不知道要换汇，而是不知道该在国内换、机场换、当地 ATM 取，还是干脆少带现金，多刷卡或移动支付。',
    audience: ['第一次出境自由行的人', '要给父母或团队做行前提示的人', '担心到了当地付不出去的人'],
    steps: ['先确定目的地对现金、银行卡和移动支付的接受度。', '再看建议准备金额，区分应急现金和主要支付方式。', '最后把小费文化、取现手续费和备用支付方案一起准备好。'],
    mistakes: ['机场一次性换太多。', '只带单一支付方式。', '忽略小额现金和零钱场景。'],
    faqs: [
      ['为什么有些国家还要多准备现金？', '因为即使大城市支持刷卡，交通、小店、夜市、押金或突发情况仍常常需要现金解决。'],
      ['到当地再换是不是一定更划算？', '不一定，取决于机场、银行、ATM 手续费和你自己的发卡行政策，因此更适合先做方案比较。'],
      ['这页和汇率转换器有什么区别？', '汇率工具更偏数值换算，这一页更偏支付决策和实际落地执行。']
    ]
  },
  'distance-calculator.html': {
    name: '两地直线距离计算器',
    summary: '快速估算两个城市或坐标点之间的直线距离，适合做飞行时间、路线尺度、目的地远近和日程可行性的第一层判断。',
    pain: '很多旅行决策会误把“地图上看着不远”当成现实可达，结果在订酒店、排景点和安排接送时严重低估了实际移动成本。',
    audience: ['在多个城市之间选目的地的人', '需要预估跨城移动尺度的人', '配合机票、租车或行程工具一起使用的人'],
    steps: ['优先选择城市预设，或在需要更精确时输入经纬度。', '先看直线距离建立空间尺度，再结合交通方式估算真实耗时。', '如果结果将影响订票或当天行程，再配合航班、铁路或路况工具二次确认。'],
    mistakes: ['把直线距离当成实际驾车距离。', '忽略山区、海峡、边境和中转限制。', '只看公里数，不看当日交通方式。'],
    faqs: [
      ['为什么直线距离和导航公里数差很多？', '因为本页计算的是地球表面的最短球面距离，不包含道路绕行、机场路径和中转路线。'],
      ['这个结果最适合拿来做什么？', '适合做行程初筛、飞行尺度预估和目的地远近对比，而不是直接替代导航。'],
      ['输入坐标有什么用？', '当你要看景点、机场、小岛或偏远地点时，经纬度模式会比城市预设更灵活。']
    ]
  },
  'driving-side.html': {
    name: '各国驾驶方向查询',
    summary: '出国租车前先确认当地靠左还是靠右行驶、方向盘位置和上路注意点，降低刚落地开车时最危险的适应成本。',
    pain: '海外自驾的风险往往不是不会开车，而是把国内肌肉记忆直接带到相反方向的路权环境里，尤其在转弯、并线和环岛最容易出错。',
    audience: ['准备海外租车的人', '自驾环线行程制定者', '需要给同行驾驶者做提醒的人'],
    steps: ['先确认目的地国家的行驶方向和方向盘位置。', '如果是靠左行驶国家，出发前重点复习转弯、并线和环岛的判断顺序。', '拿车后第一段路尽量从低复杂度区域开始适应。'],
    mistakes: ['只记“靠左/靠右”，不练习具体动作。', '疲劳落地后立刻长途驾驶。', '忽略当地限速、停车和租车保险规则。'],
    faqs: [
      ['方向盘位置一定和行驶方向一致吗？', '绝大多数情况下是一致的，但具体车辆仍要以租车公司实际配车为准。'],
      ['最容易出错的是哪些场景？', '右转/左转、环岛进入与驶出、窄路会车、停车场出入口，这些场景最依赖习惯动作。'],
      ['这个页面能替代当地交规学习吗？', '不能，它更适合做第一步提醒，正式开车前仍建议了解当地核心交规与保险条款。']
    ]
  },
  'emergency-contacts.html': {
    name: '各国紧急求助电话查询',
    summary: '把报警、急救、消防和使领馆联系方式提前整理好，遇到手机没信号、语言慌乱或现场紧急情况时能第一时间找到正确电话。',
    pain: '真正遇到意外时，最常见的问题不是“不知道出事了”，而是不确定该打哪个号码、先找谁、需要准备哪些关键信息。',
    audience: ['给家庭旅行做风险预案的人', '去语言不熟悉国家的人', '带老人和孩子出行的人'],
    steps: ['先查目的地国家的报警、急救和消防号码并保存。', '再补上中国驻外使领馆或保险紧急协助电话。', '把护照号、酒店地址和同行联系人一起整理，形成完整应急包。'],
    mistakes: ['只记一个报警电话。', '没有保存离线信息。', '真正用到时才开始搜索。'],
    faqs: [
      ['为什么还要保存使领馆电话？', '因为证件丢失、拘留、重大事故或协助沟通时，使领馆渠道很重要。'],
      ['本页适合什么时候准备？', '最晚应在出发前完成，最好在订好机酒后就顺手整理。'],
      ['除了电话号码还应该准备什么？', '护照号、保险单号、酒店地址、同行人联系方式和当地住址都很关键。']
    ]
  },
  'flight-time.html': {
    name: '飞行时间估算工具',
    summary: '先估算空中飞行时长和阶段构成，再去判断转机、落地接驳、酒店入住和次日安排是否现实。',
    pain: '旅行里最容易高估效率的事情之一就是飞行：大家往往只看起飞和降落，不把值机、安检、滑行、晚点和落地交通一起算进去。',
    audience: ['比较不同航线方案的人', '安排转机和接送机的人', '想判断当天是否还能排活动的人'],
    steps: ['先用城市或距离模式估算空中飞行时间。', '再叠加值机、安检、转机、入境和通勤缓冲。', '如果当天还有会议、景点或换酒店，把落地后体力也一起算进去。'],
    mistakes: ['把空中时间当门到门时间。', '忽略夜航疲劳和跨时区影响。', '只看理想状态，不留缓冲。'],
    faqs: [
      ['为什么估算和机票显示不完全一样？', '因为航线、机型、风向、滑行和机场运行效率都会影响实际时间，本页更适合做前期判断。'],
      ['转机多久才算稳妥？', '要看机场规模、是否需要重新安检或入境、是否联程和值机政策，不能只看本页结果。'],
      ['这个工具最适合什么时候用？', '比价选航线、做日程初排、确认是否能赶上后续安排时都很有用。']
    ]
  },
  'fuel-cost.html': {
    name: '自驾油费计算器',
    summary: '在自驾游或跨城租车前，先把距离、油耗和油价换成清晰成本，避免低估长途路线的真实开销。',
    pain: '自驾预算失控常见于只看租车日价，不把油费、停车、过路费和堵车导致的油耗波动一起算进去。',
    audience: ['计划自驾游的人', '比较不同车型是否划算的人', '和同伴分摊路费的人'],
    steps: ['先选接近实际车辆的油耗预设，再手动微调。', '输入总行驶距离和当前油价，得到整体成本与单公里成本。', '如果路线复杂，再把停车费和过路费额外并入总预算。'],
    mistakes: ['只按理想工况油耗预算。', '往返只算单程。', '忽略山区、拥堵和空调带来的额外消耗。'],
    faqs: [
      ['为什么建议再留 10% 左右缓冲？', '因为真实油耗会受路况、载重、气温和驾驶习惯影响，实际值通常不会和理想油耗完全一致。'],
      ['自驾预算还应搭配什么一起看？', '最好同时结合过路费、停车费、租车保险和异地还车费用。'],
      ['共享给同行有什么意义？', '能提前统一成本预期，减少路上再临时讨论谁出多少。']
    ]
  },
  'hotel-cost.html': {
    name: '酒店住宿费用计算器',
    summary: '在比房价时把晚数、房间数、税费和平均每晚成本统一算清楚，避免看到“裸价便宜”就误判总预算。',
    pain: '订酒店最容易漏掉城市税、服务费、额外房间和多晚累加后的真实总价，最后看似省下的房费会被附加项目补回来。',
    audience: ['比较多家酒店方案的人', '家庭或多人出行订多间房的人', '做公司差旅预算的人'],
    steps: ['先输入晚数、每晚价格和房间数量。', '把税费、服务费或城市税按比例纳入计算。', '再看总费用与平均每晚成本，而不是只盯首晚价格。'],
    mistakes: ['只看预订平台列表价。', '忽略税费与服务费。', '多人同行没区分每间房和每人均摊。'],
    faqs: [
      ['为什么同一酒店平台展示价和结算价不同？', '因为很多平台默认展示未含税或未含服务费价格，真正付款时才叠加完整费用。'],
      ['这个页面适合比较什么？', '适合比较不同房型、不同晚数、不同房间数量下的真实总价。'],
      ['平均每间每晚有什么参考价值？', '它能帮助你判断不同订房方案之间是否真的更划算，而不是只看房间总数。']
    ]
  },
  'itinerary-planner.html': {
    name: '旅行行程规划器',
    summary: '把多天活动、时间轴、地点和备注写成真正可执行的行程单，适合在出发前统一节奏，也适合旅行中随时边走边改。',
    pain: '很多行程不是没做，而是只停留在脑海或聊天记录里，真正到了现场就会因为顺序、通勤和体力安排不清晰而频繁返工。',
    audience: ['自由行路线设计者', '多人同行的组织者', '既要做日程又要做打印/分享的人'],
    steps: ['先按天建立骨架，把必须完成的交通与预约放进去。', '再补充景点、餐饮、移动和休息节点，不要一次塞太满。', '出发前打印或导出一版，旅途中按真实情况继续调整。'],
    mistakes: ['每天排得过满。', '没留通勤和排队时间。', '有想法但没形成可共享的版本。'],
    faqs: [
      ['为什么建议先排硬约束？', '因为航班、火车、预约入场和酒店入住退房决定了整天节奏，先锁这些再排兴趣点更稳。'],
      ['手机上改行程会不会太乱？', '只要先有清晰骨架，手机更适合现场微调；电脑则更适合首次重排和打印。'],
      ['这个页面更像清单还是日历？', '它更偏“可执行的旅行时间轴”，重点是把时间、地点和动作放到同一处。']
    ]
  },
  'jet-lag-calc.html': {
    name: '时差计算器与调整建议',
    summary: '提前估算两地时差并获得作息调整建议，适合长途国际飞行前做睡眠与落地状态管理。',
    pain: '时差最难受的地方不是数字本身，而是身体在错误时间想睡、想醒、想吃饭，直接影响到第一天的会议、转机和游玩体验。',
    audience: ['跨洲长途飞行的人', '落地后有工作或活动安排的人', '带老人孩子出行的人'],
    steps: ['先确认出发地与目的地时区差。', '根据差值查看建议调整天数和方向。', '出发前几天逐步移动睡眠、光照和用餐节奏。'],
    mistakes: ['只到落地后才开始想适应。', '忽略向东飞和向西飞的差异。', '飞机上和落地后作息完全随意。'],
    faqs: [
      ['为什么大时差建议提前几天调整？', '因为生物钟需要逐步移动，临时一次性改变往往最难坚持也最难成功。'],
      ['到达后最重要的动作是什么？', '尽快接触自然光、按照当地时间吃饭睡觉，并控制咖啡因和酒精。'],
      ['时差完全适应通常要多久？', '每个人不同，但时差越大、睡眠越敏感，恢复所需时间通常越长。']
    ]
  },
  'luggage-calculator.html': {
    name: '行李限额重量计算器',
    summary: '把物品逐件加入清单并实时计算总重，帮助你在收拾行李时提前发现超重风险，而不是到机场才开始拆箱。',
    pain: '很多超重不是因为旅客带太多，而是打包时没有逐件量化，最后把“差不多”当成“应该没问题”。',
    audience: ['准备托运行李的人', '带很多电子设备或冬季衣物的人', '多个家庭成员共用行李限额的人'],
    steps: ['先选接近实际航司的限额或自定义目标重量。', '每装一类物品就同步录入，形成实时总重。', '临近封箱前再看剩余额度，决定哪些物品改随身带或删减。'],
    mistakes: ['打包结束后才称重。', '混淆随身和托运。', '忽略箱体自重和礼物增量。'],
    faqs: [
      ['为什么要按物品录入，而不是最后称一次？', '因为逐项录入更容易找到可以删减的对象，也能帮助你下次打包更快复用经验。'],
      ['自定义限额适合什么场景？', '适合廉航、特殊票种、团队内部自设目标重量，或者想主动留出安全余量时使用。'],
      ['还需要搭配什么一起看？', '最好同时参考航司尺寸限制和危险品规则，重量只是其中一个维度。']
    ]
  },
  'packing-list.html': {
    name: '旅行行李清单生成器',
    summary: '根据出行类型、天数和气候生成更像“真的能照着带”的打包清单，再按自己的习惯补充自定义物品。',
    pain: '出发前最浪费精力的往往不是大件，而是那些零散又关键的小东西——证件、充电器、药品、转换插头、防晒和备用衣物。',
    audience: ['第一次自己做打包计划的人', '不同旅行类型切换频繁的人', '想在手机上实时勾选进度的人'],
    steps: ['先选旅行类型、天数和目的地气候。', '生成基础清单后，把你的习惯物品补进去。', '收拾时边打包边勾选，最后导出或复制给同行。'],
    mistakes: ['靠记忆临时收。', '没有区分场景和气候。', '关键证件和电子配件没单独确认。'],
    faqs: [
      ['为什么生成后还建议手动补充？', '因为清单模板能覆盖大多数常见物品，但每个人的药品、设备和个人习惯差异很大。'],
      ['这个清单更适合手机还是电脑？', '手机适合现场勾选，电脑更适合首次整理和导出。'],
      ['出行前多久开始用比较好？', '最好提前 2 到 3 天生成一版，给采购、洗衣和补货留出时间。']
    ]
  },
  'passport-photo.html': {
    name: '各国护照签证照片要求查询',
    summary: '在拍证件照前先把尺寸、背景、头部比例和常见限制查清楚，减少因为照片不合规而返工或耽误申请。',
    pain: '照片出错最常见的问题不是完全不知道要求，而是把不同国家、不同证件、不同时间要求混在一起，导致尺寸对了但细节不合规。',
    audience: ['准备签证申请的人', '要拍护照、居留卡或其他证件照的人', '帮家人整理材料的人'],
    steps: ['先搜索目标国家或地区，确认用途是否对应。', '重点核对尺寸、背景、头部占比和拍摄时效。', '拍照或修图前把特殊限制逐项核一遍，避免反复返工。'],
    mistakes: ['只看尺寸，不看背景和表情。', '使用过期照片。', '不同证件共用同一张图。'],
    faqs: [
      ['为什么同是签证照片要求也可能不同？', '因为不同国家、不同签证类型和线上/线下提交流程会有细微差异。'],
      ['这页能直接裁剪照片吗？', '不能，它更适合帮助你先确认规则，再决定怎么拍和怎么处理图片。'],
      ['最容易漏掉的细节是什么？', '拍摄时间限制、头部比例、背景灰度和是否允许眼镜，这些最容易被忽略。']
    ]
  },
  'phrase-book.html': {
    name: '旅行常用语速查手册',
    summary: '把问候、问路、点餐、购物和求助短语集中放在一个页面里，适合在机场、酒店、餐厅和街头临时快速翻查。',
    pain: '真正卡住人的通常不是复杂语法，而是在最关键的现场说不出一句够用的话：比如“厕所在哪”“我要这个”“我需要帮助”。',
    audience: ['去非中文环境旅行的人', '希望给家人准备离线表达卡的人', '需要在现场快速沟通的人'],
    steps: ['先切到目标语言。', '按场景选择分类，不要在整页里盲找。', '遇到关键短语时直接复制或给对方看屏幕。'],
    mistakes: ['只背单词不记场景。', '没有准备求助类表达。', '到现场才开始搜索。'],
    faqs: [
      ['为什么要按场景而不是按词汇学？', '因为旅行里更需要“能立即使用”的表达，而不是系统学语言。'],
      ['发音标注有什么作用？', '它能帮你在临时开口时更接近当地人能理解的节奏。'],
      ['没网时还适合用吗？', '适合，尤其是你提前打开页面或做成收藏时，现场翻查很快。']
    ]
  },
  'power-adapter.html': {
    name: '各国电源插座与电压指南',
    summary: '出发前先判断目的地插座类型、电压和频率是否兼容，避免到了酒店才发现设备插不上、充不进或者存在烧坏风险。',
    pain: '很多旅行中的电子设备问题并不是设备坏了，而是插头不兼容、电压不适配，或者大家误把“能插进去”当成“可以安全使用”。',
    audience: ['带笔记本、相机或电动剃须刀出国的人', '多人同行要统一准备转换头的人', '要给父母做行前设备检查的人'],
    steps: ['先选目的地国家，确认插头制式。', '再看电压和频率是否与中国常用设备兼容。', '对不确定的设备再查看电源适配器铭牌，决定是否需要转换头或变压器。'],
    mistakes: ['只看插头形状，不看电压。', '误把转换插头当变压器。', '充电器规格不看就直接插。'],
    faqs: [
      ['为什么“能插上”不代表一定安全？', '因为插头只解决接口问题，电压和频率不兼容仍可能让设备异常甚至损坏。'],
      ['手机和笔记本通常要变压器吗？', '大多数现代充电器支持宽电压，但仍应查看适配器铭牌确认。'],
      ['这页最适合什么时候看？', '最晚应在收拾电子设备前确认，方便提前买对转换头。']
    ]
  },
  'season-guide.html': {
    name: '各目的地最佳旅行季节指南',
    summary: '用更直观的方式看不同目的地在一年中什么时候最适合去，帮助你把请假时间、机酒价格和旅行体验一起权衡。',
    pain: '很多人以为只要“有空”就能去，但旺季、雨季、严寒、酷热和节庆拥挤都会显著改变旅行成本与体验。',
    audience: ['在多个目的地之间犹豫的人', '准备提前几个月订机酒的人', '想避开人挤人和高价窗口的人'],
    steps: ['先搜索目标目的地，看全年月份分布。', '再结合你的预算、假期和偏好，在“最佳”和“推荐”之间做选择。', '最后把天气、节庆和当地价格波动一起纳入决定。'],
    mistakes: ['只看天气不看价格。', '只看攻略不看旺淡季差异。', '忽略南北半球季节相反。'],
    faqs: [
      ['最佳季节一定最值得去吗？', '不一定，最佳季节往往也伴随高价和人流，适合你才是关键。'],
      ['一般/不推荐月份完全不能去吗？', '不是，只是意味着更需要接受天气、成本或体验上的折衷。'],
      ['这页和天气规划有什么区别？', '这页更偏全年时机判断，天气规划更适合落到具体月份去准备。']
    ]
  },
  'sim-card-guide.html': {
    name: '海外旅行 SIM 卡与流量套餐指南',
    summary: '在出发前把实体 SIM、eSIM、Wi‑Fi 蛋和国际漫游方案放到一起比较，避免落地后第一件事就是为了上网四处找卡。',
    pain: '海外联网问题通常不是选不到套餐，而是不清楚自己手机是否解锁、是否支持 eSIM、是否需要热点共享，以及不同购买渠道的差价。',
    audience: ['第一次出国需要解决上网的人', '家庭出行要统一联网方案的人', '需要兼顾主号收验证码的人'],
    steps: ['先确认手机是否解锁、是否支持 eSIM 和当地频段。', '再按你的使用强度比较实体卡、eSIM、Wi‑Fi 蛋和漫游。', '最后确定主方案和备用方案，避免单点故障。'],
    mistakes: ['只看流量不看天数。', '忘记主号收短信需求。', '没确认手机锁网和 eSIM 支持。'],
    faqs: [
      ['eSIM 一定比实体卡更好吗？', '不一定，它更方便，但前提是设备支持、操作熟悉且目的地套餐合适。'],
      ['机场买卡是不是最省事？', '最省事但未必最划算，很多国家机场套餐明显偏贵。'],
      ['为什么还建议开通漫游备用？', '因为主卡激活失败、设备故障或临时没网时，备用链路能救急。']
    ]
  },
  'size-converter.html': {
    name: '国际服装鞋码尺码转换器',
    summary: '在海外购物、海淘或出国前收拾服装装备时，先把中、美、英、欧等尺码口径换清楚，减少“看起来差不多”带来的买错概率。',
    pain: '尺码问题最麻烦的不是完全不会换，而是不同国家和品牌的口径接近却不一致，稍微想当然就容易下错单。',
    audience: ['出国购物前做尺码准备的人', '帮家人朋友代购的人', '对鞋码服装码经常拿不准的人'],
    steps: ['先选择服装或鞋类类别。', '确定你最熟悉的来源地区尺码，再输入目标值。', '转换后别急着下单，最好再结合品牌尺码表与版型说明。'],
    mistakes: ['把男女码、童码混在一起。', '不同品牌直接套用同一尺码。', '只看数字，不看版型和脚型。'],
    faqs: [
      ['为什么转换后还不能保证一定合身？', '因为尺码表只解决地区口径差异，品牌版型、鞋楦和材料弹性仍会影响上身效果。'],
      ['这页最适合在什么场景用？', '最适合做购买前快速核对与现场比对，尤其是在国外商场或代购沟通时。'],
      ['完整对照表有什么价值？', '它可以帮助你看到一整段尺码分布，而不是只盯住一个单点结果。']
    ]
  },
  'time-difference.html': {
    name: '两地时差查询工具',
    summary: '快速确认两个城市或时区相差几个小时，适合安排跨国通话、酒店沟通、会议邀请和落地时间判断。',
    pain: '国际出行里很多沟通错误并不是语言问题，而是把对方的“今天晚上”理解成了自己的“今天晚上”，最后约错时间。',
    audience: ['要和海外酒店或司机沟通的人', '跨国远程会议参与者', '帮家人算当地时间的人'],
    steps: ['先选择双方城市或时区。', '看时间差和快慢方向，不只记一个数字。', '如果涉及第二天或夏令时，发送前再复核一次。'],
    mistakes: ['忽略日期跨越。', '忘记夏令时。', '只写北京时间，不写对方当地时间。'],
    faqs: [
      ['为什么建议同时写两个时间？', '因为这样可以降低理解歧义，尤其在跨日或跨周安排里更安全。'],
      ['这页和时区转换器有什么区别？', '这页更偏直接看两地差值，时区转换器更适合处理某个具体时刻的对应关系。'],
      ['为什么沟通前还要再看一次？', '因为航班调整、夏令时切换和临时改约都可能让原先的时间判断失效。']
    ]
  },
  'timezone-converter.html': {
    name: '全球时区转换器',
    summary: '把某个具体时间转换到另一个时区，适合安排跨国会议、航班接送、线上活动和远程协作。',
    pain: '“相差几小时”和“某个具体时间点对应到另一地是几点”是两回事，真正容易出错的是后者。',
    audience: ['跨国会议安排者', '远程团队协作者', '需要处理航班接送或酒店沟通的人'],
    steps: ['先确定源时区与具体日期时间。', '再选择目标时区，看对应结果。', '涉及多人协作时，把转换后的结果直接抄到通知里。'],
    mistakes: ['混淆本地输入时间和源时区时间。', '忽略夏令时。', '只给对方一个 UTC 偏移，不给城市名。'],
    faqs: [
      ['为什么建议写城市名而不是只写 UTC？', '因为城市名更容易理解，也能降低夏令时与偏移变化带来的误会。'],
      ['处理会议最稳的做法是什么？', '先在本页确认双方时刻，再把最终时间写成双方本地时间各一份。'],
      ['这页适合手机用吗？', '适合快速确认，但如果你要处理很多参与方，电脑上更方便连续核对。']
    ]
  },
  'tip-guide.html': {
    name: '各国小费指南与小费计算器',
    summary: '先理解当地小费文化，再用计算器快速得出账单对应的小费金额，减少不礼貌或多付少付的尴尬。',
    pain: '小费最难的不是不会算，而是不知道哪些场景必须给、哪些只是礼貌性表达、哪些账单其实已经含了服务费。',
    audience: ['第一次去小费文化强国家的人', '经常出差需要快速判断的人', '希望给同行家人做提醒的人'],
    steps: ['先选国家，看当地“必须给 / 通常给 / 一般不给”的文化背景。', '再输入账单金额和比例，快速得到参考值。', '若账单已含服务费，付款前先核一眼，避免重复给。'],
    mistakes: ['照搬别国比例。', '忽略账单已含服务费。', '把所有场景都按餐厅标准处理。'],
    faqs: [
      ['为什么同样是西方国家，比例也不同？', '因为不同国家服务业收入结构和默认习惯不同，不能用一套标准硬套。'],
      ['小费要按税前还是税后算？', '当地实践会有差别，本页更适合先给你一个稳妥范围，结账前再结合账单结构判断。'],
      ['旅行中什么时候最常用到这页？', '餐厅结账、出租车付款、酒店服务和短期出差报销预估时都很实用。']
    ]
  },
  'toll-calculator.html': {
    name: '高速公路过路费计算器',
    summary: '在自驾或包车前先把大致过路费估出来，搭配油费一起看，更容易判断路线成本和是否值得绕行。',
    pain: '很多人做自驾预算时只算油费，却低估了高速、桥隧和车型费率叠加后的实际出行成本。',
    audience: ['国内自驾游规划者', '比较高速与国道成本的人', '需要和同行提前说明路费的人'],
    steps: ['先输入大致行驶距离。', '再按车型选择对应费率。', '把结果与油费、停车费一起看，再决定路线和分摊方案。'],
    mistakes: ['只看单趟，不算往返。', '车型选错。', '忽略节假日免费和 ETC 折扣差异。'],
    faqs: [
      ['为什么结果只能做估算？', '因为不同路段、桥隧、省份和实际计费规则可能不同，本页更适合做预算前置判断。'],
      ['和油费计算器一起用有什么好处？', '两者结合后，你能更接近真实门到门交通成本，而不是只看到其中一项。'],
      ['长途路线怎么用最稳？', '先用总里程估一版，再对关键桥隧或特殊路段单独留余量。']
    ]
  },
  'travel-budget.html': {
    name: '旅行预算计划工具',
    summary: '把天数、人数和各项费用统一拆开看，帮助你在出发前先知道预算上限、人均成本和每天大概能花多少。',
    pain: '旅行预算最容易失控的原因，不是某一项特别贵，而是小项太多、总额不透明，导致边订边加、最后完全超出预期。',
    audience: ['订机酒前做预算的人', '需要给家庭或团队报预算的人', '还在权衡不同旅行方式的人'],
    steps: ['先输入行程天数、人数和货币。', '再把主要消费项逐项填入，不要只估一个总数。', '看总预算、人均和日均结果，决定是否要删减项目或提高上限。'],
    mistakes: ['把预算写成一个整额。', '没把交通、住宿、餐饮拆开。', '不给意外支出留余量。'],
    faqs: [
      ['为什么拆项预算比直接写总额更有用？', '因为你能看出真正的压力点在哪，也更容易知道该删哪一类支出。'],
      ['预算建议模块怎么理解？', '它更像出发前提醒，帮助你识别目前花费结构是否失衡。'],
      ['多人出行时先做总额还是人均？', '建议先做总额，再用人均反推每个人的承受范围。']
    ]
  },
  'travel-checklist.html': {
    name: '出行准备清单',
    summary: '把证件、电子设备、衣物、药品和其他准备事项做成一份可持续勾选的待办清单，适合出发前最后一轮查漏补缺。',
    pain: '真正影响出行体验的，往往不是忘带大箱子，而是遗漏签证、转换头、充电宝、药品或回程资料这种小而关键的项目。',
    audience: ['临近出发想做最终核对的人', '家庭出行需要统一准备任务的人', '反复出行想保留一套模板的人'],
    steps: ['先用默认分类建立基础框架。', '再把你个人必带项和本次特殊任务补进去。', '临出发前一边收拾一边勾选，避免口头确认。'],
    mistakes: ['只看脑子里的印象。', '多人协作但没有统一清单。', '重要证件和设备没单独确认。'],
    faqs: [
      ['为什么待办清单和打包清单要分开看？', '待办更偏准备动作，打包清单更偏物品本身，分开看更不容易漏。'],
      ['这个页面适合保留长期模板吗？', '适合，尤其对高频旅行者来说，一套可复用模板能明显减少每次重新整理的成本。'],
      ['什么时候做最后复核最好？', '通常建议出发前一晚和出门前各看一遍。']
    ]
  },
  'travel-insurance.html': {
    name: '旅行保险清单与保障指南',
    summary: '先按目的地、天数、总费用和人数估算保障重点，再把关键险种和注意事项理成一份真正能执行的购买清单。',
    pain: '很多人不是不想买保险，而是不知道该看医疗、救援、取消、行李还是极限运动条款，最后要么买过头，要么买错重点。',
    audience: ['准备购买旅行保险的人', '去高成本医疗地区的人', '家庭或多人团队出行者'],
    steps: ['先输入行程信息，判断本次风险结构。', '再勾选真正需要的保障项目，不要只看价格。', '下单前一定阅读免责条款和理赔资料要求。'],
    mistakes: ['只比保费不看保障内容。', '忽略紧急救援和既往病症限制。', '高风险活动不单独确认。'],
    faqs: [
      ['为什么医疗和救援常常比行李更重要？', '因为大额风险通常来自医疗与转运，一旦发生，金额远高于普通行李损失。'],
      ['便宜保险一定不行吗？', '不一定，但需要看是否真的覆盖你的行程类型和关键场景。'],
      ['这页最适合在什么时候用？', '确定行程框架后就可以先用一版，正式下单前再核对最终信息。']
    ]
  },
  'trip-budget.html': {
    name: '旅行消费预算管理',
    summary: '把旅行中的预算上限、已花费用和分类支出实时记下来，适合在旅途中持续控制现金流，不让“每天一点点”最后变成大超支。',
    pain: '旅途中最容易失控的是记录节奏：今天懒得记、明天想不起来，几天之后预算就只剩模糊印象。',
    audience: ['旅途中想实时记账的人', '要控制总预算的人', '结束后想复盘消费结构的人'],
    steps: ['先输入总预算，建立本次花费边界。', '每有一笔消费就立刻分类录入，不要攒到晚上。', '持续看已花费、剩余和使用率，及时调整后续计划。'],
    mistakes: ['只记大额支出。', '不分类，导致后面无法复盘。', '预算超了才开始控制。'],
    faqs: [
      ['旅行中为什么要实时记，而不是回国再整理？', '因为很多小额支出最容易忘，实时记录才能真正帮助你控制预算。'],
      ['分享按钮适合什么场景？', '适合把当前预算进度发给同行、家人或自己另一台设备，保持同步认知。'],
      ['这页和出发前预算工具有什么区别？', '前者更偏规划，后者更偏执行和追踪。']
    ]
  },
  'trip-cost-splitter.html': {
    name: '多人旅行费用分摊计算器',
    summary: '把谁付了什么、总额多少、最后谁该给谁一目了然地算清楚，减少多人旅行最常见的对账尴尬。',
    pain: '多人同行最容易累积摩擦的，不是花了多少钱，而是谁先垫了、谁漏记了、最后怎么算最省转账次数。',
    audience: ['朋友结伴旅行的人', '家庭共担大额支出的人', '需要把结算结果发群里的人'],
    steps: ['先把所有参与者加进去。', '每发生一笔费用就记录金额和付款人。', '最后看结算方案，按最少转账路径完成清账。'],
    mistakes: ['结束后才一起回忆。', '费用描述太模糊。', '参与人名单不完整。'],
    faqs: [
      ['为什么要实时记垫付？', '因为多人支出一旦延后回忆，很容易出现漏项、重复项和角色混淆。'],
      ['复制结算适合怎么用？', '适合直接发到群聊，让每个人看到统一结果，减少口头解释。'],
      ['这个结果一定是最优的吗？', '它的目标是给出尽量清晰且转账次数更少的结算方案，已经很适合实际旅行场景。']
    ]
  },
  'vaccine-checker.html': {
    name: '旅行目的地疫苗要求查询',
    summary: '在出发前把必需、推荐和常规加强疫苗分开看，帮助你判断是否需要提前预约门诊、做接种计划或准备预防药物。',
    pain: '健康准备最常见的问题不是完全没听过，而是不知道哪些是入境要求、哪些是医学建议、哪些又需要提前几周才来得及生效。',
    audience: ['去热带或偏远地区旅行的人', '带孩子和长辈出行的人', '要做长期停留或多国路线的人'],
    steps: ['先选目的地区域和国家。', '区分必需、推荐和常规接种，别混成一类。', '若时间紧张，优先处理必须项和高风险项。'],
    mistakes: ['临近出发才看。', '把疫苗和预防药物混为一谈。', '忽略黄热病等证明的时间要求。'],
    faqs: [
      ['为什么有些项目不是疫苗而是预防药物？', '因为像疟疾这类情况没有通用疫苗，医学上更多依赖防蚊和预防性用药。'],
      ['本页结果能直接替代医生建议吗？', '不能，它适合帮助你形成准备框架，最终仍应结合专业旅行医学咨询。'],
      ['最晚什么时候开始处理比较稳？', '如果去高风险地区，最好提前数周甚至更早开始规划。']
    ]
  },
  'visa-checker.html': {
    name: '中国护照签证要求查询',
    summary: '出发前先判断目的地对中国护照是免签、落地签、电子签还是需提前申请，减少在订票后才发现证件条件不满足的风险。',
    pain: '签证出错最常见的不是完全没查，而是把旧政策、他人护照情况或模糊印象当成自己的实际要求。',
    audience: ['中国护照持有人', '帮家人规划出境路线的人', '需要在多个目的地间快速比较的人'],
    steps: ['先选护照签发地区和目的地。', '查看停留时长、费用、备注和注意事项。', '凡涉及出票、转机和健康文件的决定，都要再去官方渠道交叉确认。'],
    mistakes: ['只看是否免签，不看停留天数。', '忽略返程票、酒店单和资金证明。', '把电子签和免签混为一谈。'],
    faqs: [
      ['为什么已经“免签”还可能被问材料？', '因为免签只代表无需提前办签证，不代表入境时不需要证明行程合理和条件充分。'],
      ['这页适合订票前还是订票后看？', '两次都适合，订票前判断可行性，订票后做最终复核。'],
      ['热门目的地统计有什么用？', '它能帮助你快速建立范围判断，尤其适合先筛目的地再做细查。']
    ]
  },
  'visa-requirements.html': {
    name: '各国签证要求入境政策查询',
    summary: '用更轻量的方式查看不同国籍与目的地组合的大致签证要求，适合在做路线筛选和初步判断时快速排除明显不合适的方案。',
    pain: '行程初筛时最怕的不是复杂，而是信息散：一边看目的地，一边还要反复确认国籍对应政策，效率很低。',
    audience: ['先做目的地筛选的人', '需要快速比较多国入境政策的人', '帮同行做行前说明的人'],
    steps: ['先选护照国籍，再选目的地。', '看停留时长、入境要求和护照有效期。', '若结果会影响订票或请假，再去官方使领馆与航司页面复核。'],
    mistakes: ['只看热门目的地卡片。', '忽略护照有效期。', '以为“落地签”就等于毫无准备。'],
    faqs: [
      ['这页和中国护照签证查询有什么区别？', '这页更适合多国籍与多目的地的快速初筛，另一页则更聚焦中国护照的详细使用场景。'],
      ['为什么还要看护照有效期？', '因为很多目的地即使允许入境，也要求入境时护照至少还有若干月有效期。'],
      ['初筛后下一步该做什么？', '去看官方使领馆、签证中心或航司说明，把材料与时间线锁定。']
    ]
  },
  'weather-planner.html': {
    name: '旅行目的地天气规划工具',
    summary: '按目的地和月份提前查看平均温度、降雨与推荐建议，让你在出发前更清楚该带什么、什么时候去更舒服。',
    pain: '天气准备最容易出问题的，不是查不到预报，而是只看出发前几天短期天气，却没把月度气候、雨季和体感差异纳入判断。',
    audience: ['还在决定月份的人', '已经定好时间，需要准备衣物的人', '想避开极端天气的人'],
    steps: ['先选目的地和月份，建立当月整体气候预期。', '看温度、降雨和推荐说明，不要只看最高气温。', '再根据推荐清单准备衣物和现场备用方案。'],
    mistakes: ['只看白天温度。', '忽略雨季和湿度。', '把全年攻略当成具体月份建议。'],
    faqs: [
      ['为什么平均温度和体感差很多？', '因为湿度、风力、日照和昼夜温差都会影响真实体感，平均值只是第一层参考。'],
      ['这页适合替代临近出发的天气预报吗？', '不适合，它更适合做中长期规划，临行前仍应结合实时天气预报。'],
      ['推荐月份一定最省钱吗？', '通常不是，体验好的月份往往也更热门，因此还要同时看预算。']
    ]
  },
  'world-clock.html': {
    name: '世界时钟',
    summary: '把多个城市当前时间同时放在一个页面里，适合跨国沟通、远程协作、海外出行和亲友联系时快速判断现在该不该打扰对方。',
    pain: '多城市沟通最烦的不是不会换时差，而是总得在脑子里来回换算“那边现在几点”，每次都很耗神也容易出错。',
    audience: ['经常和海外同事沟通的人', '有跨国出行与转机需求的人', '要同时关注几个目的地时间的人'],
    steps: ['先添加你常看的城市或时区。', '把关键目的地固定在列表里，减少每次重复搜索。', '沟通前先看对方当前时间，决定是否适合联系。'],
    mistakes: ['临时才找城市。', '没有保存常用列表。', '忽略夏令时变化。'],
    faqs: [
      ['世界时钟和时区转换器谁更适合日常？', '世界时钟更适合持续观察多个城市的当前时间，时区转换器更适合处理具体时刻。'],
      ['为什么建议保留本地和 UTC？', '本地有助于快速比较，UTC 则适合和国际团队统一基准。'],
      ['这个页面对旅行有什么帮助？', '它特别适合安排接送机、联系酒店、确认家人作息和判断转机城市当前时间。']
    ]
  }
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getTitle(html) {
  const match = html.match(/<title>([\s\S]*?)<\/title>/i);
  return match ? match[1].trim() : '旅行工具 - WebUtils';
}

function getDescription(html) {
  const match = html.match(/<meta\s+name=["']description["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i);
  return match ? match[1].trim() : '';
}

function upsertMeta(html, attrs, type, key, value) {
  const regex = new RegExp(`<meta[^>]*${type}=["']${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`, 'i');
  const tag = `<meta ${Object.entries(attrs).map(([k, v]) => `${k}="${escapeHtml(v)}"`).join(' ')} />`;
  if (regex.test(html)) {
    return html.replace(regex, tag);
  }
  return html.replace(/<\/title>/i, `</title>\n    ${tag}`);
}

function upsertLink(html, rel, href) {
  const regex = new RegExp(`<link[^>]*rel=["']${rel}["'][^>]*>`, 'i');
  const tag = `<link rel="${rel}" href="${escapeHtml(href)}" />`;
  if (regex.test(html)) {
    return html.replace(regex, tag);
  }
  return html.replace(/<\/title>/i, `</title>\n    ${tag}`);
}

function upsertOrInsertHead(html, tag) {
  if (html.includes(tag)) {
    return html;
  }
  return html.replace(/<\/title>/i, `</title>\n    ${tag}`);
}

function buildHead(html, fileName, meta) {
  const title = getTitle(html);
  const description = getDescription(html) || meta.summary;
  const slug = fileName.replace(/\.html$/i, '');
  const canonical = `${siteOrigin}/tools/travel/${slug}`;
  const faqEntities = meta.faqs.map(([question, answer]) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: answer
    }
  }));
  const howToSteps = meta.steps.map((text, index) => ({
    '@type': 'HowToStep',
    position: index + 1,
    name: `步骤 ${index + 1}`,
    text
  }));
  const graph = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '首页', item: `${siteOrigin}/` },
        { '@type': 'ListItem', position: 2, name: '旅行工具', item: `${siteOrigin}/#travel` },
        { '@type': 'ListItem', position: 3, name: meta.name, item: `${canonical}.html` }
      ]
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: title,
      description,
      url: canonical,
      applicationCategory: 'TravelApplication',
      operatingSystem: 'Web',
      inLanguage: 'zh-CN',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
      isAccessibleForFree: true
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqEntities
    },
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: `${meta.name}使用步骤`,
      description: `${meta.name} 的标准使用顺序与出发前复核方法。`,
      totalTime: 'PT5M',
      step: howToSteps
    }
  ];
  const jsonLd = `    <!-- travel-page-jsonld-start -->\n    <script type="application/ld+json">\n${JSON.stringify(graph, null, 2).split('\n').map((line) => `      ${line}`).join('\n')}\n    </script>\n    <!-- travel-page-jsonld-end -->`;

  html = html.replace(/\s*<!-- travel-page-jsonld-start -->[\s\S]*?<!-- travel-page-jsonld-end -->\s*/i, '\n');
  html = html.replace(/\s*<!--[^>]*JSON-LD[^>]*-->\s*/gi, '\n');
  html = html.replace(/\s*<script\s+type=["']application\/ld\+json["'][\s\S]*?<\/script>\s*/gi, '\n');
  html = upsertLink(html, 'canonical', canonical);

  html = upsertMeta(html, { name: 'description', content: description }, 'name', 'description');
  html = upsertMeta(html, { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' }, 'name', 'robots');
  html = upsertMeta(html, { name: 'referrer', content: 'strict-origin-when-cross-origin' }, 'name', 'referrer');
  html = upsertMeta(html, { name: 'color-scheme', content: 'dark light' }, 'name', 'color-scheme');
  html = upsertMeta(html, { name: 'theme-color', content: '#0a0a0f' }, 'name', 'theme-color');
  html = upsertMeta(html, { name: 'format-detection', content: 'telephone=no,email=no,address=no' }, 'name', 'format-detection');
  html = upsertMeta(html, { name: 'application-name', content: 'WebUtils' }, 'name', 'application-name');
  html = upsertMeta(html, { name: 'apple-mobile-web-app-capable', content: 'yes' }, 'name', 'apple-mobile-web-app-capable');
  html = upsertMeta(html, { name: 'apple-mobile-web-app-title', content: meta.name }, 'name', 'apple-mobile-web-app-title');
  html = upsertMeta(html, { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }, 'name', 'apple-mobile-web-app-status-bar-style');
  html = upsertMeta(html, { name: 'mobile-web-app-capable', content: 'yes' }, 'name', 'mobile-web-app-capable');
  html = upsertMeta(html, { property: 'og:title', content: title }, 'property', 'og:title');
  html = upsertMeta(html, { property: 'og:description', content: description }, 'property', 'og:description');
  html = upsertMeta(html, { property: 'og:type', content: 'website' }, 'property', 'og:type');
  html = upsertMeta(html, { property: 'og:url', content: canonical }, 'property', 'og:url');
  html = upsertMeta(html, { property: 'og:site_name', content: 'WebUtils' }, 'property', 'og:site_name');
  html = upsertMeta(html, { property: 'og:locale', content: 'zh_CN' }, 'property', 'og:locale');
  html = upsertMeta(html, { property: 'og:image', content: previewImage }, 'property', 'og:image');
  html = upsertMeta(html, { property: 'og:image:width', content: '1280' }, 'property', 'og:image:width');
  html = upsertMeta(html, { property: 'og:image:height', content: '640' }, 'property', 'og:image:height');
  html = upsertMeta(html, { property: 'og:image:type', content: 'image/png' }, 'property', 'og:image:type');
  html = upsertMeta(html, { property: 'og:image:alt', content: `${meta.name} 页面预览图` }, 'property', 'og:image:alt');
  html = upsertMeta(html, { name: 'twitter:card', content: 'summary_large_image' }, 'name', 'twitter:card');
  html = upsertMeta(html, { name: 'twitter:title', content: title }, 'name', 'twitter:title');
  html = upsertMeta(html, { name: 'twitter:description', content: description }, 'name', 'twitter:description');
  html = upsertMeta(html, { name: 'twitter:image', content: previewImage }, 'name', 'twitter:image');
  html = upsertMeta(html, { name: 'twitter:image:alt', content: `${meta.name} 页面预览图` }, 'name', 'twitter:image:alt');
  html = upsertMeta(html, { name: 'twitter:url', content: canonical }, 'name', 'twitter:url');
  html = upsertOrInsertHead(html, '<meta http-equiv="X-UA-Compatible" content="IE=edge" />');
  html = html.replace(/(<style[\s\S]*?>)/i, `${jsonLd}\n\n$1`);
  return html;
}

function buildTopBlock(meta) {
  return `
        <section class="travel-enhanced-block travel-hero" data-travel-enhance-root="hero" aria-label="${escapeHtml(meta.name)} 页面导读">
          <div class="travel-hero__eyebrow">逐页深度改版 · 静态内容已内置</div>
          <h2 class="travel-hero__title">${escapeHtml(meta.name)}：先把关键信息理清，再做旅行决定</h2>
          <p class="travel-hero__lead">${escapeHtml(meta.summary)} ${escapeHtml(meta.pain)}</p>
          <div class="travel-hero__chips">
            <span class="travel-hero__chip">手机 / 电脑自适应</span>
            <span class="travel-hero__chip">长文说明已写入 HTML</span>
            <span class="travel-hero__chip">SEO / OG / Twitter / JSON-LD</span>
            ${meta.audience.slice(0, 3).map((item) => `<span class="travel-hero__chip">${escapeHtml(item)}</span>`).join('')}
          </div>
          <div class="travel-hero__actions">
            <a class="travel-hero__action" href="#travel-tool-start">直达工具区</a>
            <a class="travel-hero__ghost" href="#travel-page-guide">查看使用指南</a>
          </div>
          <p class="travel-hero__note">如果你准备把这个页面发给家人、同伴或客户，建议把本页当作“执行说明页”而不仅是工具页：先看上面的导读，再进入功能区，最后参考底部 FAQ 做出更稳的决定。</p>
        </section>

        <aside class="travel-enhanced-block travel-ad-slot" data-travel-enhance-root="ad-top" aria-label="Google AdSense 页面顶部预留位">
          <div class="travel-ad-slot__label">Google AdSense 预留位</div>
          <div class="travel-ad-slot__text">${escapeHtml(meta.name)} 顶部横幅广告位，适合放置响应式广告代码，不遮挡工具核心操作，兼顾首屏说明区与商业化布局。</div>
          <div class="travel-ad-slot__meta">部署时建议替换为响应式广告单元，并保留当前块级结构，方便同时适配桌面与手机。</div>
        </aside>

        <div id="travel-tool-start" class="travel-tool-start-anchor" aria-hidden="true"></div>
`;}

function buildBottomBlock(meta) {
  return `
        <section class="travel-enhanced-block travel-article" id="travel-page-guide" data-travel-enhance-root="article" aria-label="${escapeHtml(meta.name)} 深度使用指南">
          <h2 class="travel-article__title">${escapeHtml(meta.name)} 深度使用指南：把结果变成真正可执行的旅行动作</h2>
          <p class="travel-article__intro">${escapeHtml(meta.summary)} 很多旅行页面的问题不在于工具不会用，而在于用户只盯着一个结果值，却没有把这个结果和机票、证件、酒店、路线、预算、天气或现场限制放在一起判断。把这一步补上，才能真正减少临场返工。</p>
          <p class="travel-article__paragraph">${escapeHtml(meta.pain)} 因此，这一页更适合你在两个阶段使用：第一阶段是出发前做快速筛选，先把明显不合理的方案排除；第二阶段是临近执行时做最后复核，把那些最容易变化的变量再看一遍，避免“本来已经准备了，现场还是出错”。</p>
          <div class="travel-article__grid">
            <div class="travel-article__panel">
              <h3>最适合谁来使用</h3>
              <ul>
                ${meta.audience.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
              </ul>
            </div>
            <div class="travel-article__panel">
              <h3>推荐使用顺序</h3>
              <ul>
                ${meta.steps.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
              </ul>
            </div>
          </div>
          <h3 class="travel-article__section-title">很多人容易忽略的风险点</h3>
          <ol class="travel-article__mistakes">
            ${meta.mistakes.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
          </ol>
          <p class="travel-article__paragraph">如果你把这类页面只当作“查一下就关掉”的信息页，很容易错过真正有价值的地方：它其实更像一个决策缓冲层，帮助你在付款、出发、值机、入境、租车、入住或和同伴结算之前，先把关键变量重新过一遍。真正稳妥的旅行安排，往往不是更复杂，而是更少依赖记忆和临场发挥。</p>
          <p class="travel-article__paragraph">建议你把本页结果和订单确认、官方公告、票据、证件复印件、保险说明、同行计划或酒店消息放在一起使用。这样做的目的不是把事情做麻烦，而是把那些最容易在最后时刻变动的信息——例如政策、汇率、开放时间、交通、库存、天气、税费、附加要求——提前锁定下来。</p>
          <div class="travel-article__notice">专业提醒：本页已经预留 SEO 与结构化数据，并写入了更长的静态说明内容，但涉及签证、健康、收费、航司规则、当地法律、设备兼容或保险理赔的最终判断时，仍建议结合官方渠道做最后核对。</div>
          <div class="travel-faq">
            <h3 class="travel-article__section-title">常见问题</h3>
            ${meta.faqs.map(([question, answer]) => `
              <details>
                <summary>${escapeHtml(question)}</summary>
                <div class="travel-faq__answer">${escapeHtml(answer)}</div>
              </details>
            `).join('')}
          </div>
        </section>

        <aside class="travel-enhanced-block travel-ad-slot" data-travel-enhance-root="ad-bottom" aria-label="Google AdSense 页面底部预留位">
          <div class="travel-ad-slot__label">Google AdSense 预留位</div>
          <div class="travel-ad-slot__text">${escapeHtml(meta.name)} 底部信息流广告位，适合放置内容型广告或相关工具推广位，靠近长文说明和 FAQ 区，但不打断主要交互路径。</div>
          <div class="travel-ad-slot__meta">如果后续接入广告，建议保留当前语义区块结构，方便搜索引擎和用户都更清楚地区分内容区与广告区。</div>
        </aside>
`;
}

function injectBody(html, meta) {
  html = html.replace(/\s*<section class="travel-enhanced-block travel-hero"[\s\S]*?<\/section>\s*/i, '\n');
  html = html.replace(/\s*<aside class="travel-enhanced-block travel-ad-slot"[\s\S]*?data-travel-enhance-root="ad-top"[\s\S]*?<\/aside>\s*/i, '\n');
  html = html.replace(/\s*<div id="travel-tool-start" class="travel-tool-start-anchor" aria-hidden="true"><\/div>\s*/i, '\n');
  html = html.replace(/\s*<section class="travel-enhanced-block travel-article"[\s\S]*?<\/section>\s*/i, '\n');
  html = html.replace(/\s*<aside class="travel-enhanced-block travel-ad-slot"[\s\S]*?data-travel-enhance-root="ad-bottom"[\s\S]*?<\/aside>\s*/i, '\n');
  const top = buildTopBlock(meta);
  const bottom = buildBottomBlock(meta);

  if (/(<main[^>]*>\s*<div class="container">)/i.test(html)) {
    html = html.replace(/(<main[^>]*>\s*<div class="container">)/i, `$1${top}`);
  } else if (/(<main[^>]*>)/i.test(html)) {
    html = html.replace(/(<main[^>]*>)/i, `$1${top}`);
  } else if (/(<div class="container">[\s\S]*?<\/nav>)/i.test(html)) {
    html = html.replace(/(<div class="container">[\s\S]*?<\/nav>)/i, `$1${top}`);
  } else if (/<div class="container">/i.test(html)) {
    html = html.replace(/(<div class="container">)/i, `$1${top}`);
  } else if (/<body[^>]*>/i.test(html)) {
    html = html.replace(/(<body[^>]*>)/i, `$1${top}`);
  }

  if (/<footer[\s\S]*?<\/footer>/i.test(html)) {
    html = html.replace(/(<footer[\s\S]*?<\/footer>)/i, `${bottom}$1`);
  } else if (/<\/main>/i.test(html)) {
    html = html.replace(/<\/main>/i, `${bottom}</main>`);
  }

  return html;
}

for (const fileName of Object.keys(pages)) {
  const filePath = path.join(travelDir, fileName);
  let html = fs.readFileSync(filePath, 'utf8');
  html = buildHead(html, fileName, pages[fileName]);
  html = injectBody(html, pages[fileName]);
  fs.writeFileSync(filePath, html, 'utf8');
}

console.log(`Updated ${Object.keys(pages).length} travel pages.`);
