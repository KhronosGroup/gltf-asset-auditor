export interface GltfBinInterface {
  byteLength: number;
  readAsync(byteOffset: number, byteLength: number): any;
}
