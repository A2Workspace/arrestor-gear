import ArrestorGear from './core/ArrestorGear';
import { matchHttpError, matchHttpStatusCode, matchHttpValidationError } from './core/utils';
import ValidationMessageBag from './core/ValidationMessageBag';

export default function arrestorGear(promise: Promise<any>): ArrestorGear {
  return new ArrestorGear(promise);
}

export * from './types';

export {
  ArrestorGear,
  ValidationMessageBag,
  matchHttpError,
  matchHttpStatusCode,
  matchHttpValidationError,
};
