import type { AxiosError, AxiosResponse } from 'axios';
import ValidationMessageBag from '../core/ValidationMessageBag';

export type HttpResponse<T = HttpResponseData, D = any> = AxiosResponse<T, D>;

export type HttpResponseData<T = any> = {
  message: string;
  errors: T;
};

export type HttpError<T = HttpResponseData, D = any> = AxiosError<T, D>;

export type HttpErrorHandler = (error: HttpError<HttpResponseData>) => any;

export type ValidationErrorHandler = (messageBag: ValidationMessageBag) => any;

export type StatusCodePatterns = number | string | Array<number | string>;
