/// <reference types="jest" />
jest.mock('./axios', () => ({
  __esModule: true,
  default: {
    defaults: { headers: {} },
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

import { shouldBypassOssSignature } from './OssProxyUtil';

describe('OssProxyUtil', () => {
  it('bypasses OSS signing for absolute urls', () => {
    expect(shouldBypassOssSignature('https://picsum.photos/800/600?random=1')).toBe(true);
    expect(shouldBypassOssSignature('http://example.com/a.jpg')).toBe(true);
    expect(shouldBypassOssSignature('data:image/png;base64,abc')).toBe(true);
    expect(shouldBypassOssSignature('blob:http://localhost/image')).toBe(true);
  });

  it('uses OSS signing for object keys', () => {
    expect(shouldBypassOssSignature('inspection/file.jpg')).toBe(false);
    expect(shouldBypassOssSignature('inspection_20260312.xlsx')).toBe(false);
  });
});