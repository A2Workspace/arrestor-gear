interface RegularHttpResponse<T = Record<string, any>> {
    status: number;
    data: T;
}
interface FetchHttpResponse<T = Record<string, any>> extends Omit<RegularHttpResponse<T>, 'data'> {
    [key: string]: any;
    _data: T;
    bodyUsed: boolean;
    ok: boolean;
    redirected: boolean;
    statusText: string;
    type: string;
    url: string;
}
type HttpResponse<T = Record<string, any>> = RegularHttpResponse<T> | FetchHttpResponse<T>;
interface HttpError<T = Record<string, any>> {
    response: HttpResponse<T>;
}
interface ValidationHttpError<T = ValidationErrorResponseData> extends HttpError<T> {
    response: HttpResponse<T> & {
        status: 422;
    };
}
interface ValidationErrorResponseData extends Record<string, any> {
    message: string;
    errors: ValidationErrors;
}
interface ValidationErrors {
    [key: string]: string[];
}

type ValidationErrorsFormatter = (messages: Array<string>) => string;
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

type PromiseOrConstructor = Promise<any> | PromiseConstructor;
type PromiseConstructor = () => Promise<any>;
type StatusCodePatterns = number | string | (number | string)[];
type HttpErrorHandler<T = Record<string, any>> = (ctx: {
    error: HttpError<T>;
    response: HttpResponse<T>;
    status: number;
    data: T | null;
}) => any;
type ValidationHttpErrorHandler = (messageBag: ValidationMessageBag, ctx: {
    error: ValidationHttpError;
    response: HttpResponse<ValidationErrorResponseData>;
    status: 422;
    data: ValidationErrorResponseData;
}) => any;

declare enum Status {
    DEFAULT = "default",
    PENDING = "pending",
    FULFILLED = "fulfilled",
    REJECTED = "rejected"
}
declare class ArrestorGear<T = Record<string, any>> {
    protected _promise: Promise<T>;
    protected _fulfilledValue: T | null;
    protected _promiseReason: any;
    protected _status: Status;
    protected _onFulfilledHooks: ((data: T) => void)[];
    protected _onFinallyHooks: ((isFulfilled: boolean) => void)[];
    protected _onErrorHooks: ((error: any) => true | void)[];
    protected _arrestors: ((reason: any) => true | void)[];
    constructor(promiseOrConstructor: PromiseOrConstructor);
    protected _fireHooks(stack: Function[], ...args: any[]): void;
    protected _fireArrestors(reason: any): void;
    protected _fireOnErrorHooks(error: any): void;
    onFulfilled(handler: (promiseValue: T) => void): this;
    onError(handler: (error: any) => true | void): this;
    finally(handler?: (isFulfilled: boolean) => any): Promise<any>;
    getPromise(): Promise<T>;
    /**
     * Short name of getPromise()
     */
    promise(): Promise<T>;
    isSettled(): boolean;
    /**
     * @deprecated
     */
    captureAxiosError(handler: HttpErrorHandler): this;
    captureHttpError(handler: HttpErrorHandler): this;
    captureStatusCode(patterns: StatusCodePatterns, handler: HttpErrorHandler): this;
    captureValidationError(handler: ValidationHttpErrorHandler): this;
    captureAny(handler: (error: any) => any): this;
}

declare function wrapArray<T>(value: T | T[]): T[];
/**
 * @deprecated
 */
declare function isAxiosError(error: any): error is HttpError;
declare function isHttpError(error: any): error is HttpError;
declare function resolveResponseStatusCode(value: any): number | null;

declare function useArrestorGear<T>(promiseOrConstructor: PromiseOrConstructor): {
    arrestorGear: ArrestorGear<T>;
    promise: Promise<T>;
    onFulfilled: (handler: (promiseValue: T) => void) => void;
    onError: (handler: (error: any) => true | void) => void;
    onFinally: (handler?: (isFulfilled: boolean) => any) => void;
    isSettled: () => boolean;
    captureHttpError: (handler: HttpErrorHandler) => void;
    captureStatusCode: (patterns: StatusCodePatterns, handler: HttpErrorHandler) => void;
    captureValidationError: (handler: ValidationHttpErrorHandler) => void;
    captureAny: (handler: (error: any) => any) => void;
};

declare function arrestorGear<T>(promiseOrConstructor: PromiseOrConstructor): ArrestorGear;

export { ValidationHttpErrorHandler, arrestorGear as default, isAxiosError, isHttpError, resolveResponseStatusCode, useArrestorGear, wrapArray };
