import { HttpErrorHandler, ValidationErrorHandler } from '../types/response';
import { isHttpError, wrapArray } from './utils';
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
      this._fireHooks(this._onFinallyHooks);
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

  finally(handler?: () => void): Promise<void> {
    if (handler) {
      this._onFinallyHooks.push(handler);

      if (this.isSettled()) {
        handler();
      }
    }

    return Promise.race([this._promise]).finally();
  }

  isSettled(): boolean {
    return this._promiseStatus === PromiseStatus.FULFILLED || this._promiseStatus === PromiseStatus.REJECTED;
  }

  captureAxiosError(handler: HttpErrorHandler): this {
    this._arrestors.push(
      createSimpleArrestor(function (reason: any) {
        if (isHttpError(reason)) {
          handler(reason);

          return true;
        }
      }, handler)
    );

    return this;
  }

  captureStatusCode(code: number | string | Array<number | string>, handler: HttpErrorHandler): this {
    let patterns: Array<number | string> = wrapArray(code);

    this._arrestors.push(
      createSimpleArrestor(function (reason: any) {
        if (isHttpError(reason) && matchStatusCode(patterns, reason.response.status)) {
          handler(reason);

          return true;
        }
      }, handler)
    );

    return this;
  }

  captureValidationError(handler: ValidationErrorHandler): this {
    return this.captureStatusCode(422, function (error) {
      handler(new ValidationMessageBag(error.response));
    });
  }

  captureAny(handler: (error: any) => any): this {
    this._arrestors.push(
      createSimpleArrestor(function (reason: any) {
        handler(reason);

        return true;
      }, handler)
    );

    return this;
  }
}

function createSimpleArrestor(catcher: Function, handler: Function): SimpleArrestor {
  let arrestor = catcher as SimpleArrestor;
  arrestor._handler = handler;

  return arrestor;
}

type SimpleArrestor = {
  (reason: any): any;
  _handler: Function;
};

function matchStatusCode(patterns: Array<number | string>, value: number): boolean {
  let result = patterns.find((pattern: number | string) => {
    if (typeof pattern === 'string') {
      pattern = pattern.toLowerCase();
      pattern = pattern.replace(/x/g, '\\d');

      return new RegExp(`^${pattern}$`).test(String(value));
    }

    return String(pattern) === String(value);
  });

  return Boolean(result);
}
