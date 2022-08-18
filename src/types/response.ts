import type { AxiosError, AxiosResponse } from 'axios';
import ValidationMessageBag from '../core/ValidationMessageBag';

export type HttpResponse<T = HttpResponseData, D = any> = AxiosResponse<T, D>;

export type HttpResponseData<T = any> = {
  message: string;
  errors: T;
};

export type HttpErrorHandler = (error: AxiosError<any>) => any;

export type ValidationErrorHandler = (messageBag: ValidationMessageBag) => any;

export type StatusCodePatterns = number | string | Array<number | string>;
