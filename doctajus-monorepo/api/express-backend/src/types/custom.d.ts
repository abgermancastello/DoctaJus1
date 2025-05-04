declare module 'xss-clean' {
  import { RequestHandler } from 'express';
  const xss: RequestHandler;
  export default xss;
}

declare module 'hpp' {
  import { RequestHandler } from 'express';
  const hpp: RequestHandler;
  export default hpp;
}

declare module 'express-mongo-sanitize' {
  import { RequestHandler } from 'express';
  const mongoSanitize: () => RequestHandler;
  export default mongoSanitize;
}

declare module 'express-rate-limit' {
  import { RequestHandler } from 'express';
  interface RateLimitOptions {
    windowMs?: number;
    max?: number;
    message?: any;
    standardHeaders?: boolean;
    legacyHeaders?: boolean;
  }
  const rateLimit: (options: RateLimitOptions) => RequestHandler;
  export default rateLimit;
}
