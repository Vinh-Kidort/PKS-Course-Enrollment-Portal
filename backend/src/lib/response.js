exports.sendSuccess = (res, data, { status = 200, message } = {}) =>
  res.status(status).json({ success: true, ...(message && { message }), data });