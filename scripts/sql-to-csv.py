#!/usr/bin/env python3
"""
将 SQL UPDATE/INSERT 语句转换为 CSV 文件
"""
import re
import csv
import sys
from pathlib import Path

def parse_sql_to_csv(sql_file, output_csv):
    """解析 SQL 文件并转换为 CSV"""
    
    with open(sql_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 提取所有 UPDATE 和 INSERT 语句
    # 匹配 UPDATE schools SET ... WHERE id = '...'
    update_pattern = r"UPDATE schools SET\s+(.*?)\s+WHERE id = '([^']+)';"
    
    # 匹配 INSERT INTO schools
    insert_pattern = r"INSERT INTO schools\s+\((.*?)\)\s+VALUES\s+\((.*?)\);"
    
    updates = re.findall(update_pattern, content, re.DOTALL)
    inserts = re.findall(insert_pattern, content, re.DOTALL)
    
    # 收集所有字段名
    all_fields = set(['id'])  # id 总是存在
    
    # 解析 UPDATE 语句中的字段
    for update_content, school_id in updates:
        fields = parse_update_fields(update_content)
        all_fields.update(fields.keys())
    
    # 解析 INSERT 语句中的字段
    for field_list, value_list in inserts:
        fields = [f.strip() for f in field_list.split(',')]
        all_fields.update(fields)
    
    # 排序字段名
    sorted_fields = sorted(list(all_fields))
    
    # 写入 CSV
    rows = []
    
    # 处理 UPDATE 语句
    for update_content, school_id in updates:
        fields = parse_update_fields(update_content)
        fields['id'] = school_id
        row = {field: fields.get(field, '') for field in sorted_fields}
        rows.append(row)
    
    # 处理 INSERT 语句
    for field_list, value_list in inserts:
        fields_names = [f.strip() for f in field_list.split(',')]
        values = parse_insert_values(value_list)
        
        field_dict = dict(zip(fields_names, values))
        row = {field: field_dict.get(field, '') for field in sorted_fields}
        rows.append(row)
    
    # 写入 CSV 文件
    with open(output_csv, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=sorted_fields)
        writer.writeheader()
        writer.writerows(rows)
    
    print(f"✅ 成功转换 {len(rows)} 条记录到 {output_csv}")
    print(f"📊 字段数量: {len(sorted_fields)}")
    print(f"📝 字段列表: {', '.join(sorted_fields[:10])}...")

def parse_update_fields(update_content):
    """解析 UPDATE 语句中的字段和值"""
    fields = {}
    
    # 按行分割
    lines = update_content.strip().split('\n')
    
    current_field = None
    current_value = []
    
    for line in lines:
        line = line.strip()
        if not line or line == ',':
            continue
        
        # 移除行尾的逗号
        line = line.rstrip(',')
        
        # 检查是否是新字段开始
        if '=' in line and not line.startswith("'"):
            # 保存之前的字段
            if current_field:
                fields[current_field] = ''.join(current_value).strip()
            
            # 解析新字段
            parts = line.split('=', 1)
            current_field = parts[0].strip()
            current_value = [parts[1].strip()]
        else:
            # 继续当前字段的值
            current_value.append(' ' + line)
    
    # 保存最后一个字段
    if current_field:
        fields[current_field] = ''.join(current_value).strip()
    
    # 清理值
    cleaned_fields = {}
    for key, value in fields.items():
        cleaned_fields[key] = clean_value(value)
    
    return cleaned_fields

def clean_value(value):
    """清理字段值"""
    value = value.strip()
    
    # 移除类型转换
    value = re.sub(r'::(text\[\]|jsonb|integer|numeric|boolean)', '', value)
    
    # 处理字符串值
    if value.startswith("'") and value.endswith("'"):
        value = value[1:-1]
        # 处理转义的单引号
        value = value.replace("''", "'")
    
    # 处理 ARRAY
    if value.startswith('ARRAY['):
        value = value[6:-1]  # 移除 ARRAY[ 和 ]
        # 提取数组元素
        elements = re.findall(r"'([^']*)'", value)
        value = '|'.join(elements)  # 使用 | 分隔
    
    # 处理 NULL
    if value.upper() == 'NULL':
        value = ''
    
    return value

def parse_insert_values(value_list):
    """解析 INSERT 语句中的值列表"""
    values = []
    current_value = []
    in_string = False
    paren_depth = 0
    bracket_depth = 0
    
    for char in value_list:
        if char == "'" and (not current_value or current_value[-1] != '\\'):
            in_string = not in_string
        elif char == '(' and not in_string:
            paren_depth += 1
        elif char == ')' and not in_string:
            paren_depth -= 1
        elif char == '[' and not in_string:
            bracket_depth += 1
        elif char == ']' and not in_string:
            bracket_depth -= 1
        elif char == ',' and not in_string and paren_depth == 0 and bracket_depth == 0:
            values.append(''.join(current_value).strip())
            current_value = []
            continue
        
        current_value.append(char)
    
    # 添加最后一个值
    if current_value:
        values.append(''.join(current_value).strip())
    
    # 清理每个值
    return [clean_value(v) for v in values]

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("用法: python sql-to-csv.py <sql文件> [输出csv文件]")
        sys.exit(1)
    
    sql_file = sys.argv[1]
    output_csv = sys.argv[2] if len(sys.argv) > 2 else sql_file.replace('.sql', '.csv')
    
    if not Path(sql_file).exists():
        print(f"❌ 错误: 文件不存在 {sql_file}")
        sys.exit(1)
    
    parse_sql_to_csv(sql_file, output_csv)
