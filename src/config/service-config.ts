import fs from 'node:fs';
import { resolveConfigPath } from './config-path';
import { logger } from '../util/logger';

export interface ServiceConfig {
	/** 是否启用降级模式（不强制要求 Cookie） */
	fallbackMode: boolean;
	/** 是否使用全局 Cookie（向后兼容） */
	useGlobalCookie: boolean;
	/** Cookie 参数名称（支持从 query 或 header 传递） */
	cookieParamName: string;
}

const configPath = resolveConfigPath('service-config.json');

// 创建默认配置
const defaultConfig: ServiceConfig = {
	fallbackMode: true,
	useGlobalCookie: false,
	cookieParamName: 'cookie',
};

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === 'object');

export const normalizeServiceConfig = (value: unknown): ServiceConfig => {
	if (!isRecord(value)) return defaultConfig;

	return {
		fallbackMode: typeof value.fallbackMode === 'boolean' ? value.fallbackMode : defaultConfig.fallbackMode,
		useGlobalCookie: typeof value.useGlobalCookie === 'boolean' ? value.useGlobalCookie : defaultConfig.useGlobalCookie,
		cookieParamName:
			typeof value.cookieParamName === 'string' && value.cookieParamName.trim()
				? value.cookieParamName.trim()
				: defaultConfig.cookieParamName,
	};
};

// 读取或创建配置文件
let config: ServiceConfig = defaultConfig;

if (fs.existsSync(configPath)) {
	try {
		const content = fs.readFileSync(configPath, 'utf-8');
		config = normalizeServiceConfig(JSON.parse(content));
	} catch {
		logger.warn('service-config.json 读取失败，使用默认配置');
	}
}

// 支持环境变量覆盖
if (process.env.FALLBACK_MODE === 'true') {
	config.fallbackMode = true;
}
if (process.env.USE_GLOBAL_COOKIE === 'true') {
	config.useGlobalCookie = true;
}

export default config;
