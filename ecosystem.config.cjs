/** PM2 process config — Windows/Linux VPS */
module.exports = {
  apps: [
    {
      name: 'tansoo',
      script: 'local-products-api.js',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 4020,
        HOST: '0.0.0.0',
      },
    },
  ],
};
