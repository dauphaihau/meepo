import type { FILTER_SEARCH_ALL } from '@config/const.ts';
import type { IUser } from '@/types/user.ts';
import type { IPost } from '@/types/post.ts';

export interface IBaseResponse {
  message: string
}

export interface IBaseParamsGetList {
  limit: number
  page: number
}

export interface IParamsSearchAll extends Partial<IBaseParamsGetList> {
  f?: FILTER_SEARCH_ALL
  q?: string
}

export interface IResponseGetSearchAll {
  users: IUser[]
  total_users: number
  total_posts: number
  posts: IPost[]
  posts_trending: IPost[]
}
