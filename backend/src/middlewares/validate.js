const { ValidationError } = require('../lib/errors');

// source: 'body' | 'query' | 'params'
module.exports = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const errors = result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
    return next(new ValidationError(errors));
  }
  req[source] = result.data; // dữ liệu đã được làm sạch, ép kiểu, loại field thừa
  next();
};