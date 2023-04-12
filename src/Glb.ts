import { GltfBinInterface } from './GltfBin';
import { GltfJsonInterface } from './GltfJson';
import { EncodeArrayBufferToBase64 } from '@babylonjs/core/Misc/stringTools.js';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { GLTFFileLoader } from '@babylonjs/loaders';
import '@babylonjs/loaders/glTF/2.0/glTFLoader.js';
import { buffer } from 'stream/consumers';

export interface GlbInterface {
  arrayBuffer: ArrayBuffer;
  bin: GltfBinInterface;
  filename: string;
  json: GltfJsonInterface;
  loaded: boolean;
  getBase64String(): string;
  getBytes(): Uint8Array;
  initFromGlbFile(file: File): void;
  initFromGlbFilePath(filePath: string): void;
  initFromGltfFiles(files: File[]): void;
  initFromGltfFilePaths(filePaths: string[]): void;
}

// GLB is the binary version of glTF and this class is used to load and access that data
export default class Glb implements GlbInterface {
  arrayBuffer = null as unknown as ArrayBuffer;
  bin = null as unknown as GltfBinInterface;
  filename = '';
  json = null as unknown as GltfJsonInterface;
  loaded = false;

  // Returns the glb data as a data string for loading with Babylon.js
  public getBase64String(): string {
    return 'data:;base64,' + EncodeArrayBufferToBase64(this.arrayBuffer);
  }

  // Returns the generic ArrayBuffer as an unsigned byte array
  public getBytes() {
    return new Uint8Array(this.arrayBuffer);
  }

  // Loads a single .glb file that comes from the browser <input type='file'> element
  public async initFromGlbFile(file: File) {
    if (!file.name.endsWith('.glb')) {
      throw new Error('When only a single file is provided, it must be a .glb');
    }
    try {
      this.arrayBuffer = await this.getBufferFromFileInput(file);
      this.filename = file.name;
    } catch (err) {
      throw new Error('Unable to get buffer from file input');
    }
    await this.loadBinAndJson();
    this.loaded = true;
  }

  // Loads a single .glb file that is on the filesystem (Node.js)
  public async initFromGlbFilePath(filePath: string) {
    if (!filePath.endsWith('.glb')) {
      throw new Error('When only a single file is provided, it must be a .glb');
    }
    try {
      // Need to import this way to compile webpack
      // webpack.config.js also needs:
      // config.resolve.fallback.fs = false
      // config.resolve.fallback.path = false
      const { promises } = await import('fs');
      const { sep } = await import('path');
      this.arrayBuffer = await promises.readFile(filePath);
      this.filename = filePath.substring(filePath.lastIndexOf(sep) + 1);
    } catch (err) {
      throw new Error('Unable to get buffer from filepath');
    }
    await this.loadBinAndJson();
    this.loaded = true;
  }

  // Loads a multi-file .gltf that comes from the browser <input type='file'> element
  public async initFromGltfFiles(files: File[]) {
    let binAndImagesBufferSize = 0;
    let binFile = null as unknown as File;
    const bufferMap = new Map();
    let gltfFile = null as unknown as File;
    let imageFiles = [] as File[];

    // Find files by extension
    files.forEach(file => {
      if (file.name.endsWith('.gltf')) {
        this.filename = file.name;
        gltfFile = file;
      } else if (file.name.endsWith('.bin')) {
        binFile = file;
      } else {
        imageFiles.push(file);
      }
    });

    // Check that .gltf and .bin are provided
    if (!binFile) {
      throw new Error('No .bin file provided');
    }
    if (!gltfFile) {
      throw new Error('No .gltf file provided');
    }

    // Load the json data from the .gltf
    const gltfBuffer = new Uint8Array(await this.getBufferFromFileInput(gltfFile));
    const dec = new TextDecoder();
    const gltfJson = JSON.parse(dec.decode(gltfBuffer));
    const originalBufferViewCount = gltfJson.bufferViews.length;

    // Load the binary data from the .bin
    const binBuffer = new Uint8Array(await this.getBufferFromFileInput(binFile));
    binAndImagesBufferSize = this.alignedLength(binBuffer.byteLength);

    // Load the binary data from all images and add to bufferView[]
    let imageBuffers = [] as unknown as Uint8Array[];
    for (let i = 0; i < imageFiles.length; i++) {
      const imageFile = imageFiles[i];
      // Note: this assumes that all files are in the same directory
      imageBuffers.push(new Uint8Array(await this.getBufferFromFileInput(imageFile)));
      // Map the bufferIndex to the uri, which is used to update gltfJson.images
      bufferMap.set(imageFile.name, originalBufferViewCount + i);
      gltfJson.bufferViews.push({
        buffer: 0,
        byteOffset: binAndImagesBufferSize,
        byteLength: imageBuffers[i].byteLength,
      });
      binAndImagesBufferSize += this.alignedLength(imageBuffers[i].byteLength);
    }

    this.arrayBuffer = this.combineBuffersToGlb(binAndImagesBufferSize, bufferMap, binBuffer, gltfJson, imageBuffers);
    this.loadBinAndJson();
    this.loaded = true;
  }

