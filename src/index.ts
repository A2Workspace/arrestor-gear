import ArrestorGear from './core/ArrestorGear';
import { PromiseOrConstructor } from './types/core';

export default function arrestorGear(promiseOrConstructor: PromiseOrConstructor): ArrestorGear {
  return new ArrestorGear(promiseOrConstructor);
}

export * from './core/utils';
export type { ValidationErrorHandler } from './types/core';
