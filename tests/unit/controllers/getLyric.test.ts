import type { Mock } from 'vitest';
import getLyricController from '../../../src/controllers/getLyric';
import { getLyric } from '../../../src/services';

vi.mock('../../../src/services');

describe('controllers/getLyric', () => {
  let mockCtx: any;
  let mockNext: Mock;
  let consoleErrorSpy: any;

  beforeEach(() => {
    mockCtx = {
      status: 200,
      body: null,
      query: {},
      params: {},
      headers: {},
      request: {}
    };
    mockNext = vi.fn();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('should return 400 when songmid is missing in both query and path', async () => {
    mockCtx.query = {};
    mockCtx.params = {};

    await getLyricController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(400);
    expect(mockCtx.body).toEqual({ response: 'no songmid' });
    expect(getLyric).not.toHaveBeenCalled();
  });

  test('should call getLyric with songmid param', async () => {
    mockCtx.query = { songmid: 'test123' };
    (getLyric as Mock).mockResolvedValue({ status: 200, body: { code: 0, data: {} } });

    await getLyricController(mockCtx, mockNext);

    expect(getLyric).toHaveBeenCalledWith(expect.objectContaining({
      method: 'get',
      params: { songmid: 'test123' },
      option: { headers: {} }
    }));
  });

  test('should use path param songmid when query is missing', async () => {
    mockCtx.params = { songmid: 'path-songmid' };
    (getLyric as Mock).mockResolvedValue({ status: 200, body: { code: 0, data: {} } });

    await getLyricController(mockCtx, mockNext);

    expect(getLyric).toHaveBeenCalledWith(expect.objectContaining({
      params: { songmid: 'path-songmid' }
    }));
  });

  test('should inject cookie header when cookie is provided in query', async () => {
    mockCtx.query = { songmid: 'test123', cookie: 'uin=o123; qqmusic_key=abc' };
    (getLyric as Mock).mockResolvedValue({ status: 200, body: { code: 0, data: {} } });

    await getLyricController(mockCtx, mockNext);

    expect(getLyric).toHaveBeenCalledWith(expect.objectContaining({
      option: {
        headers: {
          Cookie: 'uin=o123; qqmusic_key=abc'
        }
      }
    }));
  });

  test('should inject cookie header when cookie is provided in headers', async () => {
    mockCtx.query = { songmid: 'test123' };
    mockCtx.headers = {
      ...mockCtx.headers,
      cookie: 'uin=o456; qqmusic_key=xyz'
    };
    (getLyric as Mock).mockResolvedValue({ status: 200, body: { code: 0, data: {} } });

    await getLyricController(mockCtx, mockNext);

    expect(getLyric).toHaveBeenCalledWith(expect.objectContaining({
      option: {
        headers: {
          Cookie: 'uin=o456; qqmusic_key=xyz'
        }
      }
    }));
  });

  test('should prefer cookie from query over headers when both are provided', async () => {
    mockCtx.query = { songmid: 'test123', cookie: 'uin=o123; qqmusic_key=query' };
    mockCtx.headers = {
      ...mockCtx.headers,
      cookie: 'uin=o789; qqmusic_key=header'
    };
    (getLyric as Mock).mockResolvedValue({ status: 200, body: { code: 0, data: {} } });

    await getLyricController(mockCtx, mockNext);

    expect(getLyric).toHaveBeenCalledWith(expect.objectContaining({
      option: {
        headers: {
          Cookie: 'uin=o123; qqmusic_key=query'
        }
      }
    }));
  });

  test('should assign response to ctx when songmid is provided', async () => {
    mockCtx.query = { songmid: 'test123' };
    const mockResponse = {
      status: 200,
      body: { code: 0, data: { lyric: 'test lyric' } }
    };
    (getLyric as Mock).mockResolvedValue(mockResponse);

    await getLyricController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(200);
    expect(mockCtx.body).toEqual({ code: 0, data: { lyric: 'test lyric' } });
  });

  test('should handle errors from getLyric', async () => {
    mockCtx.query = { songmid: 'test123' };
    const mockError = new Error('Lyric error');
    (getLyric as Mock).mockRejectedValue(mockError);

    await getLyricController(mockCtx, mockNext);

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(mockCtx.status).toBe(502);
    expect(mockCtx.body).toEqual({ error: '上游服务异常' });
  });
});
