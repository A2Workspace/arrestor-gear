'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function wrapArray(value) {
  return Array.isArray(value) ? value : [value];
}
function isHttpError(error) {
  return typeof error === "object" && error.isAxiosError === true;
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
  constructor(promise) {
    this._promiseValue = null;
    this._promiseReason = null;
    this._promiseStatus = PromiseStatus.DEFAULT;
    this._onFulfilledHooks = [];
    this._onFinallyHooks = [];
    this._arrestors = [];
    this._passOverMode = false;
    if (typeof promise === "function") {
      promise = promise();
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
      this._fireHooks(this._onFinallyHooks);
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
        console.error(error);
      }
    }
  }
  _fireArrestors(reason) {
    const arrestors = this._arrestors;
    const isPassOverMode = this._passOverMode;
    let i = 0;
    let len = arrestors.length;
    while (i < len) {
      try {
        if (arrestors[i++](reason) === true && !isPassOverMode) {
          break;
        }
      } catch (error) {
        console.error(error);
      }
    }
  }
  goAround() {
    if (this.isSettled()) {
      this._fireArrestors(this._promiseReason);
    }
  }
  passOver(enabled = true) {
    this._passOverMode = enabled;
  }
  onFulfilled(handler) {
    this._onFulfilledHooks.push(handler);
    if (this.isSettled()) {
      handler(this._promiseValue);
    }
    return this;
  }
  finally(handler) {
    if (handler) {
      this._onFinallyHooks.push(handler);
      if (this.isSettled()) {
        handler();
      }
    }
    return Promise.race([this._promise]).finally();
  }
  isSettled() {
    return this._promiseStatus === PromiseStatus.FULFILLED || this._promiseStatus === PromiseStatus.REJECTED;
  }
  captureAxiosError(handler) {
    this._arrestors.push(createSimpleArrestor(function(reason) {
      if (isHttpError(reason)) {
        handler(reason);
        return true;
      }
    }, handler));
    return this;
  }
  captureStatusCode(code, handler) {
    let patterns = wrapArray(code);
    this._arrestors.push(createSimpleArrestor(function(reason) {
      if (isHttpError(reason) && matchStatusCode(patterns, reason.response.status)) {
        handler(reason);
        return true;
      }
    }, handler));
    return this;
  }
  captureValidationError(handler) {
    return this.captureStatusCode(422, function(error) {
      handler(new ValidationMessageBag(error.response));
    });
  }
  captureAny(handler) {
    this._arrestors.push(createSimpleArrestor(function(reason) {
      handler(reason);
      return true;
    }, handler));
    return this;
  }
}
function createSimpleArrestor(catcher, handler) {
  let arrestor = catcher;
  arrestor._handler = handler;
  return arrestor;
}
function matchStatusCode(patterns, value) {
  let result = patterns.find((pattern) => {
    if (typeof pattern === "string") {
      pattern = pattern.toLowerCase();
      pattern = pattern.replace(/x/g, "\\d");
      return new RegExp(`^${pattern}$`).test(String(value));
    }
    return String(pattern) === String(value);
  });
  return Boolean(result);
}

function arrestorGear(promise) {
  return new ArrestorGear(promise);
}

exports["default"] = arrestorGear;
exports.formatErrorMessages = formatErrorMessages;
