import { EdgeUvInterface } from './EdgeUv';
import { TriangleUvInterface } from './TriangleUv';

export interface VertexUvInterface {
  edges: EdgeUvInterface[];
  index: number;
  islandIndex: number;
  u: number;
  v: number;
  triangles: TriangleUvInterface[];
  checkForMatch(vertex: VertexUvInterface): boolean;
  computeIslandIndexForTriangles(): void;
  setIndex(index: number): void;
}

// A 2D point for the UV map
export default class VertexUv implements VertexUvInterface {
  edges = [] as EdgeUvInterface[];
  index = undefined as unknown as number;
  islandIndex = undefined as unknown as number;
  triangles = [] as TriangleUvInterface[];
  u = undefined as unknown as number;
  v = undefined as unknown as number;

  constructor(u: number, v: number) {
    // edges are set externally
    // index and island index initialized externally with setIndex
    // triangles are set externally
    this.u = u;
    this.v = v;
  }

  // Check if this and another vertex are in the same location
  public checkForMatch(vertex: VertexUvInterface): boolean {
    // Note: I found that on a complex mesh, blender's UV unwrap created some vertices in the same location that were +/- 0.000001
    // This resulted in missed matches with precision = 6 using Math.round
    // Example)
    // 0.918 134 510 517 120 4  : Rounds To >> 0.918 135
    // 0.918 134 450 912 475 6  : Rounds To >> 0.918 134
    // 0.000 000 059 604 644 8 is the difference (which is 2^-24)
    // This pointing to reaching the limit of floating point precision for 32-bit numbers
    // IEEE 754 32-bit floats have 23 bits in the significand (2^-23)
    // 2^-24 precision for a biased exponent of -1
    // Due to edge cases like the above, precision of 5 is used, which is still a very small difference
    const precision = 5;
    const e = 10 ** precision; // don't use caret ^ because it's XOR
    if (Math.round(vertex.u * e) == Math.round(this.u * e) && Math.round(vertex.v * e) == Math.round(this.v * e)) {
      return true;
    }
    return false;
  }

  // This recursive function sets triangle and vertex island indices to the smallest index of all connected vertices
  public computeIslandIndexForTriangles(): void {
    for (let i = 0; i < this.triangles.length; i++) {
      this.triangles[i].calculateIslandIndex();
    }
  }

  // Set the initial index and make the island index the same
  public setIndex(index: number): void {
    this.index = index;
    // The island index starts initially the same as the vertex
    this.islandIndex = index;
  }
}
