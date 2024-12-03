import ArrestorGear from './core/ArrestorGear';
import { PromiseOrConstructor } from './types/core';

export default function arrestorGear<T>(
  promiseOrConstructor: PromiseOrConstructor
): ArrestorGear<T> {
  return new ArrestorGear<T>(promiseOrConstructor);
}

export * from './core/utils';
export * from './core/ValidationMessageBag';

export type {
  HttpErrorHandler,
  ValidationHttpErrorHandler,
} from './types/core';

export type {
  ValidationHttpError,
  ValidationErrorResponseData,
  ValidationErrors,
} from './types/response';

export { default as useArrestorGear } from './core/useArrestorGear';
