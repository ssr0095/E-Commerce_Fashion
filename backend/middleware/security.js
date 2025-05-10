// middlewares/security.js
import helmet from "helmet";

// Custom CSP directives based on your DNS records
const cspDirectives = {
  defaultSrc: ["'self'", "cousinsfashion.in"],
  scriptSrc: [
    "'self'",
    "'unsafe-inline'",
    "cdn.cousinsfashion.in",
    "*.vercel-dns.com",
    "*.cloudflare.com",
  ],
  styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
  imgSrc: [
    "'self'",
    "data:",
    "cdn.cousinsfashion.in",
    "public.r2.dev",
    "*.vercel-dns.com",
  ],
  fontSrc: ["'self'", "fonts.gstatic.com", "cdn.cousinsfashion.in"],
  connectSrc: [
    "'self'",
    "api.cousinsfashion.in",
    "e-commerce-fashion.onrender.com",
    "*.mongodb.com",
    "*.cloudflare.com",
  ],
  frameSrc: ["'self'"],
  objectSrc: ["'none'"],
  mediaSrc: ["'self'", "cdn.cousinsfashion.in"],
};

export const securityMiddleware = (app) => {
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: cspDirectives,
        reportOnly: process.env.NODE_ENV === "development",
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
      crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
      hsts: {
        maxAge: 63072000,
        includeSubDomains: true,
        preload: true,
      },
      frameguard: { action: "deny" },
    })
  );

  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader(
      "Permissions-Policy",
      "geolocation=(), microphone=(), camera=()"
    );
    next();
  });
};
