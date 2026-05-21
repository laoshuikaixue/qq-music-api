import fs from 'node:fs';
import path from 'node:path';

interface UserInfo {
	loginUin: string;
	uin?: string;
	cookie: string;
	cookieList: string[];
	cookieObject: Record<string, string>;
	refreshData: (cookie: string) => any;
	[key: string]: any;
}

let userInfo: UserInfo = { loginUin: '', cookie: '', cookieList: [], cookieObject: {}, refreshData: () => ({}) };
let cookieList: string[] = [];
let cookieObject: Record<string, string> = {};

const configDir = process.env.QQ_MUSIC_API_CONFIG_DIR
	? path.resolve(process.env.QQ_MUSIC_API_CONFIG_DIR)
	: path.resolve(process.cwd(), 'config');
const infoPath = path.join(configDir, 'user-info.json');

fs.mkdirSync(configDir, { recursive: true });
if (!fs.existsSync(infoPath)) {
	fs.writeFileSync(infoPath, '{}', 'utf-8');
}

const initData = () => {
	try {
		const parsed = JSON.parse(fs.readFileSync(infoPath, 'utf-8'));
		userInfo = {
			loginUin: parsed.loginUin || '',
			cookie: parsed.cookie || '',
			cookieList: [],
			cookieObject: {},
			refreshData: () => ({}),
		};
	} catch {
		userInfo = { loginUin: '', cookie: '', cookieList: [], cookieObject: {}, refreshData: () => ({}) };
	}
	cookieList = (userInfo.cookie || '').split('; ').map(_ => _.trim());

	cookieObject = {};
	cookieList.filter(Boolean).forEach(_ => {
		if (_) {
			const [key, value = ''] = _.split('=');
			cookieObject[key] = value;
		}
	});
};

const refreshData = (cookie: string) => {
	const uinMatch = cookie.match(/ uin=([^;]+)/);
	const uin = uinMatch ? uinMatch[1] : '';
	fs.writeFileSync(infoPath, JSON.stringify({ loginUin: uin, cookie }), 'utf-8');
	initData();
	return {
		...userInfo,
		uin: userInfo.loginUin || cookieObject.uin,
		cookieList,
		cookieObject,
	};
};

initData();

const exportObj: UserInfo = {
	loginUin: userInfo?.loginUin || '',
	uin: userInfo?.loginUin || cookieObject?.uin || '',
	cookie: userInfo?.cookie || '',
	cookieList: cookieList || [],
	cookieObject: cookieObject || {},
	refreshData,
};

export default exportObj as UserInfo;
