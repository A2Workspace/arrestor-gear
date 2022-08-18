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
declare function formatErrorMessages(errors: any): Array<string>;
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
declare type HttpErrorHandler = (error: HttpError<HttpResponseData>) => any;
declare type ValidationErrorHandler = (messageBag: ValidationMessageBag) => any;
declare type StatusCodePatterns = number | string | Array<number | string>;

declare type RejectionHandler = (reason: any) => any;
declare function captureAxiosError(reasonOrCallback: HttpErrorHandler | any): RejectionHandler | Promise<any>;
declare function captureStatusCode(patterns: StatusCodePatterns, reasonOrCallback: HttpErrorHandler | any): RejectionHandler | Promise<any>;
declare function captureValidationError(reasonOrCallback: ValidationErrorHandler | any): RejectionHandler | Promise<any>;

declare function matchHttpError(error: any): boolean;
declare function matchHttpStatusCode(error: any, patterns: StatusCodePatterns): boolean;
declare function matchHttpValidationError(error: any): boolean;

export { ValidationErrors, ValidationErrorsFormatter, captureAxiosError, captureStatusCode, captureValidationError, formatErrorMessages, matchHttpError, matchHttpStatusCode, matchHttpValidationError };
