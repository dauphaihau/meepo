import { defineStore } from 'pinia';
import { StatusCodes } from 'http-status-codes';

import type {
  IRequestDataLogin, IRequestDataRegister, IResponseLogin, IUserAuthenticated
} from '@/types/user.ts';
import { authService } from '@services/auth.ts';
import { logger } from '@core/helpers/logger.ts';
import { apiHelper } from '@lib/axios.ts';
import type { AxiosResponse } from 'axios';

export interface IState {
  user: Partial<IUserAuthenticated>
  authToken: string
  loadingAuth: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): IState => ({
    user: {},
    authToken: '',
    loadingAuth: true,
  }),
  getters: {
    isLoggedIn: state => Boolean(state.authToken),
  },
  actions: {
    async register(dataRegister: IRequestDataRegister) {
      try {
        const response = await authService.register(dataRegister);
        if (response.status === StatusCodes.OK) {
          this.authenticated(response);
        }
        return response;
      }
      catch (error) {
        logger.error(error, 'src/stores/auth.ts');
      }
    },

    async login(payload: IRequestDataLogin) {
      try {
        const response = await authService.login(payload);
        if (response.status === StatusCodes.OK) {
          this.authenticated(response);
        }
        return response;
      }
      catch (error) {
        logger.error(error, 'src/stores/auth.ts');
      }
    },

    async logout() {
      try {
        const response = await authService.logout();
        if (response.status === StatusCodes.OK) {
          this.reset();
        }
        return response;
      }
      catch (error) {
        logger.error(error, 'src/stores/auth.ts');
      }
    },

    async me() {
      try {
        this.loadingAuth = true;
        const { status, data } = await authService.me();
        this.loadingAuth = false;

        if (status === StatusCodes.UNAUTHORIZED) {
          this.reset();
        }
        else if (status === StatusCodes.OK) {
          this.user = data.user;
          this.authToken = sessionStorage.getItem('auth_token');
        }
      }
      catch (error) {
        logger.error(error, 'src/stores/auth.ts');
      }
    },

    reset() {
      this.user = {};
      this.authToken = '';
      sessionStorage.removeItem('auth_token');
      apiHelper.defaults.headers.common['Authorization'] = '';
    },

    authenticated(response: AxiosResponse<IResponseLogin>) {
      const { data, headers } = response;
      if (!response.headers?.authorization) {
        logger.error('autoToken is null', 'src/stores/auth.ts');
        response.status = StatusCodes.INTERNAL_SERVER_ERROR;
        return response;
      }
      apiHelper.defaults.headers.common['Authorization'] = headers.authorization;
      sessionStorage.setItem('auth_token', headers.authorization);
      this.user = data.user;
      this.authToken = headers.authorization;
    },
  },
});
