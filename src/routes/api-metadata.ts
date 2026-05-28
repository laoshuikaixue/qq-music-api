export type ApiMethod = 'GET' | 'POST' | 'DELETE';

export interface ApiParamMetadata {
	name: string;
	required?: boolean;
	description?: string;
}

export interface ApiMetadataItem {
	name: string;
	category: string;
	method: ApiMethod;
	path: string;
	aliases?: string[];
	queryParams?: ApiParamMetadata[];
	pathParams?: ApiParamMetadata[];
	bodyExample?: unknown;
	authRequired?: boolean;
	cookieRequired?: boolean;
}

export const apiMetadata: ApiMetadataItem[] = [
	{ name: 'getCookie', category: 'user', method: 'GET', path: '/user/getCookie' },
	{ name: 'setCookie', category: 'user', method: 'GET', path: '/user/setCookie', queryParams: [{ name: 'cookie', required: true }] },
	{ name: 'getUserPlaylists', category: 'user', method: 'GET', path: '/user/getUserPlaylists', queryParams: [{ name: 'uin', required: true }] },
	{ name: 'getUserAvatar', category: 'user', method: 'GET', path: '/user/getUserAvatar', queryParams: [{ name: 'uin' }, { name: 'k' }, { name: 'size' }] },
	{ name: 'getUserLikedSongs', category: 'user', method: 'GET', path: '/user/getUserLikedSongs', cookieRequired: true },
	{ name: 'getDownloadQQMusic', category: 'download', method: 'GET', path: '/downloadQQMusic' },
	{ name: 'getHotKey', category: 'search', method: 'GET', path: '/getHotkey' },
	{ name: 'getSearchByKey', category: 'search', method: 'GET', path: '/getSearchByKey', aliases: ['/getSearchByKey/:key'], queryParams: [{ name: 'key' }, { name: 'limit' }, { name: 'page' }] },
	{ name: 'getSmartbox', category: 'search', method: 'GET', path: '/getSmartbox', aliases: ['/getSmartbox/:key'], queryParams: [{ name: 'key' }] },
	{ name: 'getSongListCategories', category: 'playlist', method: 'GET', path: '/getSongListCategories' },
	{ name: 'getSongLists', category: 'playlist', method: 'GET', path: '/getSongLists', aliases: ['/getSongLists/:page/:limit/:categoryId/:sortId'] },
	{ name: 'batchGetSongLists', category: 'playlist', method: 'POST', path: '/batchGetSongLists', bodyExample: { ids: ['123'] } },
	{ name: 'getSongInfo', category: 'music', method: 'GET', path: '/getSongInfo', aliases: ['/getSongInfo/:songmid'] },
	{ name: 'batchGetSongInfo', category: 'music', method: 'POST', path: '/batchGetSongInfo', bodyExample: { songs: [['songmid', 'songid']] } },
	{ name: 'getSongListDetail', category: 'playlist', method: 'GET', path: '/getSongListDetail', aliases: ['/getSongListDetail/:disstid'] },
	{ name: 'getNewDisks', category: 'album', method: 'GET', path: '/getNewDisks' },
	{ name: 'getMvByTag', category: 'mv', method: 'GET', path: '/getMvByTag' },
	{ name: 'getMv', category: 'mv', method: 'GET', path: '/getMv' },
	{ name: 'getMvPlay', category: 'mv', method: 'GET', path: '/getMvPlay', queryParams: [{ name: 'vid', required: true }] },
	{ name: 'getSingerList', category: 'singer', method: 'GET', path: '/getSingerList' },
	{ name: 'getSimilarSinger', category: 'singer', method: 'GET', path: '/getSimilarSinger' },
	{ name: 'getSingerAlbum', category: 'singer', method: 'GET', path: '/getSingerAlbum' },
	{ name: 'getSingerHotsong', category: 'singer', method: 'GET', path: '/getSingerHotsong' },
	{ name: 'getSingerMv', category: 'singer', method: 'GET', path: '/getSingerMv' },
	{ name: 'getSingerDesc', category: 'singer', method: 'GET', path: '/getSingerDesc' },
	{ name: 'getSingerStarNum', category: 'singer', method: 'GET', path: '/getSingerStarNum' },
	{ name: 'getRadioLists', category: 'radio', method: 'GET', path: '/getRadioLists' },
	{ name: 'getDigitalAlbumLists', category: 'album', method: 'GET', path: '/getDigitalAlbumLists' },
	{ name: 'getLyric', category: 'music', method: 'GET', path: '/getLyric', aliases: ['/getLyric/:songmid'], queryParams: [{ name: 'songmid', required: true }], cookieRequired: true },
	{ name: 'getMusicPlay', category: 'music', method: 'GET', path: '/getMusicPlay', aliases: ['/getMusicPlay/:songmid'], queryParams: [{ name: 'songmid', required: true }], cookieRequired: true },
	{ name: 'getAlbumInfo', category: 'album', method: 'GET', path: '/getAlbumInfo', aliases: ['/getAlbumInfo/:albummid'], queryParams: [{ name: 'albummid', required: true }] },
	{ name: 'getComments', category: 'comments', method: 'GET', path: '/getComments' },
	{ name: 'getRecommend', category: 'recommend', method: 'GET', path: '/getRecommend' },
	{ name: 'getTopLists', category: 'rank', method: 'GET', path: '/getTopLists' },
	{ name: 'getRanks', category: 'rank', method: 'GET', path: '/getRanks' },
	{ name: 'getTicketInfo', category: 'utility', method: 'GET', path: '/getTicketInfo' },
	{ name: 'getImageUrl', category: 'utility', method: 'GET', path: '/getImageUrl' },
	{ name: 'getQQLoginQr', category: 'login', method: 'GET', path: '/getQQLoginQr', aliases: ['/user/getQQLoginQr'] },
	{ name: 'checkQQLoginQr', category: 'login', method: 'POST', path: '/checkQQLoginQr', aliases: ['/user/checkQQLoginQr'] },
	{ name: 'getDailyRecommend', category: 'recommend', method: 'GET', path: '/getDailyRecommend', cookieRequired: true },
	{ name: 'getPrivateFM', category: 'recommend', method: 'GET', path: '/getPrivateFM', cookieRequired: true },
	{ name: 'getNewSongs', category: 'recommend', method: 'GET', path: '/getNewSongs' },
	{ name: 'getPersonalRecommend', category: 'recommend', method: 'GET', path: '/getPersonalRecommend', cookieRequired: true },
	{ name: 'getSimilarSongs', category: 'recommend', method: 'GET', path: '/getSimilarSongs', queryParams: [{ name: 'songmid', required: true }] },
	{ name: 'getPlaylistTags', category: 'playlist', method: 'GET', path: '/getPlaylistTags' },
	{ name: 'getPlaylistsByTag', category: 'playlist', method: 'GET', path: '/getPlaylistsByTag' },
	{ name: 'getHotComments', category: 'comments', method: 'GET', path: '/getHotComments' },
	{ name: 'getSingerListByArea', category: 'singer', method: 'GET', path: '/getSingerListByArea' },
];

export const apiMetadataPaths = apiMetadata.flatMap(item => [item.path, ...(item.aliases || [])]);
