const { execSync } = require('child_process');

module.exports = async () => {
  require('./load-env');
  execSync('npx prisma migrate deploy', { stdio: 'inherit', env: process.env });
};