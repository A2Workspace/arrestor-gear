import { HttpResponse } from '@src/types/response';

export const baseResposne: HttpResponse<object> = {
  data: {},
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {},
};

export const validationErrorResponse: HttpResponse = {
  ...baseResposne,
  status: 422,
  statusText: 'Unprocessable Content',
  data: {
    message: 'You know the rules',
    errors: {
      username: ['The username field is required.'],
      password: ['The password field is required.', 'The passwore confirmation does not match.'],
    },
  },
};
