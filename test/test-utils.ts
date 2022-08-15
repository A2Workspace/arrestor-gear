import { HttpError, HttpResponseData } from '@src/types';
import axios, { AxiosRequestConfig } from 'axios';
import MockAdapter from 'axios-mock-adapter';

const ENDPOINT = '/endpoint';

export function initMockAxios() {
  const mock = new MockAdapter(axios);

  return {
    ENDPOINT,
    mock,
    resetMock(): void {
      mock.reset();
    },
    mockRquest(statusOrCallback: number | ((mock: MockAdapter) => void), data?: any): void {
      if (typeof statusOrCallback === 'function') {
        statusOrCallback(mock);
      } else {
        mock.onAny(ENDPOINT).reply(statusOrCallback, data);
      }
    },
  };
}

export function createHttpError(status: number, data?: any): HttpError<any> {
  const response = {
    data,
    status,
    statusText: '',
    headers: {},
    config: {},
  };

  return {
    isAxiosError: true,
    response,
    name: '',
    message: '',
    config: {} as AxiosRequestConfig,
    toJSON: () => ({}),
  };
}