  // Loads a multi-file .gltf that is on the filesystem (Node.js)
  public async initFromGltfFilePaths(filePaths: string[]) {
    // Need to import this way to compile webpack
    // webpack.config.js also needs:
    // config.resolve.fallback.fs = false
    // config.resolve.fallback.path = false
    const { promises } = await import('fs');
    const { sep } = await import('path');

    let binAndImagesBufferSize = 0;
    let binFilePath = '';
    const bufferMap = new Map();
    let gltfFilePath = '';
    let imageFilePaths = [] as string[];

    // Find files by extension
    filePaths.forEach(filePath => {
      if (filePath.endsWith('.gltf')) {
        gltfFilePath = filePath;
        this.filename = filePath.substring(filePath.lastIndexOf(sep) + 1);
      } else if (filePath.endsWith('.bin')) {
        binFilePath = filePath;
      } else {
        imageFilePaths.push(filePath);
      }
    });

    // Check that .gltf and .bin are provided
    if (!binFilePath) {
      throw new Error('No .bin file provided');
    }
    if (!gltfFilePath) {
      throw new Error('No .gltf file provided');
    }

    // Load the json data from the .gltf
    const gltfBuffer = await promises.readFile(gltfFilePath);
    const gltfJson = JSON.parse(gltfBuffer.toString('utf-8'));
    const originalBufferViewCount = gltfJson.bufferViews.length;

    // Load the binary data from the .bin
    const binBuffer = await promises.readFile(binFilePath);
    binAndImagesBufferSize = this.alignedLength(binBuffer.length);

    // Load the binary data from all images and add to bufferView[]
    let imageBuffers = [] as unknown as Buffer[];
    for (let i = 0; i < imageFilePaths.length; i++) {
      const imageFilePath = imageFilePaths[i];
      // Note: this assumes that all files are in the same directory
      const imageFileName = imageFilePath.substring(imageFilePath.lastIndexOf(sep) + 1);
      imageBuffers.push(await promises.readFile(imageFilePath));
      // Map the bufferIndex to the uri, which is used to update gltfJson.images
      bufferMap.set(imageFileName, originalBufferViewCount + i);
      gltfJson.bufferViews.push({
        buffer: 0,
        byteOffset: binAndImagesBufferSize,
        byteLength: imageBuffers[i].length,
      });
      binAndImagesBufferSize += this.alignedLength(imageBuffers[i].length);
    }

    this.arrayBuffer = this.combineBuffersToGlb(binAndImagesBufferSize, bufferMap, binBuffer, gltfJson, imageBuffers);
    this.loadBinAndJson();
    this.loaded = true;
  }

  ///////////////////////
  // PRIVATE FUNCTIONS //
  ///////////////////////

  // Round the length up to the nearest 4 bytes (32 bits)
  private alignedLength(initialLength: number): number {
    if (initialLength == 0) {
      return initialLength;
    }
    const alignValue = 4;
    var modRemainder = initialLength % alignValue;
    if (modRemainder === 0) {
      return initialLength;
    }
    return initialLength + (alignValue - modRemainder);
  }

