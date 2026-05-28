import type { Mock } from 'vitest';
import getDownloadQQMusicController from '../../../src/controllers/getDownloadQQMusic';
import { downloadQQMusic } from '../../../src/services';

vi.mock('../../../src/services');

describe('controllers/getDownloadQQMusic', () => {
  let mockCtx: any;
  let mockNext: Mock;

  beforeEach(() => {
    mockCtx = {
      status: 200,
      body: null,
      query: {}
    };
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  test('should call downloadQQMusic with default props', async () => {
    (downloadQQMusic as Mock).mockResolvedValue({ status: 200, body: { code: 0, data: {} } });

    await getDownloadQQMusicController(mockCtx, mockNext);

    expect(downloadQQMusic).toHaveBeenCalledWith({
      method: 'get',
      params: {},
      option: {}
    });
  });

  test('should assign response to ctx', async () => {
    const mockResponse = {
      status: 200,
      body: { code: 0, data: { downloadUrl: 'http://example.com' } }
    };
    (downloadQQMusic as Mock).mockResolvedValue(mockResponse);

    await getDownloadQQMusicController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(200);
    expect(mockCtx.body).toEqual({ code: 0, data: { downloadUrl: 'http://example.com' } });
  });

  test('should handle errors from downloadQQMusic', async () => {
    (downloadQQMusic as Mock).mockResolvedValue({
      status: 502,
      body: { error: 'Download error' }
    });

    await getDownloadQQMusicController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(502);
    expect(mockCtx.body).toEqual({ error: 'Download error' });
  });
});
