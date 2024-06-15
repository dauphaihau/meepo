import type {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios';
import axios from 'axios';
import { logger } from '@core/helpers/logger.ts';

export interface IConfigReq extends InternalAxiosRequestConfig {
  whereSrcRequest?: string
}

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  validateStatus: (status) => {
    return status >= 200 && status < 500;
  },
});

const onRequest = (configReq: IConfigReq): IConfigReq => {
  const { method, url, whereSrcRequest } = configReq;
  const authToken = sessionStorage.getItem('auth_token');
  if (authToken) {
    configReq.headers.Authorization = authToken;
  }
  logger.debug(`🔺 Request | [API] ${method?.toUpperCase()} ${url} `, configReq.data ?? 'req with undefined data', whereSrcRequest);
  if (method === 'get') {
    configReq.timeout = 15000;
  }
  return configReq as IConfigReq;
};

// const onRequestError = (error: AxiosError): Promise<AxiosError> => {
//   console.error(`[request error] [${JSON.stringify(error)}]`);
//   return Promise.reject(error);
// };

const onResponse = (response: AxiosResponse): AxiosResponse => {
  const { method, url, whereSrcRequest } = response.config as IConfigReq;
  const { status } = response;
  logger.debug(`🔻 Response | [API] ${method?.toUpperCase()} ${url} ${status}`, response, whereSrcRequest);
  return response;
};

const onResponseError = (error: AxiosError): Promise<AxiosError> => {
  const { message } = error;
  const { method, url, whereSrcRequest } = error.config as IConfigReq;
  const { status } = error.response as AxiosResponse ?? {};
  logger.error(`🚨 [API] | Error ${method?.toUpperCase()} ${url} ${status} ${message}`, whereSrcRequest);
  return Promise.reject(error);
};

axiosInstance.interceptors.request.use(onRequest, onResponseError);
axiosInstance.interceptors.response.use(onResponse, onResponseError);

export const apiHelper = axiosInstance;
