import type { Mock } from 'vitest';
import getAlbumInfoController from '../../../src/controllers/getAlbumInfo';
import { getAlbumInfo } from '../../../src/services';

vi.mock('../../../src/services');

describe('controllers/getAlbumInfo', () => {
  let mockCtx: any;
  let mockNext: Mock;
  let consoleErrorSpy: any;

  beforeEach(() => {
    mockCtx = {
      status: 200,
      body: null,
      query: {}
    };
    mockNext = vi.fn();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('should return 400 when albummid is missing', async () => {
    mockCtx.query = {};

    await getAlbumInfoController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(400);
    expect(mockCtx.body).toEqual({
      response: '缺少必需参数：albummid'
    });
    expect(getAlbumInfo).not.toHaveBeenCalled();
  });

  test('should call getAlbumInfo with albummid param', async () => {
    mockCtx.query = { albummid: 'test123' };
    (getAlbumInfo as Mock).mockResolvedValue({ status: 200, body: { code: 0, data: {} } });

    await getAlbumInfoController(mockCtx, mockNext);

    expect(getAlbumInfo).toHaveBeenCalledWith({
      method: 'get',
      params: { albummid: 'test123' },
      option: {}
    });
  });

  test('should assign response to ctx when albummid is provided', async () => {
    mockCtx.query = { albummid: 'test123' };
    const mockResponse = {
      status: 200,
      body: { code: 0, data: { album: { name: 'Test Album' } } }
    };
    (getAlbumInfo as Mock).mockResolvedValue(mockResponse);

    await getAlbumInfoController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(200);
    expect(mockCtx.body).toEqual({ code: 0, data: { album: { name: 'Test Album' } } });
  });

  test('should handle empty string albummid', async () => {
    mockCtx.query = { albummid: '' };

    await getAlbumInfoController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(400);
    expect(getAlbumInfo).not.toHaveBeenCalled();
  });

  test('should handle errors from getAlbumInfo', async () => {
    mockCtx.query = { albummid: 'test123' };
    const mockError = new Error('Album info error');
    (getAlbumInfo as Mock).mockRejectedValue(mockError);

    await getAlbumInfoController(mockCtx, mockNext);

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(mockCtx.status).toBe(500);
    expect(mockCtx.body).toEqual({ error: '服务器内部错误' });
  });
});
