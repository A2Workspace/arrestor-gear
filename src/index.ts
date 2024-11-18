import ArrestorGear from './core/ArrestorGear';
import { PromiseOrConstructor } from './types/core';

export default function arrestorGear<T>(
  promiseOrConstructor: PromiseOrConstructor
): ArrestorGear {
  return new ArrestorGear<T>(promiseOrConstructor);
}

export * from './core/utils';
export type { ValidationHttpErrorHandler } from './types/core';

export { default as useArrestorGear } from './core/useArrestorGear';
