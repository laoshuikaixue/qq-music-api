import type { Mock } from 'vitest';
import getSearchByKeyController from '../../../src/controllers/getSearchByKey';
import { getSearchByKey } from '../../../src/services';

vi.mock('../../../src/services');

describe('controllers/getSearchByKey', () => {
  let mockCtx: any;
  let mockNext: Mock;
  let consoleErrorSpy: any;

  beforeEach(() => {
    mockCtx = {
      status: 200,
      body: null,
      query: {},
      params: {}
    };
    mockNext = vi.fn();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('should return 400 when search key is missing', async () => {
    mockCtx.query = {};
    mockCtx.params = {};

    await getSearchByKeyController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(400);
    expect(mockCtx.body).toEqual({ response: 'search key is null' });
    expect(getSearchByKey).not.toHaveBeenCalled();
  });

  test('should use query.key when provided', async () => {
    mockCtx.query = { key: 'test music' };
    mockCtx.params = {};
    (getSearchByKey as Mock).mockResolvedValue({ status: 200, body: { code: 0, data: {} } });

    await getSearchByKeyController(mockCtx, mockNext);

    expect(getSearchByKey).toHaveBeenCalledWith({
      method: 'get',
      params: {
        w: 'test music',
        n: 10,
        p: 1,
        catZhida: 1,
        remoteplace: 'txt.yqq.song'
      },
      option: {}
    });
  });

  test('should use params.key when query.key is not provided', async () => {
    mockCtx.query = {};
    mockCtx.params = { key: 'param key' };
    (getSearchByKey as Mock).mockResolvedValue({ status: 200, body: {} });

    await getSearchByKeyController(mockCtx, mockNext);

    expect(getSearchByKey).toHaveBeenCalledWith({
      method: 'get',
      params: {
        w: 'param key',
        n: 10,
        p: 1,
        catZhida: 1,
        remoteplace: 'txt.yqq.song'
      },
      option: {}
    });
  });

  test('should prefer query.key over params.key', async () => {
    mockCtx.query = { key: 'query key' };
    mockCtx.params = { key: 'param key' };
    (getSearchByKey as Mock).mockResolvedValue({ status: 200, body: {} });

    await getSearchByKeyController(mockCtx, mockNext);

    expect(getSearchByKey).toHaveBeenCalledWith({
      method: 'get',
      params: {
        w: 'query key',
        n: 10,
        p: 1,
        catZhida: 1,
        remoteplace: 'txt.yqq.song'
      },
      option: {}
    });
  });

  test('should accept limit param', async () => {
    mockCtx.query = { key: 'test', limit: '50' };
    (getSearchByKey as Mock).mockResolvedValue({ status: 200, body: {} });

    await getSearchByKeyController(mockCtx, mockNext);

    expect(getSearchByKey).toHaveBeenCalledWith({
      method: 'get',
      params: {
        w: 'test',
        n: 50,
        p: 1,
        catZhida: 1,
        remoteplace: 'txt.yqq.song'
      },
      option: {}
    });
  });

  test('should accept page param', async () => {
    mockCtx.query = { key: 'test', page: '5' };
    (getSearchByKey as Mock).mockResolvedValue({ status: 200, body: {} });

    await getSearchByKeyController(mockCtx, mockNext);

    expect(getSearchByKey).toHaveBeenCalledWith({
      method: 'get',
      params: {
        w: 'test',
        n: 10,
        p: 5,
        catZhida: 1,
        remoteplace: 'txt.yqq.song'
      },
      option: {}
    });
  });

  test('should accept catZhida param', async () => {
    mockCtx.query = { key: 'test', catZhida: '0' };
    (getSearchByKey as Mock).mockResolvedValue({ status: 200, body: {} });

    await getSearchByKeyController(mockCtx, mockNext);

    expect(getSearchByKey).toHaveBeenCalledWith({
      method: 'get',
      params: {
        w: 'test',
        n: 10,
        p: 1,
        catZhida: 1,
        remoteplace: 'txt.yqq.song'
      },
      option: {}
    });
  });

  test('should accept truthy catZhida param', async () => {
    mockCtx.query = { key: 'test', catZhida: '5' };
    (getSearchByKey as Mock).mockResolvedValue({ status: 200, body: {} });

    await getSearchByKeyController(mockCtx, mockNext);

    expect(getSearchByKey).toHaveBeenCalledWith({
      method: 'get',
      params: {
        w: 'test',
        n: 10,
        p: 1,
        catZhida: 5,
        remoteplace: 'txt.yqq.song'
      },
      option: {}
    });
  });

  test('should accept remoteplace param', async () => {
    mockCtx.query = { key: 'test', remoteplace: 'album' };
    (getSearchByKey as Mock).mockResolvedValue({ status: 200, body: {} });

    await getSearchByKeyController(mockCtx, mockNext);

    expect(getSearchByKey).toHaveBeenCalledWith({
      method: 'get',
      params: {
        w: 'test',
        n: 10,
        p: 1,
        catZhida: 1,
        remoteplace: 'txt.yqq.album'
      },
      option: {}
    });
  });

  test('should handle invalid numeric params', async () => {
    mockCtx.query = { key: 'test', limit: 'abc', page: 'xyz' };
    (getSearchByKey as Mock).mockResolvedValue({ status: 200, body: {} });

    await getSearchByKeyController(mockCtx, mockNext);

    expect(getSearchByKey).toHaveBeenCalledWith({
      method: 'get',
      params: {
        w: 'test',
        n: 10,
        p: 1,
        catZhida: 1,
        remoteplace: 'txt.yqq.song'
      },
      option: {}
    });
  });

  test('should assign response to ctx', async () => {
    mockCtx.query = { key: 'test' };
    const mockResponse = {
      status: 200,
      body: { code: 0, data: { song: { list: [] } } }
    };
    (getSearchByKey as Mock).mockResolvedValue(mockResponse);

    await getSearchByKeyController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(200);
    expect(mockCtx.body).toEqual({ code: 0, data: { song: { list: [] } } });
  });

  test('should handle errors from getSearchByKey', async () => {
    mockCtx.query = { key: 'test' };
    const mockError = new Error('Search error');
    (getSearchByKey as Mock).mockRejectedValue(mockError);

    await getSearchByKeyController(mockCtx, mockNext);

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(mockCtx.status).toBe(502);
    expect(mockCtx.body).toEqual({ error: '上游服务异常' });
  });
});
