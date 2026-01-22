export interface LoadableAttributeInterface<T> {
  loaded: boolean;
  name: string;
  value: T;
  loadValue: (value: T) => void;
}

// Helper class to keep track of when values have been loaded
export class LoadableAttribute<T> implements LoadableAttributeInterface<T> {
  loaded = false;
  name: string;
  value: T;

  constructor(name: string, defaultValue: T) {
    this.name = name;
    this.value = defaultValue;
  }

  loadValue(value: T) {
    this.value = value;
    this.loaded = true;
  }
}
