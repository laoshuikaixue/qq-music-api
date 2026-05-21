import { Router } from '@koa/router';
import context from './context';

const router = new Router();

// User
router.get('/user/getCookie', context.getCookie);
router.get('/user/setCookie', context.setCookie);
router.get('/user/getUserPlaylists', context.getUserPlaylists);
router.get('/user/getUserAvatar', context.getUserAvatar);
router.get('/user/getUserLikedSongs', context.getUserLikedSongs);

// Download
router.get('/downloadQQMusic', context.getDownloadQQMusic);

// Search
router.get('/getHotkey', context.getHotKey);
router.get('/getSearchByKey/:key', context.getSearchByKey);
router.get('/getSearchByKey', context.getSearchByKey);
router.get('/getSmartbox/:key', context.getSmartbox);
router.get('/getSmartbox', context.getSmartbox);

// Song lists
router.get('/getSongListCategories', context.getSongListCategories);
router.get('/getSongLists/:page/:limit/:categoryId/:sortId', context.getSongLists);
router.get('/getSongLists', context.getSongLists);
router.post('/batchGetSongLists', context.batchGetSongLists);
router.get('/getSongInfo/:songmid', context.getSongInfo);
router.get('/getSongInfo', context.getSongInfo);
router.post('/batchGetSongInfo', context.batchGetSongInfo);
router.get('/getSongListDetail/:disstid', context.getSongListDetail);
router.get('/getSongListDetail', context.getSongListDetail);
router.get('/getNewDisks', context.getNewDisks);

// MV
router.get('/getMvByTag', context.getMvByTag);
router.get('/getMv', context.getMv);
router.get('/getMvPlay', context.getMvPlay);

// Singer
router.get('/getSingerList', context.getSingerList);
router.get('/getSimilarSinger', context.getSimilarSinger);
router.get('/getSingerAlbum', context.getSingerAlbum);
router.get('/getSingerHotsong', context.getSingerHotsong);
router.get('/getSingerMv', context.getSingerMv);
router.get('/getSingerDesc', context.getSingerDesc);
router.get('/getSingerStarNum', context.getSingerStarNum);

// Radio & Digital Album
router.get('/getRadioLists', context.getRadioLists);
router.get('/getDigitalAlbumLists', context.getDigitalAlbumLists);

// Music & Lyric
router.get('/getLyric/:songmid', context.getLyric);
router.get('/getLyric', context.getLyric);
router.get('/getMusicPlay/:songmid', context.getMusicPlay);
router.get('/getMusicPlay', context.getMusicPlay);
router.get('/getAlbumInfo/:albummid', context.getAlbumInfo);
router.get('/getAlbumInfo', context.getAlbumInfo);
router.get('/getComments', context.getComments);

// Recommend
router.get('/getRecommend', context.getRecommend);
router.get('/getTopLists', context.getTopLists);
router.get('/getRanks', context.getRanks);

// Utility
router.get('/getTicketInfo', context.getTicketInfo);
router.get('/getImageUrl', context.getImageUrl);

// QQ Login
router.get('/getQQLoginQr', context.getQQLoginQr);
router.get('/user/getQQLoginQr', context.getQQLoginQr);
router.post('/checkQQLoginQr', context.checkQQLoginQr);
router.post('/user/checkQQLoginQr', context.checkQQLoginQr);

// Personal recommend
router.get('/getDailyRecommend', context.getDailyRecommend);
router.get('/getPrivateFM', context.getPrivateFM);
router.get('/getNewSongs', context.getNewSongs);
router.get('/getPersonalRecommend', context.getPersonalRecommend);
router.get('/getSimilarSongs', context.getSimilarSongs);

// Extended features
router.get('/getPlaylistTags', context.getPlaylistTags);
router.get('/getPlaylistsByTag', context.getPlaylistsByTag);
router.get('/getHotComments', context.getHotComments);
router.get('/getSingerListByArea', context.getSingerListByArea);

export default router;
