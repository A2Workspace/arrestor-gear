import ArrestorGear from './core/ArrestorGear';
import { matchHttpError, matchHttpStatusCode, matchHttpValidationError } from './core/utils';
import { captureAxiosError, captureStatusCode, captureValidationError } from './core/capturers';
import ValidationMessageBag from './core/ValidationMessageBag';

export default function arrestorGear(promise: Promise<any>): ArrestorGear {
  return new ArrestorGear(promise);
}

export {
  ArrestorGear,
  ValidationMessageBag,
  matchHttpError,
  matchHttpStatusCode,
  matchHttpValidationError,
  captureAxiosError,
  captureStatusCode,
  captureValidationError,
};
