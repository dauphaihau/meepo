import * as z from 'zod';
import { POST_PIN_STATUS, POST_WHO_CAN_REPLY } from '@config/post.ts';

export const postSchema = z.object({
  id: z.number(),
  parent_id: z.number(),
  user_id: z.number(),
  content: z.string(),
  edited_parent_id: z.number(),
  edited_posts_count: z.number().default(0),
  likes_count: z.number(),
  image_url: z.string(),
  sub_posts_count: z.number(),
  pin_status: z.nativeEnum(POST_PIN_STATUS).default(POST_PIN_STATUS.UNPIN),
  who_can_comment: z.nativeEnum(POST_WHO_CAN_REPLY).default(POST_WHO_CAN_REPLY.EVERYONE),
  created_at: z.date(),
  updated_at: z.date(),
});
