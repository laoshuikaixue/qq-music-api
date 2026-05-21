/**
 * 运行测试并生成带 flags 的覆盖率报告
 *
 * 用法:
 * - 运行所有测试：npm run test:flags
 * - 只运行单元测试：npm run test:flags:unit
 *
 * 注意：此脚本通过 tsx 运行，不使用 ts-node
 */

import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const COVERAGE_DIR = path.join(ROOT_DIR, 'coverage');
const VITEST_BIN = path.join(ROOT_DIR, 'node_modules', 'vitest', 'vitest.mjs');
const COVERAGE_ARGS = [
	'--coverage',
	'--coverage.thresholds.lines=0',
	'--coverage.thresholds.functions=0',
	'--coverage.thresholds.branches=0',
	'--coverage.thresholds.statements=0',
];

// 确保覆盖率目录存在
if (!fs.existsSync(COVERAGE_DIR)) {
	fs.mkdirSync(COVERAGE_DIR, { recursive: true });
}

/**
 * 运行 Vitest
 * @param args - Vitest 命令行参数数组
 * @param env - 环境变量
 */
function runVitest(args: string[], env: Record<string, string> = {}) {
	try {
		execFileSync(process.execPath, [VITEST_BIN, 'run', ...COVERAGE_ARGS, ...args], {
			stdio: 'inherit',
			env: { ...process.env, ...env },
			cwd: ROOT_DIR,
		});
	} catch (error) {
		console.error(`命令执行失败：vitest run ${[...COVERAGE_ARGS, ...args].join(' ')}`);
		throw error;
	}
}

function runUnitTests() {
	console.log('\n🧪 运行单元测试...\n');

	runVitest(['tests/unit'], {
		COVERAGE_FILE: 'coverage/unit-coverage.json',
	});

	// 移动覆盖率文件
	const coverageFile = path.join(COVERAGE_DIR, 'coverage-final.json');
	if (fs.existsSync(coverageFile)) {
		const unitCoverageFile = path.join(COVERAGE_DIR, 'unit-coverage-final.json');
		fs.copyFileSync(coverageFile, unitCoverageFile);
		console.log(`✅ 单元测试覆盖率已保存到：${unitCoverageFile}`);
	}
}

function runAllTests() {
	console.log('\n🧪 运行所有测试...\n');

	runVitest([], {
		COVERAGE_FILE: 'coverage/all-coverage.json',
	});

	// 移动覆盖率文件
	const coverageFile = path.join(COVERAGE_DIR, 'coverage-final.json');
	if (fs.existsSync(coverageFile)) {
		const allCoverageFile = path.join(COVERAGE_DIR, 'all-coverage-final.json');
		fs.copyFileSync(coverageFile, allCoverageFile);
		console.log(`✅ 所有测试覆盖率已保存到：${allCoverageFile}`);
	}
}

function main() {
	const args = process.argv.slice(2);
	const testType = args[0] || 'all';

	console.log('🚀 开始运行测试...\n');

	try {
		if (testType === 'unit') {
			runUnitTests();
		} else if (testType === 'all') {
			runAllTests();
		} else {
			console.error(`❌ 未知的测试类型：${testType}`);
			console.error('可用选项：unit, all');
			process.exit(1);
		}

		console.log('\n✅ 测试完成！\n');
	} catch {
		console.error('\n❌ 测试失败！\n');
		process.exit(1);
	}
}

main();
