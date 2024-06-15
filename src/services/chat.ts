import { apiHelper } from '@lib/axios';
import type {
  IMessage,
  IParamsGetLastMessages,
  IParamsGetMessages,
  IResponseGetLastMessages,
  ISendMessage
} from '@/types/chat.ts';
import { useInfiniteQuery, useMutation } from '@tanstack/vue-query';

export const chatService = {
  async getLastMessages(params: IParamsGetLastMessages) {
    const queriesString = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] === 0 || params[key]) {
        queriesString.append(key, params[key]);
      }
    });
    const res = await apiHelper.get<IResponseGetLastMessages>(`/messages/last?${queriesString}`);
    return res.data;
  },
  async getMessages(params: IParamsGetMessages) {
    const queriesString = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] === 0 || params[key]) {
        queriesString.append(key, params[key]);
      }
    });
    const res = await apiHelper.get<IResponseGetLastMessages>(`/messages?${queriesString}`);
    return res.data;
  },
  async sendMessage(values: ISendMessage) {
    return apiHelper.post<{ message: IMessage }>('/messages', values);
  },
};

export function useGetLastMessages(params: IParamsGetLastMessages) {
  return useInfiniteQuery({
    initialPageParam: 1,
    queryKey: ['get-last-messages', params],
    queryFn: ({ pageParam = 1 }) => chatService.getLastMessages({ ...params, page: pageParam }),
    getNextPageParam: (_lastPage, allPages) => {
      return allPages.length + 1;
    },
    enabled: Boolean(params),
  });
}

export function useGetMessages(params: IParamsGetMessages) {
  return useInfiniteQuery({
    initialPageParam: 1,
    queryKey: ['get-messages', params],
    queryFn: ({ pageParam = 1 }) => chatService.getMessages({ ...params, page: pageParam }),
    getNextPageParam: (_lastPage, allPages) => {
      return allPages.length + 1;
    },
    enabled: Boolean(params),
  });
}

export function useSendMessage() {
  return useMutation({
    mutationKey: ['send-message'],
    mutationFn: (payload: ISendMessage) => chatService.sendMessage(payload),
  });
}
