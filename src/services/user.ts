import { apiHelper } from '@/lib/axios';
import type {
  IParamsGetUsers,
  IRequestDataUpdateProfile,
  IResponseGetProfile,
  IResponseGetUserList,
  IUser
} from '@/types/user';
import {
  useInfiniteQuery, useMutation, useMutationState, useQuery
} from '@tanstack/vue-query';
import type { AxiosResponse } from 'axios';

export const userService = {
  async list(params: IParamsGetUsers) {
    const queriesString = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] === 0 || params[key]) {
        queriesString.append(key, params[key]);
      }
    });
    const res = await apiHelper.get<IResponseGetUserList>(`/users?${queriesString}`);
    return res.data;
  },
  follow(userId: IUser['id']) {
    return apiHelper.post(`/users/${userId}/follow`);
  },
  unfollow(userId: IUser['id']) {
    return apiHelper.post(`/users/${userId}/unfollow`);
  },
  async unOrFollow(userId: IUser['id'], type) {
    return await apiHelper.post(`/users/${userId}/${type}`);
  },
  async getProfile(username: IUser['username']) {
    const res = await apiHelper.get<IResponseGetProfile>(`/users/${username}`);
    return res.data;
  },
  async updateProfile(id: IUser['id'], payload: IRequestDataUpdateProfile) {
    return await apiHelper.put<{ user: IUser }>(`/users/${id}`, payload);
  },
};

export function useGetUsers(params: IParamsGetUsers) {
  return useInfiniteQuery({
    initialPageParam: 1,
    queryKey: ['get-users', params],
    queryFn: ({ pageParam = 1 }) => userService.list({ ...params, page: pageParam }),
    getNextPageParam: (_lastPage, allPages) => {
      return allPages.length + 1;
    },
    enabled: Boolean(params),
  });
}

export function useGetProfileUser(username: IUser['username']) {
  return useQuery({
    queryKey: ['get-profile-user', username],
    queryFn: () => userService.getProfile(username),
  });
}

export function useMutationGetProfileUser(username: IUser['username']) {
  return useMutation({
    // mutationKey: ['mutate-get-profile-user', username],
    mutationKey: ['mutate-get-profile-user'],
    mutationFn: () => userService.getProfile(username),
  });
}

export function useUpdateProfile(userId: IUser['id']) {
  return useMutation({
    mutationKey: ['update-profile', userId],
    mutationFn: (data: IRequestDataUpdateProfile) => userService.updateProfile(userId, data),
  });
}

export function useGetStateUpdateProfile(userId: IUser['id']) {
  return useMutationState({
    filters: {
      mutationKey: ['update-profile', userId],
    },
    select: (mutation) => {
      return (mutation.state.data as AxiosResponse<{ user: IUser }>)?.data?.user;
    },
  });
}

export function useUnOrFollowUser(userId: IUser['id']) {
  return useMutation({
    mutationKey: ['un-or-follow-user', userId],
    mutationFn: (type: string) => userService.unOrFollow(userId, type),
  });
}

export function useGetStateUnOrFollowUser(userId?: IUser['id']) {
  const mutationKey = ['un-or-follow-user'];
  if (userId) {
    mutationKey.push(userId.toString());
  }
  return useMutationState({
    filters: {
      mutationKey,
    },
    select: (mutation) => {
      return (mutation.state.data as AxiosResponse<{ message: string }>)?.data?.message;
    },
  });
}
