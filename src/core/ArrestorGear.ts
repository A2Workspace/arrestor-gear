import { PromiseOrConstructor, HttpError, StatusCodePatterns } from '../types';
import { matchHttpError, matchHttpStatusCode, matchHttpValidationError } from './utils';
import ValidationMessageBag from './ValidationMessageBag';

enum PromiseStatus {
  DEFAULT = 'default',
  PENDING = 'pending',
  FULFILLED = 'fulfilled',
  REJECTED = 'rejected',
}

export default class ArrestorGear {
  protected _promise: Promise<any>;
  protected _promiseValue: any = null;
  protected _promiseReason: any = null;
  protected _promiseStatus: PromiseStatus = PromiseStatus.DEFAULT;
  protected _onFulfilledHooks: Array<Function> = [];
  protected _onFinallyHooks: Array<Function> = [];
  protected _onErrorHooks: Array<Function> = [];
  protected _arrestors: Array<Function> = [];

  constructor(promiseOrConstructor: PromiseOrConstructor) {
    let promise = promiseOrConstructor;

    if (typeof promiseOrConstructor === 'function') {
      promise = promiseOrConstructor();

      if (!(promise instanceof Promise)) {
        throw new TypeError('Initial function must return an Promise');
      }
    }

    if (!(promise instanceof Promise)) {
      throw new TypeError('Argument must be a Promise');
    }

    promise = promise.then(
      (value) => {
        this._promiseStatus = PromiseStatus.FULFILLED;
        this._promiseValue = value;

        this._fireHooks(this._onFulfilledHooks, value);
      },
      (reason) => {
        this._promiseStatus = PromiseStatus.REJECTED;
        this._promiseReason = reason;

        this._fireArrestors(reason);
      }
    );

    promise = promise.finally(() => {
      const isFulfilled = this._promiseStatus === PromiseStatus.FULFILLED;
      this._fireHooks(this._onFinallyHooks, isFulfilled);
    });

    this._promiseStatus = PromiseStatus.PENDING;
    this._promise = promise;
  }

  protected _fireHooks(stack: Array<Function>, value: any = null): void {
    let i = 0;
    let len = stack.length;

    while (i < len) {
      try {
        stack[i++](value);
      } catch (error) {
        this._fireOnErrorHooks(error);
      }
    }
  }

  protected _fireArrestors(reason: any): void {
    const arrestors: Array<Function> = this._arrestors;

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
    const callbacks: Array<Function> = this._onErrorHooks;

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

  onFulfilled(handler: (promiseValue: any) => void): this {
    this._onFulfilledHooks.push(handler);

    if (this.isSettled()) {
      handler(this._promiseValue);
    }

    return this;
  }

  onError(handler: (error: any) => boolean | void): this {
    this._onErrorHooks.push(handler);

    return this;
  }

  finally(handler?: (isFulfilled: boolean) => any): Promise<any> {
    if (handler) {
      this._onFinallyHooks.push(handler);

      if (this.isSettled()) {
        handler(this._promiseStatus === PromiseStatus.FULFILLED);
      }
    }

    return Promise.race([this._promise]).then(() => {
      return this._promiseStatus === PromiseStatus.FULFILLED;
    });
  }

  isSettled(): boolean {
    return this._promiseStatus === PromiseStatus.FULFILLED || this._promiseStatus === PromiseStatus.REJECTED;
  }

  captureAxiosError(handler: (error: HttpError) => any): this {
    const arrestor = createSimpleArrestor(function (reason: any) {
      if (matchHttpError(reason)) {
        handler(reason);

        return true;
      }
    }, handler);

    this._arrestors.push(arrestor);

    return this;
  }

  captureStatusCode(patterns: StatusCodePatterns, handler: (error: HttpError) => any): this {
    const arrestor = createSimpleArrestor(function (reason: any) {
      if (matchHttpStatusCode(reason, patterns)) {
        handler(reason);

        return true;
      }
    }, handler);

    this._arrestors.push(arrestor);

    return this;
  }

  captureValidationError(handler: (messageBag: ValidationMessageBag) => any): this {
    const arrestor = createSimpleArrestor(function (reason: any) {
      if (matchHttpValidationError(reason)) {
        handler(new ValidationMessageBag(reason.response));

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

function createSimpleArrestor(errorHandler: (reason: any) => boolean, callback: Function): SimpleArrestor {
  let arrestor = errorHandler as SimpleArrestor;
  arrestor._handler = callback;

  return arrestor;
}

type SimpleArrestor = {
  (reason: any): boolean;
  _handler: Function;
};
