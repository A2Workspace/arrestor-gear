import {
  HttpErrorHandler,
  PromiseOrConstructor,
  StatusCodePatterns,
  ValidationHttpErrorHandler,
} from '../types/core';
import { HttpError } from '../types/response';
import ArrestorGear from './ArrestorGear';
import ValidationMessageBag from './ValidationMessageBag';

export default function useArrestorGear<T>(
  promiseOrConstructor: PromiseOrConstructor
) {
  const arrestorGear = new ArrestorGear<T>(promiseOrConstructor);

  const onFulfilled = (handler: (promiseValue: T) => void) => {
    arrestorGear.onFulfilled(handler);
  };

  const onError = (handler: (error: any) => true | void) => {
    arrestorGear.onError(handler);
  };

  const onFinally = (handler?: (isFulfilled: boolean) => any) => {
    arrestorGear.finally(handler);
  };

  const promise = arrestorGear.getPromise();
  const isSettled = () => arrestorGear.isSettled();

  const captureHttpError = (handler: HttpErrorHandler) => {
    arrestorGear.captureHttpError(handler);
  };

  const captureStatusCode = (
    patterns: StatusCodePatterns,
    handler: HttpErrorHandler
  ) => {
    arrestorGear.captureStatusCode(patterns, handler);
  };

  const captureValidationError = (handler: ValidationHttpErrorHandler) => {
    arrestorGear.captureValidationError(handler);
  };

  const captureAny = (handler: (error: any) => any) => {
    arrestorGear.captureAny(handler);
  };

  return {
    arrestorGear,
    promise,
    onFulfilled,
    onError,
    onFinally,
    isSettled,
    captureHttpError,
    captureStatusCode,
    captureValidationError,
    captureAny,
  };
}
