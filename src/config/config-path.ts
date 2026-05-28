import path from 'node:path';
import { fileURLToPath } from 'node:url';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const configDirName = 'config';
const distDirName = 'dist';
const srcDirName = 'src';

const resolvePackageRoot = (fromDir: string): string => {
	const baseName = path.basename(fromDir);

	if (baseName === configDirName) {
		const parentDir = path.dirname(fromDir);
		if (path.basename(parentDir) === srcDirName) return path.dirname(parentDir);
		return path.basename(parentDir) === distDirName ? path.dirname(parentDir) : parentDir;
	}

	if (baseName === srcDirName) {
		return path.dirname(fromDir);
	}

	return baseName === distDirName ? path.dirname(fromDir) : fromDir;
};

export const resolveDefaultConfigDir = (fromDir: string = moduleDir): string =>
	path.join(resolvePackageRoot(fromDir), configDirName);

export const getConfigDir = (): string => {
	if (process.env.QQ_MUSIC_API_CONFIG_DIR) {
		return path.resolve(process.env.QQ_MUSIC_API_CONFIG_DIR);
	}

	return resolveDefaultConfigDir();
};

export const resolveConfigPath = (filename: string): string => path.join(getConfigDir(), filename);
