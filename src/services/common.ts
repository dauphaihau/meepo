import { apiHelper } from '@/lib/axios';
import axios from 'axios';
import { useInfiniteQuery, useMutation } from '@tanstack/vue-query';
import type { IParamsSearchAll, IResponseGetSearchAll } from '@/types/common.ts';

export const commonService = {
  async searchAll(params: IParamsSearchAll) {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] === 0 || params[key]) {
        searchParams.append(key, params[key]);
      }
    });
    const queriesString = searchParams ? `?${searchParams}` : '';
    const res = await apiHelper.get<IResponseGetSearchAll>(`/search${queriesString}`);
    return res.data;
  },
  async uploadImage(fileImage: File) {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    const folderName = import.meta.env.VITE_CLOUDINARY_FOLDER_NAME;

    const formData = new FormData();
    formData.append('file', fileImage);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', folderName);

    return await axios.post<{ url: string }>(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      formData
    );
  },
};

export function useSearchUser() {
  return useMutation({
    mutationKey: ['search-all'],
    mutationFn: (params: IParamsSearchAll) => commonService.searchAll(params),
  });
}

export function useGetSearchAll(params: IParamsSearchAll) {
  return useInfiniteQuery({
    initialPageParam: 1,
    queryKey: ['search-all', params],
    queryFn: ({ pageParam = 1 }) => commonService.searchAll({ ...params, page: pageParam }),
    getNextPageParam: (_lastPage, allPages) => {
      return allPages.length + 1;
    },
    enabled: Boolean(params),
  });
}

export function useUploadImage() {
  return useMutation({
    mutationKey: ['upload-image'],
    mutationFn: (file: File) => commonService.uploadImage(file),
  });
}
