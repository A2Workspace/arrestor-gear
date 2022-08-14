import ValidationMessageBag from '@src/core/ValidationMessageBag';
import { validationErrorResponse } from '../fixtures/http-responses';

describe('core/ValidationMessageBag', function () {
  const response = { ...validationErrorResponse };
  const bag = new ValidationMessageBag(response);

  test('Basic', function () {
    expect(bag.response).toBe(response);
    expect(bag.message).toBe(validationErrorResponse.data.message);
    expect(bag.errors).toMatchObject(validationErrorResponse.data.errors);
  });

  test('has()', function () {
    expect(bag.has('username')).toBe(true);
    expect(bag.has('password')).toBe(true);
    expect(bag.has('nickname')).toBe(false);
  });

  test('get()', function () {
    expect(bag.get('username')).toBe(validationErrorResponse.data.errors.username);
    expect(bag.get('password')).toBe(validationErrorResponse.data.errors.password);
    expect(bag.get('password', (v) => v[0])).toBe(validationErrorResponse.data.errors.password[0]);
  });

  test('first()', function () {
    expect(bag.first()).toEqual(expect.any(String));
    expect(bag.first('username')).toBe('The username field is required.');
    expect(bag.first('password')).toBe('The password field is required.');
  });

  test('all()', function () {
    expect(bag.all()).toMatchObject(validationErrorResponse.data.errors);
    expect(bag.all((v) => v[0])).toMatchObject({
      username: 'The username field is required.',
      password: 'The password field is required.',
    });
  });
});
