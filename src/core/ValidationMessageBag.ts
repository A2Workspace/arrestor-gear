import {
  FetchHttpResponse,
  HttpResponse,
  ValidationErrors,
} from '../types/response';
import { wrapArray } from './utils';

export type ValidationErrorsFormatter = (messages: Array<string>) => string;

export default class ValidationMessageBag {
  private _response: HttpResponse;
  private _message: string;
  private _errors: ValidationErrors;

  constructor(response: HttpResponse) {
    const payload = response.data || (response as FetchHttpResponse)._data;

    this._response = response;
    this._message = payload.message || 'The given data was invalid';
    this._errors = (function () {
      let errors = payload.errors || {};

      for (const [key, value] of Object.entries(errors)) {
        errors[key] = formatErrorMessages(value);
      }

      return errors as ValidationErrors;
    })();
  }

  get response(): HttpResponse {
    return this._response;
  }

  get message(): string {
    return this._message;
  }

  get errors(): ValidationErrors {
    return this._errors;
  }

  has(key: string): boolean {
    return typeof this._errors[key] !== 'undefined';
  }

  get(key: string, formatter?: ValidationErrorsFormatter): any {
    if (this.has(key)) {
      return formatter ? formatter(this._errors[key]) : this._errors[key];
    }

    return null;
  }

  first(key?: string): string | null {
    if (key) {
      return this.get(key, (messages) => messages[0] || null);
    }

    return Object.values(this._errors).find((messages) => messages[0])[0];
  }

  all(formatter: ValidationErrorsFormatter): Record<string, any>;
  all(): ValidationErrors;

  all(formatter?: ValidationErrorsFormatter) {
    if (typeof formatter === 'function') {
      return Object.entries(this._errors).reduce(function (
        parsed,
        [key, value]
      ) {
        parsed[key] = formatter(value);
        return parsed;
      },
      {});
    }

    return this._errors;
  }
}

function formatErrorMessages(errors: any): Array<string> {
  errors = wrapArray(errors);
  errors = errors.map((message: any) => String(message));

  return errors;
}
