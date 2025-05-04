import { RequestHandler } from 'express';

declare module 'xss-clean' {
    const xss: () => RequestHandler;
    export default xss;
}

declare module 'hpp' {
    const hpp: () => RequestHandler;
    export default hpp;
}

declare module 'express-mongo-sanitize' {
    const mongoSanitize: () => RequestHandler;
    export default mongoSanitize;
}

declare module 'express-rate-limit' {
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
