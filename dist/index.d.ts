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
declare type HttpError<T = HttpResponseData> = AxiosError<T, any> & {
    response: HttpResponse<T>;
};
declare type StatusCodePatterns = number | string | Array<number | string>;

declare type PromiseOrConstructor = Promise<any> | PromiseConstructor;
declare type PromiseConstructor = () => Promise<any>;

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

declare function arrestorGear(promiseOrConstructor: PromiseOrConstructor): ArrestorGear;

export { arrestorGear as default };
