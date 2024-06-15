import type {
  IRequestDataLogin,
  IUser,
  IResponseLogin,
  IResponseRegister,
  IRequestDataRegister, IResponseMe, IRequestDataResetPassword
} from '@/types/user.ts';
import { apiHelper } from '@lib/axios.ts';

export const authService = {
  async login(data: IRequestDataLogin) {
    return await apiHelper.post<IResponseLogin>('/users/sign_in', {
      user: data,
    });
  },
  async register(data: IRequestDataRegister) {
    return await apiHelper.post<IResponseRegister>('/users', {
      user: data,
    });
  },
  forgetPassword(query: string) {
    return apiHelper.post<{ message: string }>('/users/password/reset', { query });
  },
  verifyCodeFromEmail(token: string) {
    return apiHelper.patch<{ message: string }>('/users/password/reset', { token });
  },
  resetPassword(payload: IRequestDataResetPassword) {
    return apiHelper.put<{ user: IUser, message: string }>('/users/password/reset', payload);
  },
  async logout() {
    return await apiHelper.delete('/users/sign_out');
  },
  async me() {
    return await apiHelper.get<IResponseMe>('/me');
  },
};
