export function wrapArray(value: any): Array<any> {
  return Array.isArray(value) ? value : [value];
}

export function isHttpError(error: any): boolean {
  return typeof error === 'object' && error.isAxiosError === true;
}
