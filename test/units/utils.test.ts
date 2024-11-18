import {
  wrapArray,
  isHttpError,
  isAxiosError,
  resolveResponseStatusCode,
} from '@src/core/utils';
import { createHttpError } from '../test-utils';

describe('core/utils', function () {
  test('wrapArray()', function () {
    expect(wrapArray('foo')).toStrictEqual(['foo']);
    expect(wrapArray(['foo'])).toStrictEqual(['foo']);
  });

  test('isAxiosError()', function () {
    expect(isAxiosError({ isAxiosError: true })).toBe(true);
    expect(isAxiosError(createHttpError(400))).toBe(true);

    expect(isAxiosError(new Error())).toBe(false);
  });

  test('isHttpError()', function () {
    expect(isHttpError({ isAxiosError: true })).toBe(false);
    expect(isHttpError(createHttpError(400))).toBe(true);

    expect(isHttpError(new Error())).toBe(false);
  });

  test('resolveResponseStatusCode()', function () {
    expect(resolveResponseStatusCode({ response: { status: 200 } })).toBe(200);
    expect(resolveResponseStatusCode({ status: 200 })).toBe(200);
    expect(resolveResponseStatusCode(200)).toBe(200);
  });
});
