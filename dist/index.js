'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function wrapArray(value) {
  return Array.isArray(value) ? value : [value];
}
function isAxiosError(error) {
  return typeof error === "object" && error.isAxiosError === true;
}
function isHttpError(error) {
  return isAxiosError(error);
}
function matchHttpError(error) {
  return isHttpError(error);
}
function matchHttpStatusCode(error, patterns) {
  return isHttpError(error) && matchStatusCode(patterns, error.response.status);
}
function matchHttpValidationError(error) {
  return isHttpError(error) && matchStatusCode(422, error.response.status);
}
function matchStatusCode(patterns, value) {
  patterns = wrapArray(patterns);
  value = String(resolveResponseStatusCode(value));
  let callback = function(pattern) {
    if (typeof pattern === "string") {
      pattern = pattern.toLowerCase();
      pattern = pattern.replace(/x/g, "\\d");
      return new RegExp(`^${pattern}$`).test(value);
    }
    return String(pattern) === value;
  };
  return Boolean(patterns.find(callback));
}
function resolveResponseStatusCode(value) {
  var _a;
  if (typeof value === "number") {
    return value;
  }
  if (!isNaN(value)) {
    return parseInt(value);
  }
  if (typeof value === "object") {
    return ((_a = value.response) == null ? void 0 : _a.status) || value.status || null;
  }
  return null;
}

class ValidationMessageBag {
  constructor(response) {
    this._response = response;
    this._message = response.data.message || "The given data was invalid";
    let errors = response.data.errors || {};
    for (const [key, value] of Object.entries(errors)) {
      errors[key] = formatErrorMessages(value);
    }
    this._errors = errors;
  }
  get response() {
    return this._response;
  }
  get message() {
    return this._message;
  }
  get errors() {
    return this._errors;
  }
  has(key) {
    return typeof this._errors[key] !== "undefined";
  }
  get(key, formatter) {
    if (this.has(key)) {
      return formatter ? formatter(this._errors[key]) : this._errors[key];
    }
    return null;
  }
  first(key) {
    if (key) {
      return this.get(key, (messages) => messages[0] || null);
    }
    return Object.values(this._errors).find((messages) => messages[0])[0];
  }
  all(formatter) {
    if (typeof formatter === "function") {
      return Object.entries(this._errors).reduce(function(parsed, [key, value]) {
        parsed[key] = formatter(value);
        return parsed;
      }, {});
    }
    return this._errors;
  }
}
function formatErrorMessages(errors) {
  errors = wrapArray(errors);
  errors = errors.map((message) => String(message));
  return errors;
}

var PromiseStatus;
(function(PromiseStatus2) {
  PromiseStatus2["DEFAULT"] = "default";
  PromiseStatus2["PENDING"] = "pending";
  PromiseStatus2["FULFILLED"] = "fulfilled";
  PromiseStatus2["REJECTED"] = "rejected";
})(PromiseStatus || (PromiseStatus = {}));
class ArrestorGear {
  constructor(promiseOrConstructor) {
    this._promiseValue = null;
    this._promiseReason = null;
    this._promiseStatus = PromiseStatus.DEFAULT;
    this._onFulfilledHooks = [];
    this._onFinallyHooks = [];
    this._onErrorHooks = [];
    this._arrestors = [];
    let promise = promiseOrConstructor;
    if (typeof promiseOrConstructor === "function") {
      promise = promiseOrConstructor();
      if (!(promise instanceof Promise)) {
        throw new TypeError("Initial function must return an Promise");
      }
    }
    if (!(promise instanceof Promise)) {
      throw new TypeError("Argument must be a Promise");
    }
    promise = promise.then((value) => {
      this._promiseStatus = PromiseStatus.FULFILLED;
      this._promiseValue = value;
      this._fireHooks(this._onFulfilledHooks, value);
    }, (reason) => {
      this._promiseStatus = PromiseStatus.REJECTED;
      this._promiseReason = reason;
      this._fireArrestors(reason);
    });
    promise = promise.finally(() => {
      const isFulfilled = this._promiseStatus === PromiseStatus.FULFILLED;
      this._fireHooks(this._onFinallyHooks, isFulfilled);
    });
    this._promiseStatus = PromiseStatus.PENDING;
    this._promise = promise;
  }
  _fireHooks(stack, value = null) {
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
  _fireArrestors(reason) {
    const arrestors = this._arrestors;
    let i = 0;
    let len = arrestors.length;
    while (i < len) {
      try {
        if (arrestors[i++](reason) === true) {
          break;
        }
      } catch (error) {
        this._fireOnErrorHooks(error);
      }
    }
  }
  _fireOnErrorHooks(error) {
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
  onFulfilled(handler) {
    this._onFulfilledHooks.push(handler);
    if (this.isSettled()) {
      handler(this._promiseValue);
    }
    return this;
  }
  onError(handler) {
    this._onErrorHooks.push(handler);
    return this;
  }
  finally(handler) {
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
  isSettled() {
    return this._promiseStatus === PromiseStatus.FULFILLED || this._promiseStatus === PromiseStatus.REJECTED;
  }
  captureAxiosError(handler) {
    const arrestor = createSimpleArrestor(function(reason) {
      if (matchHttpError(reason)) {
        handler(reason);
        return true;
      }
    }, handler);
    this._arrestors.push(arrestor);
    return this;
  }
  captureStatusCode(patterns, handler) {
    const arrestor = createSimpleArrestor(function(reason) {
      if (matchHttpStatusCode(reason, patterns)) {
        handler(reason);
        return true;
      }
    }, handler);
    this._arrestors.push(arrestor);
    return this;
  }
  captureValidationError(handler) {
    const arrestor = createSimpleArrestor(function(reason) {
      if (matchHttpValidationError(reason)) {
        handler(new ValidationMessageBag(reason.response));
        return true;
      }
    }, handler);
    this._arrestors.push(arrestor);
    return this;
  }
  captureAny(handler) {
    const arrestor = createSimpleArrestor(function(reason) {
      handler(reason);
      return true;
    }, handler);
    this._arrestors.push(arrestor);
    return this;
  }
}
function createSimpleArrestor(errorHandler, callback) {
  let arrestor = errorHandler;
  arrestor._handler = callback;
  return arrestor;
}

function arrestorGear(promiseOrConstructor) {
  return new ArrestorGear(promiseOrConstructor);
}

exports["default"] = arrestorGear;
exports.isAxiosError = isAxiosError;
exports.isHttpError = isHttpError;
exports.matchHttpError = matchHttpError;
exports.matchHttpStatusCode = matchHttpStatusCode;
exports.matchHttpValidationError = matchHttpValidationError;
exports.matchStatusCode = matchStatusCode;
exports.resolveResponseStatusCode = resolveResponseStatusCode;
exports.wrapArray = wrapArray;
