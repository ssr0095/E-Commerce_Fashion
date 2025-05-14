import helmet from "helmet";

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
  // frameSrc: ["'self'", "https://www.youtube.com"], // if embedding videos
  objectSrc: ["'none'"],
  mediaSrc: ["'self'", "cdn.cousinsfashion.in"],
  formAction: ["'self'"],
  baseUri: ["'self'"],
  frameAncestors: ["'none'"], // clickjacking protection
  // Optional:
  // reportUri: "https://cousinsfashion.in/csp-report",
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
      crossOriginOpenerPolicy: { policy: "same-origin" },
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
      hsts: {
        maxAge: 63072000,
        includeSubDomains: true,
        preload: true,
      },
      frameguard: { action: "deny" },
      noSniff: true,
    })
  );

  app.use((req, res, next) => {
    res.setHeader(
      "Permissions-Policy",
      "geolocation=(), microphone=(), camera=(), payment=()"
    );
    next();
  });
};
