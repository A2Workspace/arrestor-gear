import ArrestorGear from './core/ArrestorGear';
import { PromiseOrConstructor } from './types';

export default function arrestorGear(promiseOrConstructor: PromiseOrConstructor): ArrestorGear {
  return new ArrestorGear(promiseOrConstructor);
}
