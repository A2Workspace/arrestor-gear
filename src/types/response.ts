import { AxiosError, AxiosResponse } from 'axios';

export type HttpResponse<T = HttpResponseData, D = any> = AxiosResponse<T, D>;

export type HttpResponseData<T = any> = {
  message: string;
  errors: T;
};

export type HttpError<T = HttpResponseData> = AxiosError<T, any> & {
  response: HttpResponse<T>;
};

export type HttpErrorHandler = (error: HttpError<HttpResponseData>) => any;

export type StatusCodePatterns = number | string | Array<number | string>;
