import type { UserInfo } from './global';

declare global {
  var userInfo: UserInfo;
}

export type { UserInfo };
