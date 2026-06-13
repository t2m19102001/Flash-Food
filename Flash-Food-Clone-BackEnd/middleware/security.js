// Security audit and hardening middleware
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// Rate limiting configuration
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: message || 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Different rate limits for different endpoints
const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  20, // max 20 login attempts
  'Too many login attempts, please try again in 15 minutes.'
);

const apiLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  100, // max 100 requests per minute
  'Too many API requests, please try again later.'
);

const paymentLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  10, // max 10 payment attempts per minute
  'Too many payment attempts, please try again later.'
);

const uploadLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  5, // max 5 uploads per minute
  'Too many upload attempts, please try again later.'
);

// Security headers middleware
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "https://js.stripe.com"],
      imgSrc: ["'self'", "data:", "https:", "http://localhost:*"],
      connectSrc: ["'self'", "https://api.stripe.com", "http://localhost:*"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'", "https://js.stripe.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: false,
  referrerPolicy: { policy: "no-referrer" },
  xssFilter: true
});

// Input validation middleware
const validateInput = (req, res, next) => {
  // Check for common attack patterns
  const suspiciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*<\/script>)/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^>]*>/gi,
    /<object\b[^>]*>/gi,
    /<embed\b[^>]*>/gi,
    /<link\b[^>]*>/gi,
    /<meta\b[^>]*>/gi
  ];

  const checkValue = (value) => {
    if (typeof value !== 'string') return false;
    return suspiciousPatterns.some(pattern => pattern.test(value));
  };

  const checkObject = (obj) => {
    for (const key in obj) {
      if (checkValue(obj[key])) {
        return true;
      }
    }
    return false;
  };

  // Check request body
  if (req.body && checkObject(req.body)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid input detected'
    });
  }

  // Check query parameters
  if (req.query && checkObject(req.query)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid query parameters'
    });
  }

  next();
};

// Request size limiter
const requestSizeLimiter = (req, res, next) => {
  const contentLength = req.get('content-length');
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (contentLength && parseInt(contentLength) > maxSize) {
    return res.status(413).json({
      success: false,
      message: 'Request entity too large'
    });
  }

  next();
};

// IP whitelist/blacklist middleware
const ipFilter = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;

  // Block common attack IPs (example - should be configurable)
  const blockedIPs = process.env.BLOCKED_IPS ? process.env.BLOCKED_IPS.split(',') : [];

  if (blockedIPs.includes(clientIP)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  // Log suspicious IPs
  const suspiciousPatterns = [
    /\d+\.\d+\.\d+\.\d+/, // Basic IP pattern
  ];

  if (suspiciousPatterns.some(pattern => pattern.test(clientIP))) {
    console.warn(`Suspicious IP detected: ${clientIP}`);
  }

  next();
};

// CORS enhancement
const enhancedCORS = (req, res, next) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS ?
    process.env.ALLOWED_ORIGINS.split(',') :
    ["http://localhost:5173", "http://localhost:5174"];

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }

  next();
};

// Security audit logger
const securityLogger = (req, res, next) => {
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    contentLength: req.get('content-length'),
    referer: req.get('Referer')
  };

  // Log suspicious activities
  const suspiciousPatterns = [
    /\.\./, // Directory traversal
    /<script/i, // XSS
    /union.*select/i, // SQL injection
    /drop.*table/i, // SQL injection
    /exec\(/i, // Command injection
  ];

  const isSuspicious = suspiciousPatterns.some(pattern =>
    pattern.test(req.url) ||
    (req.body && pattern.test(JSON.stringify(req.body)))
  );

  if (isSuspicious) {
    console.warn('🚨 Suspicious Request Detected:', logData);
  }

  next();
};

export {
  authLimiter,
  apiLimiter,
  paymentLimiter,
  uploadLimiter,
  securityHeaders,
  validateInput,
  requestSizeLimiter,
  ipFilter,
  enhancedCORS,
  securityLogger
};
