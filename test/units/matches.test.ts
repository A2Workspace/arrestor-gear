import {
  matchStatusCode,
  matchHttpError,
  matchHttpStatusCode,
  matchHttpValidationError,
} from '@src/core/matches';
import { createHttpError } from '../test-utils';

describe('core/utils', function () {
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

  test('matchHttpError()', function () {
    expect(matchHttpError({ isAxiosError: true })).toBe(false);
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
