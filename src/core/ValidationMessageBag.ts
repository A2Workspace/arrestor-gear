import { HttpResponse } from '../types/response';
import { wrapArray } from './utils';

export default class ValidationMessageBag {
  private _response: HttpResponse;
  private _message: string;
  private _errors: ValidationErrors;

  constructor(response: HttpResponse) {
    this._response = response;
    this._message = response.data.message || 'The given data was invalid';

    let errors = response.data.errors || {};
    for (const [key, value] of Object.entries(errors)) {
      errors[key] = formatErrorMessages(value);
    }

    this._errors = errors as ValidationErrors;
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

  all(formatter?: ValidationErrorsFormatter) {
    if (typeof formatter === 'function') {
      return Object.entries(this._errors).reduce(function (parsed, [key, value]) {
        parsed[key] = formatter(value);
        return parsed;
      }, {});
    }

    return this._errors;
  }
}

export function formatErrorMessages(errors: any): Array<string> {
  errors = wrapArray(errors);
  errors = errors.map((message: any) => String(message));

  return errors;
}

export type ValidationErrors = {
  [key: string]: Array<string>;
};

export type ValidationErrorsFormatter = (messages: Array<string>) => string;
