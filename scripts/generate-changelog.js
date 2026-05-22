import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const changelogPath = 'CHANGELOG.md';
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = pkg.version;
const today = new Date().toISOString().slice(0, 10);

const runGit = (args, fallback = '') => {
	try {
		return execFileSync('git', args, { encoding: 'utf8' }).trim();
	} catch {
		return fallback;
	}
};

const normalizeRepositoryUrl = url =>
	String(url || '')
		.replace(/^git\+/, '')
		.replace(/^ssh:\/\/git@github\.com\//, 'https://github.com/')
		.replace(/^git@github\.com:/, 'https://github.com/')
		.replace(/\.git$/, '');

const repositoryUrl = normalizeRepositoryUrl(pkg.repository?.url);
const existingChangelog = fs.existsSync(changelogPath) ? fs.readFileSync(changelogPath, 'utf8') : '';
const versionHeadingPattern = new RegExp(`^## \\[?${version.replaceAll('.', '\\.')}\\]?\\b`, 'm');

if (versionHeadingPattern.test(existingChangelog)) {
	console.log(`CHANGELOG already contains version ${version}`);
	process.exit(0);
}

const latestTag = runGit(['describe', '--tags', '--abbrev=0'], '');
const range = latestTag ? `${latestTag}..HEAD` : 'HEAD';
const gitLog = runGit(['log', '--no-merges', '--format=%H%x1f%s', range], '');

const groups = [
	{ title: 'Features', types: ['feat'] },
	{ title: 'Bug Fixes', types: ['fix'] },
	{ title: 'Performance Improvements', types: ['perf'] },
	{ title: 'Documentation', types: ['docs'] },
	{ title: 'Build System', types: ['build', 'ci'] },
	{ title: 'Tests', types: ['test'] },
	{ title: 'Code Refactoring', types: ['refactor'] },
	{ title: 'Other Changes', types: ['chore', 'style', 'revert', 'other'] },
];

const entries = new Map(groups.map(group => [group.title, []]));

const parseCommit = line => {
	const [hash, subject = ''] = line.split('\x1f');
	const conventionalMatch = subject.match(/^(\w+)(?:\([^)]+\))?(!)?:\s*(.+)$/);
	const type = conventionalMatch?.[1] || 'other';
	const message = conventionalMatch?.[3] || subject;
	const group = groups.find(item => item.types.includes(type)) || groups[groups.length - 1];
	const shortHash = hash.slice(0, 7);
	const hashText = repositoryUrl ? `[${shortHash}](${repositoryUrl}/commit/${hash})` : shortHash;

	entries.get(group.title)?.push(`* ${message} (${hashText})`);
};

if (gitLog) {
	gitLog.split('\n').filter(Boolean).forEach(parseCommit);
}

const lines = [`## ${version} (${today})`, ''];

let hasEntries = false;
for (const group of groups) {
	const groupEntries = entries.get(group.title) || [];
	if (groupEntries.length === 0) continue;

	hasEntries = true;
	lines.push(`### ${group.title}`, '', ...groupEntries, '');
}

if (!hasEntries) {
	lines.push('* No notable changes.', '');
}

const nextChangelog = `${lines.join('\n')}\n${existingChangelog}`.trimEnd() + '\n';
fs.writeFileSync(changelogPath, nextChangelog);
console.log(`CHANGELOG generated for ${version}`);
