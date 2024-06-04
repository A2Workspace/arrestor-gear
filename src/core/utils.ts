import { StatusCodePatterns } from '../types/response';

export function wrapArray(value: any): Array<any> {
  return Array.isArray(value) ? value : [value];
}

export function isAxiosError(error: any): boolean {
  return typeof error === 'object' && error.isAxiosError === true;
}

export function isHttpError(error: any): boolean {
  return isAxiosError(error);
}

export function matchHttpError(error: any): boolean {
  return isHttpError(error);
}

export function matchHttpStatusCode(error: any, patterns: StatusCodePatterns): boolean {
  return isHttpError(error) && matchStatusCode(patterns, error.response.status);
}

export function matchHttpValidationError(error: any): boolean {
  return isHttpError(error) && matchStatusCode(422, error.response.status);
}

export function matchStatusCode(patterns: StatusCodePatterns, value: any): boolean {
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

export function resolveResponseStatusCode(value: any): number | null {
  if (typeof value === 'number') {
    return value;
  }

  if (!isNaN(value)) {
    return parseInt(value);
  }

  if (typeof value === 'object') {
    return value.response?.status || value.status || null;
  }

  return null;
}
