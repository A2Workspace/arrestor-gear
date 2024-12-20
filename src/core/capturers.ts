import {
  StatusCodePatterns,
  HttpErrorHandler,
  ValidationHttpErrorHandler,
} from '../types/core';
import {
  matchHttpError,
  matchHttpStatusCode,
  matchHttpValidationError,
} from './matches';
import ValidationMessageBag from './ValidationMessageBag';

type Arrestor = {
  (reason: any): Promise<any>;
};

type RejectionHandler = (reason: any) => any;

/**
 * @deprecated
 */
export function captureAxiosError(
  reasonOrCallback: HttpErrorHandler | any
): RejectionHandler | Promise<any> {
  let arrestor: Arrestor = function (reason: any): Promise<any> {
    if (matchHttpError(reason)) {
      return Promise.resolve(reason);
    }

    return Promise.reject(reason);
  };

  if (typeof reasonOrCallback === 'function') {
    return (reason: any): any => arrestor(reason).then(reasonOrCallback);
  }

  return arrestor(reasonOrCallback);
}

/**
 * @deprecated
 */
export function captureStatusCode(
  patterns: StatusCodePatterns,
  reasonOrCallback: HttpErrorHandler | any
): RejectionHandler | Promise<any> {
  let arrestor: Arrestor = function (reason: any): Promise<any> {
    if (matchHttpStatusCode(reason, patterns)) {
      return Promise.resolve(reason);
    }

    return Promise.reject(reason);
  };

  if (typeof reasonOrCallback === 'function') {
    return (reason: any) => arrestor(reason).then(reasonOrCallback);
  }

  return arrestor(reasonOrCallback);
}

/**
 * @deprecated
 */
export function captureValidationError(
  reasonOrCallback: ValidationHttpErrorHandler | any
): RejectionHandler | Promise<any> {
  let arrestor: Arrestor = function (reason: any): Promise<any> {
    if (matchHttpValidationError(reason)) {
      return Promise.resolve(new ValidationMessageBag(reason.response));
    }

    return Promise.reject(reason);
  };

  if (typeof reasonOrCallback === 'function') {
    return (reason: any) => arrestor(reason).then(reasonOrCallback);
  }

  return arrestor(reasonOrCallback);
}
