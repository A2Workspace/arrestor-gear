import ArrestorGear from './core/ArrestorGear';

export default function arrestorGear(promise: Promise<any>): ArrestorGear {
  return new ArrestorGear(promise);
}

export * from './core';
