export interface VertexXyzInterface {
  index: number;
  x: number;
  y: number;
  z: number;
  checkForMatch(vertex: VertexXyzInterface): boolean;
}

// 3D point for the mesh
export default class VertexXyz implements VertexXyzInterface {
  index = undefined as unknown as number;
  x = undefined as unknown as number;
  y = undefined as unknown as number;
  z = undefined as unknown as number;

  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  // Check if this an another vertex are in the same location
  public checkForMatch(vertex: VertexXyzInterface): boolean {
    // See VertexUv.checkForMatch for an explanation of why this value is 5
    const precision = 5;
    const e = 10 ** precision; // don't use caret ^ because it's XOR
    if (
      Math.round(vertex.x * e) == Math.round(this.x * e) &&
      Math.round(vertex.y * e) == Math.round(this.y * e) &&
      Math.round(vertex.z * e) == Math.round(this.z * e)
    ) {
      return true;
    }
    return false;
  }
}
