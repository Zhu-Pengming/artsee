module.exports = {
  apps: [
    {
      name: 'artsee-web',
      script: './web/server.js',
      // 使用 PATH 中的 node（Ubuntu apt / NodeSource 与旧机 node24 均可）
      interpreter: 'node',
      cwd: '/root/website/artsee',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '500M',
      watch: false,
      autorestart: true,
    },
  ],
};
