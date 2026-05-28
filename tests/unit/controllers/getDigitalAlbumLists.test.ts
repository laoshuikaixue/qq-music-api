import type { Mock } from 'vitest';
import getDigitalAlbumListsController from '../../../src/controllers/getDigitalAlbumLists';
import { getDigitalAlbumLists } from '../../../src/services';

vi.mock('../../../src/services');

describe('controllers/getDigitalAlbumLists', () => {
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

  test('should call getDigitalAlbumLists with default props', async () => {
    (getDigitalAlbumLists as Mock).mockResolvedValue({ status: 200, body: { code: 0, data: {} } });

    await getDigitalAlbumListsController(mockCtx, mockNext);

    expect(getDigitalAlbumLists).toHaveBeenCalledWith({
      method: 'get',
      params: {},
      option: {}
    });
  });

  test('should assign response to ctx', async () => {
    const mockResponse = {
      status: 200,
      body: { code: 0, data: { albumLists: [] } }
    };
    (getDigitalAlbumLists as Mock).mockResolvedValue(mockResponse);

    await getDigitalAlbumListsController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(200);
    expect(mockCtx.body).toEqual({ code: 0, data: { albumLists: [] } });
  });

  test('should handle errors from getDigitalAlbumLists', async () => {
    const mockError = new Error('Digital album lists error');
    (getDigitalAlbumLists as Mock).mockRejectedValue(mockError);

    await getDigitalAlbumListsController(mockCtx, mockNext);

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(mockCtx.status).toBe(500);
    expect(mockCtx.body).toEqual({ error: '服务器内部错误' });
  });
});
