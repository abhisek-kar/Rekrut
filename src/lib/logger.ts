/**
 * Structured logging system for the application
 * Provides different log levels and formatting for development and production
 */

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

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  environment: string;
}

class Logger {
  private isDevelopment: boolean;
  private minLevel: LogLevel;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.minLevel = (process.env.LOG_LEVEL as LogLevel) || (this.isDevelopment ? 'debug' : 'info');
  }

  private getLevelPriority(level: LogLevel): number {
    const priorities = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
      fatal: 4,
    };
    return priorities[level];
  }

  private shouldLog(level: LogLevel): boolean {
    return this.getLevelPriority(level) >= this.getLevelPriority(this.minLevel);
  }

  private formatLog(level: LogLevel, message: string, context?: LogContext, error?: Error): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      environment: process.env.NODE_ENV || 'development',
    };

    if (context) {
      entry.context = context;
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
      };
    }

    return entry;
  }

  private output(entry: LogEntry): void {
    if (this.isDevelopment) {
      // Development: Pretty formatted console output
      const emoji = {
        debug: '🐛',
        info: 'ℹ️',
        warn: '⚠️',
        error: '❌',
        fatal: '💀',
      };

      const color = {
        debug: '\x1b[36m', // Cyan
        info: '\x1b[34m',  // Blue
        warn: '\x1b[33m',  // Yellow
        error: '\x1b[31m', // Red
        fatal: '\x1b[35m', // Magenta
      };

      const reset = '\x1b[0m';
      const timestamp = new Date(entry.timestamp).toLocaleTimeString();
      
      console.log(
        `${color[entry.level]}${emoji[entry.level]} [${entry.level.toUpperCase()}]${reset} ${timestamp} - ${entry.message}`
      );

      if (entry.context) {
        console.log(`${color[entry.level]}   Context:${reset}`, entry.context);
      }

      if (entry.error) {
        console.log(`${color[entry.level]}   Error:${reset}`, entry.error);
      }
    } else {
      // Production: JSON structured logging
      console.log(JSON.stringify(entry));
    }
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog('debug')) return;
    const entry = this.formatLog('debug', message, context);
    this.output(entry);
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog('info')) return;
    const entry = this.formatLog('info', message, context);
    this.output(entry);
  }

  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog('warn')) return;
    const entry = this.formatLog('warn', message, context);
    this.output(entry);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    if (!this.shouldLog('error')) return;
    const entry = this.formatLog('error', message, context, error);
    this.output(entry);
  }

  fatal(message: string, error?: Error, context?: LogContext): void {
    if (!this.shouldLog('fatal')) return;
    const entry = this.formatLog('fatal', message, context, error);
    this.output(entry);
  }

  // Convenience methods for common scenarios
  apiRequest(method: string, url: string, context?: LogContext): void {
    this.info(`API Request: ${method} ${url}`, {
      method,
      url,
      ...context,
    });
  }

  apiResponse(method: string, url: string, statusCode: number, duration: number, context?: LogContext): void {
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    this[level](`API Response: ${method} ${url} - ${statusCode} (${duration}ms)`, {
      method,
      url,
      statusCode,
      duration,
      ...context,
    });
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
    const level = duration > 1000 ? 'warn' : 'debug';
    this[level](`Performance: ${operation} took ${duration}ms`, {
      operation,
      duration,
      ...context,
    });
  }
}

// Create singleton logger instance
export const logger = new Logger();

// Export convenience functions
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

// Client-side logger (simplified)
export const clientLogger = {
  debug: (message: string, context?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🐛 [DEBUG]', message, context);
    }
  },
  info: (message: string, context?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('ℹ️ [INFO]', message, context);
    }
  },
  warn: (message: string, context?: any) => {
    console.warn('⚠️ [WARN]', message, context);
  },
  error: (message: string, error?: Error, context?: any) => {
    console.error('❌ [ERROR]', message, error, context);
    
    // In production, you might want to send errors to a logging service
    if (process.env.NODE_ENV === 'production') {
      // Example: sendToLoggingService({ message, error, context });
    }
  },
};

export default logger;
