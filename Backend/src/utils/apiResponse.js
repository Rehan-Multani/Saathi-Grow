export const sendSuccess = (res, payload = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    ...payload,
  });
};

export const sendError = (req, res, statusCode, message, extra = {}) => {
  return res.status(statusCode).json({
    success: false,
    message,
    requestId: req?.requestId || null,
    ...extra,
  });
};
