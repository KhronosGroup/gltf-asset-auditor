export interface LoadableAttributeInterface {
  loaded: boolean;
  name: string;
  value: boolean | number | string;
  loadValue: (value: boolean | number | string) => void;
}

// Helper class to keep track of when values have been loaded
export class LoadableAttribute implements LoadableAttributeInterface {
  loaded = false;
  name = '';
  value = undefined as unknown as boolean | number | string;

  constructor(name: string, defaultValue: boolean | number | string) {
    this.name = name;
    this.value = defaultValue;
  }

  loadValue(value: boolean | number | string) {
    this.value = value;
    this.loaded = true;
  }
}
