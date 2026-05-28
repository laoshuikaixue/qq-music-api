import type { Mock } from 'vitest';
import getTopListsController from '../../../src/controllers/getTopLists';
import { getTopLists } from '../../../src/services';

vi.mock('../../../src/services');

describe('controllers/getTopLists', () => {
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

  test('should call getTopLists with default props', async () => {
    (getTopLists as Mock).mockResolvedValue({ status: 200, body: { code: 0, data: {} } });

    await getTopListsController(mockCtx, mockNext);

    expect(getTopLists).toHaveBeenCalledWith({
      method: 'get',
      params: {},
      option: {}
    });
  });

  test('should assign response to ctx', async () => {
    const mockResponse = {
      status: 200,
      body: { code: 0, data: { topLists: [] } }
    };
    (getTopLists as Mock).mockResolvedValue(mockResponse);

    await getTopListsController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(200);
    expect(mockCtx.body).toEqual({ code: 0, data: { topLists: [] } });
  });

  test('should pass query params through to API', async () => {
    mockCtx.query = { format: 'json' };
    (getTopLists as Mock).mockResolvedValue({ status: 200, body: { code: 0, data: {} } });

    await getTopListsController(mockCtx, mockNext);

    expect(getTopLists).toHaveBeenCalledWith({
      method: 'get',
      params: { format: 'json' },
      option: {}
    });
  });

  test('should handle errors from getTopLists', async () => {
    const mockError = new Error('Top lists error');
    (getTopLists as Mock).mockRejectedValue(mockError);

    await getTopListsController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(500);
    expect(mockCtx.body).toEqual({ error: '服务器内部错误' });
  });
});
