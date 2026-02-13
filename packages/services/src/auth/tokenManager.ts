import { jwtDecode } from 'jwt-decode';
import { cookieManager } from '../utils/cookieManager';
import { COOKIES_KEYS } from '../constants';

export const tokenManager = {
  getTemporalToken: (workspaceId?: string) => {
    return cookieManager.get(cookieManager.getCookieName([COOKIES_KEYS.TEMPORAL, workspaceId]));
  },
  
  getLoginToken: (workspaceId?: string) => {
    return cookieManager.get(cookieManager.getCookieName([COOKIES_KEYS.MY_ACCESS, workspaceId]));
  },
  
  setTemporalToken: (token: string, workspaceId?: string) => {
    const key = cookieManager.getCookieName([COOKIES_KEYS.TEMPORAL, workspaceId]);
    cookieManager.set(key, token, { expires: 1 });
  },
  
  setLoginToken: (token: string, workspaceId?: string) => {
    const key = cookieManager.getCookieName([COOKIES_KEYS.MY_ACCESS, workspaceId]);
    cookieManager.set(key, token, { expires: 1 });
  },
  
  removeTokens: (workspaceId?: string) => {
    cookieManager.remove(cookieManager.getCookieName([COOKIES_KEYS.TEMPORAL, workspaceId]));
    cookieManager.remove(cookieManager.getCookieName([COOKIES_KEYS.MY_ACCESS, workspaceId]));
  },
  
  decodeToken: (token: string) => {
    try {
      return jwtDecode(token);
    } catch (e) {
      return null;
    }
  }
};
