const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = 'Asia/Ho_Chi_Minh';

exports.formatDate = (d) => dayjs(d).tz(TZ).format('YYYY-MM-DD');
exports.formatDateTime = (d) => dayjs(d).tz(TZ).format('YYYY-MM-DD HH:mm:ss');