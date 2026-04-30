#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量修复 life 分类页面的 meta 信息乱码
"""

import os
import re

# 定义每个页面的 meta 信息
pages_meta = {
    'bookmark-manager': {
        'name': '书签管理器',
        'subtitle': '在线网址收藏整理工具',
        'description': '在线书签管理器，轻松整理和管理你的网址收藏。支持分类管理、快速搜索、本地存储、一键访问，让你的常用网站井井有条，随时随地快速访问。',
        'og_description': '在线书签管理器，轻松整理和管理你的网址收藏。支持分类管理、快速搜索、本地存储，让你的常用网站井井有条。',
        'keywords': '书签管理器,网址收藏,书签整理,网址管理,收藏夹,浏览器书签'
    },
    'expense-tracker': {
        'name': '记账本',
        'subtitle': '在线收支记录管理工具',
        'description': '在线记账本工具，轻松管理个人收支。支持收入支出分类、余额统计、本地存储、数据导出，帮助你清晰掌握财务状况，养成良好的记账习惯。',
        'og_description': '在线记账本工具，轻松管理个人收支。支持收入支出分类、余额统计、本地存储，帮助你清晰掌握财务状况。',
        'keywords': '记账本,收支记录,财务管理,记账工具,收入支出,个人理财'
    },
    'annual-leave': {
        'name': '年假计算器',
        'subtitle': '在线年假天数计算工具',
        'description': '在线年假计算器，快速计算你的年假天数。根据工作年限自动计算应休年假，支持不同地区政策，帮助你合理规划假期，了解自己的休假权益。',
        'og_description': '在线年假计算器，快速计算你的年假天数。根据工作年限自动计算应休年假，帮助你合理规划假期。',
        'keywords': '年假计算器,年假天数,带薪年假,休假计算,工龄计算,假期规划'
    },
    'bank-card-validator': {
        'name': '银行卡验证',
        'subtitle': '在线银行卡号校验工具',
        'description': '在线银行卡验证工具，快速校验银行卡号是否正确。支持所有主流银行，使用 Luhn 算法验证，识别银行卡类型和发卡行，保护你的资金安全。',
        'og_description': '在线银行卡验证工具，快速校验银行卡号是否正确。支持所有主流银行，使用 Luhn 算法验证。',
        'keywords': '银行卡验证,银行卡校验,卡号验证,Luhn算法,银行卡类型,发卡行识别'
    },
    'clipboard-history': {
        'name': '剪贴板历史',
        'subtitle': '在线剪贴板管理工具',
        'description': '在线剪贴板历史管理工具，记录和管理你的复制内容。支持历史记录、快速搜索、一键复制、本地存储，让你的复制粘贴更高效，不再丢失重要内容。',
        'og_description': '在线剪贴板历史管理工具，记录和管理你的复制内容。支持历史记录、快速搜索、一键复制。',
        'keywords': '剪贴板历史,剪贴板管理,复制历史,粘贴板,剪贴板工具,复制记录'
    },
    'color-picker': {
        'name': '颜色选择器',
        'subtitle': '在线取色器工具',
        'description': '在线颜色选择器，轻松选择和转换颜色。支持 HEX、RGB、HSL 等多种格式，实时预览，调色板功能，帮助设计师和开发者快速找到完美的颜色。',
        'og_description': '在线颜色选择器，轻松选择和转换颜色。支持 HEX、RGB、HSL 等多种格式，实时预览。',
        'keywords': '颜色选择器,取色器,颜色转换,HEX转RGB,调色板,配色工具'
    },
    'electricity-bill': {
        'name': '电费计算器',
        'subtitle': '在线电费计算工具',
        'description': '在线电费计算器，快速计算你的电费支出。支持阶梯电价、峰谷电价，输入用电量自动计算费用，帮助你了解用电成本，合理规划用电，节省电费开支。',
        'og_description': '在线电费计算器，快速计算你的电费支出。支持阶梯电价、峰谷电价，帮助你了解用电成本。',
        'keywords': '电费计算器,电费计算,阶梯电价,峰谷电价,用电量计算,电费查询'
    },
    'event-countdown': {
        'name': '事件倒计时',
        'subtitle': '在线倒计时工具',
        'description': '在线事件倒计时工具，记录重要日子。支持生日、纪念日、考试、假期等倒计时，实时显示剩余天数，帮助你珍惜时间，不错过任何重要时刻。',
        'og_description': '在线事件倒计时工具，记录重要日子。支持生日、纪念日、考试、假期等倒计时，实时显示剩余天数。',
        'keywords': '事件倒计时,倒计时工具,日期倒计时,生日倒计时,纪念日,重要日子'
    },
    'file-merger': {
        'name': '文件合并',
        'subtitle': '在线文件合并工具',
        'description': '在线文件合并工具，快速合并多个文件。支持文本文件、CSV、JSON 等格式，批量处理，本地操作保护隐私，帮助你高效整理和合并文件内容。',
        'og_description': '在线文件合并工具，快速合并多个文件。支持文本文件、CSV、JSON 等格式，本地操作保护隐私。',
        'keywords': '文件合并,文件合并工具,文本合并,CSV合并,批量合并,文件整理'
    }
}

def fix_page(filename, meta):
    """修复单个页面的 meta 信息"""
    filepath = f'tools/life/{filename}.html'

    if not os.path.exists(filepath):
        print(f'❌ 文件不存在: {filepath}')
        return False

    try:
        # 读取文件
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # 修复 title
        title = f"{meta['name']} - {meta['subtitle']} - WebUtils"
        content = re.sub(
            r'<title>.*?</title>',
            f'<title>{title}</title>',
            content,
            count=1
        )

        # 修复 description
        content = re.sub(
            r'<meta name="description" content=".*?" />',
            f'<meta name="description" content="{meta["description"]}" />',
            content,
            count=1
        )

        # 修复 keywords
        content = re.sub(
            r'<meta name="keywords" content=".*?" />',
            f'<meta name="keywords" content="{meta["keywords"]}" />',
            content,
            count=1
        )

        # 修复 og:title
        og_title = f"{meta['name']} - {meta['subtitle']} - WebUtils"
        content = re.sub(
            r'<meta property="og:title" content=".*?" />',
            f'<meta property="og:title" content="{og_title}" />',
            content,
            count=1
        )

        # 修复 og:description
        content = re.sub(
            r'<meta property="og:description" content=".*?" />',
            f'<meta property="og:description" content="{meta["og_description"]}" />',
            content,
            count=1
        )

        # 修复 twitter:title
        twitter_title = f"{meta['name']} - {meta['subtitle']} - WebUtils"
        content = re.sub(
            r'<meta name="twitter:title" content=".*?" />',
            f'<meta name="twitter:title" content="{twitter_title}" />',
            content,
            count=1
        )

        # 修复 twitter:description
        twitter_desc = meta['og_description']
        content = re.sub(
            r'<meta name="twitter:description" content=".*?" />',
            f'<meta name="twitter:description" content="{twitter_desc}" />',
            content,
            count=1
        )

        # 写回文件
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f'✅ 修复成功: {filepath}')
        return True

    except Exception as e:
        print(f'❌ 修复失败: {filepath}')
        print(f'   错误: {str(e)}')
        return False

def main():
    """主函数"""
    print('开始批量修复页面 meta 信息...\n')

    success_count = 0
    fail_count = 0

    for filename, meta in pages_meta.items():
        if fix_page(filename, meta):
            success_count += 1
        else:
            fail_count += 1

    print(f'\n修复完成！')
    print(f'✅ 成功: {success_count} 个')
    print(f'❌ 失败: {fail_count} 个')

if __name__ == '__main__':
    main()
