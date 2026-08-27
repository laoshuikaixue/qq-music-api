export const hash33 = (t: string): number => {
	let e = 0;
	for (let n = 0, o = t.length; n < o; ++n) {
		e += (e << 5) + t.charCodeAt(n);
	}
	return 2147483647 & e;
};

export const toBooleanParam = (value: unknown): boolean => {
	return value === true || value === '1' || value === 'true';
};

export const getGtk = (p_skey: string): number => {
	const str = p_skey;
	let hash = 5381;
	for (let i = 0, len = str.length; i < len; ++i) {
		hash += (hash << 5) + str.charCodeAt(i);
	}
	return hash & 0x7fffffff;
};

export const getGuid = (): string => {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
		.replace(/[xy]/g, function (c) {
			const r = (Math.random() * 16) | 0;
			const v = c === 'x' ? r : (r & 0x3) | 0x8;
			return v.toString(16);
		})
		.toUpperCase();
};

export interface LoginSession {
	loginUin: string;
	uin: string;
	euin?: string;
	cookie: string;
	cookieList: string[];
	cookieObject: Record<string, string>;
}

export const REQUEST_TIMEOUT_MS = 10000;

export const fetchWithTimeout = async (input: string, init: RequestInit = {}, timeout = REQUEST_TIMEOUT_MS) => {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeout);

	try {
		return await fetch(input, {
			...init,
			signal: controller.signal,
		});
	} finally {
		clearTimeout(timer);
	}
};

export const parseSetCookie = (setCookieHeader: string | null): string[] => {
	if (!setCookieHeader) return [];
	const cookies: string[] = [];
	const parts = setCookieHeader.split(/,(?=\s*[a-zA-Z_]+=)/);
	for (const part of parts) {
		const cookiePair = part.split(';')[0].trim();
		if (cookiePair && cookiePair.includes('=') && cookiePair.split('=')[1]) {
			cookies.push(cookiePair);
		}
	}
	return cookies;
};

export const buildLoginSession = (cookie: string): LoginSession => {
	const cookieList = cookie
		.split(';')
		.map(item => item.trim())
		.filter(Boolean);

	const cookieObject: Record<string, string> = {};
	cookieList.forEach(item => {
		// 仅按首个 = 分隔键值，保证值中的 = （base64 填充等）不丢失
		const separator = item.indexOf('=');
		const key = separator === -1 ? '' : item.slice(0, separator);
		const value = separator === -1 ? '' : item.slice(separator + 1);
		if (key && value) {
			cookieObject[key] = value;
		}
	});

	const loginUin = cookieObject.uin || '';

	return {
		loginUin,
		uin: loginUin,
		cookie,
		cookieList,
		cookieObject,
	};
};
