/**
 * سیستم مرکزی مدیریت خطا
 *
 * خطاهای حساس به کاربر فقط با کد نمایش داده می‌شوند.
 * جزئیات فنی فقط در کنسول (dev) ثبت می‌شوند.
 */

export const ErrorCodes = {
  NETWORK: 'ERR-NET-001',
  API_UNAVAILABLE: 'ERR-NET-002',
  AUTH_DENIED: 'ERR-AUTH-001',
  SESSION_EXPIRED: 'ERR-AUTH-002',
  DB: 'ERR-DB-001',
  PAYMENT: 'ERR-PAY-001',
  PAYMENT_GATEWAY: 'ERR-PAY-002',
  CONFIG: 'ERR-CFG-001',
  NOT_FOUND: 'ERR-NF-001',
  RATE_LIMIT: 'ERR-RL-001',
  VALIDATION: 'ERR-VAL-001',
  UNKNOWN: 'ERR-UNK-001',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

const SENSITIVE_PATTERNS: Array<{ pattern: RegExp; code: ErrorCode }> = [
  { pattern: /jwt|bearer|token|authorization/i, code: ErrorCodes.AUTH_DENIED },
  { pattern: /permission|rls|policy|forbidden|unauthorized/i, code: ErrorCodes.AUTH_DENIED },
  { pattern: /supabase|postgres|pgrst|sql|relation|column|constraint/i, code: ErrorCodes.DB },
  { pattern: /api[_-]?key|secret|credential|password|service[_-]?role/i, code: ErrorCodes.CONFIG },
  { pattern: /stack|at\s+\w+\./i, code: ErrorCodes.UNKNOWN },
  { pattern: /failed to fetch|networkerror|net::/i, code: ErrorCodes.NETWORK },
  { pattern: /timeout|timed?\s*out/i, code: ErrorCodes.NETWORK },
];

const CODE_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCodes.NETWORK]: 'اتصال برقرار نشد. لطفاً اینترنت خود را بررسی کنید.',
  [ErrorCodes.API_UNAVAILABLE]: 'سرویس در حال حاضر در دسترس نیست.',
  [ErrorCodes.AUTH_DENIED]: 'دسترسی مجاز نیست.',
  [ErrorCodes.SESSION_EXPIRED]: 'نشست شما منقضی شده است. لطفاً دوباره وارد شوید.',
  [ErrorCodes.DB]: 'خطا در پردازش اطلاعات.',
  [ErrorCodes.PAYMENT]: 'خطا در پردازش پرداخت.',
  [ErrorCodes.PAYMENT_GATEWAY]: 'خطا در ارتباط با درگاه پرداخت.',
  [ErrorCodes.CONFIG]: 'پیکربندی سرویس ناقص است.',
  [ErrorCodes.NOT_FOUND]: 'مورد درخواستی یافت نشد.',
  [ErrorCodes.RATE_LIMIT]: 'تعداد درخواست‌ها بیش از حد مجاز است. لطفاً کمی صبر کنید.',
  [ErrorCodes.VALIDATION]: 'اطلاعات وارد شده نامعتبر است.',
  [ErrorCodes.UNKNOWN]: 'خطای غیرمنتظره رخ داده است.',
};

export interface ResolvedError {
  message: string;
  code: ErrorCode;
  isSensitive: boolean;
}

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly userMessage: string;
  readonly isSensitive: boolean;

  constructor(
    code: ErrorCode,
    userMessage: string,
    options?: { cause?: unknown; isSensitive?: boolean },
  ) {
    super(userMessage);
    this.name = 'AppError';
    this.code = code;
    this.userMessage = userMessage;
    this.isSensitive = options?.isSensitive ?? false;
  }
}

function isPersianUserMessage(message: string): boolean {
  return /[\u0600-\u06FF]/.test(message) && message.length <= 300;
}

function detectSensitiveCode(raw: string): ErrorCode | null {
  for (const { pattern, code } of SENSITIVE_PATTERNS) {
    if (pattern.test(raw)) {
      return code;
    }
  }
  return null;
}

function formatCodedMessage(code: ErrorCode): string {
  return `${CODE_MESSAGES[code]} (کد: ${code})`;
}

/** تبدیل هر خطا به پیام امن برای نمایش به کاربر */
export function resolveError(error: unknown, fallbackCode: ErrorCode = ErrorCodes.UNKNOWN): ResolvedError {
  if (error instanceof AppError) {
    return {
      message: error.isSensitive
        ? formatCodedMessage(error.code)
        : error.userMessage,
      code: error.code,
      isSensitive: error.isSensitive,
    };
  }

  const rawMessage =
    error instanceof Error ? error.message : typeof error === 'string' ? error : '';

  if (rawMessage && isPersianUserMessage(rawMessage)) {
    const sensitiveCode = detectSensitiveCode(rawMessage);
    if (sensitiveCode) {
      logInternalError(error, sensitiveCode);
      return {
        message: formatCodedMessage(sensitiveCode),
        code: sensitiveCode,
        isSensitive: true,
      };
    }

    return {
      message: rawMessage,
      code: ErrorCodes.VALIDATION,
      isSensitive: false,
    };
  }

  const sensitiveCode = rawMessage ? detectSensitiveCode(rawMessage) : fallbackCode;
  const code = sensitiveCode ?? fallbackCode;

  logInternalError(error, code);

  return {
    message: formatCodedMessage(code),
    code,
    isSensitive: true,
  };
}

/** استخراج پیام خطا — میانبر برای resolveError */
export function getErrorMessage(error: unknown, fallbackCode?: ErrorCode): string {
  return resolveError(error, fallbackCode).message;
}

/** ثبت جزئیات فنی خطا در کنسول */
export function logInternalError(error: unknown, code?: ErrorCode): void {
  const prefix = code ? `[${code}]` : '[ERROR]';

  if (import.meta.env.DEV) {
    console.error(prefix, error);
    return;
  }

  if (error instanceof Error) {
    console.error(prefix, error.name, error.message);
  } else {
    console.error(prefix, 'Unexpected error');
  }
}

/** ساخت AppError از کد */
export function createError(
  code: ErrorCode,
  userMessage?: string,
  options?: { cause?: unknown; isSensitive?: boolean },
): AppError {
  return new AppError(code, userMessage ?? CODE_MESSAGES[code], options);
}
