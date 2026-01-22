import { LoadableAttribute, LoadableAttributeInterface } from './LoadableAttribute.js';
import { ProductInfoJSONInterface } from './ProductInfoJSON.js';

export interface ProductInfoInterface {
  height: LoadableAttributeInterface<number>;
  length: LoadableAttributeInterface<number>;
  width: LoadableAttributeInterface<number>;
  loaded: boolean;
  getAttributes: () => LoadableAttributeInterface<number>[];
  loadFromFileInput(file: File): Promise<void>;
  loadFromFileSystem(filepath: string): Promise<void>;
}

// Product dimensions that can be provided from a database to check tolerances
export class ProductInfo implements ProductInfoInterface {
  height = new LoadableAttribute('Product Height', -1); // -1 indicates not to test (default)
  length = new LoadableAttribute('Product Length', -1); // -1 indicates not to test (default)
  width = new LoadableAttribute('Product Width', -1); // -1 indicates not to test (default)

  loaded = false;

  getAttributes() {
    return [this.length, this.height, this.width];
  }

  // (Browser) - The file comes from an <input type='file'> element
  public async loadFromFileInput(file: File): Promise<void> {
    const loader = new Promise((resolve, reject) => {
      const fileReader = new FileReader(); // FileReader is not available in node.js
      fileReader.onload = async function () {
        const schemaText = fileReader.result as string;
        const schemaData = JSON.parse(schemaText) as ProductInfoJSONInterface;
        // FileReader is not async be default, so this wrapper is needed.
        resolve(schemaData);
      };
      fileReader.onerror = function (e) {
        reject(e);
      };
      fileReader.readAsText(file);
    });

    const obj = (await loader) as ProductInfoJSONInterface;
    this.loadFromProductInfoObject(obj);
  }

  // (Node.js) - The file comes from the file system
  public async loadFromFileSystem(filepath: string): Promise<void> {
    // Need to import promises this way to compile webpack
    // webpack.config.js also needs config.resolve.fallback.fs = false
    const { promises } = await import('fs');
    const schemaText = await promises.readFile(filepath, 'utf-8');
    const obj = JSON.parse(schemaText) as ProductInfoJSONInterface;
    this.loadFromProductInfoObject(obj);
  }

  ///////////////////////
  // PRIVATE FUNCTIONS //
  ///////////////////////

  // Populate product info after reading the data from a file
  private loadFromProductInfoObject(obj: ProductInfoJSONInterface) {
    this.height.loadValue(obj.dimensions.height);
    this.length.loadValue(obj.dimensions.length);
    this.width.loadValue(obj.dimensions.width);
    this.loaded = true;
  }
}
