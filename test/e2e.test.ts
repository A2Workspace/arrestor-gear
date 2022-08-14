import arrestorGear from '@src/index';
import axios from 'axios';
import { initMockAxios } from './test-utils';

const { resetMock, mockRquest, ENDPOINT } = initMockAxios();

describe('e2e', function () {
  afterEach(function () {
    resetMock();
  });

  test('post invalid form data', async function () {
    mockRquest(422, {
      message: 'You know the rules',
      errors: {
        username: ['The username field is required.'],
        password: ['The password field is required.'],
      },
    });

    const handleResponse = jest.fn(() => {});
    const handleValidationError = jest.fn(() => {});
    const handlePermissionDenied = jest.fn(() => {});
    const handleAxiosError = jest.fn(() => {});
    const handleError = jest.fn(() => {});

    const ag = arrestorGear(axios.post(ENDPOINT));

    ag.onFulfilled(handleResponse);
    ag.captureStatusCode([401, 403], handlePermissionDenied);
    ag.captureValidationError(handleValidationError);
    ag.captureAxiosError(handleAxiosError);
    ag.captureAny(handleError);

    await ag.finally();

    expect(handleResponse).not.toHaveBeenCalled();
    expect(handlePermissionDenied).not.toHaveBeenCalled();
    expect(handleValidationError).toHaveBeenCalled();
    expect(handleAxiosError).not.toHaveBeenCalled();
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
      })
    );
  });
});
