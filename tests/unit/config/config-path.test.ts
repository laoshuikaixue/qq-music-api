import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const importFresh = async <T>(modulePath: string): Promise<T> => {
	vi.resetModules();
	return import(modulePath) as Promise<T>;
};

describe('config modules', () => {
	let originalConfigDir: string | undefined;
	let originalCwd: string;

	beforeEach(() => {
		originalConfigDir = process.env.QQ_MUSIC_API_CONFIG_DIR;
		originalCwd = process.cwd();
	});

	afterEach(() => {
		if (originalConfigDir === undefined) {
			delete process.env.QQ_MUSIC_API_CONFIG_DIR;
		} else {
			process.env.QQ_MUSIC_API_CONFIG_DIR = originalConfigDir;
		}
		process.chdir(originalCwd);
	});

	test('default config path is stable and does not follow process cwd', async () => {
		delete process.env.QQ_MUSIC_API_CONFIG_DIR;
		const first = await importFresh<typeof import('../../../src/config/config-path')>('../../../src/config/config-path');
		const firstConfigDir = first.getConfigDir();

		const tempCwd = fs.mkdtempSync(path.join(os.tmpdir(), 'qq-music-api-cwd-'));
		process.chdir(tempCwd);

		const second = await importFresh<typeof import('../../../src/config/config-path')>('../../../src/config/config-path');
		expect(second.getConfigDir()).toBe(firstConfigDir);
		expect(firstConfigDir).toBe(path.join(originalCwd, 'config'));
	});

	test('default config path resolves back to the package config directory from built entries', async () => {
		const { resolveDefaultConfigDir } =
			await importFresh<typeof import('../../../src/config/config-path')>('../../../src/config/config-path');

		expect(resolveDefaultConfigDir(path.join(originalCwd, 'dist'))).toBe(path.join(originalCwd, 'config'));
		expect(resolveDefaultConfigDir(path.join(originalCwd, 'dist', 'config'))).toBe(path.join(originalCwd, 'config'));
		expect(resolveDefaultConfigDir(path.join(originalCwd, 'config'))).toBe(path.join(originalCwd, 'config'));
	});

	test('service config import does not create config files', async () => {
		const configDir = fs.mkdtempSync(path.join(os.tmpdir(), 'qq-music-api-config-'));
		fs.rmSync(configDir, { recursive: true, force: true });
		process.env.QQ_MUSIC_API_CONFIG_DIR = configDir;

		await importFresh<typeof import('../../../src/config/service-config')>('../../../src/config/service-config');

		expect(fs.existsSync(configDir)).toBe(false);
	});

	test('service config normalizes invalid fields to safe defaults', async () => {
		const { normalizeServiceConfig } =
			await importFresh<typeof import('../../../src/config/service-config')>('../../../src/config/service-config');

		expect(
			normalizeServiceConfig({
				fallbackMode: 'yes',
				useGlobalCookie: 1,
				cookieParamName: '   ',
			}),
		).toEqual({
			fallbackMode: true,
			useGlobalCookie: false,
			cookieParamName: 'cookie',
		});

		expect(
			normalizeServiceConfig({
				fallbackMode: false,
				useGlobalCookie: true,
				cookieParamName: 'auth_cookie',
			}),
		).toEqual({
			fallbackMode: false,
			useGlobalCookie: true,
			cookieParamName: 'auth_cookie',
		});
	});

	test('user info import does not create config files', async () => {
		const configDir = fs.mkdtempSync(path.join(os.tmpdir(), 'qq-music-api-config-'));
		fs.rmSync(configDir, { recursive: true, force: true });
		process.env.QQ_MUSIC_API_CONFIG_DIR = configDir;

		await importFresh<typeof import('../../../src/config/user-info')>('../../../src/config/user-info');

		expect(fs.existsSync(configDir)).toBe(false);
	});

	test('user info parser ignores malformed cookie fragments', async () => {
		const { normalizeUserInfo, parseCookieObject } =
			await importFresh<typeof import('../../../src/config/user-info')>('../../../src/config/user-info');

		expect(normalizeUserInfo({ loginUin: 123, cookie: ['bad'] }).loginUin).toBe('');
		expect(parseCookieObject('uin=o123; empty; qqmusic_key=abc=def; =bad')).toEqual({
			uin: 'o123',
			qqmusic_key: 'abc=def',
		});
	});

	test('refreshData creates the explicit config directory when persisting login state', async () => {
		const configDir = fs.mkdtempSync(path.join(os.tmpdir(), 'qq-music-api-config-'));
		fs.rmSync(configDir, { recursive: true, force: true });
		process.env.QQ_MUSIC_API_CONFIG_DIR = configDir;

		const { default: userInfo } = await importFresh<typeof import('../../../src/config/user-info')>('../../../src/config/user-info');
		userInfo.refreshData('uin=o123; qqmusic_key=abc');

		expect(JSON.parse(fs.readFileSync(path.join(configDir, 'user-info.json'), 'utf-8'))).toEqual({
			loginUin: 'o123',
			cookie: 'uin=o123; qqmusic_key=abc',
		});
	});
});
