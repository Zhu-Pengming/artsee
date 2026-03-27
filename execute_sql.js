#!/usr/bin/env node
/**
 * 使用 Supabase Management API 执行 SQL
 */
const https = require('https');
const fs = require('fs');

// 配置
const PROJECT_REF = 'nufrgmlhlfmhxsqbybfd';
const ACCESS_TOKEN = 'sbp_9bcb49680cf2097025c383dc9b6220afa55493c0';
const SQL_FILE = 'init_data/setup_database.sql';

// 读取 SQL 文件
const sql = fs.readFileSync(SQL_FILE, 'utf8');

// 构建请求 - 使用正确的 JSON 转义
const data = JSON.stringify({
  query: sql
});

console.log('🚀 正在执行 SQL...');
console.log('项目:', PROJECT_REF);
console.log('SQL 长度:', sql.length, '字符');
console.log('JSON 长度:', data.length, '字符');
console.log();

const options = {
  hostname: 'api.supabase.com',
  port: 443,
  path: `/v1/projects/${PROJECT_REF}/database/query`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = https.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log('状态码:', res.statusCode);
    
    if (res.statusCode === 200) {
      console.log('✅ SQL 执行成功!');
      try {
        const result = JSON.parse(responseData);
        console.log('响应:', JSON.stringify(result, null, 2));
      } catch (e) {
        console.log('响应:', responseData);
      }
    } else {
      console.log('❌ 执行失败');
      try {
        const error = JSON.parse(responseData);
        console.log('错误:', JSON.stringify(error, null, 2));
      } catch (e) {
        console.log('响应:', responseData);
      }
    }
  });
});

req.on('error', (e) => {
  console.error('❌ 请求错误:', e.message);
});

req.write(data);
req.end();
