import { styleText } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import colors from './util/colors';
import serviceConfig from './config/service-config';
import pkg from './package.json';
import app from './koaApp';

const parsedPort = Number.parseInt(process.env.PORT ?? '', 10);
const PORT: number = Number.isFinite(parsedPort) ? parsedPort : 3200;

// Service info (only when run directly, not imported as library)
const entryFile = process.argv[1] ? path.resolve(process.argv[1]) : '';
const currentFile = path.resolve(fileURLToPath(import.meta.url));
if (entryFile === currentFile) {
	console.log(styleText('green', '\n🎵 QQ Music API Service Starting...\n'));
	console.log(colors.info(`Current Version: ${pkg.version}`));
	console.log(colors.info(`Fallback Mode: ${serviceConfig.fallbackMode ? 'Enabled' : 'Disabled'}`));
	console.log(colors.info(`Use Global Cookie: ${serviceConfig.useGlobalCookie ? 'Yes' : 'No'}`));

	if (serviceConfig.fallbackMode) {
		console.log(styleText('green', '\n✅ 降级模式已启用：支持手动传递 Cookie\n'));
		console.log('使用方式:');
		console.log('  1. Query 参数：GET /api/endpoint?cookie=your_cookie');
		console.log('  2. Header: X-Custom-Cookie: your_cookie');
		console.log('  3. Header: Cookie: your_cookie\n');
	}

	if (!serviceConfig.useGlobalCookie) {
		console.log(styleText('yellow', '\n⚠️  全局 Cookie 未启用：需要登录的接口请手动传递 Cookie\n'));
	} else {
		console.log(styleText('green', '\n✅ 全局 Cookie 已启用\n'));

		if (!(global.userInfo.loginUin || global.userInfo.uin)) {
			console.log(
				styleText(
					'yellow',
					`😔 The configuration ${styleText('red', 'loginUin')} or your ${styleText('red', 'cookie')} in file ${styleText('green', 'config/user-info')} has not configured. \n`,
				),
			);
		}

		if (!global.userInfo.cookie) {
			console.log(
				styleText(
					'yellow',
					`😔 The configuration ${styleText('red', 'cookie')} in file ${styleText('green', 'config/user-info')} has not configured. \n`,
				),
			);
		}
	}

	const server = app.listen(PORT, () => {
		console.log(colors.prompt(`server running @ http://localhost:${PORT}`));
		console.log(colors.info(`open playground @ http://localhost:${PORT}/index.html`));
	});

	server.on('error', (error: NodeJS.ErrnoException) => {
		if (error.code === 'EADDRINUSE') {
			console.error(colors.error(`Port ${PORT} is already in use.`));
			console.error(colors.warn('Stop the existing process or set PORT to another value before running again.'));
			process.exit(1);
		}

		console.error(colors.error('Failed to start server.'));
		console.error(error);
		process.exit(1);
	});
}

export default app;
