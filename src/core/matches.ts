import { StatusCodePatterns } from '../types/core';
import { HttpError, ValidationHttpError } from '../types/response';
import { isHttpError, resolveResponseStatusCode, wrapArray } from './utils';

export function matchHttpError(error: any): error is HttpError {
  return isHttpError(error);
}

export function matchHttpStatusCode(
  error: any,
  patterns: StatusCodePatterns
): error is HttpError {
  return isHttpError(error) && matchStatusCode(patterns, error.response.status);
}

export function matchHttpValidationError(
  error: any
): error is ValidationHttpError {
  return isHttpError(error) && matchStatusCode(422, error.response.status);
}

export function matchStatusCode(
  patterns: StatusCodePatterns,
  value: any
): boolean {
  patterns = wrapArray(patterns);
  value = String(resolveResponseStatusCode(value));

  let callback = function (pattern: number | string) {
    if (typeof pattern === 'string') {
      pattern = pattern.toLowerCase();
      pattern = pattern.replace(/x/g, '\\d');

      return new RegExp(`^${pattern}$`).test(value);
    }

    return String(pattern) === value;
  };

  return Boolean(patterns.find(callback));
}
