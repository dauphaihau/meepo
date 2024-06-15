import type { IUser } from './user';
import type { POST_FILTER_BY } from '@/config/const.ts';
import type { z } from 'zod';
import type { postSchema } from '@/schemas/post.ts';
import type { IBaseParamsGetList } from '@/types/common.ts';

export type IPost = z.infer<typeof postSchema>;

export type IParamsGetPosts = IBaseParamsGetList & {
  by: POST_FILTER_BY
  username?: IUser['username']
} & Partial<Pick<IPost, 'parent_id' | 'pin_status' | 'user_id' | 'edited_parent_id'>>;

export type IResponseGetPost = IPost & {
  is_current_user_like?: boolean
  author_avatar_url?: string
  author_name?: string
  author_username?: string
  is_current_user_can_comment?: boolean
  who_can_comment_int?: number
  pin_status_int?: number
  author?: IUser
  sub_post?: IResponseGetPost
};

export interface IResponseGetPosts {
  total_posts: number
  posts?: IResponseGetPost[]
}

export type ICreatePost =
  Pick<IPost, 'content' | 'parent_id'> &
  Partial<Pick<IPost, 'pin_status' | 'image_url' | 'who_can_comment'>> & {
    hashtags?: string[]
  };

export type ICreateSubPost =
  Pick<IPost, 'parent_id' | 'content'> &
  Partial<Pick<IPost, 'pin_status' | 'image_url' | 'who_can_comment'>> & {
    hashtags?: string[]
  };

export type IUpdatePost =
  Pick<IPost, 'id' > &
  Partial<Pick<IPost, 'content' | 'parent_id' | 'pin_status' | 'image_url' | 'who_can_comment'>> & {
    hashtags?: string[]
  };

export interface IResponseGetDetailPost {
  post: IPost & {
    parent_post?: Exclude<IResponseGetDetailPost['post'], 'parent_post'>
    sub_posts_count: number
    is_current_user_can_comment?: boolean
    is_current_user_like?: boolean
    author: IUser
  }
}

export interface IHashtag {
  name: string
  count?: number
}
