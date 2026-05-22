import { execSync } from 'node:child_process';
import fs from 'node:fs';

console.log('Bumping version in package.json...');

try {
	const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
	const oldVersion = pkg.version;
	console.log(`Current version: ${oldVersion}`);

	execSync('npm version patch --no-git-tag-version --ignore-scripts', {
		stdio: 'inherit',
	});

	const newPkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
	const newVersion = newPkg.version;
	console.log(`Version bumped to ${newVersion}`);

	console.log('Generating CHANGELOG...');
	execSync('npm run changelog', { stdio: 'inherit' });
	console.log('CHANGELOG generated successfully');

	console.log('Generating version.json...');
	execSync('node scripts/generate-version.js', { stdio: 'inherit' });
	console.log('version.json generated successfully');

	if (process.env.GITHUB_OUTPUT) {
		fs.appendFileSync(process.env.GITHUB_OUTPUT, `new_version=${newVersion}\n`);
	}

	console.log(`New version: ${newVersion}`);
} catch (error) {
	console.error('Error during version bump:', error.message);
	console.error('Version bump failed. Please check the error messages above.');
	process.exit(1);
}
