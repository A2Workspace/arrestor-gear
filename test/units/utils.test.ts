import {
  wrapArray,
  isHttpError,
  isAxiosError,
  matchStatusCode,
  resolveResponseStatusCode,
  matchHttpError,
  matchHttpStatusCode,
  matchHttpValidationError,
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
    expect(isHttpError({ isAxiosError: true })).toBe(true);
    expect(isHttpError(createHttpError(400))).toBe(true);

    expect(isHttpError(new Error())).toBe(false);
  });

  test('matchStatusCode()', function () {
    expect(matchStatusCode(404, 404)).toBe(true);
    expect(matchStatusCode([404], 404)).toBe(true);
    expect(matchStatusCode([401, 404], 404)).toBe(true);

    expect(matchStatusCode('404', 404)).toBe(true);
    expect(matchStatusCode(['404'], 404)).toBe(true);
    expect(matchStatusCode(['401', '404'], 404)).toBe(true);

    expect(matchStatusCode('4XX', 404)).toBe(true);
    expect(matchStatusCode('4X4', 404)).toBe(true);
    expect(matchStatusCode(['5XX', '4XX'], 404)).toBe(true);

    expect(matchStatusCode(500, 404)).toBe(false);
    expect(matchStatusCode('5XX', 404)).toBe(false);
    expect(matchStatusCode('5X4', 404)).toBe(false);
  });

  test('resolveResponseStatusCode()', function () {
    expect(resolveResponseStatusCode({ response: { status: 200 } })).toBe(200);
    expect(resolveResponseStatusCode({ status: 200 })).toBe(200);
    expect(resolveResponseStatusCode(200)).toBe(200);
  });

  test('matchHttpError()', function () {
    expect(matchHttpError({ isAxiosError: true })).toBe(true);
    expect(matchHttpError(createHttpError(400))).toBe(true);

    expect(matchHttpError(new Error())).toBe(false);
  });

  test('matchHttpStatusCode()', function () {
    expect(matchHttpStatusCode(createHttpError(404), 404)).toBe(true);
    expect(matchHttpStatusCode(createHttpError(404), [404])).toBe(true);
    expect(matchHttpStatusCode(createHttpError(404), [401, 404])).toBe(true);

    expect(matchHttpStatusCode(createHttpError(500), [401, 404])).toBe(false);
  });

  test('matchHttpValidationError()', function () {
    expect(matchHttpValidationError(createHttpError(422))).toBe(true);

    expect(matchHttpValidationError(createHttpError(401))).toBe(false);
    expect(matchHttpValidationError(new Error())).toBe(false);
  });
});
