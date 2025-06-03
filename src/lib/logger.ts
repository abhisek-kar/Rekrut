// lib/logger.ts

import pino from 'pino';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogContext {
  userId?: string;
  requestId?: string;
  userAgent?: string;
  ip?: string;
  url?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  [key: string]: unknown;
}

// Setup Pino instance
const isDev = process.env.NODE_ENV === 'development';

const baseLogger = pino({
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  base: {
    environment: process.env.NODE_ENV || 'development',
  },
});

class Logger {
  debug(message: string, context?: LogContext): void {
    baseLogger.debug(context || {}, message);
  }

  info(message: string, context?: LogContext): void {
    baseLogger.info(context || {}, message);
  }

  warn(message: string, context?: LogContext): void {
    baseLogger.warn(context || {}, message);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    const errContext = {
      ...context,
      error: {
        name: error?.name,
        message: error?.message,
        stack: isDev ? error?.stack : undefined,
      },
    };
    baseLogger.error(errContext, message);
  }

  fatal(message: string, error?: Error, context?: LogContext): void {
    const errContext = {
      ...context,
      error: {
        name: error?.name,
        message: error?.message,
        stack: isDev ? error?.stack : undefined,
      },
    };
    baseLogger.fatal(errContext, message);
  }

  apiRequest(method: string, url: string, context?: LogContext): void {
    this.info(`API Request: ${method} ${url}`, {
      method,
      url,
      ...context,
    });
  }

  apiResponse(method: string, url: string, statusCode: number, duration: number, context?: LogContext): void {
    const level: LogLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    const logContext = {
      method,
      url,
      statusCode,
      duration,
      ...context,
    };
    
    if (level === 'error') {
      this.error(`API Response: ${method} ${url} - ${statusCode} (${duration}ms)`, undefined, logContext);
    } else if (level === 'warn') {
      this.warn(`API Response: ${method} ${url} - ${statusCode} (${duration}ms)`, logContext);
    } else {
      this.info(`API Response: ${method} ${url} - ${statusCode} (${duration}ms)`, logContext);
    }
  }

  auth(action: string, userId?: string, context?: LogContext): void {
    this.info(`Auth: ${action}`, {
      userId,
      action,
      ...context,
    });
  }

  database(operation: string, collection?: string, context?: LogContext): void {
    this.debug(`Database: ${operation}${collection ? ` on ${collection}` : ''}`, {
      operation,
      collection,
      ...context,
    });
  }

  security(event: string, context?: LogContext): void {
    this.warn(`Security: ${event}`, context);
  }

  performance(operation: string, duration: number, context?: LogContext): void {
    const level: LogLevel = duration > 1000 ? 'warn' : 'debug';
    this[level](`Performance: ${operation} took ${duration}ms`, {
      operation,
      duration,
      ...context,
    });
  }
}

// Singleton instance
export const logger = new Logger();

// Export bound methods for easier use
export const log = {
  debug: logger.debug.bind(logger),
  info: logger.info.bind(logger),
  warn: logger.warn.bind(logger),
  error: logger.error.bind(logger),
  fatal: logger.fatal.bind(logger),
  apiRequest: logger.apiRequest.bind(logger),
  apiResponse: logger.apiResponse.bind(logger),
  auth: logger.auth.bind(logger),
  database: logger.database.bind(logger),
  security: logger.security.bind(logger),
  performance: logger.performance.bind(logger),
};

// Client-side logging (basic)
export const clientLogger = {
  debug: (message: string, context?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('🐛 [DEBUG]', message, context);
    }
  },
  info: (message: string, context?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'development') {
      console.info('ℹ️ [INFO]', message, context);
    }
  },
  warn: (message: string, context?: Record<string, unknown>) => {
    console.warn('⚠️ [WARN]', message, context);
  },
  error: (message: string, error?: Error, context?: Record<string, unknown>) => {
    console.error('❌ [ERROR]', message, error, context);

    if (process.env.NODE_ENV === 'production') {
      // Example: send to a remote log service
      // fetch('/api/logs', { method: 'POST', body: JSON.stringify({ message, error, context }) });
    }
  },
};

export default logger;