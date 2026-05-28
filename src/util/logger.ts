type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type LogPayload = Record<string, unknown>;

const SENSITIVE_KEY_PATTERN = /(cookie|authorization|token|uin|qq|user)/i;

const shouldLog = (level: LogLevel): boolean => {
	if (process.env.NODE_ENV === 'test') return false;
	if (level === 'debug') return process.env.DEBUG === 'true';
	return true;
};

const maskSensitiveValue = (value: unknown): unknown => {
	if (typeof value === 'string') return value ? '[masked]' : value;
	if (Array.isArray(value)) return value.map(maskSensitiveValue);
	if (value && typeof value === 'object') return sanitizeLogPayload(value as LogPayload);
	return value;
};

export const sanitizeLogPayload = (payload: LogPayload): LogPayload => {
	return Object.fromEntries(
		Object.entries(payload).map(([key, value]) => [
			key,
			SENSITIVE_KEY_PATTERN.test(key) ? maskSensitiveValue(value) : maskSensitiveValueIfNested(value),
		]),
	);
};

const maskSensitiveValueIfNested = (value: unknown): unknown => {
	if (Array.isArray(value)) return value.map(maskSensitiveValueIfNested);
	if (value && typeof value === 'object') return sanitizeLogPayload(value as LogPayload);
	return value;
};

const writeLog = (level: LogLevel, message: string, payload?: LogPayload) => {
	if (!shouldLog(level)) return;

	const args = payload ? [message, sanitizeLogPayload(payload)] : [message];

	if (level === 'error') {
		console.error(...args);
		return;
	}

	if (level === 'warn') {
		console.warn(...args);
		return;
	}

	console.log(...args);
};

export const logger = {
	debug: (message: string, payload?: LogPayload) => writeLog('debug', message, payload),
	info: (message: string, payload?: LogPayload) => writeLog('info', message, payload),
	warn: (message: string, payload?: LogPayload) => writeLog('warn', message, payload),
	error: (message: string, payload?: LogPayload) => writeLog('error', message, payload),
};
