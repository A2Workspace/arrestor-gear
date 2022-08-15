import { HttpErrorHandler, StatusCodePatterns } from '../types';
import { matchHttpError, matchHttpStatusCode, matchHttpValidationError } from './utils';

export function arrestAxiosError(error: any, callback: HttpErrorHandler): boolean {
  if (matchHttpError(error)) {
    callback(error);
    return true;
  }

  return false;
}

export function arrestStatusCode(error: any, patterns: StatusCodePatterns, callback: HttpErrorHandler): boolean {
  if (matchHttpStatusCode(error, patterns)) {
    callback(error);
    return true;
  }

  return false;
}

export function arrestValidationError(error: any, callback: HttpErrorHandler): boolean {
  if (matchHttpValidationError(error)) {
    callback(error);
    return true;
  }

  return false;
}
