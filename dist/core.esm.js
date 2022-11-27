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

function captureAxiosError(reasonOrCallback) {
  let arrestor = function(reason) {
    if (matchHttpError(reason)) {
      return Promise.resolve(reason);
    }
    return Promise.reject(reason);
  };
  if (typeof reasonOrCallback === "function") {
    return (reason) => arrestor(reason).then(reasonOrCallback);
  }
  return arrestor(reasonOrCallback);
}
function captureStatusCode(patterns, reasonOrCallback) {
  let arrestor = function(reason) {
    if (matchHttpStatusCode(reason, patterns)) {
      return Promise.resolve(reason);
    }
    return Promise.reject(reason);
  };
  if (typeof reasonOrCallback === "function") {
    return (reason) => arrestor(reason).then(reasonOrCallback);
  }
  return arrestor(reasonOrCallback);
}
function captureValidationError(reasonOrCallback) {
  let arrestor = function(reason) {
    if (matchHttpValidationError(reason)) {
      return Promise.resolve(new ValidationMessageBag(reason.response));
    }
    return Promise.reject(reason);
  };
  if (typeof reasonOrCallback === "function") {
    return (reason) => arrestor(reason).then(reasonOrCallback);
  }
  return arrestor(reasonOrCallback);
}

export { captureAxiosError, captureStatusCode, captureValidationError, formatErrorMessages, matchHttpError, matchHttpStatusCode, matchHttpValidationError };
