function wrapArray(value) {
  return Array.isArray(value) ? value : [value];
}
function isAxiosError(error) {
  return typeof error === "object" && error.isAxiosError === true;
}
function isHttpError(error) {
  return typeof error === "object" && typeof error.response === "object" && typeof error.response.status === "number" && ("data" in error.response || "_data" in error.response);
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

class ValidationMessageBag {
  constructor(response) {
    const payload = response.data || response._data;
    this._response = response;
    this._message = payload.message || "The given data was invalid";
    this._errors = function() {
      let errors = payload.errors || {};
      for (const [key, value] of Object.entries(errors)) {
        errors[key] = formatErrorMessages(value);
      }
      return errors;
    }();
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

var Status;
(function(Status2) {
  Status2["DEFAULT"] = "default";
  Status2["PENDING"] = "pending";
  Status2["FULFILLED"] = "fulfilled";
  Status2["REJECTED"] = "rejected";
})(Status || (Status = {}));
class ArrestorGear {
  constructor(promiseOrConstructor) {
    this._fulfilledValue = null;
    this._promiseReason = null;
    this._status = Status.DEFAULT;
    this._onFulfilledHooks = [];
    this._onFinallyHooks = [];
    this._onErrorHooks = [];
    this._arrestors = [];
    let promise = (() => {
      if (typeof promiseOrConstructor === "function") {
        let result = promiseOrConstructor();
        if (result instanceof Promise) {
          return result;
        }
        throw new TypeError("Initial function must return an Promise");
      }
      if (promiseOrConstructor instanceof Promise) {
        return promiseOrConstructor;
      }
      throw new TypeError("Argument must be a Promise");
    })();
    promise = promise.then((value) => {
      this._status = Status.FULFILLED;
      this._fulfilledValue = value;
      this._fireHooks(this._onFulfilledHooks, value);
    }, (reason) => {
      this._status = Status.REJECTED;
      this._promiseReason = reason;
      this._fireArrestors(reason);
    });
    promise = promise.finally(() => {
      const isFulfilled = this._status === Status.FULFILLED;
      this._fireHooks(this._onFinallyHooks, isFulfilled);
    });
    this._status = Status.PENDING;
    this._promise = promise;
  }
  _fireHooks(stack, ...args) {
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
      handler(this._fulfilledValue);
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
  promise() {
    return this.getPromise();
  }
  isSettled() {
    return this._status === Status.FULFILLED || this._status === Status.REJECTED;
  }
  captureAxiosError(handler) {
    const arrestor = createSimpleArrestor(function(reason) {
      if (isAxiosError(reason)) {
        handler({
          error: reason,
          response: reason.response,
          status: reason.response.status,
          data: reason.response.data || reason.response._data || null
        });
        return true;
      }
    }, handler);
    this._arrestors.push(arrestor);
    return this;
  }
  captureHttpError(handler) {
    const arrestor = createSimpleArrestor(function(reason) {
      if (matchHttpError(reason)) {
        handler({
          error: reason,
          response: reason.response,
          status: reason.response.status,
          data: reason.response.data || reason.response._data || null
        });
        return true;
      }
    }, handler);
    this._arrestors.push(arrestor);
    return this;
  }
  captureStatusCode(patterns, handler) {
    const arrestor = createSimpleArrestor(function(reason) {
      if (matchHttpStatusCode(reason, patterns)) {
        handler({
          error: reason,
          response: reason.response,
          status: reason.response.status,
          data: reason.response.data || reason.response._data || null
        });
        return true;
      }
    }, handler);
    this._arrestors.push(arrestor);
    return this;
  }
  captureValidationError(handler) {
    const arrestor = createSimpleArrestor(function(reason) {
      if (matchHttpValidationError(reason)) {
        const messageBag = new ValidationMessageBag(reason.response);
        handler(messageBag, {
          error: reason,
          response: reason.response,
          status: reason.response.status,
          data: reason.response.data || reason.response._data || null
        });
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

function useArrestorGear(promiseOrConstructor) {
  const arrestorGear = new ArrestorGear(promiseOrConstructor);
  const onFulfilled = (handler) => {
    arrestorGear.onFulfilled(handler);
  };
  const onError = (handler) => {
    arrestorGear.onError(handler);
  };
  const onFinally = (handler) => {
    arrestorGear.finally(handler);
  };
  const promise = arrestorGear.getPromise();
  const isSettled = () => arrestorGear.isSettled();
  const captureHttpError = (handler) => {
    arrestorGear.captureHttpError(handler);
  };
  const captureStatusCode = (patterns, handler) => {
    arrestorGear.captureStatusCode(patterns, handler);
  };
  const captureValidationError = (handler) => {
    arrestorGear.captureValidationError(handler);
  };
  const captureAny = (handler) => {
    arrestorGear.captureAny(handler);
  };
  return {
    arrestorGear,
    promise,
    onFulfilled,
    onError,
    onFinally,
    isSettled,
    captureHttpError,
    captureStatusCode,
    captureValidationError,
    captureAny
  };
}

function arrestorGear(promiseOrConstructor) {
  return new ArrestorGear(promiseOrConstructor);
}

export { arrestorGear as default, isAxiosError, isHttpError, resolveResponseStatusCode, useArrestorGear, wrapArray };
