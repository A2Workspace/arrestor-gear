export interface RegularHttpResponse<T = Record<string, any>> {
  status: number;
  data: T;
}

export interface FetchHttpResponse<T = Record<string, any>>
  extends Omit<RegularHttpResponse<T>, 'data'> {
  [key: string]: any;
  _data: T;
  bodyUsed: boolean;
  ok: boolean;
  redirected: boolean;
  statusText: string;
  type: string; // Example: "basic", "cors", etc.
  url: string;
}

export type HttpResponse<T = Record<string, any>> =
  | RegularHttpResponse<T>
  | FetchHttpResponse<T>;

export interface HttpError<T = Record<string, any>> {
  response: HttpResponse<T>;
}

export interface ValidationHttpError<T = ValidationErrorResponseData>
  extends HttpError<T> {
  response: HttpResponse<T> & {
    status: 422;
  };
}

export interface ValidationErrorResponseData extends Record<string, any> {
  message: string;
  errors: ValidationErrors;
}

export interface ValidationErrors {
  [key: string]: string[];
}
