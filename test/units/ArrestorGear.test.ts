import ArrestorGear from '@src/core/ArrestorGear';
import axios from 'axios';
import { initMockAxios } from '../test-utils';

const { resetMock, mockRquest, ENDPOINT } = initMockAxios();

describe('core/ArrestorGear', function () {
  afterEach(function () {
    resetMock();
  });

  describe('constructor()', function () {
    test('Create by function which return a Promise', async () => {
      const ag = new ArrestorGear(function () {
        return Promise.resolve('RESOLVED');
      });

      await expect(ag.finally()).resolves.toBe(true);
    });

    test('Should throw a TypeError when creation function dose not return a Promise', async () => {
      const t = () => {
        new ArrestorGear(() => 'RESOLVED' as any);
      };

      expect(t).toThrow(TypeError);
    });
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

  describe('captureValidationError()', function () {
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
      expect(handleValidationError).toHaveReturnedWith(
        'The given data was invalid'
      );
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

  describe('onError()', function () {
    test('case 1', async () => {
      const handleError = jest.fn((error) => error);

      const ag = new ArrestorGear(Promise.resolve(true));

      ag.onFulfilled(() => {
        throw 'FAILURE IN ON_FULFILLED CALLBACK';
      });

      ag.onError(handleError);

      await ag.finally();

      expect(handleError).toHaveBeenCalledTimes(1);
      expect(handleError).toHaveBeenCalledWith('FAILURE IN ON_FULFILLED CALLBACK');
    });

    test('case 2', async () => {
      const handleError = jest.fn((error) => error);

      const ag = new ArrestorGear(Promise.reject(true));

      ag.captureAny(() => {
        throw 'FAILURE IN CAPTURE_ANY CALLBACK';
      });

      ag.onError(handleError);

      await ag.finally();

      expect(handleError).toHaveBeenCalledTimes(1);
      expect(handleError).toHaveBeenCalledWith('FAILURE IN CAPTURE_ANY CALLBACK');
    });

    test('case 3', async () => {
      const handleError = jest.fn((error) => error);

      const ag = new ArrestorGear(Promise.reject(true));

      ag.onError(handleError);

      await ag.finally(() => {
        throw 'FAILURE IN FINALLY CALLBACK';
      });

      expect(handleError).toHaveBeenCalledTimes(1);
      expect(handleError).toHaveBeenCalledWith('FAILURE IN FINALLY CALLBACK');
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
