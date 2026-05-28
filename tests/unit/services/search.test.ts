import type { Mock } from 'vitest';
import getHotKey from '../../../src/services/apis/search/getHotKey';
import { handleApi } from '../../../src/util/apiResponse';
import y_common from '../../../src/services/apis/y_common';

vi.mock('../../../src/util/apiResponse');
vi.mock('../../../src/services/apis/y_common');

describe('services/apis/search/getHotKey', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (y_common as Mock).mockResolvedValue({ data: { hotkeys: [] } });
  });

  it('should call handleApi and return search payload', async () => {
    const mockResult = { data: { hotkeys: [{ k: 'test' }] } };
    (handleApi as Mock).mockResolvedValue(mockResult);

    const result = await getHotKey({});

    expect(y_common).toHaveBeenCalledWith({
      url: '/splcloud/fcgi-bin/gethotkey.fcg',
      method: 'get',
      options: {
        params: {
          format: 'json',
          outCharset: 'utf-8',
          hostUin: 0,
          needNewCode: 0
        }
      }
    });
    expect(handleApi).toHaveBeenCalledWith(expect.any(Promise));
    expect(result).toEqual(mockResult);
  });

  it('should reject when handleApi rejects', async () => {
    const mockError = new Error('search failed');
    (handleApi as Mock).mockRejectedValue(mockError);

    await expect(getHotKey({})).rejects.toThrow('search failed');
  });
});
