
export type PromiseOrConstructor = Promise<any> | PromiseConstructor;

export type PromiseConstructor = () => Promise<any>;
