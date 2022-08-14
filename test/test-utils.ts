import axios from 'axios';
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
    mockRquest(statusOrCallback: number | mockAxiosHandler, data?: any): void {
      if (typeof statusOrCallback === 'function') {
        statusOrCallback(mock);
      } else {
        mock.onAny(ENDPOINT).reply(statusOrCallback, data);
      }
    },
  };
}

type mockAxiosHandler = (mock: MockAdapter) => void;
