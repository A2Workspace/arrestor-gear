import ValidationMessageBag from '../core/ValidationMessageBag';

export type PromiseOrConstructor = Promise<any> | PromiseConstructor;

export type PromiseConstructor = () => Promise<any>;

export type ValidationErrorHandler = (messageBag: ValidationMessageBag) => any;
