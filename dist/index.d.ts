import { AxiosResponse, AxiosError } from 'axios';

type HttpResponse<T = HttpResponseData, D = any> = AxiosResponse<T, D>;
type HttpResponseData<T = any> = {
    message: string;
    errors: T;
};
type HttpError<T = HttpResponseData> = AxiosError<T, any> & {
    response: HttpResponse<T>;
};
type StatusCodePatterns = number | string | Array<number | string>;

declare class ValidationMessageBag {
    private _response;
    private _message;
    private _errors;
    constructor(response: HttpResponse);
    get response(): HttpResponse;
    get message(): string;
    get errors(): ValidationErrors;
    has(key: string): boolean;
    get(key: string, formatter?: ValidationErrorsFormatter): any;
    first(key?: string): string | null;
    all(formatter?: ValidationErrorsFormatter): ValidationErrors;
}
type ValidationErrors = {
    [key: string]: Array<string>;
};
type ValidationErrorsFormatter = (messages: Array<string>) => string;

type PromiseOrConstructor = Promise<any> | PromiseConstructor;
type PromiseConstructor = () => Promise<any>;
type ValidationErrorHandler = (messageBag: ValidationMessageBag) => any;

declare enum PromiseStatus {
    DEFAULT = "default",
    PENDING = "pending",
    FULFILLED = "fulfilled",
    REJECTED = "rejected"
}
declare class ArrestorGear {
    protected _promise: Promise<any>;
    protected _promiseValue: any;
    protected _promiseReason: any;
    protected _promiseStatus: PromiseStatus;
    protected _onFulfilledHooks: Array<Function>;
    protected _onFinallyHooks: Array<Function>;
    protected _onErrorHooks: Array<Function>;
    protected _arrestors: Array<Function>;
    constructor(promiseOrConstructor: PromiseOrConstructor);
    protected _fireHooks(stack: Array<Function>, value?: any): void;
    protected _fireArrestors(reason: any): void;
    protected _fireOnErrorHooks(error: any): void;
    onFulfilled(handler: (promiseValue: any) => void): this;
    onError(handler: (error: any) => boolean | void): this;
    finally(handler?: (isFulfilled: boolean) => any): Promise<any>;
    isSettled(): boolean;
    captureAxiosError(handler: (error: HttpError) => any): this;
    captureStatusCode(patterns: StatusCodePatterns, handler: (error: HttpError) => any): this;
    captureValidationError(handler: (messageBag: ValidationMessageBag) => any): this;
    captureAny(handler: (error: any) => any): this;
}

declare function wrapArray(value: any): Array<any>;
declare function isAxiosError(error: any): boolean;
declare function isHttpError(error: any): boolean;
declare function matchHttpError(error: any): boolean;
declare function matchHttpStatusCode(error: any, patterns: StatusCodePatterns): boolean;
declare function matchHttpValidationError(error: any): boolean;
declare function matchStatusCode(patterns: StatusCodePatterns, value: any): boolean;
declare function resolveResponseStatusCode(value: any): number | null;

declare function arrestorGear(promiseOrConstructor: PromiseOrConstructor): ArrestorGear;

export { ValidationErrorHandler, arrestorGear as default, isAxiosError, isHttpError, matchHttpError, matchHttpStatusCode, matchHttpValidationError, matchStatusCode, resolveResponseStatusCode, wrapArray };
