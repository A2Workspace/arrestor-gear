import ArrestorGear from '@src/core/ArrestorGear';
import axios from 'axios';
import { initMockAxios } from '../test-utils';

const { resetMock, mockRquest, ENDPOINT } = initMockAxios();

describe('core/ArrestorGear', function () {
  afterEach(function () {
    resetMock();
  });

  describe('captureAxiosError()', function () {
    test('Basic', async () => {
      mockRquest(502);

      const handleGatewayError = jest.fn((error) => error.response.status);
      const handleAxiosError = jest.fn(() => {});

      const ag = new ArrestorGear(axios.post(ENDPOINT));
      ag.captureAxiosError(handleGatewayError);
      ag.captureAxiosError(handleAxiosError);

      await ag.finally();

      expect(handleAxiosError).not.toHaveBeenCalled();

      expect(handleGatewayError).toHaveBeenCalledTimes(1);
      expect(handleGatewayError).toHaveReturnedWith(502);
      expect(handleGatewayError).toBeCalledWith(
        expect.objectContaining({
          response: expect.objectContaining({
            status: 502,
          }),
        })
      );
    });
  });

  describe('captureStatusCode()', function () {
    test('Basic', async () => {
      mockRquest(401);

      const handleUnauthorized = jest.fn((error) => error.response.status);
      const handleAxiosError = jest.fn(() => {});

      const ag = new ArrestorGear(axios.post(ENDPOINT));
      ag.captureStatusCode(401, handleUnauthorized);
      ag.captureAxiosError(handleAxiosError);

      await ag.finally();

      expect(handleAxiosError).not.toHaveBeenCalled();

      expect(handleUnauthorized).toHaveBeenCalledTimes(1);
      expect(handleUnauthorized).toHaveReturnedWith(401);
      expect(handleUnauthorized).toBeCalledWith(
        expect.objectContaining({
          response: expect.objectContaining({
            status: 401,
          }),
        })
      );
    });

    test('Should support list of status codes', async () => {
      mockRquest(403);

      const handlePermissionDenied = jest.fn((error) => error.response.status);
      const handleAxiosError = jest.fn(() => {});

      const ag = new ArrestorGear(axios.post(ENDPOINT));
      ag.captureStatusCode([401, 403], handlePermissionDenied);
      ag.captureAxiosError(handleAxiosError);

      await ag.finally();

      expect(handleAxiosError).not.toHaveBeenCalled();

      expect(handlePermissionDenied).toHaveBeenCalledTimes(1);
      expect(handlePermissionDenied).toHaveReturnedWith(403);
      expect(handlePermissionDenied).toBeCalledWith(
        expect.objectContaining({
          response: expect.objectContaining({
            status: 403,
          }),
        })
      );
    });

    test('Should support query string like: 4XX, 5XX ...', async () => {
      mockRquest(502);

      const handleGatewayError = jest.fn((error) => error.response.status);
      const handleAxiosError = jest.fn(() => {});

      const ag = new ArrestorGear(axios.post(ENDPOINT));
      ag.captureStatusCode('5XX', handleGatewayError);
      ag.captureAxiosError(handleAxiosError);

      await ag.finally();

      expect(handleAxiosError).not.toHaveBeenCalled();

      expect(handleGatewayError).toHaveBeenCalledTimes(1);
      expect(handleGatewayError).toHaveReturnedWith(502);
      expect(handleGatewayError).toBeCalledWith(
        expect.objectContaining({
          response: expect.objectContaining({
            status: 502,
          }),
        })
      );
    });
  });

  describe('captureValidationError()', () => {
    test('Basic', async () => {
      mockRquest(422, {});

      const handleValidationError = jest.fn((errorBag) => errorBag.message);
      const handleAxiosError = jest.fn(() => {});

      const ag = new ArrestorGear(axios.post(ENDPOINT));
      ag.captureValidationError(handleValidationError);
      ag.captureAxiosError(handleAxiosError);

      await ag.finally();

      expect(handleAxiosError).not.toHaveBeenCalled();

      expect(handleValidationError).toHaveBeenCalledTimes(1);
      expect(handleValidationError).toHaveReturnedWith('The given data was invalid');
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

  describe('captureAny()', function () {
    test('Basic', async () => {
      const handleError = jest.fn((error) => error);
      const handleAxiosError = jest.fn(() => {});

      const ag = new ArrestorGear(
        new Promise(function (_, reject) {
          reject('abort');
        })
      );

      ag.captureAxiosError(handleAxiosError);
      ag.captureAny(handleError);

      await ag.finally();

      expect(handleAxiosError).not.toHaveBeenCalled();

      expect(handleError).toHaveBeenCalledTimes(1);
      expect(handleError).toHaveBeenCalledWith('abort');
    });
  });

  describe('finally()', function () {
    test('Should return a Promise', async () => {
      const ag = new ArrestorGear(Promise.resolve(true));

      await expect(ag.finally()).resolves.toBe(true);
    });

    test('Should execute onFinally callback and pass the isFulfilled value', async () => {
      const ag = new ArrestorGear(Promise.resolve(true));

      const handleOnFinally = jest.fn((isFulfilled) => isFulfilled);

      await ag.finally(handleOnFinally);

      expect(handleOnFinally).toHaveBeenCalledTimes(1);
      expect(handleOnFinally).toHaveBeenCalledWith(true);
    });
  });
});
