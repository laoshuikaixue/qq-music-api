import type { Mock } from 'vitest';
import getAlbumInfo from '../../../src/services/apis/album/getAlbumInfo';
import { handleApi } from '../../../src/util/apiResponse';
import y_common from '../../../src/services/apis/y_common';

vi.mock('../../../src/util/apiResponse');
vi.mock('../../../src/services/apis/y_common');

describe('services/apis/album/getAlbumInfo', () => {
  const albumId = '00123456';

  beforeEach(() => {
    vi.clearAllMocks();
    (y_common as Mock).mockResolvedValue({ data: { albumName: 'Test Album' } });
  });

  it('should call handleApi and return album payload', async () => {
    const mockResult = { data: { albumName: 'Test Album' } };
    (handleApi as Mock).mockResolvedValue(mockResult);

    const result = await getAlbumInfo({ params: { albumId } });

    expect(y_common).toHaveBeenCalledWith({
      url: '/v8/fcg-bin/fcg_v8_album_info_cp.fcg',
      method: 'get',
      options: {
        params: {
          albumId,
          format: 'json',
          outCharset: 'utf-8'
        }
      }
    });
    expect(handleApi).toHaveBeenCalledWith(expect.any(Promise));
    expect(result).toEqual(mockResult);
  });

  it('should pass albumId to request payload', async () => {
    (handleApi as Mock).mockResolvedValue({ data: {} });
    await getAlbumInfo({ params: { albumId } });

    const call = (y_common as Mock).mock.calls[0]?.[0];
    expect(call.options.params.albumId).toBe(albumId);
  });

  it('should reject when handleApi rejects', async () => {
    const mockError = new Error('album not found');
    (handleApi as Mock).mockRejectedValue(mockError);

    await expect(getAlbumInfo({ params: { albumId } })).rejects.toThrow('album not found');
  });
});
