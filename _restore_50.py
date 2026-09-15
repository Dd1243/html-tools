#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""从 de27b01b 提交恢复 50 个被清空的文件"""
import subprocess
from pathlib import Path

ROOT = Path(r"e:\html-tools")
COMMIT = "de27b01b"

with open(ROOT / "_restore_list.txt", "r", encoding="utf-8") as f:
    files = [line.strip() for line in f if line.strip()]

# 只取后 50 个（前 2 个是已修复好的 string-builder 和 symbols-table）
files_to_restore = files[2:]  # 跳过 string-builder 和 symbols-table

print(f"[INFO] 恢复 {len(files_to_restore)} 个文件从 {COMMIT}")
success = 0
fail = 0
for i, rel in enumerate(files_to_restore, 1):
    # git checkout COMMIT -- path
    result = subprocess.run(
        ["git", "-C", str(ROOT), "checkout", COMMIT, "--", rel],
        capture_output=True,
        text=True,
        encoding="utf-8"
    )
    if result.returncode == 0:
        success += 1
    else:
        fail += 1
        print(f"  [FAIL] {rel}: {result.stderr}")
    if i % 10 == 0:
        print(f"  已处理 {i}/{len(files_to_restore)}")

print(f"\n=== 总结 ===")
print(f"成功: {success}")
print(f"失败: {fail}")
