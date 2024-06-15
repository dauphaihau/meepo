import type { IBaseParamsGetList } from '@/types/common.ts';
import type { IRoom } from '@/types/room.ts';
import type { IUser } from '@/types/user.ts';

export interface IMessage {
  id: number
  user_id: number
  room_id: number
  text: string
  created_at: Date
}

export type ILastMessage = {
  participant_name?: string
  participant_username?: string
  participant_avatar_url?: string
} & IMessage;

export interface IResponseGetLastMessages {
  messages: ILastMessage[]
  total_messages: number
}

export type IParamsGetLastMessages = IBaseParamsGetList;

export type IParamsGetMessages = IBaseParamsGetList & {
  room_id: IRoom['id']
};

export interface ISendMessage {
  room_id?: IRoom['id']
  username?: IUser['username']
  text: IMessage['text']
}

export interface IResponseDataMessageChannel {
  type: string
  message: IMessage & Pick<IUser, 'username'>
}
