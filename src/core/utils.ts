

export function wrapArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

/**
 * @deprecated
 */
export function isAxiosError(error: any): boolean {
  return typeof error === 'object' && error.isAxiosError === true;
}

export function isHttpError(error: any): boolean {
  return (
    typeof error === 'object' &&
    typeof error.response === 'object' &&
    typeof error.response.status === 'number'
  );
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
