import {
  HttpErrorHandler,
  PromiseOrConstructor,
  ValidationHttpErrorHandler,
  StatusCodePatterns,
} from '../types/core';
import { FetchHttpResponse } from '../types/response';
import {
  matchHttpError,
  matchHttpStatusCode,
  matchHttpValidationError,
} from './matches';
import { isAxiosError } from './utils';
import ValidationMessageBag from './ValidationMessageBag';

enum Status {
  DEFAULT = 'default',
  PENDING = 'pending',
  FULFILLED = 'fulfilled',
  REJECTED = 'rejected',
}

export default class ArrestorGear<T = Record<string, any>> {
  protected _promise: Promise<T>;
  protected _fulfilledValue: T | null = null;
  protected _promiseReason: any = null;
  protected _status: Status = Status.DEFAULT;
  protected _onFulfilledHooks: ((data: T) => void)[] = [];
  protected _onFinallyHooks: ((isFulfilled: boolean) => void)[] = [];
  protected _onErrorHooks: ((error: any) => true | void)[] = [];
  protected _arrestors: ((reason: any) => true | void)[] = [];

  constructor(promiseOrConstructor: PromiseOrConstructor) {
    let promise = (() => {
      if (typeof promiseOrConstructor === 'function') {
        let result = promiseOrConstructor();

        if (result instanceof Promise) {
          return result;
        }

        throw new TypeError('Initial function must return an Promise');
      }

      if (promiseOrConstructor instanceof Promise) {
        return promiseOrConstructor;
      }

      throw new TypeError('Argument must be a Promise');
    })();

    promise = promise.then(
      (value) => {
        this._status = Status.FULFILLED;
        this._fulfilledValue = value;

        this._fireHooks(this._onFulfilledHooks, value);
      },
      (reason) => {
        this._status = Status.REJECTED;
        this._promiseReason = reason;

        this._fireArrestors(reason);
      }
    );

    promise = promise.finally(() => {
      const isFulfilled = this._status === Status.FULFILLED;
      this._fireHooks(this._onFinallyHooks, isFulfilled);
    });

    this._status = Status.PENDING;
    this._promise = promise;
  }

  protected _fireHooks(stack: Function[], ...args: any[]): void {
    let i = 0;
    let len = stack.length;

    while (i < len) {
      try {
        stack[i++](...args);
      } catch (error) {
        this._fireOnErrorHooks(error);
      }
    }
  }

  protected _fireArrestors(reason: any): void {
    const arrestors = this._arrestors;

    let i = 0;
    let len = arrestors.length;

    while (i < len) {
      try {
        // Call error handler and break loop if return value is TRUE.
        if (arrestors[i++](reason) === true) {
          break;
        }
      } catch (error) {
        this._fireOnErrorHooks(error);
      }
    }
  }

  protected _fireOnErrorHooks(error: any): void {
    const callbacks = this._onErrorHooks;

    if (callbacks.length === 0) {
      console.error(error);

      return;
    }

    for (let callback of callbacks) {
      if (callback(error) === true) {
        break;
      }
    }
  }

  onFulfilled(handler: (promiseValue: T) => void): this {
    this._onFulfilledHooks.push(handler);

    if (this.isSettled()) {
      handler(this._fulfilledValue);
    }

    return this;
  }

  onError(handler: (error: any) => true | void): this {
    this._onErrorHooks.push(handler);

    return this;
  }

  finally(handler?: (isFulfilled: boolean) => any): Promise<any> {
    if (handler) {
      this._onFinallyHooks.push(handler);

      if (this.isSettled()) {
        handler(this._status === Status.FULFILLED);
      }
    }

    return Promise.race([this._promise]).then(() => {
      return this._status === Status.FULFILLED;
    });
  }

  getPromise() {
    return this._promise;
  }

  /**
   * Short name of getPromise()
   */
  promise() {
    return this.getPromise();
  }

  isSettled(): boolean {
    return (
      this._status === Status.FULFILLED || this._status === Status.REJECTED
    );
  }

  /**
   * @deprecated
   */
  captureAxiosError(handler: HttpErrorHandler): this {
    const arrestor = createSimpleArrestor(function (reason: any) {
      if (isAxiosError(reason)) {
        handler({
          error: reason,
          response: reason.response,
          status: reason.response.status,
          data:
            reason.response.data ||
            (reason.response as FetchHttpResponse)._data ||
            null,
        });

        return true;
      }
    }, handler);

    this._arrestors.push(arrestor);

    return this;
  }

  captureHttpError(handler: HttpErrorHandler): this {
    const arrestor = createSimpleArrestor(function (reason: any) {
      if (matchHttpError(reason)) {
        handler({
          error: reason,
          response: reason.response,
          status: reason.response.status,
          data:
            reason.response.data ||
            (reason.response as FetchHttpResponse)._data ||
            null,
        });

        return true;
      }
    }, handler);

    this._arrestors.push(arrestor);

    return this;
  }

  captureStatusCode(
    patterns: StatusCodePatterns,
    handler: HttpErrorHandler
  ): this {
    const arrestor = createSimpleArrestor(function (reason: any) {
      if (matchHttpStatusCode(reason, patterns)) {
        handler({
          error: reason,
          response: reason.response,
          status: reason.response.status,
          data:
            reason.response.data ||
            (reason.response as FetchHttpResponse)._data ||
            null,
        });

        return true;
      }
    }, handler);

    this._arrestors.push(arrestor);

    return this;
  }

  captureValidationError(handler: ValidationHttpErrorHandler): this {
    const arrestor = createSimpleArrestor(function (reason: any) {
      if (matchHttpValidationError(reason)) {
        const messageBag = new ValidationMessageBag(reason.response);

        handler(messageBag, {
          error: reason,
          response: reason.response,
          status: reason.response.status,
          data:
            reason.response.data ||
            (reason.response as FetchHttpResponse)._data ||
            null,
        });

        return true;
      }
    }, handler);

    this._arrestors.push(arrestor);

    return this;
  }

  captureAny(handler: (error: any) => any): this {
    const arrestor = createSimpleArrestor(function (reason: any) {
      handler(reason);

      return true;
    }, handler);

    this._arrestors.push(arrestor);

    return this;
  }
}

function createSimpleArrestor(
  errorHandler: (reason: any) => true | void,
  callback: Function
): SimpleArrestor {
  let arrestor = errorHandler as SimpleArrestor;
  arrestor._handler = callback;

  return arrestor;
}

interface SimpleArrestor {
  (reason: any): true | void;
  _handler: Function;
}
