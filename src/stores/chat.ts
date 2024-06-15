import { defineStore } from 'pinia';
import type { IUser } from '@/types/user.ts';
import type { IMessage } from '@/types/chat.ts';

export interface IState {
  showChatbox: boolean
  showViewChatPrivate: boolean
  showFullChatbox: boolean
  currentUserToMessage: Pick<IUser, 'name' | 'username' | 'avatar_url'> & Partial<Pick<IMessage, 'room_id'>> | null
}

export const useChatStore = defineStore('chat', {
  state: (): IState => ({
    showChatbox: false,
    showViewChatPrivate: false,
    showFullChatbox: false,
    currentUserToMessage: null,
  }),
  getters: {},
  actions: {
    messageToUser(user: IState['currentUserToMessage']) {
      this.showChatbox = true;
      this.showFullChatbox = true;
      this.showViewChatPrivate = true;
      this.currentUserToMessage = user;
    },
  },
  persist: {
    storage: sessionStorage,
    paths: ['currentUserToMessage'],
  },
});
