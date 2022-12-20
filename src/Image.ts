import { GltfJsonImageInterface } from './GltfJson';
import { loadImage, Image as CanvasImage, createCanvas } from 'canvas';

export interface ImageInterface {
  canvasImage: CanvasImage;
  height: number;
  maxValue: number;
  minValue: number;
  mimeType: string;
  name: string;
  usedForBaseColor: boolean; // Identifies if it should be used in the PBR range test
  width: number;
  initFromBrowser(arrayBuffer: ArrayBuffer): Promise<void>;
  init(buffer: Buffer): Promise<void>;
  isPowerOfTwo(): boolean;
  isQuadratic(): boolean;
}

// 2D Image used for a texture
// Note that CanvasImage is used because Babylon's NullEngine does not load images
export class Image implements ImageInterface {
  canvasImage = undefined as unknown as CanvasImage;
  height = undefined as unknown as number;
  maxValue = undefined as unknown as number;
  minValue = undefined as unknown as number;
  mimeType = '';
  name = '';
  usedForBaseColor = false;
  width = undefined as unknown as number;

  constructor(imageJson: GltfJsonImageInterface) {
    this.name = imageJson.name;
    this.mimeType = imageJson.mimeType;
    // await this.init should be called externally to load the data
  }

  // constructor cannot be async, but we need to await loadImage
  public init = async (buffer: string | Buffer): Promise<void> => {
    try {
      this.canvasImage = await loadImage(buffer);
      this.height = this.canvasImage.naturalHeight;
      this.width = this.canvasImage.naturalWidth;
    } catch (err) {
      console.log('error creating image from binary data');
      console.log(err);
    }
    this.calculateColorValueMaxMin();
  };

  public initFromBrowser = async (arrayBuffer: ArrayBuffer): Promise<void> => {
    // The browser does not have Buffer, so we need to get the image as a data uri
    const dataUri = await this.getDataUriFromArrayBuffer(arrayBuffer);
    await this.init(dataUri);
  };

  public isPowerOfTwo(): boolean {
    return this.numberIsPowerOfTwo(this.height) && this.numberIsPowerOfTwo(this.width);
  }

  public isQuadratic(): boolean {
    return this.height === this.width;
  }

  ///////////////////////
  // PRIVATE FUNCTIONS //
  ///////////////////////
  private calculateColorValueMaxMin = () => {
    try {
      // create a canvas to write the pixels to
      const canvas = createCanvas(this.canvasImage.naturalWidth, this.canvasImage.naturalHeight);

      // draw the image on the canvas
      const ctx = canvas.getContext('2d');
      ctx.drawImage(this.canvasImage, 0, 0, this.canvasImage.naturalWidth, this.canvasImage.naturalHeight);

      // read the pixels from the canvas
      const pixelData = ctx.getImageData(0, 0, this.canvasImage.naturalWidth, this.canvasImage.naturalHeight);

      // loop through the pixels to find the min/max values
      for (let i = 0; i < pixelData.data.length; i = i + 4) {
        // Stride length is 4: [R, G, B, A]
        const r = pixelData.data[4 * i + 0];
        const g = pixelData.data[4 * i + 1];
        const b = pixelData.data[4 * i + 2];
        //const a = pixelData.data[4 * i + 3];

        // Value in HSV is just the biggest channel
        const v = Math.max(r, g, b);
        if (this.maxValue === undefined || v > this.maxValue) {
          this.maxValue = v;
        }
        if (this.minValue === undefined || v < this.minValue) {
          this.minValue = v;
        }
      }
    } catch (err) {
      console.log('Error reading color values');
      console.log(err);
    }
  };

  private async getDataUriFromArrayBuffer(arrayBuffer: ArrayBuffer): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onload = function () {
          if (reader.result) {
            resolve(reader.result as string);
          } else {
            reject();
          }
        };
        reader.readAsDataURL(new Blob([arrayBuffer]));
      } catch (err) {
        reject();
      }
    });
  }

  // bitwise check that all trailing bits are 0
  private numberIsPowerOfTwo(n: number): boolean {
    // Power of two numbers are 0x100...00
    return n > 0 && (n & (n - 1)) === 0;
  }
}
