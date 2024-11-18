import ValidationMessageBag from '../core/ValidationMessageBag';
import {
  HttpError,
  HttpResponse,
  ValidationErrorResponseData,
  ValidationHttpError,
} from './response';

export type PromiseOrConstructor = Promise<any> | PromiseConstructor;

export type PromiseConstructor = () => Promise<any>;

export type StatusCodePatterns = number | string | (number | string)[];

export type HttpErrorHandler<T = Record<string, any>> = (ctx: {
  error: HttpError<T>;
  response: HttpResponse<T>;
  status: number;
  data: T | null;
}) => any;

export type ValidationHttpErrorHandler = (
  messageBag: ValidationMessageBag,
  ctx: {
    error: ValidationHttpError;
    response: HttpResponse<ValidationErrorResponseData>;
    status: 422;
    data: ValidationErrorResponseData;
  }
) => any;
