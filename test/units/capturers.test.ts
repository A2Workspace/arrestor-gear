import { captureAxiosError, captureStatusCode, captureValidationError } from '@src/core/capturers';
import { createHttpError } from '../test-utils';
import { validationErrorResponse } from '../fixtures/http-responses';

describe('core/capturers', function () {
  describe('captureAxiosError()', function () {
    test('Classic', async () => {
      const handleAxiosError = jest.fn(() => {});

      let promise = Promise.reject(createHttpError(404));
      await promise.catch(captureAxiosError(handleAxiosError) as any);

      expect(handleAxiosError).toHaveBeenCalledTimes(1);
      expect(handleAxiosError).toBeCalledWith(
        expect.objectContaining({
          response: expect.objectContaining({
            status: 404,
          }),
        })
      );
    });

    test('Promise style', async () => {
      const handleAxiosError = jest.fn(() => {});

      await Promise.reject(createHttpError(404)).catch((error) => {
        return (captureAxiosError(error) as Promise<any>).then(handleAxiosError);
      });

      expect(handleAxiosError).toHaveBeenCalledTimes(1);
      expect(handleAxiosError).toBeCalledWith(
        expect.objectContaining({
          response: expect.objectContaining({
            status: 404,
          }),
        })
      );
    });
  });

  describe('captureStatusCode()', function () {
    test('Classic', async () => {
      const handleUnauthorized = jest.fn(() => {});

      let promise = Promise.reject(createHttpError(401));
      await promise.catch(captureStatusCode('4XX', handleUnauthorized) as any);

      expect(handleUnauthorized).toHaveBeenCalledTimes(1);
      expect(handleUnauthorized).toBeCalledWith(
        expect.objectContaining({
          response: expect.objectContaining({
            status: 401,
          }),
        })
      );
    });

    test('Promise style', async () => {
      const handleUnauthorized = jest.fn(() => {});

      await Promise.reject(createHttpError(401)).catch((error) => {
        return (captureStatusCode('4XX', error) as Promise<any>).then(handleUnauthorized);
      });

      expect(handleUnauthorized).toHaveBeenCalledTimes(1);
      expect(handleUnauthorized).toBeCalledWith(
        expect.objectContaining({
          response: expect.objectContaining({
            status: 401,
          }),
        })
      );
    });
  });

  describe('captureValidationError()', function () {
    test('Classic', async () => {
      const handleValidationError = jest.fn((errorBag) => errorBag.message);

      let promise = Promise.reject(createHttpError(422, { ...validationErrorResponse.data }));
      await promise.catch(captureValidationError(handleValidationError) as any);

      expect(handleValidationError).toHaveBeenCalledTimes(1);
      expect(handleValidationError).toHaveReturnedWith('You know the rules');
      expect(handleValidationError).toBeCalledWith(
        expect.objectContaining({
          response: expect.any(Object),
          errors: expect.any(Object),
          message: expect.any(String),
          first: expect.any(Function),
        })
      );
    });

    test('Promise style', async () => {
      const handleValidationError = jest.fn((errorBag) => errorBag.message);

      await Promise.reject(createHttpError(422, { ...validationErrorResponse.data })).catch((error) => {
        return (captureValidationError(error) as Promise<any>).then(handleValidationError);
      });

      expect(handleValidationError).toHaveBeenCalledTimes(1);
      expect(handleValidationError).toHaveReturnedWith('You know the rules');
      expect(handleValidationError).toBeCalledWith(
        expect.objectContaining({
          response: expect.any(Object),
          errors: expect.any(Object),
          message: expect.any(String),
          first: expect.any(Function),
        })
      );
    });
  });
});
