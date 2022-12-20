import { TriangleUvInterface } from './TriangleUv.js';

export interface UvIslandInterface {
  index: number;
  triangles: TriangleUvInterface[];
}

// A group of triangles that are connected by shared vertices
export default class UvIsland implements UvIslandInterface {
  index = undefined as unknown as number;
  triangles = [] as TriangleUvInterface[];

  constructor(triangle: TriangleUvInterface) {
    this.index = triangle.islandIndex;
    this.triangles = [triangle];
  }
}
