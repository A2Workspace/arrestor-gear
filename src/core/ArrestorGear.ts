import { AxiosError } from 'axios';
import { StatusCodePatterns } from '../types/response';
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
  protected _arrestors: Array<Function> = [];
  protected _passOverMode: boolean = false;

  constructor(promise: Promise<any> | (() => Promise<any>)) {
    if (typeof promise === 'function') {
      promise = promise();

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
    const errorStack: Array<any> = [];

    while (i < len) {
      try {
        stack[i++](value);
      } catch (error) {
        errorStack.push(error);
        console.error(error);
      }
    }
  }

  protected _fireArrestors(reason: any): void {
    const arrestors: Array<Function> = this._arrestors;
    const isPassOverMode: boolean = this._passOverMode;
    const errorStack: Array<any> = [];

    let i = 0;
    let len = arrestors.length;

    while (i < len) {
      try {
        // Call error handler and break loop if return value is TRUE.
        if (arrestors[i++](reason) === true && !isPassOverMode) {
          break;
        }
      } catch (error) {
        errorStack.push(error);
        console.error(error);
      }
    }
  }

  goAround(): void {
    if (this.isSettled()) {
      this._fireArrestors(this._promiseReason);
    }
  }

  passOver(enabled: boolean = true): void {
    this._passOverMode = enabled;
  }

  onFulfilled(handler: (promiseValue: any) => void): this {
    this._onFulfilledHooks.push(handler);

    if (this.isSettled()) {
      handler(this._promiseValue);
    }

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

  captureAxiosError(handler: (error: AxiosError<any>) => any): this {
    const arrestor = createSimpleArrestor(function (reason: any) {
      if (matchHttpError(reason)) {
        handler(reason);

        return true;
      }
    }, handler);

    this._arrestors.push(arrestor);

    return this;
  }

  captureStatusCode(patterns: StatusCodePatterns, handler: (error: AxiosError<any>) => any): this {
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
