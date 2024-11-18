import arrestorGear, { useArrestorGear } from '@src/index';
import axios from 'axios';
import { initMockAxios } from './test-utils';

const { resetMock, mockRquest, ENDPOINT } = initMockAxios();

describe('e2e', function () {
  afterEach(function () {
    resetMock();
  });

  test('Handling invalid form data', async function () {
    mockRquest(422, {
      message: 'You know the rules',
      errors: {
        username: ['The username field is required.'],
        password: ['The password field is required.'],
      },
    });

    const handleResponse = jest.fn(() => {});
    const handleValidationError = jest.fn(() => {});
    const handlePermissionDenied = jest.fn((payload) => payload);
    const handleHttpError = jest.fn(({ data: payload }) => payload);
    const handleError = jest.fn(() => {});

    const ag = arrestorGear(axios.post(ENDPOINT));

    ag.onFulfilled(handleResponse);
    ag.captureStatusCode([401, 403], ({ data: payload }) => {
      handlePermissionDenied(payload);
    });
    ag.captureValidationError(handleValidationError);
    ag.captureHttpError(handleHttpError);
    ag.captureAny(handleError);

    await ag.finally();

    expect(handleResponse).not.toHaveBeenCalled();
    expect(handlePermissionDenied).not.toHaveBeenCalled();
    expect(handleValidationError).toHaveBeenCalled();
    expect(handleHttpError).not.toHaveBeenCalled();
    expect(handleError).not.toHaveBeenCalled();

    expect(handleValidationError).toHaveBeenCalledTimes(1);
    expect(handleValidationError).toBeCalledWith(
      expect.objectContaining({
        response: expect.any(Object),
        message: 'You know the rules',
        errors: {
          username: ['The username field is required.'],
          password: ['The password field is required.'],
        },
        first: expect.any(Function),
      }),
      expect.objectContaining({
        error: expect.any(Object),
        response: expect.any(Object),
        status: expect.any(Number),
        data: expect.any(Object),
      })
    );
  });

  test('Handling invalid form data with composable function', async function () {
    mockRquest(422, {
      message: 'You know the rules',
      errors: {
        username: ['The username field is required.'],
        password: ['The password field is required.'],
      },
    });

    const handleResponse = jest.fn(() => {});
    const handleValidationError = jest.fn(() => {});
    const handlePermissionDenied = jest.fn((payload) => payload);
    const handleHttpError = jest.fn(({ data: payload }) => payload);
    const handleError = jest.fn(() => {});

    const {
      onFulfilled,
      captureStatusCode,
      captureValidationError,
      captureHttpError,
      captureAny,
      promise,
    } = useArrestorGear(axios.post(ENDPOINT));

    onFulfilled(handleResponse);
    captureStatusCode([401, 403], ({ data: payload }) => {
      handlePermissionDenied(payload);
    });
    captureValidationError(handleValidationError);
    captureHttpError(handleHttpError);
    captureAny(handleError);

    await promise;

    expect(handleResponse).not.toHaveBeenCalled();
    expect(handlePermissionDenied).not.toHaveBeenCalled();
    expect(handleValidationError).toHaveBeenCalled();
    expect(handleHttpError).not.toHaveBeenCalled();
    expect(handleError).not.toHaveBeenCalled();

    expect(handleValidationError).toHaveBeenCalledTimes(1);
    expect(handleValidationError).toBeCalledWith(
      expect.objectContaining({
        response: expect.any(Object),
        message: 'You know the rules',
        errors: {
          username: ['The username field is required.'],
          password: ['The password field is required.'],
        },
        first: expect.any(Function),
      }),
      expect.objectContaining({
        error: expect.any(Object),
        response: expect.any(Object),
        status: expect.any(Number),
        data: expect.any(Object),
      })
    );
  });
});
