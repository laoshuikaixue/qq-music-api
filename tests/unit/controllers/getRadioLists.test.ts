import type { Mock } from 'vitest';
import getRadioListsController from '../../../src/controllers/getRadioLists';
import { getRadioLists } from '../../../src/services';

vi.mock('../../../src/services');

describe('controllers/getRadioLists', () => {
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

  test('should call getRadioLists with default props', async () => {
    (getRadioLists as Mock).mockResolvedValue({ status: 200, body: { code: 0, data: {} } });

    await getRadioListsController(mockCtx, mockNext);

    expect(getRadioLists).toHaveBeenCalledWith({
      method: 'get',
      params: {},
      option: {}
    });
  });

  test('should assign response to ctx', async () => {
    const mockResponse = {
      status: 200,
      body: { code: 0, data: { radioLists: [] } }
    };
    (getRadioLists as Mock).mockResolvedValue(mockResponse);

    await getRadioListsController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(200);
    expect(mockCtx.body).toEqual({ code: 0, data: { radioLists: [] } });
  });

  test('should handle errors from getRadioLists', async () => {
    const mockError = new Error('Radio lists error');
    (getRadioLists as Mock).mockRejectedValue(mockError);

    await getRadioListsController(mockCtx, mockNext);

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(mockCtx.status).toBe(500);
    expect(mockCtx.body).toEqual({ error: '服务器内部错误' });
  });
});
