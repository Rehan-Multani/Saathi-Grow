import rateLimit from 'express-rate-limit';

const getClientIp = (req) => {
  // Prefer Express-derived IP (honors trusted proxy config) over raw headers.
  return req.ip || req.socket?.remoteAddress || 'unknown';
};

const normalizeKeyPart = (value) => String(value || '').toLowerCase().trim().slice(0, 120);

export const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    const email = normalizeKeyPart(req.body?.email);
    return `admin-login:${getClientIp(req)}:${email}`;
  },
  message: { message: 'Too many login attempts. Please try again shortly.' }
});

export const adminWriteLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 160,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `admin-write:${req.admin?._id?.toString() || getClientIp(req)}`,
  message: { message: 'Too many requests. Please slow down and try again.' }
});

export const sensitiveAdminActionLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 80,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `admin-sensitive:${req.admin?._id?.toString() || getClientIp(req)}`,
  message: { message: 'Too many sensitive operations in a short time. Please try again soon.' }
});

export const auditAction = (action) => (req, res, next) => {
  const startedAt = Date.now();
  res.on('finish', () => {
    if (res.statusCode < 200 || res.statusCode >= 400) return;

    const actor = req.admin
      ? { id: req.admin._id, role: req.admin.role, email: req.admin.email }
      : null;

    console.info(
      '[AUDIT]',
      JSON.stringify({
        action,
        actor,
        requestId: req.requestId || null,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: Date.now() - startedAt,
        at: new Date().toISOString()
      })
    );
  });

  next();
};

const idempotencyStore = new Map();
const DEFAULT_IDEMPOTENCY_TTL_MS = 10 * 60 * 1000;

const cleanupIdempotencyStore = () => {
  const now = Date.now();
  for (const [key, record] of idempotencyStore.entries()) {
    if (!record || record.expiresAt <= now) {
      idempotencyStore.delete(key);
    }
  }
};

setInterval(cleanupIdempotencyStore, 60 * 1000).unref();

const buildActorScope = (req) => {
  if (req.admin?._id) return `admin:${req.admin._id.toString()}`;
  if (req.vendor?._id) return `vendor:${req.vendor._id.toString()}`;
  if (req.user?._id) return `user:${req.user._id.toString()}`;
  if (req.partner?._id) return `partner:${req.partner._id.toString()}`;
  return `ip:${getClientIp(req)}`;
};

const buildPayloadFingerprint = (req) =>
  JSON.stringify({
    body: req.body || {},
    params: req.params || {},
    query: req.query || {}
  });

export const idempotencyGuard = ({ ttlMs = DEFAULT_IDEMPOTENCY_TTL_MS } = {}) => (req, res, next) => {
  const idempotencyKey = req.header('Idempotency-Key');
  if (!idempotencyKey) return next();

  cleanupIdempotencyStore();

  const scope = `${buildActorScope(req)}:${req.method}:${req.path}:${idempotencyKey}`;
  const payloadFingerprint = buildPayloadFingerprint(req);
  const now = Date.now();
  const existing = idempotencyStore.get(scope);

  if (existing) {
    if (existing.payloadFingerprint !== payloadFingerprint) {
      return res.status(409).json({
        message: 'Idempotency-Key is already in use with a different request payload'
      });
    }

    if (existing.state === 'processing') {
      return res.status(409).json({
        message: 'A request with the same Idempotency-Key is already being processed'
      });
    }

    if (existing.state === 'completed') {
      res.set('Idempotency-Replayed', 'true');
      return res.status(existing.statusCode).json(existing.responseBody);
    }
  }

  idempotencyStore.set(scope, {
    state: 'processing',
    payloadFingerprint,
    expiresAt: now + ttlMs
  });

  const originalJson = res.json.bind(res);
  let completed = false;

  res.json = (body) => {
    const isSuccess = res.statusCode >= 200 && res.statusCode < 300;

    if (isSuccess) {
      idempotencyStore.set(scope, {
        state: 'completed',
        payloadFingerprint,
        statusCode: res.statusCode,
        responseBody: body,
        expiresAt: Date.now() + ttlMs
      });
      completed = true;
    } else {
      idempotencyStore.delete(scope);
    }

    return originalJson(body);
  };

  res.on('close', () => {
    if (!completed) {
      const current = idempotencyStore.get(scope);
      if (current?.state === 'processing') {
        idempotencyStore.delete(scope);
      }
    }
  });

  next();
};
