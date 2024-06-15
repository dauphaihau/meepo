import type { z } from 'zod';
import type { loginSchema, registerSchema, userSchema } from '@/schemas/user.ts';
import type { IBaseParamsGetList, IBaseResponse } from '@/types/common.ts';
import type { USER_FILTER_BY } from '@config/const.ts';

interface OtherFields {
  is_current_user_following: boolean
  followers_count: number
  followed_count: number
  last_message_count: number
}

export type IUser = z.infer<typeof userSchema>;

export type IUserAuthenticated = IUser &
  Pick<OtherFields, 'followers_count' | 'followed_count' | 'last_message_count'>;

export type IParamsGetUsers = IBaseParamsGetList & {
  by: USER_FILTER_BY
  username?: IUser['username']
  include?: 'user'
};

export type UserInGetList = IUser &
  Pick<OtherFields, 'followers_count' | 'followed_count' | 'is_current_user_following'>;

export interface IResponseGetUserList {
  total_users: number
  users?: UserInGetList[]
  by_user?: IUser
}

export type IRequestDataLogin = z.infer<typeof loginSchema>;

export type IRequestDataRegister = z.infer<typeof registerSchema>;

export type IResponseLogin = IBaseResponse & {
  user: IUserAuthenticated
};

export type IResponseRegister = IBaseResponse & {
  user: IUserAuthenticated
};

export type IResponseMe = IBaseResponse & {
  user: IUserAuthenticated
};

export type IResponseGetProfile = IBaseResponse & {
  user: IUser & Pick<OtherFields, 'followers_count' | 'followed_count' | 'is_current_user_following'>
};

export interface IRequestDataResetPassword {
  password: string
  token: string
}

export type IRequestDataUpdateProfile = Partial<
  Pick<IUser, 'name' | 'bio' | 'location' | 'website' | 'avatar_url' | 'dob'>
>;