  // Get data loaded from a multi-file .gltf in the equivalent .glb format
  private combineBuffersToGlb(
    binAndImagesBufferSize: number,
    bufferMap: Map<string | undefined, number>,
    binBuffer: Uint8Array,
    gltfJson: GltfJsonInterface,
    imageBuffers: Uint8Array[],
  ): ArrayBuffer {
    /**
     * Babylon.js does not have a way to load multiple files, so for
     * multi-file .gltf + .bin + images, we'll convert to the .glb format
     * The original .gltf has one buffer that references the external .bin
     * We're going to remove the external uri reference and merge the
     * binary data from the .bin and all the image files.
     * The uris in the image data is replaced with a bufferView reference
     * and the bufferViews need to be expanded to include the image data references
     */

    // Note: new bufferViews for the images were added to the incoming gltfJson when loaded

    // Update the buffer with the new size and remove the uri that was for the bin file
    if (gltfJson.buffers.length !== 1) {
      throw new Error('The gltf should have one buffer and it has ' + gltfJson.buffers.length);
    }
    gltfJson.buffers[0].byteLength = binAndImagesBufferSize;
    delete gltfJson.buffers[0].uri;

    // Replace the uri with a bufferView for all matched images
    if (gltfJson.images) {
      gltfJson.images.forEach(image => {
        // Note: not checking if the uri is base64
        const bufferIndex = bufferMap.get(image.uri);
        if (bufferIndex) {
          delete image.uri;
          image.bufferView = bufferIndex;
          // Note: mimeType should already be set
        }
      });
    }

    // reference: https://github.com/sbtron/makeglb/blob/master/index.html
    const enc = new TextEncoder();
    const jsonBuffer = enc.encode(JSON.stringify(gltfJson));
    const jsonAlignedLength = this.alignedLength(jsonBuffer.length);
    const totalSize =
      12 + // file header: magic + version + length
      8 + // json chunk header: json length + type
      jsonAlignedLength +
      8 + // bin chunk header: chunk length + type
      binAndImagesBufferSize;

    const arrayBuffer = new ArrayBuffer(totalSize);
    const dataView = new DataView(arrayBuffer);
    let bufferIndex = 0;

    // Binary Magic
    dataView.setUint32(bufferIndex, 0x46546c67, true);
    bufferIndex += 4;
    dataView.setUint32(bufferIndex, 2, true);
    bufferIndex += 4;
    dataView.setUint32(bufferIndex, totalSize, true);
    bufferIndex += 4;

    // JSON
    dataView.setUint32(bufferIndex, jsonAlignedLength, true);
    bufferIndex += 4;
    dataView.setUint32(bufferIndex, 0x4e4f534a, true);
    bufferIndex += 4;
    for (let i = 0; i < jsonBuffer.length; i++) {
      dataView.setUint8(bufferIndex, jsonBuffer[i]);
      bufferIndex++;
    }
    let padding = jsonAlignedLength - jsonBuffer.length;
    for (let i = 0; i < padding; i++) {
      dataView.setUint8(bufferIndex, 0x20); // space
      bufferIndex++;
    }

    // BIN (+images)
    dataView.setUint32(bufferIndex, binAndImagesBufferSize, true);
    bufferIndex += 4;
    dataView.setUint32(bufferIndex, 0x004e4942, true);
    bufferIndex += 4;

    // .bin
    for (let i = 0; i < binBuffer.length; i++) {
      dataView.setUint8(bufferIndex, binBuffer[i]);
      bufferIndex++;
    }
    // The bufferViews have byte offsets that are 32-bit aligned
    // The bin and images write 8 bits at a time and may not take up
    // all of the allocated space, so extra space at the end can be skipped
    bufferIndex = this.alignedLength(bufferIndex);

    // images
    imageBuffers.forEach(imageBuffer => {
      for (let i = 0; i < imageBuffer.length; i++) {
        dataView.setUint8(bufferIndex, imageBuffer[i]); // change setUint32 to the setUint8
        bufferIndex++;
      }
      bufferIndex = this.alignedLength(bufferIndex);
    });

    return arrayBuffer;
  }

  // Extract json and binary data from the arrayBuffer
  private async loadBinAndJson(): Promise<void> {
    if (!this.arrayBuffer) {
      throw new Error('The array buffer must be loaded before json and bin data can be extracted');
    }
    // Creating an empty scene for the purpose of this extraction
    const engine = new NullEngine();
    const scene = new Scene(engine);
    return await new Promise((resolve, reject) => {
      const fileLoader = new GLTFFileLoader();
      fileLoader.loadFile(
        scene,
        this.getBase64String(),
        data => {
          this.json = data.json;
          this.bin = data.bin;
          resolve();
        },
        ev => {
          // progress. nothing to do
        },
        true,
        err => {
          reject();
        },
      );
    });
  }

  // Read a file from a web browser <input type='file'> element
  private async getBufferFromFileInput(file: File): Promise<ArrayBuffer> {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onload = function () {
          if (reader.result) {
            const buffer = reader.result as ArrayBuffer;
            resolve(buffer);
          } else {
            reject();
          }
        };
        reader.readAsArrayBuffer(file);
      } catch (err) {
        reject();
      }
    });
  }
}
