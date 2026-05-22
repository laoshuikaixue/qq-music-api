import { exec, execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';

const execAsync = promisify(exec);
const execFileAsync = promisify(execFile);
const projectRoot = process.cwd();
const configDir = path.join(projectRoot, 'tests', 'output', 'package-entry-config');
const outputDir = path.join(projectRoot, 'tests', 'output', 'package-entry');

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

const waitForServerStart = (entry: string) =>
	new Promise<void>((resolve, reject) => {
		const child = execFile(process.execPath, [entry], {
			cwd: projectRoot,
			env: {
				...process.env,
				PORT: '0',
				QQ_MUSIC_API_CONFIG_DIR: configDir,
			},
			timeout: 60_000,
		});

		let completed = false;
		let output = '';

		const finish = (error?: Error) => {
			if (completed) return;
			completed = true;
			child.kill();
			if (error) {
				reject(error);
				return;
			}
			resolve();
		};

		const timer = setTimeout(() => {
			finish(new Error(`Timed out waiting for server start. Output:\n${output}`));
		}, 10_000);

		const collectOutput = (chunk: Buffer | string) => {
			output += chunk.toString();
			if (output.includes('server running @')) {
				clearTimeout(timer);
				finish();
			}
		};

		child.stdout?.on('data', collectOutput);
		child.stderr?.on('data', collectOutput);
		child.on('exit', code => {
			clearTimeout(timer);
			if (!completed) {
				finish(new Error(`Server process exited with code ${code}. Output:\n${output}`));
			}
		});
	});

describe('Package Entry Compatibility', () => {
	beforeAll(async () => {
		await runBuild();
	}, 60_000);

	beforeEach(() => {
		fs.rmSync(configDir, { recursive: true, force: true });
	});

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
			expect(fs.existsSync(configDir)).toBe(false);
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
			expect(fs.existsSync(configDir)).toBe(false);
		},
		60_000,
	);

	test(
		'should start the CLI when invoked through a symlinked bin path',
		async () => {
			fs.mkdirSync(outputDir, { recursive: true });
			const realEntry = path.join(projectRoot, 'dist', 'app.js');
			const symlinkEntry = path.join(outputDir, 'qq-music-api-bin.mjs');
			fs.rmSync(symlinkEntry, { force: true });
			fs.symlinkSync(realEntry, symlinkEntry);

			await waitForServerStart(symlinkEntry);
		},
		60_000,
	);
});
