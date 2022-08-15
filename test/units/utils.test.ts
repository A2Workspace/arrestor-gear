import { wrapArray, isHttpError, matchStatusCode, resolveResponseStatusCode } from '@src/core/utils';

describe('core/utils', function () {
  test('wrapArray()', function () {
    expect(wrapArray('foo')).toBe(['foo']);
    expect(wrapArray(['foo'])).toBe(['foo']);
  });

  test('isHttpError()', function () {
    expect(isHttpError({ isAxiosError: true })).toBe(true);
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
});
