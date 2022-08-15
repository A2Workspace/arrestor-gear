export function wrapArray(value: any): Array<any> {
  return Array.isArray(value) ? value : [value];
}

export function isHttpError(error: any): boolean {
  return typeof error === 'object' && error.isAxiosError === true;
}

export function matchStatusCode(patterns: StatusCodeMatcherPatterns, value: any): boolean {
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

export type StatusCodeMatcherPatterns = number | string | Array<number | string>;
