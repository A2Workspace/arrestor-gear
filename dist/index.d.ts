import { AxiosResponse, AxiosError } from 'axios';

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
declare type ValidationErrors = {
    [key: string]: Array<string>;
};
declare type ValidationErrorsFormatter = (messages: Array<string>) => string;

declare type HttpResponse<T = HttpResponseData, D = any> = AxiosResponse<T, D>;
declare type HttpResponseData<T = any> = {
    message: string;
    errors: T;
};
declare type HttpError<T = HttpResponseData, D = any> = AxiosError<T, D>;
declare type HttpErrorHandler = (error: HttpError<HttpResponseData>) => any;
declare type ValidationErrorHandler = (messageBag: ValidationMessageBag) => any;
declare type StatusCodePatterns = number | string | Array<number | string>;

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
    protected _arrestors: Array<Function>;
    protected _passOverMode: boolean;
    constructor(promise: Promise<any> | (() => Promise<any>));
    protected _fireHooks(stack: Array<Function>, value?: any): void;
    protected _fireArrestors(reason: any): void;
    goAround(): void;
    passOver(enabled?: boolean): void;
    onFulfilled(handler: (promiseValue: any) => void): this;
    finally(handler?: (isFulfilled: boolean) => any): Promise<any>;
    isSettled(): boolean;
    captureAxiosError(handler: HttpErrorHandler): this;
    captureStatusCode(patterns: StatusCodePatterns, handler: HttpErrorHandler): this;
    captureValidationError(handler: ValidationErrorHandler): this;
    captureAny(handler: (error: any) => any): this;
}

declare function matchHttpError(error: any): boolean;
declare function matchHttpStatusCode(error: any, patterns: StatusCodePatterns): boolean;
declare function matchHttpValidationError(error: any): boolean;

declare type RejectionHandler = (reason: any) => any;
declare function captureAxiosError(reasonOrCallback: HttpErrorHandler | any): RejectionHandler | Promise<any>;
declare function captureStatusCode(patterns: StatusCodePatterns, reasonOrCallback: HttpErrorHandler | any): RejectionHandler | Promise<any>;
declare function captureValidationError(reasonOrCallback: ValidationErrorHandler | any): RejectionHandler | Promise<any>;

declare function arrestorGear(promise: Promise<any>): ArrestorGear;

export { ArrestorGear, ValidationMessageBag, captureAxiosError, captureStatusCode, captureValidationError, arrestorGear as default, matchHttpError, matchHttpStatusCode, matchHttpValidationError };
