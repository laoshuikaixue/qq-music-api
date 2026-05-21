import { exec, execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';

const execAsync = promisify(exec);
const execFileAsync = promisify(execFile);
const projectRoot = process.cwd();
const configDir = path.join(projectRoot, 'tests', 'output', 'package-entry-config');

const commandOptions = {
	cwd: projectRoot,
	env: {
		...process.env,
		QQ_MUSIC_API_CONFIG_DIR: configDir,
	},
	timeout: 60_000,
};

const runBuild = async () => execAsync('npm run build', commandOptions);

const runNode = async (args: string[]) =>
	execFileAsync(process.execPath, args, {
		cwd: projectRoot,
		env: {
			...process.env,
			QQ_MUSIC_API_CONFIG_DIR: configDir,
		},
		timeout: 60_000,
	});

describe('Package Entry Compatibility', () => {
	beforeAll(async () => {
		await runBuild();
	}, 60_000);

	test(
		'should load the package through the ESM import entry',
		async () => {
			const { stdout } = await runNode([
				'--input-type=module',
				'--eval',
				`
					const mod = await import('@sansenjian/qq-music-api');
					if (typeof mod.default?.callback !== 'function') {
						throw new Error('Expected ESM default export to be a Koa app');
					}
					console.log('esm ok');
				`,
			]);

			expect(stdout.trim()).toBe('esm ok');
		},
		60_000,
	);

	test(
		'should load the package through the CJS require entry',
		async () => {
			const { stdout } = await runNode([
				'--eval',
				`
					const mod = require('@sansenjian/qq-music-api');
					const app = mod.default || mod;
					if (typeof app.callback !== 'function') {
						throw new Error('Expected CJS export to be a Koa app');
					}
					console.log('cjs ok');
				`,
			]);

			expect(stdout.trim()).toBe('cjs ok');
		},
		60_000,
	);
});
